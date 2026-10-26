"use client";
import React, { useState, useEffect, useMemo, useRef } from "react";
import { playPause, setActiveSong } from "@/redux/features/playerSlice";
import { BsPlayFill, BsPauseFill } from "react-icons/bs";
import { useDispatch, useSelector } from "react-redux";
import SongListSkeleton from "./SongListSkeleton";
import { BiHeadphone } from "react-icons/bi";
import { PiDotsThreeVerticalBold } from "react-icons/pi";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import {
  addSongToPlaylist,
  deleteSongFromPlaylist,
  getUserPlaylists,
} from "@/services/playlistApi";
import { addFavourite, getFavourite } from "@/services/dataAPI";
import { setFavourites, toggleFavouriteSong, removeFavouriteSong } from "@/redux/features/favouritesSlice";
import {
  setPlaylists,
  addSongToPlaylistState,
  removeSongFromPlaylistState,
} from "@/redux/features/playlistsSlice";
import { toast } from "react-hot-toast";
import { MdOutlineDeleteOutline } from "react-icons/md";
import { useSession } from "next-auth/react";
import decodeHtml from "@/utils/decodeHtml";

const SongsList = ({
  SongData,
  loading,
  hidePlays,
  isUserPlaylist,
  playlistID,
  setSongs,
  isFavouritePage,
}) => {
  const { activeSong, isPlaying, currentIndex } = useSelector((state) => state.player);
  const { status } = useSession();
  const [showMenu, setShowMenu] = useState(null);
  const playlists = useSelector((state) => state.playlists.playlists);
  const isPlaylistsLoaded = useSelector((state) => state.playlists.isLoaded);
  const { items: favouriteSongs } = useSelector((state) => state.favourites || { items: [] });
  const [visibleCount, setVisibleCount] = useState(25);
  const sentinelRef = useRef(null);
  const dispatch = useDispatch();

  // Deduplicate songs by ID to prevent repeated tracks
  const uniqueSongs = useMemo(() => {
    if (!Array.isArray(SongData)) return [];
    if (hidePlays) return SongData; // Preserve queue tracks and exact currentSongs indices
    const seen = new Set();
    return SongData.filter((s) => {
      if (!s) return false;
      const key = String(s?.id || "");
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [SongData, hidePlays]);

  // Scroll-based loading (Infinite scroll observer)
  useEffect(() => {
    if (!sentinelRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + 20, uniqueSongs.length));
        }
      },
      { rootMargin: "250px" }
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [uniqueSongs.length]);

  const handlePlayClick = (song, index) => {
    dispatch(setActiveSong({ song, data: uniqueSongs, i: index }));
    dispatch(playPause(true));
  };

  const formatDuration = (durationInSeconds) => {
    if (!durationInSeconds) return "0:00";
    const minutes = Math.floor(durationInSeconds / 60);
    const seconds = Math.round(durationInSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // Fetch playlists and favourites
  useEffect(() => {
    let isCancelled = false;
    const loadUserData = async () => {
      try {
        if (status === "authenticated") {
          const promises = [];
          if (!isPlaylistsLoaded) {
            promises.push(getUserPlaylists().catch(() => null));
          }
          promises.push(getFavourite().catch(() => []));
          const results = await Promise.all(promises);
          if (!isCancelled) {
            let plRes = null;
            let favRes = null;
            if (!isPlaylistsLoaded) {
              plRes = results[0];
              favRes = results[1];
            } else {
              favRes = results[0];
            }
            if (plRes?.success === true) {
              dispatch(setPlaylists(plRes?.data?.playlists || []));
            }
            if (Array.isArray(favRes)) {
              dispatch(setFavourites(favRes));
            }
          }
        }
      } catch {}
    };
    loadUserData();
    return () => {
      isCancelled = true;
    };
  }, [status, isPlaylistsLoaded, dispatch]);

  const isSongInFavourites = (song) => {
    if (!song) return false;
    const songId = String(song.id || "");
    const songName = song.name?.trim().toLowerCase() || "";
    return (favouriteSongs || []).some((item) => {
      const itemId = String(typeof item === "object" ? item?.id : item);
      if (songId && itemId === songId) return true;
      if (typeof item === "object" && item?.name && songName) {
        return item.name.trim().toLowerCase() === songName;
      }
      return false;
    });
  };

  const handleToggleFavourite = async (e, song) => {
    e?.stopPropagation();
    if (status === "unauthenticated") {
      toast.error("Please log in to save favourites");
      return;
    }
    const currentlyFav = isSongInFavourites(song);
    const songId = String(song.id || "");
    const songName = song.name?.trim().toLowerCase() || "";

    // Global optimistic update
    dispatch(toggleFavouriteSong(song));
    if (currentlyFav) {
      if (isFavouritePage && setSongs) {
        setSongs((prev) => prev.filter((s) => String(s?.id || "") !== songId));
      }
      toast.success("Removed from Liked Songs");
    } else {
      toast.success("Saved to Liked Songs");
    }

    setShowMenu(null);
    try {
      const res = await addFavourite(song);
      if (res?.success === true && Array.isArray(res?.data?.favourites)) {
        dispatch(setFavourites(res.data.favourites));
      }
    } catch {
      toast.error("Could not update favourites");
    }
  };

  const handleAddToPlaylist = async (song, pId) => {
    setShowMenu(null);
    try {
      // Optimistic Redux state update
      dispatch(addSongToPlaylistState({ playlistId: pId, song }));
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
      if (setSongs) {
        setSongs((prev) =>
          prev.filter((s) => s?.id?.toString() !== song?.toString())
        );
      }
      // Optimistic Redux state update
      dispatch(removeSongFromPlaylistState({ playlistId: pId, song }));
      const res = await deleteSongFromPlaylist(pId, song);
      if (res?.success === true) {
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

  if (uniqueSongs.length === 0) {
    return (
      <div className="py-12 text-center text-gray-400">
        No songs found in this list.
      </div>
    );
  }

  const renderedSongs = uniqueSongs.slice(0, visibleCount);

  return (
    <>
      <div className="mt-4 flex flex-col gap-1">
        {/* Spotify Table Header */}
        <div className="hidden sm:flex items-center justify-between px-3 sm:px-4 py-2 border-b border-white/[0.08] text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
          <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 flex-1 mr-3">
            <span className="w-6 sm:w-8 text-center flex-shrink-0">#</span>
            <span className="pl-12 sm:pl-14">Title</span>
          </div>
          <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
            {!hidePlays && (
              <span className="hidden md:block w-20 text-right mr-1">Plays</span>
            )}
            <span className="w-24 sm:w-28 text-right pr-2">Duration</span>
          </div>
        </div>

        {renderedSongs.map((song, index) => {
          const songId = song?.id ? String(song.id) : null;
          const activeId = activeSong?.id ? String(activeSong.id) : null;
          const idMatches = Boolean(songId && activeId && songId === activeId);
          const isThisActive = hidePlays
            ? (idMatches && index === currentIndex) || (!activeId && index === currentIndex)
            : idMatches;

          const artistName =
            (Array.isArray(song?.artists?.primary) &&
              song.artists.primary.map((a) => a?.name).join(", ")) ||
            (Array.isArray(song?.artists) &&
              song.artists.map((a) => a?.name).join(", ")) ||
            (typeof song?.artists === "string" ? song.artists : "") ||
            song?.primaryArtists ||
            "";

          const isFav = isSongInFavourites(song);

          return (
            <div
              key={hidePlays ? `${song?.id || "track"}-${index}` : (song?.id || index)}
              onClick={() => handlePlayClick(song, index)}
              className={`group flex items-center justify-between px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-xl cursor-pointer transition-all duration-200 ${
                isThisActive
                  ? "bg-white/[0.08] border border-[var(--primary-accent,#f43f5e)]/40 shadow-md"
                  : "hover:bg-white/[0.05] border border-transparent"
              }`}
            >
              {/* Left Column: Index / Play + Artwork + Title & Artist */}
              <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 flex-1 mr-3">
                {/* Index / Play indicator */}
                <div className="w-6 sm:w-8 flex items-center justify-center flex-shrink-0 text-center">
                  {isThisActive ? (
                    isPlaying ? (
                      <BiHeadphone
                        size={20}
                        className="text-[var(--primary-accent,#f43f5e)] animate-pulse"
                      />
                    ) : (
                      <BsPauseFill
                        size={18}
                        className="text-[var(--primary-accent,#f43f5e)]"
                      />
                    )
                  ) : (
                    <>
                      <span className="group-hover:hidden text-xs font-bold text-gray-400">
                        {index + 1}
                      </span>
                      <BsPlayFill
                        size={18}
                        className="hidden group-hover:block text-white"
                      />
                    </>
                  )}
                </div>

                {/* Cover Artwork */}
                <img
                  src={
                    song?.image?.[2]?.url ||
                    song?.image?.[1]?.url ||
                    song?.image?.[0]?.url ||
                    "/images/vinyl.png"
                  }
                  alt={song?.name || "cover"}
                  onError={(e) => {
                    e.currentTarget.src = "/images/vinyl.png";
                  }}
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-lg object-cover flex-shrink-0 bg-[#18181f] shadow-sm"
                />

                {/* Title and Artist */}
                <div className="min-w-0 flex-1 pr-1">
                  <p
                    className={`text-xs sm:text-sm font-semibold truncate transition-colors leading-tight ${
                      isThisActive
                        ? "text-[var(--primary-accent,#f43f5e)]"
                        : "text-white group-hover:text-white"
                    }`}
                  >
                    {decodeHtml(song?.name)}
                  </p>
                  <p className="text-[11px] sm:text-xs text-[#b3b3b3] truncate mt-0.5 group-hover:text-gray-300 leading-tight">
                    {decodeHtml(artistName)}
                  </p>
                </div>
              </div>

              {/* Right Column: Plays count + Heart + Duration + Options Menu */}
              <div className="flex items-center gap-2 sm:gap-3 text-xs text-gray-400 flex-shrink-0 ml-auto">
                {/* Optional Plays count on full pages */}
                {!hidePlays && song?.playCount && (
                  <span className="hidden md:block text-xs text-gray-400 tabular-nums mr-1">
                    {Number(song.playCount).toLocaleString()}
                  </span>
                )}

                {/* Direct Heart Button on row */}
                <button
                  type="button"
                  onClick={(e) => handleToggleFavourite(e, song)}
                  title={isFav ? "Remove from Liked Songs" : "Save to Liked Songs"}
                  className="p-1 cursor-pointer transition-transform hover:scale-125 outline-none focus:outline-none flex-shrink-0"
                >
                  {isFav ? (
                    <AiFillHeart
                      size={18}
                      className="text-[#f43f5e] drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]"
                    />
                  ) : (
                    <AiOutlineHeart
                      size={18}
                      className="text-gray-400 hover:text-[#f43f5e] transition-colors"
                    />
                  )}
                </button>

                {/* Duration */}
                <span className="font-mono text-xs text-gray-300 tabular-nums w-10 sm:w-11 text-right flex-shrink-0">
                  {formatDuration(song?.duration)}
                </span>

                {/* 3 dots menu container */}
                <div className="relative flex-shrink-0">
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
                      className="absolute right-0 top-8 z-50 w-48 rounded-xl border border-white/15 bg-[#18181f]/95 backdrop-blur-2xl p-2 shadow-2xl text-white text-xs animate-fadeIn"
                    >
                      {/* Favourite Action in dropdown */}
                      <button
                        type="button"
                        onClick={(e) => handleToggleFavourite(e, song)}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 flex items-center gap-2 transition-colors font-medium border-b border-white/10 mb-1"
                      >
                        {isFav ? (
                          <>
                            <AiFillHeart className="text-[#f43f5e]" size={16} />
                            <span className="text-rose-">Remove from Liked</span>
                          </>
                        ) : (
                          <>
                            <AiOutlineHeart className="text-gray-300" size={16} />
                            <span>Save to Liked Songs</span>
                          </>
                        )}
                      </button>

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
                          <div className="px-3 py-1 text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">
                            Add to Playlist
                          </div>
                          {playlists?.length > 0 ? (
                            playlists.map((pl) => (
                              <button
                                key={pl._id}
                                type="button"
                                onClick={() =>
                                  handleAddToPlaylist(song, pl._id)
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

        {/* Infinite Scroll Sentinel */}
        {visibleCount < uniqueSongs.length && (
          <div ref={sentinelRef} className="py-4 text-center text-xs text-gray-500">
            Loading more tracks...
          </div>
        )}
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
