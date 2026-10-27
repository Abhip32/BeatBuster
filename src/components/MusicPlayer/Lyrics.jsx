"use client";
import { getlyricsData } from "@/services/dataAPI";
import React, { useState, useEffect, useMemo, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import SongsList from "../SongsList";
import { setAutoAdd } from "@/redux/features/playerSlice";
import { IoMusicalNotesOutline } from "react-icons/io5";

// Helper to parse standard LRC string into an array of { id, time, text }
const parseLrc = (lrcString) => {
  if (!lrcString || typeof lrcString !== "string") return [];
  const lines = lrcString.split("\n");
  const result = [];
  const regex = /\[(\d{2}):(\d{2}(?:\.\d{1,3})?)\](.*)/;

  for (let i = 0; i < lines.length; i++) {
    const match = regex.exec(lines[i].trim());
    if (match) {
      const minutes = parseInt(match[1], 10);
      const seconds = parseFloat(match[2]);
      const text = match[3].trim();
      const time = minutes * 60 + seconds;
      if (text) {
        result.push({ id: i, time, text });
      }
    }
  }
  return result.sort((a, b) => a.time - b.time);
};

const Lyrics = ({
  activeSong,
  appTime = 0,
  setSeekTime,
  activeTab: controlledTab,
  onTabChange,
  hideHeaderTabs = false,
}) => {
  const dispatch = useDispatch();
  const { currentSongs, autoAdd } = useSelector((state) => state.player);
  const [internalTab, setInternalTab] = useState("queue");
  const activeTab = controlledTab !== undefined ? controlledTab : internalTab;

  useEffect(() => {
    try {
      const savedTab = localStorage.getItem("desktopLyricsTab");
      if (savedTab && (savedTab === "queue" || savedTab === "lyrics")) {
        setInternalTab(savedTab);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const handleTabChange = (tab) => {
    if (onTabChange) {
      onTabChange(tab);
    } else {
      setInternalTab(tab);
      try {
        localStorage.setItem("desktopLyricsTab", tab);
      } catch (e) {
        // ignore
      }
    }
  };

  const containerRef = useRef(null);
  const activeLineRef = useRef(null);
  const [isUserInteracting, setIsUserInteracting] = useState(false);
  const scrollTimeoutRef = useRef(null);

  const { data: lyricsData, isLoading: loading } = useQuery({
    queryKey: ["lyrics", activeSong?.id, activeSong?.name],
    queryFn: () => getlyricsData(activeSong),
    enabled: Boolean(activeSong?.name || activeSong?.id),
    staleTime: 60 * 60 * 1000,
  });

  // Parse synchronized lyrics if available
  const parsedLyrics = useMemo(() => {
    if (lyricsData?.syncedLyrics) {
      return parseLrc(lyricsData.syncedLyrics);
    }
    return [];
  }, [lyricsData?.syncedLyrics]);

  // Determine current active lyric line index based on playback time
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

  // Pause auto-scroll briefly when the user manually scrolls
  const handleUserScroll = () => {
    setIsUserInteracting(true);
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = setTimeout(() => {
      setIsUserInteracting(false);
    }, 2500);
  };

  // Smoothly scroll the active lyric line into the vertical center
  useEffect(() => {
    if (isUserInteracting) return;
    if (activeLineRef.current && activeTab === "lyrics") {
      activeLineRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [activeLineIndex, isUserInteracting, activeTab]);

  const handleAutoAdd = (checked) => {
    if (checked) {
      dispatch(setAutoAdd(true));
      localStorage.setItem("autoAdd", "true");
    } else {
      dispatch(setAutoAdd(false));
      localStorage.setItem("autoAdd", "false");
    }
  };

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
      }}
      className="w-full h-full flex flex-col items-center"
    >
      {/* Header Tabs: Queue / Lyrics */}
      {!hideHeaderTabs && (
        <div className="flex justify-center items-center w-full flex-shrink-0 mb-3">
          <button
            onClick={() => handleTabChange("queue")}
            className={`${
              activeTab === "queue"
                ? "border-[#f43f5e] border-b-2 text-white"
                : "text-gray-400 hover:text-white"
            } text-xl mx-4 pb-1 font-semibold transition-colors`}
          >
            Queue
          </button>
          <button
            onClick={() => handleTabChange("lyrics")}
            className={`${
              activeTab === "lyrics"
                ? "border-[#f43f5e] border-b-2 text-white"
                : "text-gray-400 hover:text-white"
            } text-xl mx-4 pb-1 font-semibold transition-colors flex items-center gap-1.5`}
          >
            Lyrics
            {parsedLyrics.length > 0 && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#f43f5e] inline-block" />
            )}
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <div className="w-full flex-1 min-h-0 overflow-y-auto hideScrollBar flex flex-col">
        {activeTab === "lyrics" ? (
          loading ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-3 py-12">
              <div className="w-8 h-8 border-2 border-[#f43f5e] border-t-transparent rounded-full animate-spin" />
              <p className="text-sm">Loading lyrics...</p>
            </div>
          ) : lyricsData?.instrumental ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-300 gap-4 py-16 text-center">
              <IoMusicalNotesOutline className="text-5xl text-[#f43f5e] animate-pulse" />
              <p className="text-lg sm:text-xl font-semibold text-white">
                Instrumental Track
              </p>
              <p className="text-sm text-gray-400">This song has no lyrics.</p>
            </div>
          ) : parsedLyrics.length > 0 ? (
            /* YouTube Music Style Synced Lyrics View */
            <div
              ref={containerRef}
              onScroll={handleUserScroll}
              style={{
                maskImage:
                  "linear-gradient(to bottom, transparent 0%, black 10%, black 85%, transparent 100%)",
                WebkitMaskImage:
                  "linear-gradient(to bottom, transparent 0%, black 10%, black 85%, transparent 100%)",
              }}
              className="w-full flex-1 min-h-0 overflow-y-auto hideScrollBar px-4 sm:px-6 py-16 flex flex-col gap-5 text-left"
            >
              {parsedLyrics.map((line, idx) => {
                const isActive = idx === activeLineIndex;
                const isPast = idx < activeLineIndex;

                return (
                  <p
                    key={line.id}
                    ref={isActive ? activeLineRef : null}
                    onClick={() => {
                      if (setSeekTime) setSeekTime(line.time);
                    }}
                    className={`cursor-pointer select-none transition-all duration-300 ease-out origin-left leading-relaxed ${
                      isActive
                        ? "text-white font-bold text-xl sm:text-2xl scale-[1.03] opacity-100"
                        : isPast
                        ? "text-white/50 font-semibold text-base sm:text-lg opacity-50 hover:opacity-90 hover:text-white"
                        : "text-white/40 font-medium text-base sm:text-lg opacity-40 hover:opacity-80 hover:text-white"
                    }`}
                  >
                    {line.text}
                  </p>
                );
              })}
            </div>
          ) : lyricsData?.plainLyrics ? (
            /* Fallback Plain Lyrics View */
            <div className="w-full flex-1 min-h-0 overflow-y-auto hideScrollBar text-white/90 text-base sm:text-lg px-4 sm:px-6 py-6 text-left whitespace-pre-line leading-loose">
              {lyricsData.plainLyrics}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-2 py-16 text-center">
              <p className="text-base sm:text-lg font-medium text-gray-300">
                No Lyrics Found
              </p>
              <p className="text-xs text-gray-500">
                We couldn't find lyrics for this song on lrclib.net
              </p>
            </div>
          )
        ) : (
          /* Queue Tab */
          <div className="w-full flex-1 min-h-0 flex flex-col">
            <div
              className="flex items-center justify-between gap-3 py-2 px-3 bg-white/[0.05] rounded-xl border border-white/[0.08] mb-2 flex-shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="text-white font-medium text-xs sm:text-sm truncate min-w-0 select-none">
                Auto add similar songs to queue
              </p>

              <label
                htmlFor="autoAddButton"
                className="relative inline-flex items-center cursor-pointer flex-shrink-0"
              >
                <input
                  onChange={(e) => {
                    handleAutoAdd(e.target.checked);
                  }}
                  type="checkbox"
                  checked={autoAdd}
                  className="sr-only peer"
                  name="autoAddButton"
                  id="autoAddButton"
                  placeholder="autoAddButton"
                  title={autoAdd ? "on" : "off"}
                />
                <div className="w-9 h-5 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#f43f5e]" />
              </label>
            </div>
            {currentSongs?.length > 0 ? (
              <div className="text-white mt-1 w-full flex-1 min-h-0 overflow-y-auto hideScrollBar pb-4">
                <SongsList
                  SongData={currentSongs}
                  loading={false}
                  hidePlays={true}
                  isQueue={true}
                  activeSong={activeSong}
                />
              </div>
            ) : (
              <div className="text-white text-base sm:text-lg p-4 mt-8 w-full text-center">
                No Songs
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Lyrics;
