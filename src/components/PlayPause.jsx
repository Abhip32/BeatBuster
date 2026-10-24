import React from "react";
import { BsFillPlayFill, BsFillPauseFill } from "react-icons/bs";

const PlayPause = ({
  isPlaying,
  activeSong,
  song,
  handlePause,
  handlePlay,
  loading,
}) => {
  if (loading) {
    return (
      <div className="w-10 h-10 rounded-full bg-[#f43f5e] flex items-center justify-center shadow-[0_0_15px_rgba(244, 63, 94,0.4)]">
        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isCurrentActive =
    isPlaying &&
    (activeSong?.id === song?.id ||
      (activeSong?.name && activeSong?.name === song?.name));

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (isCurrentActive) {
          handlePause();
        } else {
          handlePlay();
        }
      }}
      className="w-11 h-11 rounded-full bg-[#f43f5e] hover:bg-[#e11d48] text-white flex items-center justify-center shadow-[0_8px_20px_rgba(244, 63, 94,0.4)] hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
      aria-label={isCurrentActive ? "Pause" : "Play"}
    >
      {isCurrentActive ? (
        <BsFillPauseFill size={22} className="text-white" />
      ) : (
        <BsFillPlayFill size={24} className="text-white ml-0.5" />
      )}
    </button>
  );
};

export default PlayPause;
