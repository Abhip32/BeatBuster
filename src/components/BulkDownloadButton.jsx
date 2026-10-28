"use client";

import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { createPortal } from "react-dom";
import {
  MdCheckCircleOutline,
  MdDownloadForOffline,
  MdOutlineAutorenew,
} from "react-icons/md";
import { toast } from "react-hot-toast";
import {
  QUALITY_OPTIONS,
  buildTagInput,
  downloadBlob,
  fetchLyricsForDownload,
  getCoverType,
  sanitize,
} from "./MusicPlayer/downloadUtils";

const BulkDownloadButton = ({ songList }) => {
  const {
    defaultDownloadQuality = "ask",
    lyricsMode = "synced",
    separateLrcFile = false,
  } = useSelector((state) => state.settings || {});
  const [showMenu, setShowMenu] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [progress, setProgress] = useState(0);
  const buttonRef = useRef(null);
  const menuRef = useRef(null);
  const [menuPosition, setMenuPosition] = useState(null);
  const resetTimerRef = useRef(null);

  const songs = songList?.songs || songList || [];
  const downloadTitle = songList?.name || "songs";

  const updateMenuPosition = () => {
    if (typeof window === "undefined" || !buttonRef.current) return;

    const rect = buttonRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    const spaceAbove = rect.top;
    const spaceBelow = viewportHeight - rect.bottom;
    const openUpwards = spaceBelow < 180 && spaceAbove > spaceBelow;

    const right = Math.max(8, viewportWidth - rect.right);

    if (openUpwards) {
      const bottom = Math.max(8, viewportHeight - rect.top + 8);
      const maxHeight = Math.max(120, spaceAbove - 16);
      setMenuPosition({
        top: undefined,
        bottom,
        right,
        maxHeight,
      });
    } else {
      const top = Math.max(8, rect.bottom + 8);
      const maxHeight = Math.max(120, spaceBelow - 16);
      setMenuPosition({
        top,
        bottom: undefined,
        right,
        maxHeight,
      });
    }
  };

  useEffect(() => {
    if (!showMenu) return;

    const handler = (e) => {
      const clickedButton = buttonRef.current?.contains(e.target);
      const clickedMenu = menuRef.current?.contains(e.target);

      if (!clickedButton && !clickedMenu) {
        setShowMenu(false);
      }
    };

    updateMenuPosition();
    document.addEventListener("mousedown", handler);
    window.addEventListener("resize", updateMenuPosition);
    window.addEventListener("scroll", updateMenuPosition, true);

    return () => {
      document.removeEventListener("mousedown", handler);
      window.removeEventListener("resize", updateMenuPosition);
      window.removeEventListener("scroll", updateMenuPosition, true);
    };
  }, [showMenu]);

  const handleBulkDownload = async (quality) => {
    setShowMenu(false);

    if (!songs.length) {
      toast.error("No songs available to download");
      return;
    }

    setDownloading(true);
    setCompleted(false);
    setProgress(0);

    try {
      const [{ default: JSZip }, { applyCoverArt, applyTags }] =
        await Promise.all([import("jszip"), import("taglib-wasm/simple")]);

      const zip = new JSZip();
      const folderName = sanitize(downloadTitle) || "download";
      const folder = zip.folder(folderName) || zip;
      const availableSongs = songs.filter(
        (song) => song?.downloadUrl?.[quality.index]?.url || song?.downloadUrl?.[quality.index]?.link,
      );

      if (!availableSongs.length) {
        toast.error("No downloads available for this quality");
        return;
      }

      for (let i = 0; i < availableSongs.length; i += 1) {
        const song = availableSongs[i];
        const downloadUrl = song.downloadUrl[quality.index]?.url || song.downloadUrl[quality.index]?.link;
        const songTitle = sanitize(song.name) || `Track_${i + 1}`;
        const filename = `${songTitle}.mp4`;

        try {
          const songRes = await fetch(downloadUrl);
          if (!songRes.ok) {
            throw new Error(`Failed to fetch song ${songTitle}`);
          }

          const arrayBuffer = await songRes.arrayBuffer();
          let processedBuffer = arrayBuffer;

          const { embedLyrics, lrcContent } = await fetchLyricsForDownload(
            song,
            lyricsMode,
            separateLrcFile,
          );

          try {
            const coverUrl =
              song.image?.[2]?.url ||
              song.image?.[1]?.url ||
              song.image?.[0]?.url;

            let coverBuffer = null;
            let coverType = "image/jpeg";

            if (coverUrl) {
              const coverRes = await fetch(coverUrl);
              if (coverRes.ok) {
                coverBuffer = await coverRes.arrayBuffer();
                coverType = getCoverType(
                  coverRes.headers.get("content-type"),
                );
              }
            }

            const tagInput = buildTagInput(song, embedLyrics);
            let tagged = applyTags(new Uint8Array(processedBuffer), tagInput);

            if (coverBuffer) {
              tagged = applyCoverArt(
                tagged,
                new Uint8Array(coverBuffer),
                coverType,
                "Cover (front)",
              );
            }

            processedBuffer = tagged.buffer;
          } catch (tagError) {
            console.warn("Tag embedding fallback:", tagError);
          }

          folder.file(filename, processedBuffer);

          if (separateLrcFile && lrcContent) {
            folder.file(`${songTitle}.lrc`, lrcContent);
          }
        } catch (itemError) {
          console.error(itemError);
        }

        setProgress(Math.round(((i + 1) / availableSongs.length) * 100));
      }

      const zipBlob = await zip.generateAsync({ type: "blob" });
      downloadBlob(zipBlob, `${folderName}.zip`);
      setCompleted(true);
      toast.success("Download ready!");

      if (resetTimerRef.current) {
        clearTimeout(resetTimerRef.current);
      }
      resetTimerRef.current = setTimeout(() => {
        setCompleted(false);
      }, 5000);
    } catch (err) {
      console.error(err);
      toast.error("Failed to complete download");
    } finally {
      setDownloading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (resetTimerRef.current) {
        clearTimeout(resetTimerRef.current);
      }
    };
  }, []);

  const availableQualities = QUALITY_OPTIONS.filter((quality) =>
    songs.some((song) => song?.downloadUrl?.[quality.index]?.url || song?.downloadUrl?.[quality.index]?.link),
  );

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        disabled={downloading}
        onClick={() => {
          if (downloading) return;

          if (defaultDownloadQuality !== "ask") {
            const targetQuality = QUALITY_OPTIONS.find(
              (q) => q.index === Number(defaultDownloadQuality),
            );
            if (
              targetQuality &&
              songs.some((song) => song?.downloadUrl?.[targetQuality.index]?.url || song?.downloadUrl?.[targetQuality.index]?.link)
            ) {
              handleBulkDownload(targetQuality);
              return;
            }
            if (availableQualities.length > 0) {
              handleBulkDownload(availableQualities[availableQualities.length - 1]);
              return;
            }
          }

          setShowMenu((prev) => {
            const next = !prev;
            if (next) updateMenuPosition();
            return next;
          });
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (!downloading) {
            setShowMenu(true);
            updateMenuPosition();
          }
        }}
        title={
          downloading
            ? "Downloading"
            : defaultDownloadQuality !== "ask"
            ? `Download ${downloadTitle} (Right-click to select quality)`
            : `Download ${downloadTitle}`
        }
        aria-label={downloading ? "Downloading" : `Download ${downloadTitle}`}
        className={`group relative overflow-hidden flex h-13 items-center justify-center gap-2.5 rounded-full border px-6 text-white font-bold text-sm tracking-wide transition-all duration-200 active:scale-95 cursor-pointer backdrop-blur-xl ${
          downloading
            ? "cursor-not-allowed bg-white/10 border-white/20"
            : completed
            ? "bg-[#f43f5e]/20 border-[#f43f5e] text-[#f43f5e] shadow-[0_0_20px_rgba(244, 63, 94,0.3)]"
            : "bg-white/[0.08] hover:bg-white/[0.14] border-white/15 hover:border-[#f43f5e]/60 hover:shadow-[0_0_20px_rgba(244, 63, 94,0.2)]"
        }`}
      >
        <div
          className={`absolute inset-y-0 left-0 transition-[width,background-color] duration-150 ease-out ${
            downloading
              ? "bg-[#f43f5e]/30"
              : completed
              ? "bg-[#f43f5e]/40"
              : "bg-transparent"
          }`}
          style={{ width: `${Math.min(progress, 100)}%` }}
        />

        <div className="relative z-10 flex items-center justify-center gap-2 pointer-events-none">
          {downloading ? (
            <>
              <MdOutlineAutorenew size={20} className="animate-spin text-[#f43f5e]" />
              <span>Downloading... {progress}%</span>
            </>
          ) : completed ? (
            <>
              <MdCheckCircleOutline size={20} className="text-[#f43f5e]" />
              <span>Downloaded</span>
            </>
          ) : (
            <>
              <MdDownloadForOffline
                size={22}
                className="text-gray-300 group-hover:text-[#f43f5e] transition-colors"
              />
              <span>Download ZIP</span>
            </>
          )}
        </div>
      </button>

      {showMenu && menuPosition && typeof document !== "undefined"
        ? createPortal(
            <div
              ref={menuRef}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#18181f]/95 border border-white/15 rounded-2xl shadow-2xl backdrop-blur-2xl z-[9999] min-w-[180px] p-2 overflow-y-auto hideScrollBar animate-fadeIn"
              style={{
                position: "fixed",
                top: menuPosition.top !== undefined ? `${menuPosition.top}px` : "auto",
                bottom: menuPosition.bottom !== undefined ? `${menuPosition.bottom}px` : "auto",
                right: `${menuPosition.right}px`,
                maxHeight: `${menuPosition.maxHeight}px`,
              }}
            >
              <div className="px-3 py-1.5 text-[11px] text-gray-400 font-bold uppercase tracking-wider border-b border-white/10 mb-1">
                Select Quality
              </div>
              {availableQualities.map((quality) => (
                <button
                  key={quality.index}
                  onClick={() => handleBulkDownload(quality)}
                  className="w-full text-left px-3 py-2 text-xs font-semibold text-gray-200 hover:text-black hover:bg-[#f43f5e] rounded-xl transition-all flex items-center justify-between gap-2"
                >
                  <span>{quality.label}</span>
                  {quality.index === 4 && (
                    <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full font-bold">
                      HQ
                    </span>
                  )}
                </button>
              ))}
            </div>,
            document.body,
          )
        : null}
    </div>
  );
};

export default BulkDownloadButton;
