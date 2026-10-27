import { NextResponse } from "next/server";
import dbConnect from "@/utils/dbconnect";
import Playlist from "@/models/Playlist";
import UserData from "@/models/UserData";
import auth from "@/utils/auth";
import { getApiBase } from "@/services/dataAPI";

export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const conn = await dbConnect();
    if (!conn) {
      return NextResponse.json(
        { success: false, message: "Database offline" },
        { status: 503 }
      );
    }

    const user = await auth(req);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Please log in to import playlists" },
        { status: 401 }
      );
    }

    const { url, customName } = await req.json();
    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { success: false, message: "Spotify playlist URL is required" },
        { status: 400 }
      );
    }

    const match = url.match(/(?:playlist|album)[\/:]([a-zA-Z0-9]+)/);
    if (!match) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid Spotify URL. Please paste a valid playlist or album link.",
        },
        { status: 400 }
      );
    }

    const isAlbum = url.includes("album");
    const type = isAlbum ? "album" : "playlist";
    const id = match[1];
    const embedUrl = `https://open.spotify.com/embed/${type}/${id}`;

    const spotifyRes = await fetch(embedUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    if (!spotifyRes.ok) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to access Spotify playlist. Please check that it is public.",
        },
        { status: 400 }
      );
    }

    const html = await spotifyRes.text();
    const dataMatch = html.match(/<script id="__NEXT_DATA__"[^>]*>(.*?)<\/script>/);
    if (!dataMatch) {
      return NextResponse.json(
        {
          success: false,
          message: "Could not read playlist data from Spotify embed.",
        },
        { status: 400 }
      );
    }

    let parsed = null;
    try {
      parsed = JSON.parse(dataMatch[1]);
    } catch {
      return NextResponse.json(
        { success: false, message: "Failed to parse Spotify metadata" },
        { status: 500 }
      );
    }

    const entity = parsed?.props?.pageProps?.state?.data?.entity;
    if (!entity || !Array.isArray(entity.trackList)) {
      return NextResponse.json(
        {
          success: false,
          message: "No playable tracks found in this Spotify playlist.",
        },
        { status: 400 }
      );
    }

    const playlistTitle =
      customName?.trim() ||
      entity.title ||
      entity.name ||
      "Imported Spotify Playlist";
    const rawTracks = entity.trackList.slice(0, 50); // limit to top 50 to maintain fast response
    const apiBase = getApiBase();

    // Helper to search JioSaavn for a track
    const resolveTrack = async (track) => {
      if (!track?.title) return null;
      const cleanTitle = track.title.replace(/\s*\(feat\.[^)]*\)/i, "").trim();
      const artists = (track.subtitle || "").replace(/,\s*/g, " ").trim();
      const queries = [
        `${cleanTitle} ${artists}`.trim(),
        cleanTitle,
      ];

      for (const q of queries) {
        try {
          const res = await fetch(
            `${apiBase}/api/search/songs?query=${encodeURIComponent(q)}&limit=1`
          );
          if (res.ok) {
            const data = await res.json();
            const song = data?.data?.results?.[0];
            if (song && (song.downloadUrl || song.url)) {
              return song;
            }
          }
        } catch {
          // continue to next query attempt
        }
      }
      return null;
    };

    // Process tracks in concurrent batches of 5 to avoid throttling
    const matchedSongs = [];
    const batchSize = 5;
    for (let i = 0; i < rawTracks.length; i += batchSize) {
      const batch = rawTracks.slice(i, i + batchSize);
      const results = await Promise.all(batch.map((t) => resolveTrack(t)));
      for (const song of results) {
        if (song) {
          // Avoid duplicates in the same playlist
          if (!matchedSongs.some((s) => String(s?.id) === String(song?.id))) {
            matchedSongs.push(song);
          }
        }
      }
    }

    if (matchedSongs.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Could not match any songs from this Spotify playlist in the catalog.",
        },
        { status: 404 }
      );
    }

    // Create the playlist in DB
    const newPlaylist = await Playlist.create({
      name: playlistTitle,
      user: user._id,
      songs: matchedSongs,
    });

    const userData = await UserData.findById(user.userData);
    if (userData) {
      userData.playlists.push(newPlaylist._id);
      await userData.save();
    }

    return NextResponse.json({
      success: true,
      message: `Successfully imported "${playlistTitle}" with ${matchedSongs.length} tracks!`,
      data: {
        playlist: newPlaylist,
        totalSpotifyTracks: entity.trackList.length,
        matchedCount: matchedSongs.length,
      },
    });
  } catch (error) {
    console.error("Spotify import error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred while importing the Spotify playlist.",
      },
      { status: 500 }
    );
  }
}
