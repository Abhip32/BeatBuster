'use client';
import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useSession } from 'next-auth/react';
import { syncSongHistory } from '@/services/dataAPI';
import decodeHtml from '@/utils/decodeHtml';

const SongsHistory = () => {
  const { activeSong } = useSelector((state) => state.player);
  const { status } = useSession();
  const syncTimeoutRef = useRef(null);

  useEffect(() => {
    if (activeSong?.name && activeSong?.id) {
      const artistDisplay =
        (Array.isArray(activeSong?.artists?.primary) &&
          activeSong.artists.primary.map((a) => a?.name).join(", ")) ||
        (Array.isArray(activeSong?.artists) &&
          activeSong.artists.map((a) => a?.name).join(", ")) ||
        (typeof activeSong?.artists === "string" ? activeSong.artists : "") ||
        activeSong?.primaryArtists ||
        "";

      const cleanSong = {
        id: String(activeSong.id),
        name: decodeHtml(activeSong.name || activeSong.title || "Song"),
        artists: decodeHtml(artistDisplay),
        image: activeSong.image || [],
        duration: activeSong.duration || 0,
        album: activeSong.album?.name
          ? { name: decodeHtml(activeSong.album.name) }
          : undefined,
      };

      // 1. Instant local update for 0ms lag
      try {
        const stored = localStorage.getItem("songHistory");
        const parsed = stored ? JSON.parse(stored) : [];
        const filtered = parsed.filter((s) => String(s?.id) !== cleanSong.id);
        const updated = [cleanSong, ...filtered].slice(0, 15);
        localStorage.setItem("songHistory", JSON.stringify(updated));
        window.dispatchEvent(new Event("songHistoryUpdated"));
      } catch (e) {
        // ignore localStorage errors
      }

      // 2. Debounced Cloud DB sync for authenticated user (2.5s settle window)
      if (status === "authenticated") {
        if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
        syncTimeoutRef.current = setTimeout(() => {
          syncSongHistory(cleanSong).catch(() => {});
        }, 2500);
      }
    }

    return () => {
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    };
  }, [activeSong, status]);

  return null;
};

export default SongsHistory;
