"use client";
import React, { useState } from "react";
import Languages from "./Languages";
import Favourites from "./Favourites";
import Playlists from "./Playlists";
import Profile from "./Profile";
import SettingsLink from "./SettingsLink";
import { FaGithub } from "react-icons/fa";
import { MdOutlineClose } from "react-icons/md";
import { IoSparkles } from "react-icons/io5";
import Link from "next/link";
import { useDispatch } from "react-redux";
import { setProgress } from "@/redux/features/loadingBarSlice";
import AiDjModal from "@/components/AiDj/AiDjModal";

const Sidebar = ({ showNav, setShowNav }) => {
  const dispatch = useDispatch();
  const [showAiDj, setShowAiDj] = useState(false);

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
          <button
            type="button"
            onClick={() => {
              setShowNav(false);
              setShowAiDj(true);
            }}
            className="w-full flex items-center justify-between px-3 py-2.5 text-gray-200 hover:text-white hover:bg-white/[0.06] rounded-xl transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-[#f43f5e] flex items-center justify-center shadow-[0_0_12px_rgba(168,85,247,0.35)] group-hover:scale-105 transition-transform flex-shrink-0">
                <IoSparkles size={15} className="text-white animate-pulse" />
              </div>
              <span className="text-sm font-semibold tracking-wide group-hover:text-purple-300 transition-colors truncate">
                AI DJ
              </span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
              Smart Mix
            </span>
          </button>
        </div>
        <div className="py-0.5">
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

      <AiDjModal show={showAiDj} setShow={setShowAiDj} />
    </aside>
  );
};

export default Sidebar;
