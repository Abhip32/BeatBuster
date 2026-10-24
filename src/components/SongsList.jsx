"use client";
import React, { useState, useEffect } from "react";
import { playPause, setActiveSong } from "@/redux/features/playerSlice";
import { BsPlayFill, BsPauseFill } from "react-icons/bs";
import { useDispatch, useSelector } from "react-redux";
import SongListSkeleton from "./SongListSkeleton";
import { BiHeadphone } from "react-icons/bi";
import { PiDotsThreeVerticalBold } from "react-icons/pi";
import {
  addSongToPlaylist,
  deleteSongFromPlaylist,
  getUserPlaylists,
} from "@/services/playlistApi";
import { toast } from "react-hot-toast";
import { MdOutlineDeleteOutline } from "react-icons/md";

const SongsList = ({
  SongData,
  loading,
  hidePlays,
  isUserPlaylist,
  playlistID,
  setSongs,
}) => {
  const { activeSong, isPlaying } = useSelector((state) => state.player);
  const [showMenu, setShowMenu] = useState(null);
  const [playlists, setPlaylists] = useState([]);
  const dispatch = useDispatch();

  const handlePlayClick = (song, index) => {
    dispatch(setActiveSong({ song, data: SongData, i: index }));
    dispatch(playPause(true));
  };

  const formatDuration = (durationInSeconds) => {
    if (!durationInSeconds) return "0:00";
    const minutes = Math.floor(durationInSeconds / 60);
    const seconds = Math.round(durationInSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    const getPlaylists = async () => {
      try {
        const res = await getUserPlaylists();
        if (res?.success === true) {
          setPlaylists(res?.data?.playlists || []);
        }
      } catch {}
    };
    getPlaylists();
  }, []);

  const handleAddToPlaylist = async (song, pId) => {
    setShowMenu(null);
    try {
      const res = await addSongToPlaylist(pId, song);
      if (res?.success === true) {
        toast.success(res?.message || "Added to playlist");
      } else {
        toast.error(res?.message || "Could not add");
      }
    } catch {
      toast.error("An error occurred");
    }
  };

  const handleDeleteFromPlaylist = async (pId, song) => {
    setShowMenu(null);
    try {
      const res = await deleteSongFromPlaylist(pId, song);
      if (res?.success === true) {
        if (setSongs) {
          setSongs((prev) =>
            prev.filter((s) => s?.id?.toString() !== song?.toString()),
          );
        }
        toast.success(res?.message || "Removed from playlist");
      } else {
        toast.error(res?.message || "Could not remove");
      }
    } catch {
      toast.error("An error occurred");
    }
  };

  if (loading) {
    return <SongListSkeleton />;
  }

  if (!Array.isArray(SongData) || SongData.length === 0) {
    return (
      <div className="py-12 text-center text-gray-400">
        No songs found in this list.
      </div>
    );
  }

  return (
    <>
      <div className="mt-4 flex flex-col gap-1">
        {/* Spotify Table Header */}
        <div className="hidden sm:grid grid-cols-12 px-4 py-2 border-b border-white/[0.08] text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
          <div className="col-span-1 text-center">#</div>
          <div className="col-span-6 md:col-span-7">Title</div>
          {!hidePlays && (
            <div className="hidden lg:block lg:col-span-2">Plays</div>
          )}
          <div
            className={`${hidePlays ? "col-span-4 md:col-span-3" : "col-span-4 md:col-span-2"} text-right pr-6`}
          >
            Duration
          </div>
        </div>

        {SongData.map((song, index) => {
          const isThisActive =
            activeSong?.id === song?.id ||
            (activeSong?.name && activeSong?.name === song?.name);

          const artistName =
            (Array.isArray(song?.artists?.primary) &&
              song.artists.primary.map((a) => a?.name).join(", ")) ||
            (Array.isArray(song?.artists) &&
              song.artists.map((a) => a?.name).join(", ")) ||
            (typeof song?.artists === "string" ? song.artists : "") ||
            song?.primaryArtists ||
            "";

          return (
            <div
              key={song?.id || index}
              onClick={() => handlePlayClick(song, index)}
              className={`group grid grid-cols-12 items-center px-3 sm:px-4 py-2.5 rounded-xl cursor-pointer transition-all duration-200 ${
                isThisActive
                  ? "bg-white/[0.08] border border-[#a855f7]/30 shadow-md"
                  : "hover:bg-white/[0.05] border border-transparent"
              }`}
            >
              {/* Index / Play indicator */}
              <div className="col-span-2 sm:col-span-1 flex items-center justify-center">
                {isThisActive ? (
                  isPlaying ? (
                    <BiHeadphone
                      size={22}
                      className="text-[#a855f7] animate-pulse"
                    />
                  ) : (
                    <BsPauseFill size={20} className="text-[#a855f7]" />
                  )
                ) : (
                  <>
                    <span className="group-hover:hidden text-xs font-bold text-gray-400">
                      {index + 1}
                    </span>
                    <BsPlayFill
                      size={20}
                      className="hidden group-hover:block text-white"
                    />
                  </>
                )}
              </div>

              {/* Title & Artist */}
              <div className="col-span-7 sm:col-span-6 md:col-span-7 flex items-center gap-3 min-w-0 pr-2">
                <img
                  src={
                    song?.image?.[2]?.url ||
                    song?.image?.[1]?.url ||
                    song?.image?.[0]?.url ||
                    ""
                  }
                  alt={song?.name || "cover"}
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-lg object-cover flex-shrink-0 bg-[#18181f] shadow-sm"
                />
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-sm font-semibold truncate transition-colors ${
                      isThisActive
                        ? "text-[#a855f7]"
                        : "text-white group-hover:text-white"
                    }`}
                  >
                    {song?.name
                      ?.replaceAll("&#039;", "'")
                      ?.replaceAll("&amp;", "&")}
                  </p>
                  <p className="text-xs text-[#b3b3b3] truncate mt-0.5 group-hover:text-gray-300">
                    {artistName}
                  </p>
                </div>
              </div>

              {/* Plays count */}
              {!hidePlays && (
                <div className="hidden lg:block lg:col-span-2 text-xs text-gray-400">
                  {song?.playCount
                    ? Number(song.playCount).toLocaleString()
                    : "-"}
                </div>
              )}

              {/* Duration & Options Menu */}
              <div className="col-span-3 sm:col-span-5 md:col-span-4 lg:col-span-2 flex items-center justify-end gap-2 text-xs text-gray-400">
                <span className="font-mono">
                  {formatDuration(song?.duration)}
                </span>
                <div className="relative">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenu(showMenu === song?.id ? null : song?.id);
                    }}
                    className="p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <PiDotsThreeVerticalBold size={18} />
                  </button>

                  {showMenu === song?.id && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="absolute right-0 top-8 z-50 w-44 rounded-xl border border-white/15 bg-[#18181f]/95 backdrop-blur-2xl p-2 shadow-2xl text-white text-xs animate-fadeIn"
                    >
                      {isUserPlaylist ? (
                        <button
                          type="button"
                          onClick={() =>
                            handleDeleteFromPlaylist(playlistID, song?.id)
                          }
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-red-500/20 text-red-400 flex items-center gap-2 transition-colors font-medium"
                        >
                          <MdOutlineDeleteOutline size={16} /> Remove from
                          playlist
                        </button>
                      ) : (
                        <>
                          <div className="px-3 py-1 text-[10px] text-gray-400 uppercase font-bold tracking-wider border-b border-white/10 mb-1">
                            Add to Playlist
                          </div>
                          {playlists?.length > 0 ? (
                            playlists.map((pl) => (
                              <button
                                key={pl._id}
                                type="button"
                                onClick={() =>
                                  handleAddToPlaylist(song?.id, pl._id)
                                }
                                className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-white/10 text-gray-200 hover:text-white transition-colors truncate"
                              >
                                {pl.name}
                              </button>
                            ))
                          ) : (
                            <div className="px-3 py-2 text-gray-500 italic">
                              No personal playlists
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showMenu && (
        <div
          onClick={() => setShowMenu(null)}
          className="fixed inset-0 z-40 bg-transparent"
        />
      )}
    </>
  );
};

export default SongsList;
