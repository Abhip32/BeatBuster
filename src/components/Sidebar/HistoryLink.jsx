"use client";
import Link from "next/link";
import React, { useEffect } from "react";
import { MdHistory } from "react-icons/md";
import { useSelector, useDispatch } from "react-redux";
import { setHistory } from "@/redux/features/historySlice";

const HistoryLink = ({ setShowNav }) => {
  const dispatch = useDispatch();
  const { count, items } = useSelector((state) => state.history || { count: 0, items: [] });

  // Hydrate count from localStorage on mount if not loaded
  useEffect(() => {
    if (count === 0) {
      try {
        const stored = localStorage.getItem("songHistory");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            dispatch(setHistory(parsed));
          }
        }
      } catch (e) {}
    }
  }, [count, dispatch]);

  return (
    <Link
      href="/history"
      onClick={() => setShowNav(false)}
      className="flex items-center justify-between px-3 py-2.5 text-gray-200 hover:text-white hover:bg-white/[0.06] rounded-xl transition-all cursor-pointer group"
    >
      <div className="flex items-center gap-3.5 min-w-0">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#f43f5e] via-[#be123c] to-[#4c0519] flex items-center justify-center shadow-[0_0_12px_rgba(244,63,94,0.35)] group-hover:scale-105 transition-transform flex-shrink-0 border border-rose-400/20">
          <MdHistory size={18} className="text-white" />
        </div>
        <span className="text-sm font-semibold tracking-wide group-hover:text-rose-300 transition-colors truncate">
          Recently Played
        </span>
      </div>
      {count > 0 && (
        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 flex-shrink-0">
          {count}
        </span>
      )}
    </Link>
  );
};

export default HistoryLink;
