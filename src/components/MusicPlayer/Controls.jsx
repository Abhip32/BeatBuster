"use client";
import React from "react";
import { MdSkipNext, MdSkipPrevious } from "react-icons/md";
import { BsFillPauseFill, BsFillPlayFill } from "react-icons/bs";
import { TbRepeat, TbRepeatOnce, TbArrowsShuffle } from "react-icons/tb";
import Downloader from "./Downloader";
import FavouriteButton from "./FavouriteButton";

const Controls = ({
  isPlaying,
  repeat,
  setRepeat,
  shuffle,
  setShuffle,
  currentSongs,
  handlePlayPause,
  handlePrevSong,
  handleNextSong,
  activeSong,
  fullScreen,
  handleAddToFavourite,
  favouriteSongs,
  loading,
}) => {
  return (
    <div
      className={`flex items-center justify-center ${
        fullScreen
          ? "w-full max-w-[440px] sm:max-w-[520px] xl:max-w-[580px] px-2 gap-4"
          : "w-full max-w-xs sm:max-w-sm gap-2 sm:gap-3 md:gap-4 lg:gap-5"
      }`}
    >
      <FavouriteButton
        favouriteSongs={favouriteSongs}
        activeSong={activeSong}
        loading={loading}
        handleAddToFavourite={handleAddToFavourite}
        style={"sm:block hidden"}
        size={fullScreen ? 28 : 22}
      />
      {!repeat ? (
        <TbRepeat
          title="Repeat"
          size={fullScreen ? 28 : 22}
          color={"white"}
          onClick={(e) => {
            e.stopPropagation();
            setRepeat((prev) => !prev);
          }}
          className={`${
            !fullScreen ? "hidden sm:block" : "m-2 sm:m-3"
          } cursor-pointer hover:scale-110 transition-transform`}
        />
      ) : (
        <TbRepeatOnce
          title="Repeat Once"
          size={fullScreen ? 28 : 22}
          color={repeat ? "#f43f5e" : "white"}
          onClick={(e) => {
            e.stopPropagation();
            setRepeat((prev) => !prev);
          }}
          className={`${
            !fullScreen ? "hidden sm:block" : "m-2 sm:m-3"
          } cursor-pointer hover:scale-110 transition-transform`}
        />
      )}

      <MdSkipPrevious
        title="Previous"
        size={fullScreen ? 44 : 30}
        color={currentSongs?.length ? "#ffff" : "#b3b3b3"}
        className="cursor-pointer hover:scale-110 transition-transform"
        onClick={handlePrevSong}
      />
      {isPlaying ? (
        <BsFillPauseFill
          size={fullScreen ? 58 : 38}
          color="#f43f5e"
          onClick={handlePlayPause}
          className="cursor-pointer hover:scale-110 transition-transform"
        />
      ) : (
        <BsFillPlayFill
          size={fullScreen ? 58 : 38}
          color="#f43f5e"
          onClick={handlePlayPause}
          className="cursor-pointer hover:scale-110 transition-transform"
        />
      )}
      <MdSkipNext
        title="Next"
        size={fullScreen ? 44 : 30}
        color={currentSongs?.length ? "#ffff" : "#b3b3b3"}
        className="cursor-pointer hover:scale-110 transition-transform"
        onClick={handleNextSong}
      />

      <TbArrowsShuffle
        title="Shuffle"
        size={fullScreen ? 28 : 22}
        color={shuffle ? "#f43f5e" : "white"}
        onClick={(e) => {
          e.stopPropagation();
          setShuffle((prev) => !prev);
        }}
        className={`${
          !fullScreen ? "hidden sm:block" : "m-2 sm:m-3"
        } cursor-pointer hover:scale-110 transition-transform`}
      />

      {(activeSong?.id || activeSong?.name) && (
        <div className="hidden md:block">
          <Downloader
            activeSong={activeSong}
            fullScreen={fullScreen}
            size={fullScreen ? 28 : 22}
          />
        </div>
      )}
    </div>
  );
};

export default Controls;
