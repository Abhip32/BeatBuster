import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  BsFillVolumeUpFill,
  BsVolumeDownFill,
  BsFillVolumeMuteFill,
  BsKeyboard,
} from "react-icons/bs";
import { BiAddToQueue } from "react-icons/bi";
import { TbMicrophone2 } from "react-icons/tb";
import { MdQueueMusic } from "react-icons/md";
import { IoMoonOutline } from "react-icons/io5";
import { addSongToPlaylist, getUserPlaylists } from "@/services/playlistApi";
import { toast } from "react-hot-toast";
import MiniLyricsModal from "./MiniLyricsModal";
import MiniQueueModal from "./MiniQueueModal";
import SleepTimerModal from "./SleepTimerModal";
import ShortcutsModal from "./ShortcutsModal";
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
  showLyrics,
  setShowLyrics,
  showQueue,
  setShowQueue,
  sleepTimerMode,
  sleepTimerRemaining = 0,
  onSetTimer,
  onCancelTimer,
  showShortcuts,
  setShowShortcuts,
}) => {
  const dispatch = useDispatch();
  const { status } = useSession();
  const playlists = useSelector((state) => state.playlists.playlists);
  const isLoaded = useSelector((state) => state.playlists.isLoaded);
  const currentSongs = useSelector((state) => state.player?.currentSongs || []);

  const [showMenu, setShowMenu] = useState(false);
  const [localShowLyrics, setLocalShowLyrics] = useState(false);
  const [localShowQueue, setLocalShowQueue] = useState(false);
  const [localShowSleep, setLocalShowSleep] = useState(false);
  const [localShowShortcuts, setLocalShowShortcuts] = useState(false);

  const isLyricsOpen = showLyrics !== undefined ? showLyrics : localShowLyrics;
  const setLyricsOpen = setShowLyrics !== undefined ? setShowLyrics : setLocalShowLyrics;

  const isQueueOpen = showQueue !== undefined ? showQueue : localShowQueue;
  const setQueueOpen = setShowQueue !== undefined ? setShowQueue : setLocalShowQueue;

  const isShortcutsOpen = showShortcuts !== undefined ? showShortcuts : localShowShortcuts;
  const setShortcutsOpen = setShowShortcuts !== undefined ? setShowShortcuts : setLocalShowShortcuts;

  useEffect(() => {
    if (status === "authenticated" && !isLoaded) {
      const getPlaylists = async () => {
        try {
          const res = await getUserPlaylists();
          if (res?.success === true) {
            dispatch(setPlaylists(res?.data?.playlists || []));
          }
        } catch (e) {
          // ignore
        }
      };
      getPlaylists();
    }
  }, [status, isLoaded, dispatch]);

  // add song to playlist
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
      <div className={`${fullScreen ? "hidden min-[1180px]:flex" : "hidden sm:flex"} flex-1 items-center justify-end gap-1.5`}>
        {/* Mini Player Lyrics Button */}
        {!fullScreen && (
          <div className="relative">
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={(e) => {
                e.stopPropagation();
                e.currentTarget.blur();
                setLyricsOpen((prev) => !prev);
                setQueueOpen(false);
                setLocalShowSleep(false);
                setShowMenu(false);
              }}
              title="Lyrics (L)"
              className={`p-2 transition-colors cursor-pointer rounded-full hover:bg-white/10 outline-none focus:outline-none focus:ring-0 ${
                isLyricsOpen ? "text-[#f43f5e]" : "text-white hover:text-[#f43f5e]"
              }`}
            >
              <TbMicrophone2 size={22} />
            </button>
          </div>
        )}

        {/* Mini Player Queue Drawer Button */}
        {!fullScreen && (
          <div className="relative">
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={(e) => {
                e.stopPropagation();
                e.currentTarget.blur();
                setQueueOpen((prev) => !prev);
                setLyricsOpen(false);
                setLocalShowSleep(false);
                setShowMenu(false);
              }}
              title={`Play Queue (Q) • ${currentSongs.length} tracks`}
              className={`relative p-2 transition-colors cursor-pointer rounded-full hover:bg-white/10 outline-none focus:outline-none focus:ring-0 ${
                isQueueOpen ? "text-[#f43f5e]" : "text-white hover:text-[#f43f5e]"
              }`}
            >
              <MdQueueMusic size={22} />
              {currentSongs.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-rose-500 text-[9px] font-extrabold text-white flex items-center justify-center shadow-sm">
                  {currentSongs.length > 9 ? "9+" : currentSongs.length}
                </span>
              )}
            </button>
          </div>
        )}

        {/* Sleep Timer Button */}
        {!fullScreen && (
          <div className="relative">
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={(e) => {
                e.stopPropagation();
                e.currentTarget.blur();
                setLocalShowSleep((prev) => !prev);
                setLyricsOpen(false);
                setQueueOpen(false);
                setShowMenu(false);
              }}
              title={
                sleepTimerMode
                  ? `Sleep Timer: ${Math.ceil(sleepTimerRemaining / 60)}m left`
                  : "Sleep Timer"
              }
              className={`relative p-2 transition-colors cursor-pointer rounded-full hover:bg-white/10 outline-none focus:outline-none focus:ring-0 ${
                sleepTimerMode
                  ? "text-rose-400 bg-rose-500/15"
                  : "text-white hover:text-rose-400"
              }`}
            >
              <IoMoonOutline size={20} />
              {sleepTimerMode && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              )}
            </button>
          </div>
        )}

        {/* Add to Playlist Button & Floating Dialog */}
        <div className="relative">
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={(e) => {
              e.stopPropagation();
              e.currentTarget.blur();
              setShowMenu((prev) => !prev);
              setLyricsOpen(false);
              setQueueOpen(false);
              setLocalShowSleep(false);
            }}
            title="Add to Playlist"
            className={`p-2 transition-colors cursor-pointer rounded-full hover:bg-white/10 outline-none focus:outline-none focus:ring-0 ${
              showMenu ? "text-[#f43f5e]" : "text-white hover:text-[#f43f5e]"
            }`}
          >
            <BiAddToQueue size={22} />
          </button>

          {showMenu && createPortal(
            <>
              {/* Click outside backdrop */}
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(false);
                }}
                className="fixed inset-0 z-[90]"
              />

              {/* Floating Add to Playlist Dialog */}
              <div
                onClick={(e) => e.stopPropagation()}
                className="fixed bottom-24 right-4 sm:right-8 w-56 sm:w-64 rounded-xl shadow-2xl z-[100] overflow-hidden border border-white/10 p-3 flex flex-col gap-2 text-white animate-in fade-in slide-in-from-bottom-2 duration-150"
                style={{
                  backgroundColor: bgColor
                    ? `rgba(${bgColor.red}, ${bgColor.green}, ${bgColor.blue}, 0.2)`
                    : "rgba(0,0,0,0.2)",
                  backdropFilter: "blur(40px)",
                  WebkitBackdropFilter: "blur(40px)",
                }}
              >
                <p className="text-sm font-semibold flex gap-1 border-b border-white/15 pb-2 items-center text-white">
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
                        className="text-sm text-gray-200 hover:text-[#f43f5e] hover:bg-white/10 px-2.5 py-1.5 rounded-lg text-left transition-colors truncate"
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

        {/* Keyboard Shortcuts Cheatsheet Button */}
        {!fullScreen && (
          <div className="relative hidden lg:block">
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={(e) => {
                e.stopPropagation();
                e.currentTarget.blur();
                setShortcutsOpen((prev) => !prev);
              }}
              title="Keyboard Shortcuts (?)"
              className="p-2 text-white/60 hover:text-white transition-colors cursor-pointer rounded-full hover:bg-white/10"
            >
              <BsKeyboard size={18} />
            </button>
          </div>
        )}

        {/* Volume controls */}
        <div className="flex items-center ml-1">
          {value <= 1 && value > 0.5 && (
            <BsFillVolumeUpFill
              size={22}
              color="#FFF"
              className="cursor-pointer hover:text-[#f43f5e] transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setVolume(0);
              }}
            />
          )}
          {value <= 0.5 && value > 0 && (
            <BsVolumeDownFill
              size={22}
              className="cursor-pointer hover:text-[#f43f5e] transition-colors"
              color="#FFF"
              onClick={(e) => {
                e.stopPropagation();
                setVolume(0);
              }}
            />
          )}
          {value === 0 && (
            <BsFillVolumeMuteFill
              size={22}
              color="#FFF"
              className="cursor-pointer hover:text-[#f43f5e] transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setVolume(1);
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
            style={{ background: `linear-gradient(to right, #f43f5e ${Math.min(Math.max(((value - min) / ((max - min) || 1)) * 100, 0), 100)}%, rgba(255, 255, 255, 0.2) ${Math.min(Math.max(((value - min) / ((max - min) || 1)) * 100, 0), 100)}%)` }}
            className="w-16 sm:w-20 md:w-24 h-1 ml-2 accent-[#f43f5e] cursor-pointer outline-none focus:outline-none focus:ring-0"
          />
        </div>
      </div>

      {/* Floating Mini Lyrics Modal */}
      {!fullScreen && (
        <MiniLyricsModal
          isOpen={isLyricsOpen}
          onClose={() => setLyricsOpen(false)}
          activeSong={activeSong}
          appTime={appTime}
          setSeekTime={setSeekTime}
          bgColor={bgColor}
        />
      )}

      {/* Floating Mini Queue Modal */}
      {!fullScreen && (
        <MiniQueueModal
          isOpen={isQueueOpen}
          onClose={() => setQueueOpen(false)}
          activeSong={activeSong}
          bgColor={bgColor}
        />
      )}

      {/* Floating Sleep Timer Modal */}
      {!fullScreen && (
        <SleepTimerModal
          isOpen={localShowSleep}
          onClose={() => setLocalShowSleep(false)}
          bgColor={bgColor}
          sleepTimerMode={sleepTimerMode}
          sleepTimerRemaining={sleepTimerRemaining}
          onSetTimer={onSetTimer}
          onCancelTimer={onCancelTimer}
        />
      )}

      {/* Floating Keyboard Shortcuts Guide Modal */}
      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setShortcutsOpen(false)}
      />
    </>
  );
};

export default VolumeBar;

