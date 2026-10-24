import Link from "next/link";
import React from "react";
import { AiFillHeart } from "react-icons/ai";

const Favourites = ({ setShowNav }) => {
  return (
    <Link
      href="/favourite"
      onClick={() => setShowNav(false)}
      className="flex items-center gap-3.5 px-3 py-2.5 text-gray-200 hover:text-white hover:bg-white/[0.06] rounded-xl transition-all cursor-pointer group"
    >
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-700 flex items-center justify-center shadow-[0_0_12px_rgba(168,85,247,0.35)] group-hover:scale-105 transition-transform">
        <AiFillHeart size={16} className="text-white" />
      </div>
      <span className="text-sm font-semibold tracking-wide group-hover:text-[#a855f7] transition-colors">
        Liked Songs
      </span>
    </Link>
  );
};

export default Favourites;
