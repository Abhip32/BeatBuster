"use client";
import React from "react";
import { useDispatch } from "react-redux";
import { BsFillPlayFill } from "react-icons/bs";

import { playPause, setActiveSong } from "@/redux/features/playerSlice";
import BulkDownloadButton from "./BulkDownloadButton";

const PlayButton = ({ songList }) => {
  const dispatch = useDispatch();
  const handlePlayClick = (song, index) => {
    dispatch(setActiveSong({ song, data: songList?.songs, i: index }));
    dispatch(playPause(true));
  };

  return (
    <div className="flex flex-wrap items-center gap-3 mt-6">
      <button
        type="button"
        onClick={() => {
          handlePlayClick(songList?.songs?.[0], 0);
        }}
        className="group relative flex h-13 items-center justify-center gap-3 rounded-full bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-500 hover:to-rose-600 px-7 py-3 text-white font-extrabold text-base tracking-wide shadow-[0_8px_24px_rgba(244, 63, 94,0.45)] hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
      >
        <BsFillPlayFill
          size={24}
          className="text-white transition-transform duration-200 group-hover:scale-110"
        />
        <span>Play</span>
      </button>

      <BulkDownloadButton songList={songList} />
    </div>
  );
};

export default PlayButton;
