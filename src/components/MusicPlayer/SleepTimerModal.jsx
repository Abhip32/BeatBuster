"use client";
import React from "react";
import { createPortal } from "react-dom";
import { IoClose, IoMoonOutline } from "react-icons/io5";
import { MdOutlineTimer, MdCheck } from "react-icons/md";

const TIMER_OPTIONS = [
  { label: "15 minutes", minutes: 15, mode: "15m" },
  { label: "30 minutes", minutes: 30, mode: "30m" },
  { label: "45 minutes", minutes: 45, mode: "45m" },
  { label: "1 hour", minutes: 60, mode: "60m" },
  { label: "End of this song", minutes: null, mode: "endOfTrack" },
];

const SleepTimerModal = ({
  isOpen,
  onClose,
  bgColor,
  sleepTimerMode,
  sleepTimerRemaining,
  onSetTimer,
  onCancelTimer,
}) => {
  if (!isOpen || typeof document === "undefined") return null;

  const formatRemaining = (seconds) => {
    if (seconds <= 0) return "0s";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  };

  return createPortal(
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 z-[95] bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
      />

      <div
        onClick={(e) => e.stopPropagation()}
        className="fixed bottom-24 right-3 sm:right-6 md:right-8 w-[calc(100vw-24px)] max-w-sm rounded-3xl shadow-2xl z-[100] overflow-hidden border border-white/10 flex flex-col text-white animate-in fade-in slide-in-from-bottom-3 duration-200"
        style={{
          backgroundColor: bgColor
            ? `rgba(${Math.max(15, bgColor.red * 0.25)}, ${Math.max(
                15,
                bgColor.green * 0.25
              )}, ${Math.max(18, bgColor.blue * 0.25)}, 0.88)`
            : "rgba(18, 18, 22, 0.92)",
          backdropFilter: "blur(50px)",
          WebkitBackdropFilter: "blur(50px)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-white/[0.03]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
              <IoMoonOutline size={18} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Sleep Timer</h3>
              <p className="text-[11px] text-gray-400">
                {sleepTimerMode
                  ? sleepTimerMode === "endOfTrack"
                    ? "Pauses at end of song"
                    : `${formatRemaining(sleepTimerRemaining)} remaining`
                  : "Pause playback automatically"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <IoClose size={20} />
          </button>
        </div>

        {/* Options List */}
        <div className="p-3 space-y-1">
          {TIMER_OPTIONS.map((opt) => {
            const isSelected = sleepTimerMode === opt.mode;
            return (
              <button
                key={opt.mode}
                type="button"
                onClick={() => {
                  onSetTimer(opt.mode, opt.minutes ? opt.minutes * 60 : null);
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-left text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                    : "hover:bg-white/[0.08] text-gray-200 hover:text-white border border-transparent"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <MdOutlineTimer
                    size={16}
                    className={isSelected ? "text-rose-400" : "text-gray-400"}
                  />
                  <span>{opt.label}</span>
                </div>
                {isSelected && <MdCheck size={16} className="text-rose-400" />}
              </button>
            );
          })}

          {/* Turn Off Option if Active */}
          {sleepTimerMode && (
            <button
              type="button"
              onClick={() => {
                onCancelTimer();
                onClose();
              }}
              className="w-full flex items-center justify-center px-4 py-2.5 mt-2 rounded-xl text-center text-xs font-bold text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 transition-all cursor-pointer"
            >
              Turn Off Timer
            </button>
          )}
        </div>
      </div>
    </>
  , document.body);
};

export default SleepTimerModal;
