"use client";
import React, { useEffect, useState, useCallback } from "react";
import SongsList from "@/components/SongsList";
import BulkDownloadButton from "@/components/BulkDownloadButton";
import { getSongHistory, clearSongHistory, getSongData } from "@/services/dataAPI";
import PlaylistSkeleton from "@/components/Skeletons/PlaylistSkeleton";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { MdHistory, MdOutlineDeleteOutline } from "react-icons/md";
import { BsFillPlayFill } from "react-icons/bs";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import { setHistory, clearHistoryState } from "@/redux/features/historySlice";
import { playPause, setActiveSong } from "@/redux/features/playerSlice";
import { toast } from "react-hot-toast";

const PAGE_SIZE = 30;

const HistoryPage = () => {
  const dispatch = useDispatch();
  const { status, data: session } = useSession();
  const [historySongs, setHistorySongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 1,
    hasMore: false,
  });
  const [isClearing, setIsClearing] = useState(false);

  // Helper to load and normalize from localStorage (for 0ms instant display & guest mode)
  const loadLocalHistory = useCallback(() => {
    try {
      const stored = localStorage.getItem("songHistory");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setHistorySongs((prev) => (prev.length === 0 ? parsed : prev));
          dispatch(setHistory(parsed));
          setPagination((prev) => ({
            ...prev,
            total: parsed.length,
            hasMore: false,
          }));
        }
      }
    } catch (e) {}
  }, [dispatch]);

  // Initial load: instant local history + remote DB fetch if authenticated
  useEffect(() => {
    loadLocalHistory();

    const fetchHistory = async () => {
      setLoading(true);
      try {
        if (status === "authenticated") {
          const songs = await getSongHistory(1, PAGE_SIZE);
          if (Array.isArray(songs) && songs.length > 0) {
            // Enrich songs with downloadUrl if missing
            const resolved = await Promise.all(
              songs.map(async (item) => {
                if (item?.downloadUrl?.length) return item;
                if (!item?.id) return item;
                try {
                  const fetched = await getSongData(item.id);
                  const full = Array.isArray(fetched) ? fetched[0] : fetched;
                  return full ? { ...full, ...item, playedAt: item.playedAt } : item;
                } catch {
                  return item;
                }
              })
            );

            setHistorySongs(resolved);
            dispatch(setHistory(resolved));
            if (songs.pagination) {
              setPagination(songs.pagination);
            }
            try {
              localStorage.setItem("songHistory", JSON.stringify(resolved));
            } catch (e) {}
          } else {
            setHistorySongs([]);
            dispatch(setHistory([]));
          }
        }
      } catch (err) {
        console.error("fetchHistory error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (status === "authenticated") {
      fetchHistory();
    } else if (status === "unauthenticated") {
      setLoading(false);
    }

    // Listen for live song history updates during playback
    const handleLiveUpdate = () => {
      try {
        const stored = localStorage.getItem("songHistory");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setHistorySongs(parsed);
            dispatch(setHistory(parsed));
          }
        }
      } catch (e) {}
    };

    window.addEventListener("songHistoryUpdated", handleLiveUpdate);
    return () => {
      window.removeEventListener("songHistoryUpdated", handleLiveUpdate);
    };
  }, [status, dispatch, loadLocalHistory]);

  // Load next page of history
  const handleLoadMore = async () => {
    if (loadingMore || !pagination.hasMore) return;
    setLoadingMore(true);
    try {
      const nextPage = pagination.page + 1;
      const nextSongs = await getSongHistory(nextPage, PAGE_SIZE);
      if (Array.isArray(nextSongs) && nextSongs.length > 0) {
        const resolved = await Promise.all(
          nextSongs.map(async (item) => {
            if (item?.downloadUrl?.length) return item;
            if (!item?.id) return item;
            try {
              const fetched = await getSongData(item.id);
              const full = Array.isArray(fetched) ? fetched[0] : fetched;
              return full ? { ...full, ...item, playedAt: item.playedAt } : item;
            } catch {
              return item;
            }
          })
        );

        setHistorySongs((prev) => {
          const existingIds = new Set(prev.map((s) => s.id));
          const uniqueNew = resolved.filter((s) => !existingIds.has(s.id));
          return [...prev, ...uniqueNew];
        });

        if (nextSongs.pagination) {
          setPagination(nextSongs.pagination);
        }
      } else {
        setPagination((prev) => ({ ...prev, hasMore: false }));
      }
    } catch (err) {
      console.error("handleLoadMore error:", err);
      toast.error("Could not load more history");
    } finally {
      setLoadingMore(false);
    }
  };

  // Clear all listening history
  const handleClearHistory = async () => {
    if (historySongs.length === 0) return;
    const confirmed = window.confirm("Are you sure you want to clear your entire listening history?");
    if (!confirmed) return;

    setIsClearing(true);
    try {
      if (status === "authenticated") {
        await clearSongHistory();
      }
      localStorage.removeItem("songHistory");
      setHistorySongs([]);
      dispatch(clearHistoryState());
      setPagination({
        page: 1,
        limit: PAGE_SIZE,
        total: 0,
        totalPages: 1,
        hasMore: false,
      });
      window.dispatchEvent(new Event("songHistoryUpdated"));
      toast.success("Listening history cleared");
    } catch (err) {
      console.error("handleClearHistory error:", err);
      toast.error("Could not clear history");
    } finally {
      setIsClearing(false);
    }
  };

  if (status === "loading" || (status === "authenticated" && loading && historySongs.length === 0)) {
    return <PlaylistSkeleton type="Recently Played" count={8} />;
  }

  return (
    <div className="w-11/12 max-w-7xl mx-auto mt-8 mb-20 animate-fade-in">
      {/* Recently Played Hero Banner */}
      <div className="relative rounded-3xl p-5 sm:p-8 lg:p-10 bg-gradient-to-b from-rose-950/40 via-white/[0.03] to-transparent backdrop-blur-2xl border border-rose-500/15 shadow-2xl flex flex-col md:flex-row items-center md:items-end gap-5 sm:gap-7 lg:gap-10">
        <div className="relative w-36 h-36 sm:w-52 sm:h-52 lg:w-60 lg:h-60 flex-shrink-0 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-[#f43f5e] via-[#be123c] to-[#4c0519] flex items-center justify-center border border-rose-400/20 shadow-[0_12px_36px_rgba(244,63,94,0.35)] group">
          <MdHistory className="w-16 h-16 sm:w-24 sm:h-24 lg:w-28 lg:h-28 text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.5)] transition-transform duration-300 group-hover:scale-105" />
        </div>

        <div className="flex flex-col text-center md:text-left text-white min-w-0 flex-1 w-full md:w-auto">
          <span className="text-[11px] sm:text-xs uppercase font-extrabold tracking-widest text-[#f43f5e] mb-1.5 flex items-center justify-center md:justify-start gap-2">
            <span>Jump Back In</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#f43f5e]" />
            <span>Collection</span>
          </span>
          <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight line-clamp-2">
            Recently Played
          </h1>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-xs text-gray-300 mt-2.5 font-semibold">
            <span>{session?.user?.name || "You"}</span>
            <span>•</span>
            <span>
              {pagination.total > historySongs.length
                ? `Showing ${historySongs.length} of ${pagination.total} tracks`
                : `${historySongs.length} tracks`}
            </span>
            <span>•</span>
            <span className="text-rose-300">Listening History</span>
          </div>

          {historySongs.length > 0 && (
            <div className="mt-5 sm:mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-center md:justify-start gap-2.5 sm:gap-3 w-full sm:w-auto max-w-sm sm:max-w-none mx-auto md:mx-0">
              {/* Primary Play Button */}
              <button
                type="button"
                onClick={() => {
                  dispatch(setActiveSong({ song: historySongs[0], data: historySongs, i: 0 }));
                  dispatch(playPause(true));
                }}
                className="group relative flex h-11 sm:h-13 items-center justify-center gap-2.5 rounded-full bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-500 hover:to-rose-600 px-6 sm:px-8 text-white font-extrabold text-sm sm:text-base tracking-wide shadow-[0_8px_24px_rgba(244,63,94,0.45)] hover:scale-[1.02] active:scale-95 transition-all duration-200 cursor-pointer"
              >
                <BsFillPlayFill
                  size={22}
                  className="text-white transition-transform duration-200 group-hover:scale-110"
                />
                <span>Play All</span>
              </button>

              {/* Secondary Actions: Symmetrical 2-column grid on mobile, inline on sm+ */}
              <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
                <BulkDownloadButton
                  songList={{ name: "Recently_Played", songs: historySongs }}
                  className="!h-11 sm:!h-13 !px-3 sm:!px-5 !text-xs sm:!text-sm w-full sm:w-auto"
                />

                <button
                  type="button"
                  onClick={handleClearHistory}
                  disabled={isClearing}
                  className="flex h-11 sm:h-13 items-center justify-center gap-1.5 sm:gap-2 rounded-full border border-white/15 hover:border-rose-500/50 bg-white/[0.08] hover:bg-rose-500/15 px-3 sm:px-5 text-gray-200 hover:text-rose-400 font-bold text-xs sm:text-sm tracking-wide transition-all duration-200 active:scale-95 cursor-pointer backdrop-blur-xl shadow-md whitespace-nowrap"
                  title="Clear all listening history"
                >
                  {isClearing ? (
                    <AiOutlineLoading3Quarters className="animate-spin text-sm" />
                  ) : (
                    <MdOutlineDeleteOutline size={18} />
                  )}
                  <span>Clear History</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tracks Section */}
      <div className="mt-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white">
              Songs
            </h2>
            <p className="text-xs text-gray-400 mt-0.5 font-medium">
              Your recent listening history recorded in chronological order
            </p>
          </div>
          {historySongs.length > 0 && (
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30">
              {pagination.total > historySongs.length
                ? `Showing ${historySongs.length} of ${pagination.total} tracks`
                : `All ${historySongs.length} tracks loaded`}
            </span>
          )}
        </div>

        {historySongs.length === 0 && !loading ? (
          <div className="py-16 text-center rounded-2xl bg-white/[0.02] border border-white/[0.06] p-8 max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto mb-4">
              <MdHistory size={32} className="text-rose-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1.5">
              No recently played tracks yet
            </h3>
            <p className="text-xs text-gray-400 mb-6 max-w-sm mx-auto">
              Any track you play on Musify will appear here automatically so you can pick up right where you left off.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white text-xs font-bold tracking-wide shadow-[0_4px_16px_rgba(244,63,94,0.35)] cursor-pointer transition-all"
            >
              <span>Explore Music</span>
            </Link>
          </div>
        ) : (
          <>
            <SongsList
              SongData={historySongs}
              loading={loading}
              setSongs={setHistorySongs}
              isHistoryPage={true}
              onDeleteHistorySong={() => {
                setPagination((prev) => ({
                  ...prev,
                  total: Math.max(0, prev.total - 1),
                }));
              }}
            />

            {/* Load more button if hasMore is true */}
            {pagination.hasMore && (
              <div className="mt-8 flex justify-center">
                <button
                  type="button"
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="px-6 py-2.5 rounded-full text-xs font-bold bg-white/[0.05] hover:bg-white/[0.1] text-rose-300 hover:text-white border border-rose-500/30 hover:border-rose-500/60 shadow-[0_0_15px_rgba(244,63,94,0.2)] transition-all cursor-pointer flex items-center gap-2"
                >
                  {loadingMore ? (
                    <>
                      <AiOutlineLoading3Quarters className="animate-spin text-sm" />
                      <span>Loading more tracks...</span>
                    </>
                  ) : (
                    <span>Load More Tracks ({pagination.total - historySongs.length} remaining)</span>
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;
