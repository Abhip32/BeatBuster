"use client";
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  BsFillVolumeUpFill,
  BsVolumeDownFill,
  BsFillVolumeMuteFill,
} from "react-icons/bs";
import { BiAddToQueue } from "react-icons/bi";
import { MdQueueMusic } from "react-icons/md";
import { addSongToPlaylist, getUserPlaylists } from "@/services/playlistApi";
import { toast } from "react-hot-toast";
import PlaybackHubModal from "./PlaybackHubModal";
import { useDispatch, useSelector } from "react-redux";
import {
  setPlaylists,
  addSongToPlaylistState,
} from "@/redux/features/playlistsSlice";
import { useSession } from "next-auth/react";

const VolumeBar = ({
  value,
  min,
  max,
  onChange,
  setVolume,
  activeSong,
  bgColor,
  fullScreen,
  appTime = 0,
  setSeekTime,
  isHubOpen,
  setIsHubOpen,
  hubTab = "queue",
  setHubTab,
  sleepTimerMode,
  sleepTimerRemaining = 0,
  onSetTimer,
  onCancelTimer,
}) => {
  const dispatch = useDispatch();
  const { status } = useSession();
  const playlists = useSelector((state) => state.playlists.playlists);
  const isLoaded = useSelector((state) => state.playlists.isLoaded);
  const currentSongs = useSelector((state) => state.player?.currentSongs || []);

  const [showMenu, setShowMenu] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [localHubOpen, setLocalHubOpen] = useState(false);
  const [localHubTab, setLocalHubTab] = useState("queue");

  useEffect(() => {
    setMounted(true);
  }, []);

  const hubOpen = isHubOpen !== undefined ? isHubOpen : localHubOpen;
  const setHubOpen = setIsHubOpen !== undefined ? setIsHubOpen : setLocalHubOpen;
  const currentTab = hubTab !== undefined ? hubTab : localHubTab;
  const setCurrentTab = setHubTab !== undefined ? setHubTab : setLocalHubTab;

  useEffect(() => {
    if (status === "authenticated" && !isLoaded) {
      const getPlaylists = async () => {
        try {
          const res = await getUserPlaylists();
          if (res?.success === true) {
            dispatch(setPlaylists(res?.data?.playlists || []));
          }
        } catch {
          // ignore
        }
      };
      getPlaylists();
    }
  }, [status, isLoaded, dispatch]);

  const handleAddToPlaylist = async (song, playlistID) => {
    setShowMenu(false);
    try {
      dispatch(addSongToPlaylistState({ playlistId: playlistID, song }));
      const res = await addSongToPlaylist(playlistID, song);
      if (res?.success === true) {
        toast.success(res?.message || "Added to playlist");
      } else {
        toast.error(res?.message || "Failed to add song");
      }
    } catch {
      toast.error("Failed to add song to playlist");
    }
  };

  return (
    <>
      <div
        className={`${
          fullScreen ? "hidden min-[1180px]:flex" : "hidden sm:flex"
        } items-center justify-end gap-1.5 sm:gap-2.5 flex-shrink-0 min-w-0`}
      >
        {/* Single Action Button: Opens Playback Hub Modal with 3 tabs (Queue, Lyrics, Sleep Timer) */}
        {!fullScreen && (
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={(e) => {
              e.stopPropagation();
              e.currentTarget.blur();
              setHubOpen((prev) => !prev);
              setShowMenu(false);
            }}
            title={`Queue, Lyrics & Sleep Timer • ${currentSongs.length} tracks`}
            className={`relative p-2 rounded-full transition-all cursor-pointer outline-none focus:outline-none flex-shrink-0 ${
              hubOpen
                ? "text-white bg-rose-500 shadow-md shadow-rose-500/40"
                : "text-white/80 hover:text-white hover:bg-white/10"
            }`}
          >
            <MdQueueMusic size={21} />
            {currentSongs.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] px-1 rounded-full bg-rose-500 text-[9px] font-black text-white flex items-center justify-center shadow-sm">
                {currentSongs.length > 9 ? "9+" : currentSongs.length}
              </span>
            )}
            {sleepTimerMode && (
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-amber-400 border-2 border-black animate-pulse" />
            )}
          </button>
        )}

        {/* Add to Playlist Button & Floating Dialog */}
        <div className="relative flex-shrink-0">
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={(e) => {
              e.stopPropagation();
              e.currentTarget.blur();
              setShowMenu((prev) => !prev);
              setHubOpen(false);
            }}
            title="Add to Playlist"
            className={`p-1.5 sm:p-2 transition-colors cursor-pointer rounded-full hover:bg-white/10 outline-none flex-shrink-0 ${
              showMenu ? "text-[#f43f5e]" : "text-white/80 hover:text-white"
            }`}
          >
            <BiAddToQueue size={20} />
          </button>

          {showMenu &&
            mounted &&
            typeof document !== "undefined" &&
            document.body &&
            createPortal(
              <>
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(false);
                  }}
                  className="fixed inset-0 z-[90]"
                />

                <div
                  onClick={(e) => e.stopPropagation()}
                  className="fixed bottom-24 right-4 sm:right-8 w-56 sm:w-64 rounded-xl shadow-2xl z-[100] overflow-hidden border border-white/10 p-3 flex flex-col gap-2 text-white animate-in fade-in slide-in-from-bottom-2 duration-150"
                  style={{
                    backgroundColor: bgColor
                      ? `rgba(${bgColor.red}, ${bgColor.green}, ${bgColor.blue}, 0.25)`
                      : "rgba(18,14,22,0.92)",
                    backdropFilter: "blur(40px)",
                    WebkitBackdropFilter: "blur(40px)",
                  }}
                >
                  <p className="text-xs font-bold flex gap-1 border-b border-white/15 pb-2 items-center text-white">
                    Add to Playlist
                  </p>
                  {playlists?.length > 0 ? (
                    <div className="flex flex-col gap-1 overflow-y-auto max-h-48 hideScrollBar">
                      {playlists?.map((playlist, index) => (
                        <button
                          key={index}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToPlaylist(activeSong, playlist._id);
                          }}
                          className="text-xs text-gray-200 hover:text-[#f43f5e] hover:bg-white/10 px-2.5 py-1.5 rounded-lg text-left transition-colors truncate cursor-pointer"
                        >
                          {playlist?.name}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 py-3 text-center">
                      No Playlists Found
                    </p>
                  )}
                </div>
              </>,
              document.body
            )}
        </div>

        {/* Volume controls */}
        <div className="flex items-center ml-0.5 sm:ml-1 flex-shrink-0">
          {value <= 1 && value > 0.5 && (
            <BsFillVolumeUpFill
              size={20}
              color="#FFF"
              className="cursor-pointer hover:text-[#f43f5e] transition-colors"
              title="Mute"
              onClick={(e) => {
                e.stopPropagation();
                setVolume(0);
              }}
            />
          )}
          {value <= 0.5 && value > 0 && (
            <BsVolumeDownFill
              size={20}
              className="cursor-pointer hover:text-[#f43f5e] transition-colors"
              color="#FFF"
              title="Mute"
              onClick={(e) => {
                e.stopPropagation();
                setVolume(0);
              }}
            />
          )}
          {value === 0 && (
            <BsFillVolumeMuteFill
              size={20}
              color="#f43f5e"
              className="cursor-pointer hover:scale-110 transition-transform"
              title="Unmute"
              onClick={(e) => {
                e.stopPropagation();
                setVolume(0.8);
              }}
            />
          )}
          <input
            onClick={(event) => {
              event.stopPropagation();
            }}
            type="range"
            step="any"
            value={value}
            min={min}
            max={max}
            onChange={onChange}
            style={{
              background: `linear-gradient(to right, #f43f5e ${Math.min(
                Math.max(((value - min) / ((max - min) || 1)) * 100, 0),
                100
              )}%, rgba(255, 255, 255, 0.2) ${Math.min(
                Math.max(((value - min) / ((max - min) || 1)) * 100, 0),
                100
              )}%)`,
            }}
            className="hidden md:inline-block w-14 sm:w-16 lg:w-20 xl:w-24 h-1 ml-2 accent-[#f43f5e] cursor-pointer outline-none focus:outline-none focus:ring-0"
          />
        </div>
      </div>

      {/* Unified Playback Hub Modal (Queue, Lyrics, Sleep Timer 3 Tabs) */}
      {!fullScreen && (
        <PlaybackHubModal
          isOpen={hubOpen}
          onClose={() => setHubOpen(false)}
          initialTab={currentTab}
          activeSong={activeSong}
          appTime={appTime}
          setSeekTime={setSeekTime}
          bgColor={bgColor}
          sleepTimerMode={sleepTimerMode}
          sleepTimerRemaining={sleepTimerRemaining}
          onSetTimer={onSetTimer}
          onCancelTimer={onCancelTimer}
        />
      )}
    </>
  );
};

export default VolumeBar;
