'use client';
import React, { useEffect, useState, useCallback } from "react";
import ListenAgainCard from "../ListenAgainCard";
import { useDispatch } from "react-redux";
import { setAutoAdd } from "@/redux/features/playerSlice";
import { setLanguages } from "@/redux/features/languagesSlice";
import { setHistory } from "@/redux/features/historySlice";
import { useSession } from "next-auth/react";
import { getSongHistory } from "@/services/dataAPI";
import Link from "next/link";
import { HiChevronRight } from "react-icons/hi2";

const ListenAgain = () => {
  const [songHistory, setSongHistory] = useState([]);
  const dispatch = useDispatch();
  const { status } = useSession();

  // Instant local load from localStorage
  const loadLocalHistory = useCallback(() => {
    try {
      const stored = localStorage.getItem("songHistory");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSongHistory(parsed);
          dispatch(setHistory(parsed));
        }
      }
    } catch (e) {}
  }, [dispatch]);

  useEffect(() => {
    loadLocalHistory();

    try {
      const storedLang = localStorage.getItem("languages");
      if (storedLang) {
        const parsed = JSON.parse(storedLang);
        if (Array.isArray(parsed) && parsed.length > 0) {
          dispatch(setLanguages(parsed));
        }
      }
      dispatch(
        setAutoAdd(
          localStorage.getItem("autoAdd")
            ? JSON.parse(localStorage.getItem("autoAdd"))
            : false
        )
      );
    } catch (e) {}

    // Listen to real-time history updates from SongsHistory
    window.addEventListener("songHistoryUpdated", loadLocalHistory);
    return () => {
      window.removeEventListener("songHistoryUpdated", loadLocalHistory);
    };
  }, [dispatch, loadLocalHistory]);

  // Cloud sync: hydrate from DB for logged-in user
  useEffect(() => {
    let isCancelled = false;
    if (status === "authenticated") {
      getSongHistory(1, 30)
        .then((dbHistory) => {
          if (!isCancelled && Array.isArray(dbHistory) && dbHistory.length > 0) {
            setSongHistory(dbHistory);
            dispatch(setHistory(dbHistory));
            try {
              localStorage.setItem("songHistory", JSON.stringify(dbHistory));
            } catch (e) {}
          }
        })
        .catch(() => {});
    }
    return () => {
      isCancelled = true;
    };
  }, [status, dispatch]);

  if (!songHistory || songHistory.length === 0) {
    return null;
  }

  return (
    <div className="mb-10 animate-fade-in">
      <div className="flex items-center justify-between mb-4 mt-4">
        <div className="flex items-center gap-2.5">
          <h2 className="text-white text-2xl lg:text-3xl font-bold tracking-tight">
            Jump Back In
          </h2>
          <span className="text-[10px] sm:text-xs font-semibold px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30">
            Listen Again
          </span>
        </div>
        <Link
          href="/history"
          className="text-xs sm:text-sm font-semibold text-gray-400 hover:text-white transition-colors flex items-center gap-1 group cursor-pointer"
        >
          <span>Show all</span>
          <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-white/[0.08] text-gray-300 ml-0.5 font-bold">
            {songHistory.length}
          </span>
          <HiChevronRight className="text-xs group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {songHistory.slice(0, 6).map((song, index) => (
          <ListenAgainCard
            key={song?.id || index}
            song={song}
            SongData={songHistory}
            index={index}
          />
        ))}
      </div>
    </div>
  );
};

export default ListenAgain;
