"use client";
import React from "react";
import Link from "next/link";
import { IoSettingsOutline } from "react-icons/io5";

const SettingsLink = ({ setShowNav }) => {
  return (
    <Link
      href="/settings"
      onClick={() => setShowNav(false)}
      className="flex items-center gap-3 px-3 py-2.5 text-gray-300 hover:text-white hover:bg-white/[0.06] rounded-xl transition-all cursor-pointer group"
    >
      <IoSettingsOutline size={20} className="text-gray-400 group-hover:text-[#f43f5e] transition-colors" />
      <span className="text-sm font-semibold tracking-wide group-hover:text-[#f43f5e] transition-colors">
        Settings
      </span>
    </Link>
  );
};

export default SettingsLink;
