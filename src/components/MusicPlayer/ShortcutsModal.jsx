"use client";
import React from "react";
import { createPortal } from "react-dom";
import { IoClose } from "react-icons/io5";
import { BsKeyboard } from "react-icons/bs";

const SHORTCUTS = [
  { key: "Space", desc: "Play or pause current playback" },
  { key: "Shift + →", desc: "Skip to next track" },
  { key: "Shift + ←", desc: "Return to previous track" },
  { key: "↑ / ↓", desc: "Increase / decrease volume by 5%" },
  { key: "M", desc: "Mute or unmute volume" },
  { key: "L", desc: "Toggle floating lyrics" },
  { key: "Q", desc: "Toggle play queue drawer" },
  { key: "F", desc: "Toggle fullscreen glowing player" },
  { key: "?", desc: "Open this keyboard shortcuts guide" },
];

const ShortcutsModal = ({ isOpen, onClose }) => {
  if (!isOpen || typeof document === "undefined") return null;

  return createPortal(
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 z-[105] bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
      />

      <div
        onClick={(e) => e.stopPropagation()}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100vw-32px)] max-w-md bg-[#18181f]/95 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl z-[110] p-6 text-white animate-in zoom-in-95 duration-200"
      >
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
              <BsKeyboard size={18} />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Keyboard Shortcuts</h3>
              <p className="text-xs text-gray-400">Desktop media hotkeys</p>
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

        <div className="space-y-2">
          {SHORTCUTS.map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between py-1.5 px-2 rounded-xl hover:bg-white/[0.04] transition-colors text-xs"
            >
              <span className="text-gray-300 font-medium">{item.desc}</span>
              <kbd className="px-2.5 py-1 rounded-lg bg-white/10 border border-white/15 text-rose-300 font-mono font-bold text-[11px] shadow-sm">
                {item.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-3 border-t border-white/10 text-center text-[11px] text-gray-400">
          Tip: Shortcuts are active whenever you aren't typing in an input field.
        </div>
      </div>
    </>,
    document.body
  );
};

export default ShortcutsModal;
