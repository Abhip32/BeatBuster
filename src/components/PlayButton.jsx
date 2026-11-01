"use client";
import React from "react";
import { useDispatch } from "react-redux";
import { BsFillPlayFill } from "react-icons/bs";

import { playPause, setActiveSong } from "@/redux/features/playerSlice";
import BulkDownloadButton from "./BulkDownloadButton";

const PlayButton = ({ songList, children }) => {
  const dispatch = useDispatch();
  const songs = Array.isArray(songList?.songs) ? songList.songs : [];

  if (songs.length === 0) return null;

  const handlePlayClick = (song, index) => {
    dispatch(setActiveSong({ song, data: songs, i: index }));
    dispatch(playPause(true));
  };

  return (
    <div className="mt-5 sm:mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-center md:justify-start gap-2.5 sm:gap-3 w-full sm:w-auto max-w-sm sm:max-w-none mx-auto md:mx-0">
      <button
        type="button"
        onClick={() => {
          handlePlayClick(songList?.songs?.[0], 0);
        }}
        className="group relative flex h-11 sm:h-13 items-center justify-center gap-2.5 rounded-full bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-500 hover:to-rose-600 px-6 sm:px-8 text-white font-extrabold text-sm sm:text-base tracking-wide shadow-[0_8px_24px_rgba(244,63,94,0.45)] hover:scale-[1.02] active:scale-95 transition-all duration-200 cursor-pointer"
      >
        <BsFillPlayFill
          size={24}
          className="text-white transition-transform duration-200 group-hover:scale-110"
        />
        <span>Play All</span>
      </button>

      <div className={`grid ${children ? "grid-cols-2" : "grid-cols-1"} sm:flex sm:items-center gap-2 sm:gap-3 w-full sm:w-auto`}>
        <BulkDownloadButton
          songList={songList}
          className="!h-11 sm:!h-13 !px-3 sm:!px-5 !text-xs sm:!text-sm w-full sm:w-auto"
        />
        {children}
      </div>
    </div>
  );
};

export default PlayButton;
