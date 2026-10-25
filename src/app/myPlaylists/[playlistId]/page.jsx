"use client";
import React, { useEffect, useState } from "react";
import SongsList from "@/components/SongsList";
import BulkDownloadButton from "@/components/BulkDownloadButton";
import PlayButton from "@/components/PlayButton";
import { getSongData } from "@/services/dataAPI";
import PlaylistSkeleton from "@/components/Skeletons/PlaylistSkeleton";
import { useSession } from "next-auth/react";
import { redirect, useParams } from "next/navigation";
import { getSinglePlaylist } from "@/services/playlistApi";
import { MdPlaylistPlay } from "react-icons/md";

const UserPlaylistPage = ({ params }) => {
  const routeParams = useParams();
  const playlistId = routeParams?.playlistId || params?.playlistId;
  const [loading, setLoading] = useState(true);
  const [songs, setSongs] = useState([]);
  const [playlist, setPlaylist] = useState({});
  const { status } = useSession();

  useEffect(() => {
    const fetchPlaylistSongs = async () => {
      if (!playlistId) return;
      setLoading(true);
      try {
        const res = await getSinglePlaylist(playlistId);
        if (res?.success === true) {
          setPlaylist(res?.data || {});
          if (res?.data?.songs?.length > 0) {
            const rawSongs = res.data.songs;
            const fetched = await Promise.all(
              rawSongs.map(async (item) => {
                if (
                  item &&
                  typeof item === "object" &&
                  (item.name || item.title) &&
                  (item.downloadUrl || item.url)
                ) {
                  return item;
                }
                const songId = typeof item === "object" ? item?.id : item;
                if (!songId || typeof songId !== "string") {
                  return item && typeof item === "object" && (item.name || item.title)
                    ? item
                    : null;
                }
                try {
                  const data = await getSongData(songId);
                  const resolved = Array.isArray(data) ? data[0] : data;
                  if (resolved && (resolved.name || resolved.title)) {
                    return resolved;
                  }
                } catch (e) {
                  // ignore
                }
                if (item && typeof item === "object" && (item.name || item.title)) {
                  return item;
                }
                return {
                  id: songId,
                  name: `Track (${songId})`,
                  title: `Track (${songId})`,
                  duration: 0,
                  image: [],
                  artists: { primary: [{ name: "Artist" }] },
                };
              })
            );
            setSongs(fetched.filter(Boolean).reverse());
          } else {
            setSongs([]);
          }
        }
      } catch (err) {
        console.error("fetchPlaylistSongs error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlaylistSongs();
  }, [playlistId]);

  if (status === "loading" || (status === "authenticated" && loading)) {
    return <PlaylistSkeleton type="playlist" count={6} />;
  }

  if (status === "unauthenticated") {
    redirect("/login");
  }

  return (
    <div className="w-11/12 max-w-7xl mx-auto mt-8 mb-20">
      {/* Spotify Header Banner */}
      <div className="relative rounded-3xl p-6 sm:p-8 lg:p-10 bg-gradient-to-b from-white/[0.08] to-white/[0.02] backdrop-blur-2xl border border-white/10 shadow-2xl flex flex-col md:flex-row items-center md:items-end gap-6 lg:gap-10">
        <div className="relative w-48 h-48 sm:w-56 sm:h-56 lg:w-64 lg:h-64 flex-shrink-0 rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-[#f43f5e] to-black flex items-center justify-center">
          <MdPlaylistPlay size={80} className="text-white" />
        </div>

        <div className="flex flex-col text-center md:text-left text-white min-w-0 flex-1">
          <span className="text-xs uppercase font-extrabold tracking-widest text-[#f43f5e] mb-1">
            Personal Playlist
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight line-clamp-2">
            {playlist?.name || "My Playlist"}
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-2 font-medium">
            {songs.length} tracks
          </p>

          {songs.length > 0 && (
            <div className="mt-4">
              <PlayButton songList={{ name: playlist?.name, songs }} />
            </div>
          )}
        </div>
      </div>

      {/* Tracks */}
      <div className="mt-10">
        <h2 className="text-2xl font-bold tracking-tight text-white mb-2">
          Songs
        </h2>
        {songs.length === 0 && !loading ? (
          <div className="py-12 text-center text-gray-400">
            This playlist has no songs yet. Search for songs and click the menu to add them!
          </div>
        ) : (
          <SongsList
            SongData={songs}
            loading={loading}
            playlistID={playlist?._id}
            isUserPlaylist={true}
            setSongs={setSongs}
          />
        )}
      </div>
    </div>
  );
};

export default UserPlaylistPage;
