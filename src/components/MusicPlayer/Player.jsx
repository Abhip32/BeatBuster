"use client";
/* eslint-disable jsx-a11y/media-has-caption */
import React, { useRef, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { getSongData } from "@/services/dataAPI";
import { updateActiveSong } from "@/redux/features/playerSlice";

const Player = ({
  activeSong,
  isPlaying,
  volume,
  seekTime,
  onEnded,
  onTimeUpdate,
  onLoadedData,
  repeat,
  handlePlayPause,
  handlePrevSong,
  handleNextSong,
  setSeekTime,
  appTime,
}) => {
  const ref = useRef(null);
  const dispatch = useDispatch();
  const [resolvedAudioUrl, setResolvedAudioUrl] = useState(null);

  // Directly extract audio URL from activeSong if present
  const directAudioSource = useMemo(() => {
    if (!activeSong) return null;
    if (typeof activeSong.downloadUrl === "string" && !activeSong.downloadUrl.includes("jiosaavn.com/song/")) {
      return activeSong.downloadUrl;
    }
    if (Array.isArray(activeSong.downloadUrl) && activeSong.downloadUrl.length > 0) {
      // Find highest quality available in reverse order
      for (let i = activeSong.downloadUrl.length - 1; i >= 0; i--) {
        const entry = activeSong.downloadUrl[i];
        const link = typeof entry === "string" ? entry : entry?.url || entry?.link;
        if (link && !link.includes("jiosaavn.com/song/")) return link;
      }
    }
    if (typeof activeSong.media_url === "string" && !activeSong.media_url.includes("jiosaavn.com/song/")) {
      return activeSong.media_url;
    }
    if (
      typeof activeSong.url === "string" &&
      (activeSong.url.endsWith(".mp4") ||
        activeSong.url.endsWith(".mp3") ||
        activeSong.url.includes("saavncdn"))
    ) {
      return activeSong.url;
    }
    return null;
  }, [activeSong]);

  // Fallback: If activeSong lacks audio stream (e.g. from topQuery or incomplete playlist item), fetch full song by id
  useEffect(() => {
    let isCancelled = false;
    if (directAudioSource) {
      setResolvedAudioUrl(directAudioSource);
      return;
    }

    if (activeSong?.id) {
      getSongData(activeSong.id)
        .then((fullData) => {
          if (!isCancelled && fullData) {
            const s = Array.isArray(fullData) ? fullData[0] : fullData;
            if (s && (s.downloadUrl || s.url)) {
              dispatch(updateActiveSong(s));
            }
            if (Array.isArray(s?.downloadUrl) && s.downloadUrl.length > 0) {
              for (let i = s.downloadUrl.length - 1; i >= 0; i--) {
                const entry = s.downloadUrl[i];
                const link = typeof entry === "string" ? entry : entry?.url || entry?.link;
                if (link && !link.includes("jiosaavn.com/song/")) {
                  setResolvedAudioUrl(link);
                  return;
                }
              }
            } else if (typeof s?.downloadUrl === "string") {
              setResolvedAudioUrl(s.downloadUrl);
            }
          }
        })
        .catch(() => {});
    } else {
      setResolvedAudioUrl(null);
    }

    return () => {
      isCancelled = true;
    };
  }, [activeSong, directAudioSource]);

  const effectiveAudioSource = directAudioSource || resolvedAudioUrl;

  useEffect(() => {
    const audio = ref.current;
    if (!audio || !effectiveAudioSource) return;

    if (isPlaying) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          if (error.name !== "AbortError") {
            console.error("Audio playback error:", error);
          }
        });
      }
    } else {
      audio.pause();
    }
  }, [isPlaying, effectiveAudioSource]);

  const artistName = useMemo(() => {
    if (Array.isArray(activeSong?.artists?.primary)) {
      return activeSong.artists.primary.map((a) => a?.name).join(", ");
    }
    if (typeof activeSong?.artists === "string") {
      return activeSong.artists;
    }
    return activeSong?.primaryArtists || "Artist";
  }, [activeSong?.artists, activeSong?.primaryArtists]);

  const mediaMetaData = useMemo(() => {
    if (!activeSong?.name) return null;
    return {
      title: activeSong?.name,
      artist: artistName,
      album: activeSong?.album?.name || "",
      artwork: [
        {
          src:
            activeSong?.image?.[2]?.url ||
            activeSong?.image?.[1]?.url ||
            activeSong?.image?.[0]?.url ||
            "",
          sizes: "500x500",
          type: "image/jpg",
        },
      ],
    };
  }, [activeSong?.name, artistName, activeSong?.album?.name, activeSong?.image]);

  useEffect(() => {
    if ("mediaSession" in navigator && mediaMetaData) {
      navigator.mediaSession.metadata = new window.MediaMetadata(mediaMetaData);

      navigator.mediaSession.setActionHandler("play", () => handlePlayPause());
      navigator.mediaSession.setActionHandler("pause", () => handlePlayPause());
      navigator.mediaSession.setActionHandler("previoustrack", () => handlePrevSong());
      navigator.mediaSession.setActionHandler("nexttrack", () => handleNextSong());
      navigator.mediaSession.setActionHandler("seekbackward", () => {
        setSeekTime((ref.current?.currentTime || 0) - 5);
      });
      navigator.mediaSession.setActionHandler("seekforward", () => {
        setSeekTime((ref.current?.currentTime || 0) + 5);
      });
    }
  }, [mediaMetaData, handlePlayPause, handlePrevSong, handleNextSong, setSeekTime]);

  useEffect(() => {
    if (ref.current) {
      ref.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    if (ref.current && seekTime !== undefined && seekTime !== null) {
      const targetTime =
        typeof seekTime === "object"
          ? Number(seekTime.time)
          : Number(seekTime);
      if (!isNaN(targetTime) && isFinite(targetTime)) {
        try {
          ref.current.currentTime = Math.max(0, targetTime);
        } catch (e) {
          // Ignore if audio metadata isn't ready
        }
      }
    }
  }, [seekTime]);

  const handleAudioError = async () => {
    console.warn("Audio stream failed to load, fetching fresh stream URL...");
    if (activeSong?.id) {
      try {
        const data = await getSongData(activeSong.id);
        const songData = Array.isArray(data) ? data[0] : data;
        if (Array.isArray(songData?.downloadUrl) && songData.downloadUrl.length > 0) {
          for (let i = songData.downloadUrl.length - 1; i >= 0; i--) {
            const entry = songData.downloadUrl[i];
            const link = typeof entry === "string" ? entry : entry?.url || entry?.link;
            if (link && link !== effectiveAudioSource) {
              setResolvedAudioUrl(link);
              return;
            }
          }
        }
      } catch (e) {
        console.error("Audio stream refresh failed:", e);
      }
    }
  };

  return (
    <audio
      src={effectiveAudioSource || undefined}
      ref={ref}
      loop={repeat}
      onEnded={onEnded}
      onTimeUpdate={onTimeUpdate}
      onLoadedData={onLoadedData}
      onError={handleAudioError}
    />
  );
};

export default Player;
