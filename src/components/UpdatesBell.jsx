"use client";

import React, { useEffect, useRef, useState } from "react";
import { HiOutlineBell } from "react-icons/hi2";
import { IoClose } from "react-icons/io5";

const CURRENT_UPDATE_KEY = "musify_updates_seen_v3";

const CHANGES = [
  {
    title: "Spotify Glassmorphism UI",
    description:
      "All-new Spotify-inspired theme with glowing green accents, translucent glass panels, and redesigned playback controls.",
  },
  {
    title: "Synchronized Karaoke Lyrics",
    description:
      "Live synchronized lyrics powered by lrclib.net with automatic scrolling and line highlighting.",
  },
  {
    title: "High-Quality Audio & Metadata",
    description:
      "Stream and download songs up to 320kbps with full ID3 tags, album artwork, and embedded lyrics.",
  },
  {
    title: "Bulk ZIP Downloads",
    description:
      "Download entire albums and playlists as ZIP archives with a single click.",
  },
];

const UpdatesBell = ({ mobileSearchOpen }) => {
  const [open, setOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const panelRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const seen = window.localStorage.getItem(CURRENT_UPDATE_KEY) === "true";
    setHasUnread(!seen);
  }, []);

  useEffect(() => {
    if (!open) return;

    const handleOutsideClick = (event) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [open]);

  const toggleOpen = () => {
    setOpen((prev) => {
      const next = !prev;
      if (next && typeof window !== "undefined") {
        window.localStorage.setItem(CURRENT_UPDATE_KEY, "true");
        setHasUnread(false);
      }
      return next;
    });
  };

  return (
    <div className={`relative ${mobileSearchOpen ? "hidden md:block" : ""}`}>
      <button
        ref={buttonRef}
        type="button"
        onClick={toggleOpen}
        aria-label="View recent updates"
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/5 border border-white/10 text-white/80 transition-all hover:bg-white/10 hover:border-[#a855f7] hover:text-[#a855f7]"
      >
        <HiOutlineBell className="h-5 w-5" />
        {hasUnread && (
          <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-[#a855f7] shadow-[0_0_8px_#a855f7]" />
        )}
      </button>

      {open && (
        <div
          ref={panelRef}
          className="absolute right-0 mt-2 w-[85vw] max-w-[360px] rounded-2xl border border-white/10 bg-[#16161b]/95 p-4 text-white shadow-2xl backdrop-blur-2xl z-50 animate-fadeIn"
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <p className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
                What&apos;s New
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#a855f7] bg-[#a855f7]/15 px-2 py-0.5 rounded-full border border-[#a855f7]/30">
                  Updates
                </span>
              </p>
              <p className="text-xs text-gray-400">Musify improvements</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full p-1 text-gray-400 hover:bg-white/10 hover:text-white"
            >
              <IoClose className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-3 max-h-[300px] space-y-3 overflow-y-auto pr-1">
            {CHANGES.map((change, index) => (
              <div
                key={index}
                className="rounded-xl border border-white/5 bg-white/[0.03] p-3 transition-colors hover:bg-white/[0.06]"
              >
                <p className="text-xs font-semibold text-gray-100">
                  {change.title}
                </p>
                <p className="mt-1 text-[11px] leading-relaxed text-gray-400">
                  {change.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UpdatesBell;
