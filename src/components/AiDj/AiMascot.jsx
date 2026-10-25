"use client";
import React, { useState, useEffect } from "react";
import { IoSparkles, IoClose } from "react-icons/io5";
import { BsSoundwave, BsMusicNoteBeamed } from "react-icons/bs";
import { FiMinimize2, FiMaximize2 } from "react-icons/fi";
import { useSelector } from "react-redux";
import AiDjModal from "./AiDjModal";

const AiMascot = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState("");
  const [showBubble, setShowBubble] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [blink, setBlink] = useState(false);

  const { activeSong, isPlaying } = useSelector((state) => state.player || {});

  // Natural eye blink effect every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 220);
    }, 4200);
    return () => clearInterval(interval);
  }, []);

  // Auto-collapse bubble after 10s if user hasn't interacted
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowBubble(false);
    }, 10000);
    return () => clearTimeout(timer);
  }, []);

  const openWithPrompt = (promptText) => {
    setSelectedPrompt(promptText);
    setShowModal(true);
  };

  const currentSongTitle = activeSong?.name || activeSong?.title || "";

  return (
    <>
      <aside
        aria-label="Musify AI DJ Mascot"
        className="fixed bottom-24 right-4 sm:right-6 z-40 flex flex-col items-end select-none pointer-events-auto"
      >
        {/* Floating Speech / Vibe Selector Bubble */}
        {!isMinimized && (showBubble || isHovered) && (
          <div
            className="mb-3 mr-1 w-[260px] sm:w-[280px] bg-gradient-to-br from-[#1b1028]/95 via-[#130b1e]/95 to-[#0b0612]/95 backdrop-blur-xl border border-purple-500/35 rounded-2xl p-3.5 shadow-[0_12px_40px_rgba(168,85,247,0.35)] transition-all duration-300 relative animate-fadeIn"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/[0.08]">
              <div className="flex items-center gap-1.5 font-bold text-white text-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="bg-gradient-to-r from-purple-300 via-pink-300 to-rose-300 bg-clip-text text-transparent">
                  Musify BeatBot
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  AI DJ
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setIsMinimized(true)}
                  title="Minimize"
                  className="text-gray-400 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <FiMinimize2 size={12} />
                </button>
                <button
                  type="button"
                  onClick={() => setShowBubble(false)}
                  title="Close"
                  className="text-gray-400 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <IoClose size={14} />
                </button>
              </div>
            </div>

            {/* Contextual Dialogue Body */}
            {isPlaying && currentSongTitle ? (
              <div className="mb-2.5">
                <p className="text-[11px] text-gray-300 leading-snug">
                  Grooving to <span className="text-rose-400 font-semibold truncate max-w-[150px] inline-block align-bottom">{currentSongTitle}</span> 🎵
                </p>
                <p className="text-[11px] text-purple-200/80 mt-0.5">
                  Want 10 songs with this exact vibe?
                </p>
                <button
                  type="button"
                  onClick={() => openWithPrompt(`Songs with the exact same vibe as ${currentSongTitle}`)}
                  className="mt-2 w-full py-1.5 px-3 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-rose-500 hover:from-purple-500 hover:to-rose-400 text-white text-xs font-bold shadow-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
                >
                  <IoSparkles className="text-yellow-300 text-xs" />
                  <span>Mix Similar Vibe</span>
                </button>
              </div>
            ) : (
              <div className="mb-2">
                <p className="text-xs text-purple-100 font-medium">
                  What&apos;s your vibe right now? ✨
                </p>
                <p className="text-[10px] text-purple-300/70 mt-0.5">
                  Tap any mood below for an instant AI mix:
                </p>
                {/* 4 Quick Vibe Chips */}
                <div className="grid grid-cols-2 gap-1.5 mt-2">
                  <button
                    type="button"
                    onClick={() => openWithPrompt("🌙 Chill Late Night & Lofi")}
                    className="px-2 py-1.5 rounded-lg bg-white/[0.05] hover:bg-purple-600/30 border border-white/[0.08] hover:border-purple-500/50 text-[11px] text-purple-200 hover:text-white transition-all text-left font-medium cursor-pointer"
                  >
                    🌙 Late Night
                  </button>
                  <button
                    type="button"
                    onClick={() => openWithPrompt("⚡ High-Energy Workout Phonk")}
                    className="px-2 py-1.5 rounded-lg bg-white/[0.05] hover:bg-rose-600/30 border border-white/[0.08] hover:border-rose-500/50 text-[11px] text-rose-200 hover:text-white transition-all text-left font-medium cursor-pointer"
                  >
                    🔥 Gym Hype
                  </button>
                  <button
                    type="button"
                    onClick={() => openWithPrompt("❤️ Romantic Acoustic Bollywood")}
                    className="px-2 py-1.5 rounded-lg bg-white/[0.05] hover:bg-pink-600/30 border border-white/[0.08] hover:border-pink-500/50 text-[11px] text-pink-200 hover:text-white transition-all text-left font-medium cursor-pointer"
                  >
                    💖 Romance
                  </button>
                  <button
                    type="button"
                    onClick={() => openWithPrompt("🕺 Bollywood Party Anthems")}
                    className="px-2 py-1.5 rounded-lg bg-white/[0.05] hover:bg-yellow-600/30 border border-white/[0.08] hover:border-yellow-500/50 text-[11px] text-yellow-200 hover:text-white transition-all text-left font-medium cursor-pointer"
                  >
                    🎉 Party Hits
                  </button>
                </div>
              </div>
            )}

            {/* Custom AI DJ Prompt Button */}
            <button
              type="button"
              onClick={() => openWithPrompt("")}
              className="w-full mt-1.5 py-1 text-[11px] text-purple-300 hover:text-white flex items-center justify-center gap-1 font-semibold transition-colors cursor-pointer"
            >
              <span>Custom Prompt...</span>
              <span className="text-xs">→</span>
            </button>

            {/* Speech bubble pointer notch */}
            <div className="absolute -bottom-1.5 right-7 w-3.5 h-3.5 bg-[#130b1e] border-r border-b border-purple-500/35 transform rotate-45" />
          </div>
        )}

        {/* Mascot Avatar Widget */}
        <div className="relative flex flex-col items-center">
          {/* Floating Music Notes when playing */}
          {isPlaying && (
            <div className="absolute -top-6 left-2 pointer-events-none text-purple-400 text-xs animate-bounce">
              <BsMusicNoteBeamed />
            </div>
          )}

          {/* Hologram Soundwave Pulses */}
          {isPlaying && (
            <div className="absolute inset-0 rounded-full border-2 border-purple-500/40 animate-ping pointer-events-none" style={{ animationDuration: "2.5s" }} />
          )}

          {/* Interactive Mascot Button */}
          <button
            type="button"
            onClick={() => {
              if (isMinimized) {
                setIsMinimized(false);
                setShowBubble(true);
              } else {
                openWithPrompt("");
              }
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            aria-label="Musify AI DJ Mascot"
            className="relative cursor-pointer p-0.5 rounded-full transition-transform duration-300 transform hover:scale-110 active:scale-95 group focus:outline-none"
          >
            {/* Ambient Neon Aura */}
            <div
              className={`absolute inset-0 rounded-full bg-gradient-to-tr from-purple-600 via-pink-500 to-rose-500 opacity-80 blur-lg transition-all duration-300 ${
                isHovered || isPlaying ? "opacity-100 scale-110" : "opacity-60"
              }`}
            />

            {/* Outer Cyber Gradient Ring */}
            <div className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-full p-[2.5px] bg-gradient-to-tr from-purple-500 via-pink-500 to-rose-400 shadow-2xl flex items-center justify-center">
              {/* Mascot Head Chassis */}
              <div className="w-full h-full rounded-full bg-[#12081e] flex items-center justify-center relative overflow-hidden shadow-inner">
                {/* Background Ambient Glow */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/40 via-transparent to-black" />

                {/* Cyber Mascot SVG Character */}
                <svg
                  viewBox="0 0 72 72"
                  className="w-12 h-12 sm:w-14 sm:h-14 relative z-10 filter drop-shadow-[0_4px_10px_rgba(168,85,247,0.7)]"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Headphone Arch */}
                  <path
                    d="M14 36 C14 20, 58 20, 58 36"
                    stroke="url(#hpGrad)"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />

                  {/* Left Ear Cup */}
                  <rect
                    x="9"
                    y="30"
                    width="8"
                    height="16"
                    rx="4"
                    fill="#9333ea"
                    stroke="#f43f5e"
                    strokeWidth="1.5"
                    className={isPlaying ? "animate-pulse" : ""}
                  />

                  {/* Right Ear Cup */}
                  <rect
                    x="55"
                    y="30"
                    width="8"
                    height="16"
                    rx="4"
                    fill="#9333ea"
                    stroke="#f43f5e"
                    strokeWidth="1.5"
                    className={isPlaying ? "animate-pulse" : ""}
                  />

                  {/* Droid Face Shell */}
                  <rect
                    x="19"
                    y="24"
                    width="34"
                    height="30"
                    rx="12"
                    fill="#180e28"
                    stroke="#c084fc"
                    strokeWidth="2"
                  />

                  {/* Visor Display Screen */}
                  <rect
                    x="23"
                    y="29"
                    width="26"
                    height="13"
                    rx="5"
                    fill="#080310"
                    stroke="#4c1d95"
                    strokeWidth="1"
                  />

                  {/* Dynamic Expressive Eyes */}
                  {blink ? (
                    // Blinking Eyes (Horizontal Lines)
                    <>
                      <line x1="26" y1="35" x2="31" y2="35" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />
                      <line x1="41" y1="35" x2="46" y2="35" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />
                    </>
                  ) : isHovered ? (
                    // Happy Star / Wink Eyes on Hover
                    <>
                      <path d="M28.5 31 L29.5 34 L32.5 34 L30 36 L31 39 L28.5 37 L26 39 L27 36 L24.5 34 L27.5 34 Z" fill="#f43f5e" />
                      <path d="M43.5 31 L44.5 34 L47.5 34 L45 36 L46 39 L43.5 37 L41 39 L42 36 L39.5 34 L42.5 34 Z" fill="#f43f5e" />
                    </>
                  ) : isPlaying ? (
                    // Equalizer Beat Eyes when music is playing
                    <>
                      <rect x="26" y="32" width="2" height="7" rx="1" fill="#38bdf8" className="animate-pulse" />
                      <rect x="29" y="34" width="2" height="5" rx="1" fill="#c084fc" />
                      <rect x="41" y="34" width="2" height="5" rx="1" fill="#c084fc" />
                      <rect x="44" y="32" width="2" height="7" rx="1" fill="#38bdf8" className="animate-pulse" />
                    </>
                  ) : (
                    // Default Happy Cyber Arc Eyes
                    <>
                      <path d="M26 36 Q28.5 32 31 36" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />
                      <path d="M41 36 Q43.5 32 46 36" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />
                    </>
                  )}

                  {/* Cheerful Mouth Curve */}
                  <path
                    d="M31 46 Q36 50 41 46"
                    stroke="#f43f5e"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />

                  {/* Cute Cheek Blushes */}
                  <circle cx="23" cy="42" r="1.5" fill="#f43f5e" opacity="0.6" />
                  <circle cx="49" cy="42" r="1.5" fill="#f43f5e" opacity="0.6" />

                  {/* DJ Antenna with glowing orb */}
                  <line x1="36" y1="24" x2="36" y2="17" stroke="#ec4899" strokeWidth="2" />
                  <circle cx="36" cy="15" r="3" fill="#fb7185" className="animate-pulse" />

                  {/* Gradient Definitions */}
                  <defs>
                    <linearGradient id="hpGrad" x1="14" y1="20" x2="58" y2="20" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#ec4899" />
                      <stop offset="0.5" stopColor="#a855f7" />
                      <stop offset="1" stopColor="#f43f5e" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* Sparkle Badge in Corner */}
                <div className="absolute top-1 right-1 w-4 h-4 bg-gradient-to-tr from-pink-500 to-rose-500 rounded-full flex items-center justify-center shadow-lg border border-white/20">
                  <IoSparkles className="text-white text-[9px]" />
                </div>
              </div>
            </div>

            {/* Pill Label */}
            <div className="absolute -bottom-1.5 left-1/2 transform -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-black/90 border border-purple-500/50 text-[10px] font-bold text-purple-300 shadow-xl flex items-center gap-1 whitespace-nowrap">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>AI DJ</span>
            </div>
          </button>
        </div>
      </aside>

      {/* AI DJ Modal */}
      <AiDjModal
        show={showModal}
        setShow={setShowModal}
        initialPrompt={selectedPrompt}
      />
    </>
  );
};

export default AiMascot;
