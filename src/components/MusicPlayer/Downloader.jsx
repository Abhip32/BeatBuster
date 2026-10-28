"use client";
import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { createPortal } from "react-dom";
import { MdOutlineFileDownload, MdDownloadForOffline } from "react-icons/md";
import { toast } from "react-hot-toast";
import { getSongData } from "@/services/dataAPI";
import { updateActiveSong } from "@/redux/features/playerSlice";
import {
  QUALITY_OPTIONS,
  buildTagInput,
  downloadBlob,
  fetchLyricsForDownload,
  getCoverType,
  sanitize,
} from "./downloadUtils";

// Helper to safely extract audio link for a given quality option
export const getQualityUrl = (song, quality) => {
  if (!song) return null;
  const dl = song.downloadUrl;
  if (!dl) {
    if (
      typeof song.url === "string" &&
      (song.url.endsWith(".mp4") ||
        song.url.endsWith(".mp3") ||
        song.url.includes("saavncdn"))
    ) {
      return song.url;
    }
    return null;
  }
  if (typeof dl === "string") {
    return dl.includes("jiosaavn.com/song/") ? null : dl;
  }
  if (Array.isArray(dl) && dl.length > 0) {
    const qIndex = typeof quality === "number" ? quality : quality?.index;
    const qTag = typeof quality === "object" ? quality?.tag : null;

    // 1. Try matching by index
    if (typeof qIndex === "number" && dl[qIndex]) {
      const entry = dl[qIndex];
      const link = typeof entry === "string" ? entry : entry?.url || entry?.link;
      if (link && !link.includes("jiosaavn.com/song/")) return link;
    }

    // 2. Try matching by quality tag (e.g. 320kbps, 160kbps, etc.)
    if (qTag) {
      const entry = dl.find((item) => {
        const itemQual = String(item?.quality || "")
          .toLowerCase()
          .replace(/\s+/g, "");
        return (
          itemQual === qTag.toLowerCase() ||
          itemQual.includes(qTag.replace("kbps", ""))
        );
      });
      if (entry) {
        const link = typeof entry === "string" ? entry : entry?.url || entry?.link;
        if (link && !link.includes("jiosaavn.com/song/")) return link;
      }
    }

    // 3. Fallback: if HQ requested or high index, pick highest available in reverse order
    if (qIndex === 4 || quality === undefined) {
      for (let i = dl.length - 1; i >= 0; i--) {
        const entry = dl[i];
        const link = typeof entry === "string" ? entry : entry?.url || entry?.link;
        if (link && !link.includes("jiosaavn.com/song/")) return link;
      }
    }
  }
  return null;
};

const Downloader = ({ activeSong, icon, size = 25 }) => {
  const dispatch = useDispatch();
  const {
    defaultDownloadQuality = "ask",
    lyricsMode = "synced",
    separateLrcFile = false,
  } = useSelector((state) => state.settings || {});

  const [showMenu, setShowMenu] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resolvedSong, setResolvedSong] = useState(null);
  const [loadingQualities, setLoadingQualities] = useState(false);

  const menuButtonRef = useRef(null);
  const menuPanelRef = useRef(null);
  const [menuPlacement, setMenuPlacement] = useState(null);

  // Combine activeSong from props with any locally resolved full song data
  const effectiveSong = useMemo(() => {
    return resolvedSong || activeSong;
  }, [resolvedSong, activeSong]);

  // Check if song currently has downloadUrl
  const hasDownloadUrl = useMemo(() => {
    if (!effectiveSong) return false;
    const dl = effectiveSong.downloadUrl;
    if (typeof dl === "string") return !dl.includes("jiosaavn.com/song/");
    if (Array.isArray(dl) && dl.length > 0) return true;
    return false;
  }, [effectiveSong]);

  // If activeSong lacks downloadUrl, fetch full metadata
  const resolveSongData = useCallback(async () => {
    if (hasDownloadUrl || !activeSong?.id) return;
    setLoadingQualities(true);
    try {
      const fullData = await getSongData(activeSong.id);
      if (fullData) {
        const s = Array.isArray(fullData) ? fullData[0] : fullData;
        if (s && (s.downloadUrl || s.url)) {
          setResolvedSong(s);
          dispatch(updateActiveSong(s));
        }
      }
    } catch (err) {
      console.error("Failed to resolve song details for download:", err);
    } finally {
      setLoadingQualities(false);
    }
  }, [hasDownloadUrl, activeSong?.id, dispatch]);

  useEffect(() => {
    setResolvedSong(null);
    if (!hasDownloadUrl && activeSong?.id) {
      resolveSongData();
    }
  }, [activeSong?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Filter to available qualities
  const availableQualities = useMemo(() => {
    return QUALITY_OPTIONS.filter((q) =>
      Boolean(getQualityUrl(effectiveSong, q))
    );
  }, [effectiveSong]);

  // Dynamic viewport-aware placement without clipping
  const updateMenuPosition = useCallback(() => {
    if (typeof window === "undefined" || !menuButtonRef.current) return;

    const rect = menuButtonRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    const spaceAbove = rect.top;
    const spaceBelow = viewportHeight - rect.bottom;

    // If space below is tight (<180px) and there's more room above (e.g. sticky bottom bar), open upwards.
    // Otherwise open downwards so it doesn't overlap album art or clip into notch/header.
    const openUpwards = spaceBelow < 180 && spaceAbove > spaceBelow;

    // Anchor horizontally to button's right edge, clamped safely within viewport
    const right = Math.max(8, Math.min(viewportWidth - 160, viewportWidth - rect.right));

    if (openUpwards) {
      const bottom = Math.max(8, viewportHeight - rect.top + 8);
      const maxHeight = Math.max(120, spaceAbove - 16);
      setMenuPlacement({
        top: undefined,
        bottom,
        right,
        maxHeight,
        openUpwards: true,
      });
    } else {
      const top = Math.max(8, rect.bottom + 8);
      const maxHeight = Math.max(120, spaceBelow - 16);
      setMenuPlacement({
        top,
        bottom: undefined,
        right,
        maxHeight,
        openUpwards: false,
      });
    }
  }, []);

  // Update position on open, resize, scroll
  useEffect(() => {
    if (!showMenu) return;

    updateMenuPosition();
    const timer = setTimeout(updateMenuPosition, 30);

    const handler = (e) => {
      const clickedButton = menuButtonRef.current?.contains(e.target);
      const clickedMenu = menuPanelRef.current?.contains(e.target);
      if (!clickedButton && !clickedMenu) {
        setShowMenu(false);
      }
    };

    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler, { passive: true });
    window.addEventListener("resize", updateMenuPosition);
    window.addEventListener("scroll", updateMenuPosition, true);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
      window.removeEventListener("resize", updateMenuPosition);
      window.removeEventListener("scroll", updateMenuPosition, true);
    };
  }, [showMenu, updateMenuPosition, availableQualities.length, loadingQualities]);

  const handleDownload = async (quality) => {
    setShowMenu(false);
    setDownloading(true);
    setProgress(0);

    try {
      const songToDownload = effectiveSong || activeSong;
      const songUrl = getQualityUrl(songToDownload, quality);
      if (!songUrl) {
        toast.error("Download URL not available for this quality");
        return;
      }

      setProgress(10);

      // Fetch audio and lyrics in parallel
      const [audioRes, { embedLyrics, lrcContent }] = await Promise.all([
        fetch(songUrl),
        fetchLyricsForDownload(songToDownload, lyricsMode, separateLrcFile),
      ]);
      if (!audioRes.ok) throw new Error("Failed to fetch audio");
      const audioBuffer = await audioRes.arrayBuffer();
      setProgress(40);

      const songName = sanitize(songToDownload?.name);
      const { applyCoverArt, applyTags } = await import("taglib-wasm/simple");
      let taggedBuffer = await applyTags(
        new Uint8Array(audioBuffer),
        buildTagInput(songToDownload, embedLyrics)
      );

      setProgress(60);

      // Fetch and embed cover art
      const coverUrl =
        songToDownload?.image?.[2]?.url ||
        songToDownload?.image?.[1]?.url ||
        songToDownload?.image?.[0]?.url;

      if (coverUrl) {
        try {
          const imgRes = await fetch(coverUrl);
          if (imgRes.ok) {
            const imgBuffer = await imgRes.arrayBuffer();
            taggedBuffer = await applyCoverArt(
              taggedBuffer,
              new Uint8Array(imgBuffer),
              getCoverType(imgRes.headers.get("content-type"))
            );
          }
        } catch {
          // Cover art fetch failed, continue with audio metadata.
        }
      }

      setProgress(80);

      downloadBlob(
        new Blob([taggedBuffer], { type: "audio/mp4" }),
        `${songName}.m4a`
      );

      if (separateLrcFile && lrcContent) {
        setTimeout(() => {
          downloadBlob(
            new Blob([lrcContent], { type: "text/plain;charset=utf-8" }),
            `${songName}.lrc`
          );
        }, 300);
      }

      setProgress(100);
      toast.success(`Downloaded "${songName}" (${quality?.label || "HQ"})`);
    } catch (err) {
      console.error("Download error:", err);
      toast.error("Download failed. Please try again.");
    } finally {
      setDownloading(false);
      setProgress(0);
    }
  };

  const handleButtonClick = (e) => {
    e.stopPropagation();
    if (downloading) return;

    // Trigger resolve if not yet resolved
    if (!hasDownloadUrl) {
      resolveSongData();
    }

    if (
      defaultDownloadQuality !== "ask" &&
      defaultDownloadQuality !== null &&
      defaultDownloadQuality !== undefined
    ) {
      const targetQuality = QUALITY_OPTIONS.find(
        (q) => q.index === Number(defaultDownloadQuality)
      );
      if (targetQuality && getQualityUrl(effectiveSong, targetQuality)) {
        handleDownload(targetQuality);
        return;
      }
      if (availableQualities.length > 0) {
        handleDownload(availableQualities[availableQualities.length - 1]);
        return;
      }
    }

    setShowMenu((prev) => {
      const next = !prev;
      if (next) updateMenuPosition();
      return next;
    });
  };

  return (
    <div className="relative flex mb-1 cursor-pointer w-7" ref={menuButtonRef}>
      <div
        onClick={handleButtonClick}
        onContextMenu={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (!downloading) {
            if (!hasDownloadUrl) resolveSongData();
            setShowMenu(true);
            updateMenuPosition();
          }
        }}
        title={
          downloading
            ? "Downloading"
            : defaultDownloadQuality !== "ask"
            ? "Download (Right-click to select quality)"
            : "Download"
        }
        className={
          downloading ? "download-button flex justify-center items-center" : ""
        }
      >
        {downloading ? (
          <div className="text-white font-extrabold text-xs">{progress}%</div>
        ) : icon === 2 ? (
          <MdDownloadForOffline size={size} color={"#fff"} />
        ) : (
          <MdOutlineFileDownload size={size} color={"#fff"} />
        )}
      </div>

      {/* Quality selection menu with dynamic viewport placement */}
      {showMenu && menuPlacement && typeof document !== "undefined"
        ? createPortal(
            <div
              ref={menuPanelRef}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#18181f]/95 border border-white/15 rounded-2xl shadow-2xl backdrop-blur-2xl z-[9999] min-w-[160px] p-2 overflow-y-auto hideScrollBar animate-fadeIn"
              style={{
                position: "fixed",
                top: menuPlacement.top !== undefined ? `${menuPlacement.top}px` : "auto",
                bottom: menuPlacement.bottom !== undefined ? `${menuPlacement.bottom}px` : "auto",
                right: `${menuPlacement.right}px`,
                maxHeight: `${menuPlacement.maxHeight}px`,
              }}
            >
              <div className="px-3 py-1.5 text-[11px] text-white/50 font-semibold uppercase tracking-wider border-b border-white/10 mb-1 flex items-center justify-between">
                <span>Quality</span>
                {loadingQualities && (
                  <div className="w-3 h-3 border border-[#f43f5e] border-t-transparent rounded-full animate-spin" />
                )}
              </div>

              {loadingQualities && availableQualities.length === 0 ? (
                <div className="px-3 py-3 text-xs text-gray-400 text-center flex items-center justify-center gap-2">
                  <div className="w-3.5 h-3.5 border-2 border-[#f43f5e] border-t-transparent rounded-full animate-spin" />
                  <span>Loading qualities...</span>
                </div>
              ) : availableQualities.length > 0 ? (
                availableQualities.map((q) => (
                  <button
                    key={q.index}
                    onClick={() => handleDownload(q)}
                    className="w-full text-left px-3 py-2 text-xs font-semibold text-gray-200 hover:text-black hover:bg-[#f43f5e] rounded-xl transition-all flex items-center justify-between gap-2"
                  >
                    <span>{q.label}</span>
                    {q.index === 4 && (
                      <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full font-bold">
                        HQ
                      </span>
                    )}
                  </button>
                ))
              ) : (
                <div className="px-3 py-2.5 text-xs text-gray-400 text-center">
                  No qualities available
                </div>
              )}
            </div>,
            document.body
          )
        : null}
    </div>
  );
};

export default Downloader;
