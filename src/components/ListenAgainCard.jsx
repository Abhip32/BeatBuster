import React from "react";
import { BsPlayFill } from "react-icons/bs";
import { useDispatch, useSelector } from "react-redux";
import {
  playPause,
  setActiveSong,
  addToQueue,
} from "@/redux/features/playerSlice";
import { BiHeadphone } from "react-icons/bi";
import { MdQueueMusic } from "react-icons/md";
import { toast } from "react-hot-toast";
import decodeHtml from "@/utils/decodeHtml";

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

  const isCurrentActive = Boolean(
    activeSong?.id && song?.id && String(activeSong.id) === String(song.id)
  );

  return (
    <div
      onClick={() => {
        handlePlayClick(song, index);
      }}
      className={`flex items-center p-2 rounded-xl cursor-pointer group bg-white/[0.03] hover:bg-white/[0.07] backdrop-blur-md border border-white/[0.05] hover:border-white/15 transition-all duration-200 justify-between ${
        isCurrentActive ? "border-[#f43f5e]/40 bg-[#f43f5e]/10" : ""
      }`}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="relative w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-[#18181f] shadow-md">
          <img
            src={
              song?.image?.[2]?.url ||
              song?.image?.[1]?.url ||
              song?.image?.[2]?.link ||
              "/images/vinyl.png"
            }
            alt={song?.name || "cover"}
            onError={(e) => {
              e.currentTarget.src = "/images/vinyl.png";
            }}
            width={48}
            height={48}
            className="object-cover w-full h-full"
          />
          {isCurrentActive ? (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <BiHeadphone size={24} className="text-[#f43f5e] animate-pulse" />
            </div>
          ) : (
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <BsPlayFill size={24} className="text-[#f43f5e]" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p
            className={`text-sm font-semibold truncate transition-colors ${
              isCurrentActive ? "text-[#f43f5e]" : "text-white group-hover:text-white"
            }`}
          >
            {decodeHtml(song?.name || song?.title)}
          </p>
          <p className="text-xs text-gray-400 truncate mt-0.5">
            {decodeHtml(artistDisplay)}
          </p>
        </div>
      </div>

      {/* Quick Add to Queue Button on hover */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          dispatch(addToQueue(song));
          toast.success(`Added "${decodeHtml(song?.name || song?.title || "Track")}" to queue`);
        }}
        title="Add to queue"
        aria-label="Add to queue"
        className="w-8 h-8 rounded-full opacity-0 group-hover:opacity-100 hover:bg-white/10 text-gray-300 hover:text-[#f43f5e] flex items-center justify-center transition-all active:scale-95 cursor-pointer flex-shrink-0 ml-1.5"
      >
        <MdQueueMusic size={18} />
      </button>
    </div>
  );
};

export default ListenAgainCard;
