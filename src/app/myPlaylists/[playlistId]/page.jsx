"use client";
import React, { useEffect, useState } from "react";
import SongsList from "@/components/SongsList";
import PlayButton from "@/components/PlayButton";
import { getSongData } from "@/services/dataAPI";
import PlaylistSkeleton from "@/components/Skeletons/PlaylistSkeleton";
import { useSession } from "next-auth/react";
import { redirect, useParams, useRouter } from "next/navigation";
import { getSinglePlaylist, deletePlaylist } from "@/services/playlistApi";
import { useDispatch } from "react-redux";
import { removePlaylist } from "@/redux/features/playlistsSlice";
import { MdPlaylistPlay, MdOutlineDeleteOutline } from "react-icons/md";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { toast } from "react-hot-toast";
import BackButton from "@/components/BackButton";

const UserPlaylistPage = ({ params }) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const routeParams = useParams();
  const playlistId = routeParams?.playlistId || params?.playlistId;
  const [loading, setLoading] = useState(true);
  const [songs, setSongs] = useState([]);
  const [playlist, setPlaylist] = useState({});
  const [isDeleting, setIsDeleting] = useState(false);
  const { status, data: session } = useSession();

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

  const handleDeletePlaylist = async () => {
    if (!playlistId) return;
    const playlistName = playlist?.name || "this playlist";
    const confirmed = window.confirm(
      `Are you sure you want to delete "${playlistName}"? This action cannot be undone.`
    );
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      const res = await deletePlaylist(playlistId);
      if (res?.success === true) {
        dispatch(removePlaylist(playlistId));
        toast.success(`Deleted playlist "${playlistName}"`);
        router.push("/");
      } else {
        toast.error(res?.message || "Could not delete playlist");
      }
    } catch (err) {
      console.error("handleDeletePlaylist error:", err);
      toast.error("An error occurred while deleting playlist");
    } finally {
      setIsDeleting(false);
    }
  };

  if (status === "loading" || (status === "authenticated" && loading)) {
    return <PlaylistSkeleton type="playlist" count={6} />;
  }

  if (status === "unauthenticated") {
    redirect("/login");
  }

  return (
    <div className="w-11/12 max-w-7xl mx-auto mt-6 mb-20 animate-fade-in">
      {/* Hero Banner */}
      <div className="relative rounded-3xl pt-12 sm:pt-14 md:pt-10 pb-5 sm:pb-8 lg:pb-10 px-5 sm:px-8 lg:px-10 bg-gradient-to-b from-rose-950/40 via-white/[0.03] to-transparent backdrop-blur-2xl border border-rose-500/15 shadow-2xl flex flex-col md:flex-row items-center md:items-end gap-5 sm:gap-7 lg:gap-10">
        <BackButton
          iconOnly
          className="absolute top-3.5 left-3.5 sm:top-4 sm:left-4 z-20"
        />

        <div className="relative w-36 h-36 sm:w-52 sm:h-52 lg:w-60 lg:h-60 flex-shrink-0 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-[#f43f5e] via-[#be123c] to-[#4c0519] flex items-center justify-center border border-rose-400/20 shadow-[0_12px_36px_rgba(244,63,94,0.35)] group">
          <MdPlaylistPlay className="w-16 h-16 sm:w-24 sm:h-24 lg:w-28 lg:h-28 text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.5)] transition-transform duration-300 group-hover:scale-105" />
        </div>

        <div className="flex flex-col text-center md:text-left text-white min-w-0 flex-1 w-full md:w-auto">
          <span className="text-[11px] sm:text-xs uppercase font-extrabold tracking-widest text-[#f43f5e] mb-1.5 flex items-center justify-center md:justify-start gap-2">
            <span>Personal Playlist</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#f43f5e]" />
            <span>Collection</span>
          </span>
          <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15] sm:leading-[1.1] pb-1.5">
            {playlist?.name || "My Playlist"}
          </h1>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-xs text-gray-300 mt-2.5 font-semibold">
            <span>{session?.user?.name || "You"}</span>
            <span>•</span>
            <span>
              {songs.length} {songs.length === 1 ? "track" : "tracks"}
            </span>
            <span>•</span>
            <span className="text-rose-300">Custom Playlist</span>
          </div>

          {songs.length > 0 ? (
            <PlayButton songList={{ name: playlist?.name, songs }}>
              <button
                type="button"
                onClick={handleDeletePlaylist}
                disabled={isDeleting}
                className="flex h-11 sm:h-13 items-center justify-center gap-1.5 sm:gap-2 rounded-full border border-white/15 hover:border-rose-500/50 bg-white/[0.08] hover:bg-rose-500/15 px-3 sm:px-5 text-gray-200 hover:text-rose-400 font-bold text-xs sm:text-sm tracking-wide transition-all duration-200 active:scale-95 cursor-pointer backdrop-blur-xl shadow-md whitespace-nowrap"
                title="Delete this playlist"
              >
                {isDeleting ? (
                  <AiOutlineLoading3Quarters className="animate-spin text-sm" />
                ) : (
                  <MdOutlineDeleteOutline size={18} />
                )}
                <span>Delete Playlist</span>
              </button>
            </PlayButton>
          ) : (
            <div className="mt-5 flex items-center justify-center md:justify-start">
              <button
                type="button"
                onClick={handleDeletePlaylist}
                disabled={isDeleting}
                className="flex h-11 sm:h-13 items-center justify-center gap-2 rounded-full border border-rose-500/30 hover:border-rose-500 bg-rose-500/15 hover:bg-rose-500/25 px-5 text-rose-300 hover:text-white font-bold text-xs sm:text-sm tracking-wide transition-all duration-200 active:scale-95 cursor-pointer shadow-md"
                title="Delete this empty playlist"
              >
                {isDeleting ? (
                  <AiOutlineLoading3Quarters className="animate-spin text-sm" />
                ) : (
                  <MdOutlineDeleteOutline size={18} />
                )}
                <span>Delete Empty Playlist</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tracks Section */}
      <div className="mt-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white">
              Songs
            </h2>
            <p className="text-xs text-gray-400 mt-0.5 font-medium">
              Tracks curated in this personal playlist
            </p>
          </div>
          {songs.length > 0 && (
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30">
              {songs.length} {songs.length === 1 ? "track" : "tracks"}
            </span>
          )}
        </div>

        {songs.length === 0 && !loading ? (
          <div className="py-14 text-center rounded-2xl bg-white/[0.02] border border-white/[0.06] p-8 max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto mb-4">
              <MdPlaylistPlay size={34} className="text-rose-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1.5">
              This playlist is currently empty
            </h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              Search for songs anywhere across Musify and click the 3-dots menu to add them to this playlist.
            </p>
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
