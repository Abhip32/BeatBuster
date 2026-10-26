import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import User from "@/models/User";
import dbConnect from "@/utils/dbconnect";
import UserData from "@/models/UserData";

export const dynamic = "force-dynamic";

const MAX_HISTORY_ITEMS = 20;

// Helper to sanitize and normalize a lightweight song history object
const normalizeSong = (song) => {
  if (!song) return null;
  const id = typeof song === "object" ? song?.id : song;
  const songId = typeof id === "string" ? id.trim() : String(id || "");
  if (!songId || songId === "undefined" || songId === "null") return null;

  if (typeof song !== "object") {
    return { id: songId };
  }

  return {
    id: songId,
    name: String(song.name || song.title || "Song"),
    artists: song.artists || song.primaryArtists || "",
    image: Array.isArray(song.image)
      ? song.image.slice(0, 3)
      : song.image
      ? [{ url: typeof song.image === "string" ? song.image : song.image?.url || "" }]
      : [],
    duration: Number(song.duration) || 0,
    album: song.album?.name ? { name: song.album.name } : undefined,
  };
};

// GET: Retrieve user's listening history
export async function GET(req) {
  const token = await getToken({ req, secret: process.env.JWT_SECRET });
  if (!token) {
    return NextResponse.json(
      { success: false, message: "User not logged in", data: [] },
      { status: 401 }
    );
  }

  try {
    const conn = await dbConnect();
    if (!conn) {
      return NextResponse.json(
        { success: false, message: "Database offline", data: [] },
        { status: 503 }
      );
    }

    const user = await User.findOne({ email: token.email });
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found", data: [] },
        { status: 404 }
      );
    }

    const userData = await UserData.findById(user.userData);
    if (!userData) {
      return NextResponse.json(
        { success: false, message: "User data not found", data: [] },
        { status: 404 }
      );
    }

    // Clean and validate existing history
    const validHistory = [];
    const seen = new Set();
    for (const item of (userData.songHistory || [])) {
      const normalized = normalizeSong(item);
      if (normalized && !seen.has(normalized.id)) {
        seen.add(normalized.id);
        validHistory.push(normalized);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Song history retrieved",
      data: validHistory.slice(0, MAX_HISTORY_ITEMS),
    });
  } catch (error) {
    console.error("GET /api/history error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error", data: [] },
      { status: 500 }
    );
  }
}

// POST: Record / prepend a song to listening history
export async function POST(req) {
  const token = await getToken({ req, secret: process.env.JWT_SECRET });
  if (!token) {
    return NextResponse.json(
      { success: false, message: "User not logged in", data: null },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const song = body?.song || body;
    const cleanSong = normalizeSong(song);

    if (!cleanSong || !cleanSong.id) {
      return NextResponse.json(
        { success: false, message: "Invalid song data", data: null },
        { status: 400 }
      );
    }

    const conn = await dbConnect();
    if (!conn) {
      return NextResponse.json(
        { success: false, message: "Database offline", data: null },
        { status: 503 }
      );
    }

    const user = await User.findOne({ email: token.email });
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found", data: null },
        { status: 404 }
      );
    }

    const userData = await UserData.findById(user.userData);
    if (!userData) {
      return NextResponse.json(
        { success: false, message: "User data not found", data: null },
        { status: 404 }
      );
    }

    // Filter out existing occurrence of this song
    const existing = Array.isArray(userData.songHistory) ? userData.songHistory : [];
    const filtered = existing.filter((item) => {
      const sid = typeof item === "object" ? item?.id : item;
      return String(sid || "").trim() !== cleanSong.id;
    });

    // Unshift the clean song to the front and cap at MAX_HISTORY_ITEMS
    const updated = [cleanSong, ...filtered].slice(0, MAX_HISTORY_ITEMS);
    userData.songHistory = updated;
    userData.markModified("songHistory");
    await userData.save();

    return NextResponse.json({
      success: true,
      message: "Song history recorded",
      data: updated,
    });
  } catch (error) {
    console.error("POST /api/history error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to save song history", data: null },
      { status: 500 }
    );
  }
}
