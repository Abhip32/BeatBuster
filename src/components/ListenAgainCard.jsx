import React from "react";
import { BsPlayFill } from "react-icons/bs";
import { useDispatch, useSelector } from "react-redux";
import {
  playPause,
  setActiveSong,
} from "@/redux/features/playerSlice";
import { BiHeadphone } from "react-icons/bi";

const ListenAgainCard = ({ song, index, SongData }) => {
  const { activeSong } = useSelector((state) => state.player);
  const dispatch = useDispatch();

  const handlePlayClick = (song, index) => {
    dispatch(setActiveSong({ song, data: SongData, i: index }));
    dispatch(playPause(true));
  };

  const artistDisplay =
    (Array.isArray(song?.artists?.primary) &&
      song.artists.primary.map((artist) => artist?.name).join(", ")) ||
    (Array.isArray(song?.artists) &&
      song.artists.map((artist) => artist?.name).join(", ")) ||
    (Array.isArray(song?.artists?.all) &&
      song.artists.all.map((artist) => artist?.name).join(", ")) ||
    "";

  const isCurrentActive = activeSong?.id === song?.id;

  return (
    <div
      onClick={() => {
        handlePlayClick(song, index);
      }}
      className={`flex items-center p-2 rounded-xl cursor-pointer group bg-white/[0.03] hover:bg-white/[0.07] backdrop-blur-md border border-white/[0.05] hover:border-white/15 transition-all duration-200 justify-between ${
        isCurrentActive ? "border-[#ec4899]/40 bg-[#ec4899]/10" : ""
      }`}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="relative w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-[#18181f] shadow-md">
          <img
            src={
              song?.image?.[2]?.url ||
              song?.image?.[1]?.url ||
              song?.image?.[2]?.link ||
              ""
            }
            alt={song?.name || "cover"}
            width={48}
            height={48}
            className="object-cover w-full h-full"
          />
          {isCurrentActive ? (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <BiHeadphone size={24} className="text-[#ec4899] animate-pulse" />
            </div>
          ) : (
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <BsPlayFill size={24} className="text-[#ec4899]" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p
            className={`text-sm font-semibold truncate transition-colors ${
              isCurrentActive ? "text-[#ec4899]" : "text-white group-hover:text-white"
            }`}
          >
            {song?.name?.replace("&#039;", "'")?.replace("&amp;", "&")}
          </p>
          <p className="text-xs text-gray-400 truncate mt-0.5">
            {artistDisplay}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ListenAgainCard;
