"use client";
import React, { useState } from "react";
import Image from "next/image";
import { IoSparkles, IoClose } from "react-icons/io5";
import { BsMusicNoteBeamed } from "react-icons/bs";
import { useSelector } from "react-redux";
import AiDjModal from "./AiDjModal";

const AiMascot = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState("");
  const [showBubble, setShowBubble] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const { activeSong, isPlaying } = useSelector((state) => state.player || {});

  const openWithPrompt = (promptText) => {
    setSelectedPrompt(promptText);
    setShowModal(true);
    setShowBubble(false);
  };

  const currentSongTitle = activeSong?.name || activeSong?.title || "";

  return (
    <>
      <aside
        aria-label="Musify AI Cat DJ"
        className="fixed bottom-24 right-4 sm:right-6 z-40 flex flex-col items-end select-none pointer-events-auto"
      >
        {/* Sleek Contextual Bubble (Shown on hover or when triggered) */}
        {(showBubble || isHovered) && (
          <div
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="mb-2 mr-2 w-[260px] sm:w-[280px] bg-[#140b1e]/95 backdrop-blur-xl border border-rose-500/30 rounded-2xl p-3 shadow-[0_12px_40px_rgba(0,0,0,0.7),0_0_24px_rgba(244,63,94,0.25)] animate-fadeIn transition-all relative"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-white/[0.08]">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-extrabold text-xs text-white tracking-wide">
                  Milo 🐱 <span className="text-[10px] font-bold text-rose-300 bg-rose-500/20 px-1.5 py-0.5 rounded-full border border-rose-500/30">AI DJ</span>
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowBubble(false);
                  setIsHovered(false);
                }}
                title="Close"
                className="text-gray-400 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors cursor-pointer"
              >
                <IoClose size={14} />
              </button>
            </div>

            {/* Bubble Dialogue */}
            {isPlaying && currentSongTitle ? (
              <div className="space-y-2">
                <p className="text-xs text-gray-200 leading-snug">
                  Purr! 🐾 Vibing to <span className="text-rose-400 font-bold truncate inline-block max-w-[130px] align-bottom">{currentSongTitle}</span>?
                </p>
                <button
                  type="button"
                  onClick={() => openWithPrompt(`Songs with the exact same vibe as ${currentSongTitle}`)}
                  className="w-full py-1.5 px-3 rounded-xl bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 hover:brightness-110 text-white text-xs font-bold shadow-md flex items-center justify-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
                >
                  <IoSparkles className="text-yellow-300 text-xs" />
                  <span>Mix Matching Vibe</span>
                </button>
              </div>
            ) : (
              <div className="space-y-1.5">
                <p className="text-xs text-gray-100 font-bold">
                  Meow! Need fresh music? 🎧
                </p>
                <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                  <button
                    type="button"
                    onClick={() => openWithPrompt("🌙 Chill Late Night & Lofi")}
                    className="p-1.5 rounded-lg bg-white/[0.05] hover:bg-purple-600/30 border border-white/10 hover:border-purple-400 text-[11px] text-white font-medium transition-all text-left flex items-center gap-1 cursor-pointer"
                  >
                    <span>🌙</span> Late Night
                  </button>
                  <button
                    type="button"
                    onClick={() => openWithPrompt("⚡ High-Energy Workout Phonk")}
                    className="p-1.5 rounded-lg bg-white/[0.05] hover:bg-rose-600/30 border border-white/10 hover:border-rose-400 text-[11px] text-white font-medium transition-all text-left flex items-center gap-1 cursor-pointer"
                  >
                    <span>🔥</span> Workout
                  </button>
                  <button
                    type="button"
                    onClick={() => openWithPrompt("❤️ Romantic Acoustic Bollywood")}
                    className="p-1.5 rounded-lg bg-white/[0.05] hover:bg-pink-600/30 border border-white/10 hover:border-pink-400 text-[11px] text-white font-medium transition-all text-left flex items-center gap-1 cursor-pointer"
                  >
                    <span>💖</span> Romance
                  </button>
                  <button
                    type="button"
                    onClick={() => openWithPrompt("🕺 Bollywood Party Anthems")}
                    className="p-1.5 rounded-lg bg-white/[0.05] hover:bg-amber-600/30 border border-white/10 hover:border-amber-400 text-[11px] text-white font-medium transition-all text-left flex items-center gap-1 cursor-pointer"
                  >
                    <span>🎉</span> Party
                  </button>
                </div>
              </div>
            )}

            {/* Custom AI DJ Prompt footer link */}
            <button
              type="button"
              onClick={() => openWithPrompt("")}
              className="w-full mt-2 pt-1.5 border-t border-white/[0.08] text-[11px] text-rose-300 hover:text-white font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
            >
              <span>Ask custom prompt...</span>
              <span>→</span>
            </button>

            {/* Pointer Notch */}
            <div className="absolute -bottom-2 right-8 w-3.5 h-3.5 bg-[#140b1e] border-r border-b border-rose-500/30 transform rotate-45" />
          </div>
        )}

        {/* Mascot Character Button - Completely unclipped cutout */}
        <div className="relative flex flex-col items-center">
          {/* Floating musical notes when playing */}
          {isPlaying && (
            <>
              <div className="absolute -top-6 left-2 pointer-events-none text-rose-400 text-sm animate-bounce">
                <BsMusicNoteBeamed />
              </div>
              <div
                className="absolute -top-4 right-1 pointer-events-none text-purple-400 text-xs animate-bounce"
                style={{ animationDelay: "0.35s" }}
              >
                ♪
              </div>
            </>
          )}

          {/* Hologram Pulse Ring when music is active */}
          {isPlaying && (
            <div
              className="absolute inset-0 rounded-full border-2 border-rose-500/30 animate-ping pointer-events-none"
              style={{ animationDuration: "2.6s" }}
            />
          )}

          {/* The Cat Mascot Button (Free-standing cutout, NO circular clipping) */}
          <button
            type="button"
            onClick={() => openWithPrompt("")}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            title="Chat with Milo the AI DJ Cat"
            className="group relative cursor-pointer outline-none transition-all duration-300 transform hover:scale-110 active:scale-95 flex flex-col items-center"
          >
            {/* Soft Ambient Neon Glow Behind Cat */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-rose-500/25 via-pink-500/20 to-purple-600/25 blur-lg group-hover:blur-xl transition-all" />

            {/* Soft Ground Shadow Under Paws */}
            <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 w-16 h-3 bg-black/60 rounded-full blur-[3px]" />

            {/* Fluffy White Cat Cutout - 100% visible, ZERO clipping */}
            <div className="relative w-20 h-24 sm:w-22 sm:h-26 flex items-center justify-center">
              <Image
                src="/images/cat-mascot.png"
                alt="Milo AI DJ Cat"
                width={88}
                height={108}
                priority
                className="w-full h-full object-contain filter drop-shadow-[0_8px_16px_rgba(244,63,94,0.35)] transition-transform duration-300"
              />

              {/* Sparkle badge near top ear */}
              <div className="absolute top-1 right-0 w-4 h-4 rounded-full bg-gradient-to-tr from-rose-500 to-purple-600 flex items-center justify-center shadow-md border border-white/30 animate-pulse">
                <IoSparkles className="text-yellow-200 text-[8px]" />
              </div>
            </div>

            {/* Cute Pill Tag Under Paws */}
            <div className="relative -mt-1 px-2.5 py-0.5 rounded-full bg-black/90 border border-rose-500/50 text-[9px] font-black text-rose-300 shadow-xl flex items-center gap-1 whitespace-nowrap group-hover:border-rose-400 group-hover:text-white transition-colors">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>MILO AI DJ</span>
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
