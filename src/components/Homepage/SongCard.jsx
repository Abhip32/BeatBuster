"use client";
import React, { memo, useState } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import PlayPause from "../PlayPause";
import {
  playPause,
  setActiveSong,
} from "../../redux/features/playerSlice";
import { getRecommendedSongs, getSongData } from "@/services/dataAPI";

const SongCard = ({ song, isPlaying, activeSong }) => {
  const [loading, setLoading] = useState(false);
  const { currentSongs, autoAdd } = useSelector((state) => state.player);

  const dispatch = useDispatch();

  const isSong =
    song?.type === "song" ||
    (song?.type !== "album" && song?.type !== "playlist" && song?.type !== "artist");

  const isCurrentActive =
    activeSong?.id === song?.id ||
    (activeSong?.name && activeSong?.name === song?.name);

  const handlePauseClick = () => {
    dispatch(playPause(false));
  };

  const handlePlayClick = async () => {
    if (isCurrentActive) {
      dispatch(playPause(true));
      return;
    }

    if (isSong) {
      setLoading(true);
      try {
        let songData = song;
        if (!Array.isArray(song?.downloadUrl) || song.downloadUrl.length === 0) {
          const Data = await getSongData(song?.id);
          songData = Array.isArray(Data) ? Data[0] : Data || song;
        }

        const nextQueue = currentSongs?.find((s) => s?.id === songData?.id)
          ? currentSongs
          : [...(currentSongs || []), songData];
        const nextIndex = currentSongs?.find((s) => s?.id === songData?.id)
          ? currentSongs?.findIndex((s) => s?.id === songData?.id)
          : (currentSongs?.length || 0);

        dispatch(
          setActiveSong({
            song: songData,
            data: nextQueue,
            i: nextIndex,
          })
        );
        dispatch(playPause(true));

        // Load suggestions in background without blocking playback
        const primaryArtistsId =
          songData?.primaryArtistsId ||
          songData?.artists?.primary?.[0]?.id ||
          songData?.id;
        if (autoAdd && primaryArtistsId) {
          getRecommendedSongs(primaryArtistsId, songData?.id)
            .then((recommended) => {
              // optional background queue fill
            })
            .catch(() => {});
        }
      } catch (err) {
        console.error("Playback start error:", err);
      } finally {
        setLoading(false);
      }
    }
  };

  const artistDisplay =
    (Array.isArray(song?.artists?.primary) &&
      song.artists.primary.length > 0 &&
      song.artists.primary.map((artist) => artist?.name).join(", ")) ||
    (Array.isArray(song?.artists) &&
      song.artists.length > 0 &&
      song.artists.map((artist) => artist?.name).join(", ")) ||
    (Array.isArray(song?.artists?.all) &&
      song.artists.all.length > 0 &&
      song.artists.all.map((artist) => artist?.name).join(", ")) ||
    (typeof song?.subtitle === "string" &&
      song?.subtitle !== "JioSaavn" &&
      song?.subtitle) ||
    "";

  return (
    <div
      key={song?.id}
      className="group relative flex flex-col p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] backdrop-blur-md border border-white/[0.06] hover:border-white/15 transition-all duration-300 shadow-lg cursor-pointer"
    >
      <Link
        onClick={(e) => {
          if (isSong) {
            e.preventDefault();
            handlePlayClick();
          }
        }}
        href={
          song?.type === "album"
            ? `/album/${song?.id}`
            : song?.type === "playlist"
            ? `/playlist/${song?.id}`
            : ""
        }
        className="flex flex-col h-full"
      >
        <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-3 bg-[#18181f] shadow-md">
          <img
            width={240}
            height={240}
            loading="lazy"
            alt={song?.name || "cover"}
            src={
              song?.image?.[2]?.url ||
              song?.image?.[1]?.url ||
              song?.image?.[0]?.url ||
              "/images/vinyl.png"
            }
            onError={(e) => {
              e.currentTarget.src = "/images/vinyl.png";
            }}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {/* Floating Spotify Play/Pause Button */}
          {isSong && (
            <div
              className={`absolute right-3 bottom-3 transition-all duration-300 z-10 ${
                isCurrentActive
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0"
              }`}
            >
              <PlayPause
                isPlaying={isPlaying}
                activeSong={activeSong}
                song={song}
                loading={loading}
                handlePause={handlePauseClick}
                handlePlay={handlePlayClick}
              />
            </div>
          )}
        </div>

        <div className="flex flex-col min-w-0">
          <p className="font-bold text-sm text-white truncate w-full group-hover:text-[#f43f5e] transition-colors">
            {song?.name?.replaceAll("&#039;", "'")?.replaceAll("&amp;", "&") ||
              song?.title}
          </p>
          <p className="text-xs truncate text-[#b3b3b3] mt-1 group-hover:text-gray-300 transition-colors">
            {artistDisplay || (song?.type === "album" ? "Album" : "Playlist")}
          </p>
        </div>
      </Link>
    </div>
  );
};

export default memo(
  SongCard,
  (prev, next) =>
    prev.song === next.song &&
    prev.activeSong === next.activeSong &&
    prev.isPlaying === next.isPlaying
);
