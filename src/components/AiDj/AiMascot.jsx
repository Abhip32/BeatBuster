"use client";
import React, { useState, useEffect } from "react";
import { IoSparkles, IoClose } from "react-icons/io5";
import { BsMusicNoteBeamed } from "react-icons/bs";
import { FiMinimize2 } from "react-icons/fi";
import { useSelector } from "react-redux";
import AiDjModal from "./AiDjModal";

const AiMascot = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState("");
  const [showBubble, setShowBubble] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [blink, setBlink] = useState(false);
  const [waveArm, setWaveArm] = useState(false);

  const { activeSong, isPlaying } = useSelector((state) => state.player || {});

  // Natural blinking timer
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 200);
    }, 3800);
    return () => clearInterval(blinkInterval);
  }, []);

  // Occasional cute wave animation
  useEffect(() => {
    const waveInterval = setInterval(() => {
      setWaveArm(true);
      setTimeout(() => setWaveArm(false), 1200);
    }, 8000);
    return () => clearInterval(waveInterval);
  }, []);

  // Auto-hide bubble after 12s if user doesn't click
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowBubble(false);
    }, 12000);
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
        aria-label="Musify AI Music Companion"
        className="fixed bottom-24 right-4 sm:right-6 z-40 flex flex-col items-end select-none pointer-events-auto"
      >
        {/* Duolingo-style Speech Bubble with Beak Pointer */}
        {!isMinimized && (showBubble || isHovered) && (
          <div className="mb-2 mr-2 w-[270px] sm:w-[290px] bg-[#1a1226]/95 backdrop-blur-xl border-2 border-purple-400/40 rounded-2xl p-3.5 shadow-[0_12px_40px_rgba(0,0,0,0.6),0_0_20px_rgba(168,85,247,0.3)] animate-fadeIn transition-all relative">
            {/* Header bar */}
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="font-extrabold text-sm text-white tracking-wide flex items-center gap-1">
                  Buster <span className="text-[11px] font-semibold text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded-md border border-rose-500/20">AI DJ</span>
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setIsMinimized(true)}
                  title="Minimize"
                  className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <FiMinimize2 size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => setShowBubble(false)}
                  title="Close"
                  className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <IoClose size={15} />
                </button>
              </div>
            </div>

            {/* Bubble dialogue */}
            {isPlaying && currentSongTitle ? (
              <div className="space-y-2">
                <p className="text-xs text-gray-200 leading-snug">
                  Hoot hoot! 🦉 Vibing to <span className="text-rose-400 font-bold truncate inline-block max-w-[150px] align-bottom">{currentSongTitle}</span>?
                </p>
                <button
                  type="button"
                  onClick={() => openWithPrompt(`Songs with the exact same vibe as ${currentSongTitle}`)}
                  className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 hover:brightness-110 text-white text-xs font-extrabold shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer"
                >
                  <IoSparkles className="text-yellow-300" />
                  <span>Generate Vibe Mix</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-gray-100 font-bold">
                  Hey bestie! What&apos;s the vibe today? 🎧
                </p>
                <p className="text-[11px] text-purple-200/80">
                  Pick a mood or tap me to create your AI playlist:
                </p>
                <div className="grid grid-cols-2 gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => openWithPrompt("🌙 Chill Late Night & Lofi")}
                    className="p-2 rounded-xl bg-white/[0.06] hover:bg-purple-600/30 border border-white/10 hover:border-purple-400 text-[11px] text-white font-bold transition-all text-left flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>🌙</span> Late Night
                  </button>
                  <button
                    type="button"
                    onClick={() => openWithPrompt("⚡ High-Energy Workout Phonk")}
                    className="p-2 rounded-xl bg-white/[0.06] hover:bg-rose-600/30 border border-white/10 hover:border-rose-400 text-[11px] text-white font-bold transition-all text-left flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>🔥</span> Gym Hype
                  </button>
                  <button
                    type="button"
                    onClick={() => openWithPrompt("❤️ Romantic Acoustic Bollywood")}
                    className="p-2 rounded-xl bg-white/[0.06] hover:bg-pink-600/30 border border-white/10 hover:border-pink-400 text-[11px] text-white font-bold transition-all text-left flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>💖</span> Romance
                  </button>
                  <button
                    type="button"
                    onClick={() => openWithPrompt("🕺 Bollywood Party Anthems")}
                    className="p-2 rounded-xl bg-white/[0.06] hover:bg-amber-600/30 border border-white/10 hover:border-amber-400 text-[11px] text-white font-bold transition-all text-left flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>🎉</span> Party Hits
                  </button>
                </div>
              </div>
            )}

            {/* Custom AI DJ Prompt footer link */}
            <button
              type="button"
              onClick={() => openWithPrompt("")}
              className="w-full mt-2 pt-1.5 border-t border-white/[0.08] text-[11px] text-purple-300 hover:text-white font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
            >
              <span>Type custom prompt...</span>
              <span>→</span>
            </button>

            {/* Pointer Notch pointing down to the owl's head */}
            <div className="absolute -bottom-2 right-12 w-4 h-4 bg-[#1a1226] border-r-2 border-b-2 border-purple-400/40 transform rotate-45" />
          </div>
        )}

        {/* The Full Duolingo-style Owl Character */}
        <div className="relative flex flex-col items-center">
          {/* Musical notes floating out when music is playing */}
          {isPlaying && (
            <>
              <div className="absolute -top-7 left-1 pointer-events-none text-rose-400 text-sm animate-bounce">
                <BsMusicNoteBeamed />
              </div>
              <div
                className="absolute -top-5 right-2 pointer-events-none text-purple-400 text-xs animate-bounce"
                style={{ animationDelay: "0.4s" }}
              >
                ♪
              </div>
            </>
          )}

          {/* Character Container with Grooving / Bouncing Motion */}
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
            title="Talk to Buster the AI DJ"
            className={`group relative cursor-pointer outline-none transition-transform duration-300 ${
              isPlaying
                ? "animate-bounce"
                : isHovered
                ? "scale-115 -translate-y-2"
                : "hover:scale-110 -translate-y-0.5"
            }`}
            style={{
              animationDuration: isPlaying ? "1.1s" : "3s",
            }}
          >
            {/* Soft cartoon drop-shadow / aura underneath */}
            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-16 h-3 bg-black/60 rounded-full blur-[3px]" />

            {/* Duolingo Owl Character SVG */}
            <svg
              width="92"
              height="96"
              viewBox="0 0 120 125"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)] transition-all"
            >
              {/* DJ HEADPHONES - Headband Behind Head */}
              <path
                d="M20 54 C20 18, 100 18, 100 54"
                stroke="#f43f5e"
                strokeWidth="8"
                strokeLinecap="round"
              />
              <path
                d="M26 50 C26 24, 94 24, 94 50"
                stroke="#fb7185"
                strokeWidth="3"
                strokeLinecap="round"
              />

              {/* OWLET FEET (Orange Duolingo-style 3-toed paws) */}
              <g id="feet">
                {/* Left foot */}
                <ellipse cx="45" cy="114" rx="10" ry="5" fill="#f97316" stroke="#c2410c" strokeWidth="2" />
                <circle cx="39" cy="115" r="3.5" fill="#ea580c" />
                <circle cx="45" cy="116" r="3.5" fill="#ea580c" />
                <circle cx="51" cy="115" r="3.5" fill="#ea580c" />

                {/* Right foot */}
                <ellipse cx="75" cy="114" rx="10" ry="5" fill="#f97316" stroke="#c2410c" strokeWidth="2" />
                <circle cx="69" cy="115" r="3.5" fill="#ea580c" />
                <circle cx="75" cy="116" r="3.5" fill="#ea580c" />
                <circle cx="81" cy="115" r="3.5" fill="#ea580c" />
              </g>

              {/* CHUBBY BODY (Iconic Duolingo Green Pear Shape) */}
              <path
                d="M60 22 C32 22 22 45 22 75 C22 102 36 114 60 114 C84 114 98 102 98 75 C98 45 88 22 60 22 Z"
                fill="#58cc02"
                stroke="#46a302"
                strokeWidth="4"
              />

              {/* BELLY FEATHERS (Light Yellow-Green Patch) */}
              <path
                d="M60 62 C44 62 36 76 36 94 C36 108 46 112 60 112 C74 112 84 108 84 94 C84 76 76 62 60 62 Z"
                fill="#89e219"
              />
              {/* Belly Feather Chevrons */}
              <path d="M52 82 Q60 88 68 82" stroke="#58cc02" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M48 94 Q60 100 72 94" stroke="#58cc02" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M54 103 Q60 107 66 103" stroke="#58cc02" strokeWidth="2" strokeLinecap="round" />

              {/* DUOLINGO SIGNATURE LARGE EYE MASK / PATCHES */}
              <ellipse cx="44" cy="50" rx="19" ry="21" fill="#89e219" />
              <ellipse cx="76" cy="50" rx="19" ry="21" fill="#89e219" />

              {/* BIG WHITE CARTOON SCLERA */}
              <ellipse cx="44" cy="50" rx="15" ry="17" fill="#ffffff" stroke="#46a302" strokeWidth="2" />
              <ellipse cx="76" cy="50" rx="15" ry="17" fill="#ffffff" stroke="#46a302" strokeWidth="2" />

              {/* EYEBALLS / PUPILS with Natural Blink & Expressions */}
              {blink ? (
                // Blinking closed happy eyelids
                <>
                  <path d="M33 50 Q44 56 55 50" stroke="#1f2937" strokeWidth="4" strokeLinecap="round" />
                  <path d="M65 50 Q76 56 87 50" stroke="#1f2937" strokeWidth="4" strokeLinecap="round" />
                </>
              ) : isHovered ? (
                // Excited Star / Sparkle Eyes when hovered
                <>
                  <ellipse cx="44" cy="50" rx="11" ry="12" fill="#0f172a" />
                  <ellipse cx="76" cy="50" rx="11" ry="12" fill="#0f172a" />
                  {/* Star glints */}
                  <polygon points="44,43 46,48 51,48 47,51 49,56 44,53 39,56 41,51 37,48 42,48" fill="#facc15" />
                  <polygon points="76,43 78,48 83,48 79,51 81,56 76,53 71,56 73,51 69,48 74,48" fill="#facc15" />
                </>
              ) : (
                // Big, friendly, expressive pupils with catchlights
                <>
                  {/* Left Pupil */}
                  <ellipse cx={isPlaying ? "46" : "44"} cy="51" rx="10" ry="11" fill="#1e293b" />
                  <circle cx={isPlaying ? "44" : "42"} cy="47" r="4" fill="#ffffff" />
                  <circle cx={isPlaying ? "48" : "46"} cy="53" r="1.8" fill="#ffffff" />

                  {/* Right Pupil */}
                  <ellipse cx={isPlaying ? "78" : "76"} cy="51" rx="10" ry="11" fill="#1e293b" />
                  <circle cx={isPlaying ? "76" : "74"} cy="47" r="4" fill="#ffffff" />
                  <circle cx={isPlaying ? "80" : "78"} cy="53" r="1.8" fill="#ffffff" />
                </>
              )}

              {/* CUTE ORANGE BEAK */}
              <polygon
                points="60,54 52,65 68,65"
                fill="#f97316"
                stroke="#c2410c"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              {/* Lower Beak Open / Tongue when singing */}
              {isPlaying && (
                <path d="M54 65 Q60 72 66 65" fill="#ef4444" stroke="#c2410c" strokeWidth="1.5" />
              )}

              {/* WINGS */}
              {/* Left Wing (Waving or Tapping) */}
              <g
                id="left-wing"
                style={{
                  transformOrigin: "26px 70px",
                  transform: waveArm || isHovered ? "rotate(-25deg)" : "rotate(0deg)",
                  transition: "transform 0.3s ease",
                }}
              >
                <path
                  d="M26 66 C14 68 8 82 14 96 C20 102 28 92 30 80 Z"
                  fill="#46a302"
                  stroke="#378001"
                  strokeWidth="2.5"
                />
              </g>

              {/* Right Wing (Holding DJ headphones or beat-tapping) */}
              <g
                id="right-wing"
                style={{
                  transformOrigin: "94px 70px",
                  transform: isPlaying ? "rotate(15deg)" : "rotate(0deg)",
                  transition: "transform 0.3s ease",
                }}
              >
                <path
                  d="M94 66 C106 68 112 82 106 96 C100 102 92 92 90 80 Z"
                  fill="#46a302"
                  stroke="#378001"
                  strokeWidth="2.5"
                />
              </g>

              {/* HEADPHONES EAR CUPS (Neon Rose & Purple Glowing Cushions) */}
              {/* Left Cup */}
              <g id="left-cup">
                <rect
                  x="10"
                  y="44"
                  width="13"
                  height="26"
                  rx="6.5"
                  fill="#f43f5e"
                  stroke="#be123c"
                  strokeWidth="2"
                />
                <circle cx="16.5" cy="57" r="4" fill="#a855f7" />
                <circle cx="16.5" cy="57" r="2" fill="#ffffff" />
              </g>

              {/* Right Cup */}
              <g id="right-cup">
                <rect
                  x="97"
                  y="44"
                  width="13"
                  height="26"
                  rx="6.5"
                  fill="#f43f5e"
                  stroke="#be123c"
                  strokeWidth="2"
                />
                <circle cx="103.5" cy="57" r="4" fill="#a855f7" />
                <circle cx="103.5" cy="57" r="2" fill="#ffffff" />
              </g>

              {/* DJ BADGE / MINI VINYL ON HEADBAND */}
              <circle cx="60" cy="23" r="8" fill="#18181b" stroke="#f43f5e" strokeWidth="2" />
              <circle cx="60" cy="23" r="4" fill="#a855f7" />
              <circle cx="60" cy="23" r="1.5" fill="#ffffff" />
            </svg>

            {/* "AI DJ" Badge tag at feet */}
            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-purple-700 via-pink-600 to-rose-600 border border-white/30 text-[10px] font-black text-white shadow-xl flex items-center gap-1 whitespace-nowrap">
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-300 animate-pulse" />
              <span>BUSTER DJ</span>
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
