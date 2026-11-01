"use client";
import React, { useMemo } from "react";
import { createPortal } from "react-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  removeFromQueue,
  clearQueue,
  setAutoAdd,
  nextSong,
} from "@/redux/features/playerSlice";
import { IoClose } from "react-icons/io5";
import { MdQueueMusic, MdOutlineDeleteOutline } from "react-icons/md";
import { BsFillPlayFill } from "react-icons/bs";
import { toast } from "react-hot-toast";
import decodeHtml from "@/utils/decodeHtml";

const MiniQueueModal = ({ isOpen, onClose, activeSong, bgColor }) => {
  const dispatch = useDispatch();
  const { currentSongs = [], currentIndex = 0, autoAdd = false } = useSelector(
    (state) => state.player || {}
  );

  const upcomingSongs = useMemo(() => {
    if (!Array.isArray(currentSongs) || currentSongs.length === 0) return [];
    return currentSongs
      .map((song, originalIdx) => ({ song, originalIdx }))
      .slice(currentIndex + 1);
  }, [currentSongs, currentIndex]);

  if (!isOpen || typeof document === "undefined") return null;

  const handleClear = (e) => {
    e.stopPropagation();
    dispatch(clearQueue());
    toast.success("Queue cleared");
  };

  const handleRemove = (e, songId) => {
    e.stopPropagation();
    dispatch(removeFromQueue(songId));
    toast.success("Removed from queue");
  };

  const handlePlayQueued = (e, originalIdx) => {
    e.stopPropagation();
    dispatch(nextSong(originalIdx));
  };

  const handleToggleAutoAdd = (checked) => {
    dispatch(setAutoAdd(checked));
    try {
      localStorage.setItem("autoAdd", JSON.stringify(checked));
    } catch {}
  };

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-[95] bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
      />

      {/* Floating Queue Drawer Panel */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="fixed bottom-24 right-3 sm:right-6 md:right-8 w-[calc(100vw-24px)] max-w-md h-[560px] max-h-[75vh] rounded-3xl shadow-2xl z-[100] overflow-hidden border border-white/10 flex flex-col text-white animate-in fade-in slide-in-from-bottom-3 duration-200"
        style={{
          backgroundColor: bgColor
            ? `rgba(${Math.max(15, bgColor.red * 0.25)}, ${Math.max(
                15,
                bgColor.green * 0.25
              )}, ${Math.max(18, bgColor.blue * 0.25)}, 0.88)`
            : "rgba(18, 18, 22, 0.92)",
          backdropFilter: "blur(50px)",
          WebkitBackdropFilter: "blur(50px)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 flex-shrink-0 bg-white/[0.03]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
              <MdQueueMusic size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-white">Play Queue</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30">
                  {currentSongs.length} {currentSongs.length === 1 ? "track" : "tracks"}
                </span>
              </div>
              <p className="text-[11px] text-gray-400">Manage upcoming tracks</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {currentSongs.length > 1 && (
              <button
                type="button"
                onClick={handleClear}
                className="text-xs font-semibold px-2.5 py-1 rounded-full text-rose-400 hover:text-white bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-all cursor-pointer"
                title="Clear upcoming queue"
              >
                Clear Queue
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
              title="Close Queue"
            >
              <IoClose size={20} />
            </button>
          </div>
        </div>

        {/* Scrollable Queue Content */}
        <div className="flex-1 min-h-0 overflow-y-auto px-4 py-3 space-y-4 scrollbar-thin">
          {/* Now Playing Card */}
          <div>
            <span className="text-[10px] uppercase font-extrabold tracking-wider text-rose-400 mb-1.5 block">
              Now Playing
            </span>
            <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-white/[0.06] border border-rose-500/25 shadow-md">
              <img
                src={
                  activeSong?.image?.[1]?.url ||
                  activeSong?.image?.[0]?.url ||
                  "/images/vinyl.png"
                }
                alt="art"
                className="w-12 h-12 rounded-xl object-cover flex-shrink-0 border border-white/10"
              />
              <div className="min-w-0 flex-1">
                <p className="font-bold text-sm text-white truncate">
                  {decodeHtml(activeSong?.name || activeSong?.title || "Track")}
                </p>
                <p className="text-xs text-rose-300 truncate mt-0.5 font-medium">
                  {decodeHtml(
                    Array.isArray(activeSong?.artists?.primary)
                      ? activeSong.artists.primary.map((a) => a.name).join(", ")
                      : typeof activeSong?.artists === "string"
                      ? activeSong.artists
                      : "Artist"
                  )}
                </p>
              </div>
              <div className="flex items-center gap-1 pr-1">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                <span className="text-[11px] font-bold text-rose-400">Playing</span>
              </div>
            </div>
          </div>

          {/* Up Next List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase font-extrabold tracking-wider text-gray-400 block">
                Up Next ({upcomingSongs.length})
              </span>
              <span className="text-[11px] text-gray-500">Tap to play</span>
            </div>

            {upcomingSongs.length > 0 ? (
              <div className="space-y-1.5">
                {upcomingSongs.map(({ song, originalIdx }, idx) => {
                  const songTitle = decodeHtml(
                    song?.name || song?.title || `Track ${idx + 1}`
                  );
                  const songArtist = decodeHtml(
                    Array.isArray(song?.artists?.primary)
                      ? song.artists.primary.map((a) => a.name).join(", ")
                      : typeof song?.artists === "string"
                      ? song.artists
                      : "Artist"
                  );
                  return (
                    <div
                      key={song?.id ? `${song.id}-${originalIdx}` : originalIdx}
                      onClick={(e) => handlePlayQueued(e, originalIdx)}
                      className="group flex items-center justify-between p-2 rounded-xl bg-white/[0.02] hover:bg-white/[0.07] border border-transparent hover:border-white/10 transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-2">
                        <span className="w-5 text-center text-xs font-semibold text-gray-500 group-hover:text-rose-400 flex-shrink-0">
                          {idx + 1}
                        </span>
                        <div className="relative w-9 h-9 rounded-lg overflow-hidden flex-shrink-0 bg-[#242428] border border-white/5">
                          <img
                            src={
                              song?.image?.[1]?.url ||
                              song?.image?.[0]?.url ||
                              "/images/vinyl.png"
                            }
                            alt="thumb"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <BsFillPlayFill size={16} className="text-white ml-0.5" />
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-xs text-white truncate group-hover:text-rose-300 transition-colors">
                            {songTitle}
                          </p>
                          <p className="text-[11px] text-gray-400 truncate mt-0.5">
                            {songArtist}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => handleRemove(e, song?.id)}
                        className="opacity-60 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-rose-400 hover:bg-white/10 rounded-lg transition-all cursor-pointer flex-shrink-0"
                        title="Remove from queue"
                      >
                        <MdOutlineDeleteOutline size={16} />
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center rounded-2xl bg-white/[0.02] border border-white/[0.06] p-4">
                <p className="text-xs font-semibold text-gray-300">
                  No upcoming tracks in queue
                </p>
                <p className="text-[11px] text-gray-500 mt-1 max-w-xs mx-auto">
                  Click the 3-dots menu on any song and choose "Play Next" or "Add to Queue"
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer with Autoplay Toggle */}
        <div className="p-3.5 border-t border-white/10 bg-white/[0.02] flex items-center justify-between flex-shrink-0">
          <div>
            <p className="text-xs font-bold text-white">Autoplay Similar Music</p>
            <p className="text-[11px] text-gray-400">Keep music playing when queue finishes</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={autoAdd}
              onChange={(e) => handleToggleAutoAdd(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#f43f5e]" />
          </label>
        </div>
      </div>
    </>
  , document.body);
};

export default MiniQueueModal;
