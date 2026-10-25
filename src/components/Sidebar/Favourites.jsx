"use client";
import Link from "next/link";
import React from "react";
import { AiFillHeart } from "react-icons/ai";
import { useSelector } from "react-redux";

const Favourites = ({ setShowNav }) => {
  const { count } = useSelector((state) => state.favourites || { count: 0 });

  return (
    <Link
      href="/favourite"
      onClick={() => setShowNav(false)}
      className="flex items-center justify-between px-3 py-2.5 text-gray-200 hover:text-white hover:bg-white/[0.06] rounded-xl transition-all cursor-pointer group"
    >
      <div className="flex items-center gap-3.5 min-w-0">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-rose-700 flex items-center justify-center shadow-[0_0_12px_rgba(244,63,94,0.35)] group-hover:scale-105 transition-transform flex-shrink-0">
          <AiFillHeart size={16} className="text-white" />
        </div>
        <span className="text-sm font-semibold tracking-wide group-hover:text-[#f43f5e] transition-colors truncate">
          Liked Songs
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

export default Favourites;
