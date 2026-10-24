"use client";
import React from "react";
import Languages from "./Languages";
import Favourites from "./Favourites";
import Playlists from "./Playlists";
import Profile from "./Profile";
import SettingsLink from "./SettingsLink";
import { FaGithub } from "react-icons/fa";
import { MdOutlineClose } from "react-icons/md";
import Link from "next/link";
import { useDispatch } from "react-redux";
import { setProgress } from "@/redux/features/loadingBarSlice";

const Sidebar = ({ showNav, setShowNav }) => {
  const dispatch = useDispatch();

  return (
    <aside
      className={`fixed top-0 left-0 h-screen w-[290px] sm:w-[320px] max-w-[85vw] z-50 transition-transform duration-300 ease-out flex flex-col bg-[#111115]/95 backdrop-blur-2xl border-r border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] ${
        showNav ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      {/* Header with Spotify Musify logo */}
      <div className="h-[70px] flex items-center justify-between px-5 border-b border-white/[0.08] flex-shrink-0">
        <Link
          href="/"
          onClick={() => {
            setShowNav(false);
            dispatch(setProgress(100));
          }}
          className="flex items-center gap-2.5 group"
        >
          <img
            src="/images/logo.png"
            alt="Musify"
            width={32}
            height={32}
            className="w-8 h-8 rounded-full object-cover shadow-[0_0_12px_rgba(244, 63, 94,0.35)] group-hover:scale-105 transition-transform"
          />
          <span className="text-lg font-bold tracking-tight text-white group-hover:text-[var(--primary-accent,#f43f5e)] transition-colors">
            Musify
          </span>
        </Link>
        <button
          type="button"
          onClick={() => setShowNav(false)}
          className="p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Close sidebar"
        >
          <MdOutlineClose size={22} />
        </button>
      </div>

      {/* Navigation Body */}
      <div className="flex-1 min-h-0 overflow-y-auto px-3 py-2 space-y-1">
        <Profile setShowNav={setShowNav} />
        <div className="py-1">
          <Favourites setShowNav={setShowNav} />
        </div>
        <Playlists setShowNav={setShowNav} />
        <Languages />
      </div>

      {/* Settings link pinned before footer */}
      <div className="border-t border-white/[0.08] px-3 py-1 flex-shrink-0">
        <SettingsLink setShowNav={setShowNav} />
      </div>

      {/* Footer */}
      <div className="px-5 py-4 pb-24 border-t border-white/[0.08] flex items-center justify-between text-xs text-gray-400 flex-shrink-0">
        <div className="flex gap-4">
          <Link
            href="/dmca"
            onClick={() => setShowNav(false)}
            className="hover:text-white transition-colors"
          >
            DMCA
          </Link>
          <a
            href="https://github.com/Abhip32/BeatBuster"
            target="_blank"
            rel="noreferrer"
            className="hover:text-white transition-colors flex items-center gap-1.5"
          >
            <FaGithub size={14} />
            <span>GitHub</span>
          </a>
        </div>
        <span className="text-[10px] text-gray-500 font-mono">v3.0 Musify</span>
      </div>
    </aside>
  );
};

export default Sidebar;
