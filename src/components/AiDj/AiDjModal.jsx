"use client";
import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { IoClose, IoSparkles } from "react-icons/io5";
import { BsFillPlayFill, BsDisc } from "react-icons/bs";
import { FaBookmark, FaKey } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { playPause, setActiveSong } from "@/redux/features/playerSlice";
import { addPlaylist } from "@/redux/features/playlistsSlice";
import { createPlaylist, addSongToPlaylist } from "@/services/playlistApi";
import { toast } from "react-hot-toast";

const decodeHtml = (str) => {
  if (!str) return "";
  return str
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
};

const QUICK_PROMPTS = [
  "🌙 Late Night Chill",
  "⚡ High-Energy Workout Phonk",
  "❤️ Romantic Acoustic Evening",
  "🕺 Bollywood Party Anthems",
  "☕ Rainy Day Lo-Fi",
  "🚗 2000s Road Trip Hits",
];

const AiDjModal = ({ show, setShow, initialPrompt = "" }) => {
  const dispatch = useDispatch();
  const { activeSong } = useSelector((state) => state.player);

  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSavingPlaylist, setIsSavingPlaylist] = useState(false);
  const [commentary, setCommentary] = useState("");
  const [songs, setSongs] = useState([]);
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (show && initialPrompt) {
      setPrompt(initialPrompt);
      handleGenerate(initialPrompt);
    }
  }, [show, initialPrompt]);

  useEffect(() => {
    try {
      const savedKey = localStorage.getItem("musify_gemini_key");
      if (savedKey) setApiKey(savedKey);
    } catch {}
  }, []);

  const handleSaveKey = (val) => {
    setApiKey(val);
    try {
      if (val.trim()) {
        localStorage.setItem("musify_gemini_key", val.trim());
      } else {
        localStorage.removeItem("musify_gemini_key");
      }
    } catch {}
  };

  const handleGenerate = async (customPrompt) => {
    const queryPrompt = customPrompt || prompt;
    if (!queryPrompt.trim() && !activeSong?.name) {
      toast.error("Please enter a vibe or choose a quick prompt");
      return;
    }

    setLoading(true);
    setSongs([]);
    setCommentary("");

    try {
      const res = await fetch("/api/ai/dj", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: queryPrompt,
          currentSong: activeSong?.name ? activeSong : null,
          apiKey: apiKey.trim(),
        }),
      });

      const data = await res.json();
      if (data?.success === true && Array.isArray(data?.songs)) {
        setSongs(data.songs);
        setCommentary(data.commentary || "Your personalized AI mix is ready.");
        if (data.songs.length === 0) {
          toast.error("No songs found for that vibe. Try another description.");
        }
      } else {
        toast.error(data?.message || "Could not generate AI mix");
      }
    } catch (err) {
      console.error("AI DJ error:", err);
      toast.error("Failed to connect to AI DJ");
    } finally {
      setLoading(false);
    }
  };

  const handlePlayAll = () => {
    if (songs.length === 0) return;
    dispatch(setActiveSong({ song: songs[0], data: songs, i: 0 }));
    dispatch(playPause(true));
    toast.success("Playing AI Mix!");
    setShow(false);
  };

  const handleSaveAsPlaylist = async () => {
    if (songs.length === 0 || isSavingPlaylist) return;
    const playlistTitle = prompt.trim()
      ? `AI Mix: ${prompt.slice(0, 24)}`
      : `AI Mix: ${new Date().toLocaleDateString()}`;

    setIsSavingPlaylist(true);
    const toastId = toast.loading("Saving AI playlist to your library...");
    try {
      const createRes = await createPlaylist(playlistTitle);
      if (createRes?.success === true) {
        const playlistObj = createRes?.data?.playlist || {
          _id: createRes?.data?._id || Date.now().toString(),
          name: playlistTitle,
          songs: [],
        };
        const pId = playlistObj._id;

        // Add all songs
        for (const s of songs) {
          await addSongToPlaylist(pId, s).catch(() => {});
        }

        const populatedItem = {
          ...playlistObj,
          songs,
        };
        dispatch(addPlaylist(populatedItem));
        toast.success(`Saved "${playlistTitle}" with ${songs.length} songs!`, {
          id: toastId,
        });
        setShow(false);
      } else {
        toast.error(createRes?.message || "Failed to create playlist", {
          id: toastId,
        });
      }
    } catch {
      toast.error("Failed to save playlist", { id: toastId });
    } finally {
      setIsSavingPlaylist(false);
    }
  };

  if (!show || !mounted) return null;

  return createPortal(
    <div
      onClick={() => setShow(false)}
      className="fixed inset-0 bg-black/85 backdrop-blur-md z-[110] flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-gradient-to-b from-[#1c1228] via-[#121217] to-black border border-purple-500/30 rounded-3xl shadow-[0_0_50px_rgba(168,85,247,0.25)] w-full max-w-xl p-6 sm:p-7 max-h-[90vh] overflow-y-auto text-white"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-pink-600 to-[#f43f5e] flex items-center justify-center shadow-lg shadow-purple-500/30">
              <IoSparkles className="text-white text-xl animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white tracking-tight">
                  Musify AI DJ
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 uppercase tracking-wider">
                  Free AI
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Instant smart playlists tailored to your mood
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setShowKeyInput((prev) => !prev)}
              className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-purple-300 transition-colors"
              title="Configure Gemini API Key"
            >
              <FaKey size={14} />
            </button>
            <button
              type="button"
              onClick={() => setShow(false)}
              className="p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            >
              <IoClose size={22} />
            </button>
          </div>
        </div>

        {/* Optional Custom Gemini Key Input */}
        {showKeyInput && (
          <div className="mt-4 p-3.5 rounded-2xl bg-purple-950/20 border border-purple-500/30 text-xs text-purple-200">
            <p className="font-semibold mb-1">Custom Google Gemini API Key (Optional)</p>
            <p className="text-gray-400 text-[11px] mb-2 leading-relaxed">
              Musify includes built-in music AI intelligence for free. To unlock full LLM creativity, you can add your free Gemini key from Google AI Studio.
            </p>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => handleSaveKey(e.target.value)}
              placeholder="Paste AI Studio API key here..."
              className="w-full px-3 py-1.5 bg-black/50 border border-purple-500/40 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-400"
            />
          </div>
        )}

        {/* Input & Quick Chips */}
        <div className="mt-5 space-y-3">
          <div className="relative">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
              placeholder="Describe your vibe, mood, decade, or genre..."
              className="w-full pl-4 pr-24 py-3 bg-white/[0.04] border border-white/15 focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/20 rounded-2xl text-sm text-white placeholder-gray-500 outline-none transition-all font-medium"
            />
            <button
              type="button"
              onClick={() => handleGenerate()}
              disabled={loading}
              className="absolute right-2 top-2 bottom-2 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-[#f43f5e] hover:from-purple-500 hover:to-[#fb7185] text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <IoSparkles size={13} />
              )}
              <span>Spin</span>
            </button>
          </div>

          {/* Quick Prompts */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {activeSong?.name && (
              <button
                type="button"
                onClick={() => {
                  setPrompt(`Similar to ${activeSong.name}`);
                  handleGenerate(`Similar to ${activeSong.name}`);
                }}
                className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30 hover:bg-rose-500/25 transition-all flex items-center gap-1 cursor-pointer"
              >
                <BsDisc size={11} className="animate-spin" />
                <span>Like: {activeSong.name.slice(0, 16)}...</span>
              </button>
            )}

            {QUICK_PROMPTS.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setPrompt(p);
                  handleGenerate(p);
                }}
                className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-white/[0.04] text-gray-300 hover:text-white hover:bg-white/[0.08] border border-white/10 transition-all cursor-pointer"
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Results Body */}
        {loading && (
          <div className="py-12 text-center flex flex-col items-center justify-center">
            <div className="relative w-12 h-12 flex items-center justify-center mb-3">
              <div className="absolute inset-0 rounded-full border-2 border-purple-500/30 border-t-purple-400 animate-spin" />
              <IoSparkles className="text-purple-400 text-xl animate-pulse" />
            </div>
            <p className="text-sm font-semibold text-white">DJ is spinning your mix...</p>
            <p className="text-xs text-gray-400 mt-1">Analyzing vibe and finding streaming tracks</p>
          </div>
        )}

        {!loading && songs.length > 0 && (
          <div className="mt-6 space-y-4 animate-in fade-in duration-300">
            {/* Commentary Banner */}
            {commentary && (
              <div className="p-3.5 rounded-2xl bg-purple-950/20 border border-purple-500/30 flex items-start gap-3">
                <span className="text-lg">🎧</span>
                <p className="text-xs text-purple-200 font-medium leading-relaxed italic">
                  &ldquo;{commentary}&rdquo;
                </p>
              </div>
            )}

            {/* Actions Bar */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                {songs.length} Tracks Selected
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={isSavingPlaylist || loading}
                  onClick={handleSaveAsPlaylist}
                  className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white/[0.08] hover:bg-white/[0.15] text-gray-200 hover:text-white border border-white/10 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSavingPlaylist ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <FaBookmark size={10} />
                      <span>Save Playlist</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handlePlayAll}
                  className="px-4 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-purple-600 to-[#f43f5e] hover:from-purple-500 hover:to-[#fb7185] text-white transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <BsFillPlayFill size={15} />
                  <span>Play Mix</span>
                </button>
              </div>
            </div>

            {/* Tracklist Preview */}
            <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1 scrollbar-thin">
              {songs.map((song, i) => (
                <div
                  key={song.id || i}
                  onClick={() => {
                    dispatch(setActiveSong({ song, data: songs, i }));
                    dispatch(playPause(true));
                  }}
                  className="group flex items-center justify-between p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.05] transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1 mr-2">
                    <img
                      src={
                        song?.image?.[1]?.url ||
                        song?.image?.[0]?.url ||
                        "/images/vinyl.png"
                      }
                      alt={song.name}
                      className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                      onError={(e) => (e.currentTarget.src = "/images/vinyl.png")}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-white truncate group-hover:text-[#f43f5e] transition-colors">
                        {decodeHtml(song?.name)}
                      </p>
                      <p className="text-[11px] text-gray-400 truncate">
                        {song?.artists?.primary?.[0]?.name || song?.primaryArtists || "Artist"}
                      </p>
                    </div>
                  </div>
                  <div className="w-7 h-7 rounded-full bg-purple-500/10 group-hover:bg-purple-500/20 text-purple-300 flex items-center justify-center flex-shrink-0 transition-colors">
                    <BsFillPlayFill size={14} className="translate-x-0.5" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default AiDjModal;
