"use client";
import React, { useState, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  removeFromQueue,
  clearQueue,
  setAutoAdd,
  nextSong,
} from "@/redux/features/playerSlice";
import { getlyricsData } from "@/services/dataAPI";
import { useQuery } from "@tanstack/react-query";
import { IoClose, IoMoonOutline, IoMusicalNotesOutline } from "react-icons/io5";
import {
  MdQueueMusic,
  MdOutlineDeleteOutline,
  MdOutlineTimer,
  MdCheck,
} from "react-icons/md";
import { TbMicrophone2 } from "react-icons/tb";
import { BsFillPlayFill } from "react-icons/bs";
import { toast } from "react-hot-toast";
import decodeHtml from "@/utils/decodeHtml";
import { parseLrc, cleanPlainLyrics } from "@/utils/lyricsParser";

const TIMER_OPTIONS = [
  { label: "15 minutes", minutes: 15, mode: "15m" },
  { label: "30 minutes", minutes: 30, mode: "30m" },
  { label: "45 minutes", minutes: 45, mode: "45m" },
  { label: "1 hour", minutes: 60, mode: "60m" },
  { label: "End of this song", minutes: null, mode: "endOfTrack" },
];

const PlaybackHubModal = ({
  isOpen,
  onClose,
  initialTab = "queue",
  activeSong,
  appTime = 0,
  setSeekTime,
  bgColor,
  sleepTimerMode,
  sleepTimerRemaining = 0,
  onSetTimer,
  onCancelTimer,
}) => {
  const [tab, setTab] = useState(initialTab);
  const [mounted, setMounted] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen && initialTab) {
      setTab(initialTab);
    }
  }, [isOpen, initialTab]);

  // Queue Redux State
  const { currentSongs = [], currentIndex = 0, autoAdd = false } = useSelector(
    (state) => state.player || {}
  );

  const upcomingSongs = useMemo(() => {
    if (!Array.isArray(currentSongs) || currentSongs.length === 0) return [];
    return currentSongs
      .map((song, originalIdx) => ({ song, originalIdx }))
      .slice(currentIndex + 1);
  }, [currentSongs, currentIndex]);

  // Lyrics Query
  const containerRef = useRef(null);
  const activeLineRef = useRef(null);
  const [isUserInteracting, setIsUserInteracting] = useState(false);
  const scrollTimeoutRef = useRef(null);

  const { data: lyricsData, isLoading: lyricsLoading } = useQuery({
    queryKey: ["lyrics", activeSong?.id, activeSong?.name],
    queryFn: () => getlyricsData(activeSong),
    enabled: Boolean(isOpen && tab === "lyrics" && (activeSong?.name || activeSong?.id)),
    staleTime: 60 * 60 * 1000,
  });

  const parsedLyrics = useMemo(() => {
    if (lyricsData?.syncedLyrics) {
      const parsed = parseLrc(lyricsData.syncedLyrics);
      if (parsed.length > 0) return parsed;
    }
    if (lyricsData?.plainLyrics) {
      const parsed = parseLrc(lyricsData.plainLyrics);
      if (parsed.length > 0) return parsed;
    }
    return [];
  }, [lyricsData?.syncedLyrics, lyricsData?.plainLyrics]);

  const activeLineIndex = useMemo(() => {
    if (!parsedLyrics.length) return -1;
    let index = -1;
    for (let i = 0; i < parsedLyrics.length; i++) {
      if (appTime >= parsedLyrics[i].time) {
        index = i;
      } else {
        break;
      }
    }
    return index;
  }, [parsedLyrics, appTime]);

  const handleUserScroll = () => {
    setIsUserInteracting(true);
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = setTimeout(() => {
      setIsUserInteracting(false);
    }, 2500);
  };

  useEffect(() => {
    if (isUserInteracting || tab !== "lyrics") return;
    if (activeLineRef.current && isOpen) {
      activeLineRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [activeLineIndex, isUserInteracting, isOpen, tab]);

  if (!isOpen || !mounted || typeof document === "undefined" || !document.body) return null;

  // Queue actions
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

  const formatRemaining = (seconds) => {
    if (seconds <= 0) return "0s";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  };

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-[95] bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
      />

      {/* Floating Hub Modal */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="fixed bottom-24 right-3 sm:right-6 md:right-8 w-[calc(100vw-24px)] max-w-md h-[540px] max-h-[75vh] rounded-3xl shadow-2xl z-[100] overflow-hidden border border-white/10 flex flex-col text-white animate-in fade-in slide-in-from-bottom-3 duration-200"
        style={{
          backgroundColor: bgColor
            ? `rgba(${Math.max(15, bgColor.red * 0.22)}, ${Math.max(
                15,
                bgColor.green * 0.22
              )}, ${Math.max(18, bgColor.blue * 0.22)}, 0.94)`
            : "rgba(18, 14, 22, 0.94)",
          backdropFilter: "blur(50px)",
          WebkitBackdropFilter: "blur(50px)",
        }}
      >
        {/* Unified Tab Header */}
        <div className="flex items-center justify-between px-3.5 py-3 border-b border-white/10 flex-shrink-0 bg-white/[0.04]">
          {/* Segmented Tabs */}
          <div className="flex items-center bg-black/40 p-1 rounded-full border border-white/10">
            {/* Queue Tab */}
            <button
              type="button"
              onClick={() => setTab("queue")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                tab === "queue"
                  ? "bg-rose-500 text-white shadow-sm shadow-rose-500/40"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              <MdQueueMusic size={16} />
              <span>Queue</span>
              {currentSongs.length > 0 && (
                <span
                  className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-full ${
                    tab === "queue"
                      ? "bg-black/30 text-white"
                      : "bg-rose-500/20 text-rose-300"
                  }`}
                >
                  {currentSongs.length}
                </span>
              )}
            </button>

            {/* Lyrics Tab */}
            <button
              type="button"
              onClick={() => setTab("lyrics")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                tab === "lyrics"
                  ? "bg-rose-500 text-white shadow-sm shadow-rose-500/40"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              <TbMicrophone2 size={15} />
              <span>Lyrics</span>
            </button>

            {/* Sleep Timer Tab */}
            <button
              type="button"
              onClick={() => setTab("timer")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer relative ${
                tab === "timer"
                  ? "bg-rose-500 text-white shadow-sm shadow-rose-500/40"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              <IoMoonOutline size={15} />
              <span>Timer</span>
              {sleepTimerMode && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              )}
            </button>
          </div>

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
            title="Close"
          >
            <IoClose size={20} />
          </button>
        </div>

        {/* Tab 1: Queue Content */}
        {tab === "queue" && (
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 scrollbar-thin scrollbar-thumb-white/10">
              {/* Currently Playing Card */}
              {activeSong && (
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-rose-400 mb-2 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                    Now Playing
                  </p>
                  <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-white/[0.08] border border-rose-500/30 shadow-lg">
                    <img
                      src={
                        activeSong?.image?.[1]?.url ||
                        activeSong?.image?.[0]?.url ||
                        "/images/vinyl.png"
                      }
                      alt={activeSong?.name || "cover"}
                      className="w-11 h-11 rounded-xl object-cover flex-shrink-0 shadow"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white truncate">
                        {decodeHtml(activeSong?.name || "Untitled")}
                      </p>
                      <p className="text-xs text-rose-300/80 truncate mt-0.5">
                        {typeof activeSong?.artists === "string"
                          ? activeSong.artists
                          : activeSong?.artists?.primary?.[0]?.name || "Artist"}
                      </p>
                    </div>
                    {/* Equalizer animation */}
                    <div className="flex items-end gap-0.5 h-4 px-2">
                      <span className="w-1 bg-rose-500 rounded-full animate-[pulse_0.8s_ease-in-out_infinite] h-3" />
                      <span className="w-1 bg-rose-400 rounded-full animate-[pulse_1.1s_ease-in-out_infinite] h-4" />
                      <span className="w-1 bg-rose-500 rounded-full animate-[pulse_0.6s_ease-in-out_infinite] h-2" />
                    </div>
                  </div>
                </div>
              )}

              {/* Next In Queue Header & Controls */}
              <div className="pt-1">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                      Next in Queue
                    </p>
                    {upcomingSongs.length > 0 && (
                      <span className="text-[10px] text-gray-400 font-medium">
                        ({upcomingSongs.length})
                      </span>
                    )}
                  </div>
                  {upcomingSongs.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClear}
                      className="text-[11px] font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      <MdOutlineDeleteOutline size={14} />
                      <span>Clear</span>
                    </button>
                  )}
                </div>

                {/* Upcoming List */}
                {upcomingSongs.length > 0 ? (
                  <div className="space-y-1">
                    {upcomingSongs.map(({ song, originalIdx }) => (
                      <div
                        key={`${song?.id || originalIdx}-${originalIdx}`}
                        onClick={(e) => handlePlayQueued(e, originalIdx)}
                        className="group flex items-center gap-3 p-2 rounded-xl hover:bg-white/[0.08] transition-all cursor-pointer border border-transparent hover:border-white/10"
                      >
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-black/40">
                          <img
                            src={
                              song?.image?.[1]?.url ||
                              song?.image?.[0]?.url ||
                              "/images/vinyl.png"
                            }
                            alt={song?.name || "song"}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <BsFillPlayFill className="text-white text-lg ml-0.5" />
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-white group-hover:text-rose-400 truncate transition-colors">
                            {decodeHtml(song?.name || "Untitled")}
                          </p>
                          <p className="text-[11px] text-gray-400 truncate mt-0.5">
                            {typeof song?.artists === "string"
                              ? song.artists
                              : song?.artists?.primary?.[0]?.name || "Artist"}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => handleRemove(e, song?.id)}
                          className="w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:text-rose-400 hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                          title="Remove from queue"
                        >
                          <MdOutlineDeleteOutline size={15} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-10 text-center text-gray-400">
                    <p className="text-xs">Queue is empty</p>
                    <p className="text-[11px] text-gray-500 mt-1">
                      Play any song or album to queue upcoming tracks
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Queue Footer */}
            <div className="p-3 border-t border-white/10 bg-white/[0.02] flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-white">Autoplay Similar</p>
                <p className="text-[10px] text-gray-400">Continuous playback</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoAdd}
                  onChange={(e) => handleToggleAutoAdd(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-500" />
              </label>
            </div>
          </div>
        )}

        {/* Tab 2: Lyrics Content */}
        {tab === "lyrics" && (
          <div
            ref={containerRef}
            onScroll={handleUserScroll}
            className="flex-1 overflow-y-auto px-5 py-4 scrollbar-thin scrollbar-thumb-white/10"
          >
            {lyricsLoading ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-16">
                <div className="w-8 h-8 rounded-full border-2 border-rose-500 border-t-transparent animate-spin mb-3" />
                <p className="text-xs text-gray-400">Loading lyrics...</p>
              </div>
            ) : parsedLyrics.length > 0 ? (
              <div className="space-y-4 py-6">
                {parsedLyrics.map((item, index) => {
                  const isActive = index === activeLineIndex;
                  return (
                    <p
                      key={item.id}
                      ref={isActive ? activeLineRef : null}
                      onClick={() => setSeekTime && setSeekTime(item.time)}
                      className={`cursor-pointer transition-all duration-300 leading-relaxed ${
                        isActive
                          ? "text-[#f43f5e] font-bold text-base sm:text-lg scale-[1.02] origin-left drop-shadow-[0_2px_8px_rgba(244,63,94,0.4)]"
                          : "text-gray-300/80 hover:text-white text-xs sm:text-sm font-medium"
                      }`}
                    >
                      {item.text}
                    </p>
                  );
                })}
              </div>
            ) : lyricsData?.plainLyrics ? (
              <div className="py-4">
                <p className="text-xs sm:text-sm text-gray-200 leading-relaxed whitespace-pre-line font-medium">
                  {cleanPlainLyrics(lyricsData.plainLyrics)}
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center py-16 text-gray-400">
                <IoMusicalNotesOutline size={38} className="mb-2 text-gray-500" />
                <p className="text-sm font-semibold text-gray-300">
                  No Lyrics Available
                </p>
                <p className="text-xs text-gray-500 mt-1 max-w-xs">
                  We couldn&apos;t find lyrics for this track right now.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Sleep Timer Content */}
        {tab === "timer" && (
          <div className="flex-1 flex flex-col justify-between p-4">
            <div>
              {/* Active Timer Banner */}
              {sleepTimerMode ? (
                <div className="p-3.5 mb-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center shadow">
                      <MdOutlineTimer size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Timer Active</p>
                      <p className="text-[11px] text-rose-300 font-medium">
                        {sleepTimerMode === "endOfTrack"
                          ? "Pauses at end of current track"
                          : `${formatRemaining(sleepTimerRemaining)} remaining`}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onCancelTimer();
                      toast.success("Sleep timer turned off");
                    }}
                    className="text-xs font-bold text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full transition-colors cursor-pointer"
                  >
                    Turn Off
                  </button>
                </div>
              ) : (
                <p className="text-xs text-gray-400 mb-3 px-1">
                  Choose when playback should automatically pause:
                </p>
              )}

              {/* Timer Presets */}
              <div className="space-y-1.5">
                {TIMER_OPTIONS.map((opt) => {
                  const isSelected = sleepTimerMode === opt.mode;
                  return (
                    <button
                      key={opt.mode}
                      type="button"
                      onClick={() => {
                        onSetTimer(
                          opt.mode,
                          opt.minutes ? opt.minutes * 60 : null
                        );
                        toast.success(`Sleep timer set: ${opt.label}`);
                      }}
                      className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-left text-xs font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                          : "hover:bg-white/[0.08] text-gray-200 hover:text-white border border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <MdOutlineTimer
                          size={16}
                          className={isSelected ? "text-rose-400" : "text-gray-400"}
                        />
                        <span>{opt.label}</span>
                      </div>
                      {isSelected && <MdCheck size={16} className="text-rose-400" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <p className="text-[11px] text-center text-gray-500 py-2">
              Music will automatically fade or pause when timer ends.
            </p>
          </div>
        )}
      </div>
    </>,
    document.body
  );
};

export default PlaybackHubModal;
