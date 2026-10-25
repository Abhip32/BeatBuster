"use client";
import React, { useState } from "react";
import { FaPlus, FaSpotify } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { toast } from "react-hot-toast";
import { createPlaylist, importSpotifyPlaylist } from "@/services/playlistApi";
import { useDispatch } from "react-redux";
import { setIsTyping } from "@/redux/features/loadingBarSlice";
import { addPlaylist } from "@/redux/features/playlistsSlice";
import { useRouter } from "next/navigation";

const PlaylistModal = ({ show, setShow, onCreated, initialTab = "create" }) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [name, setName] = useState("");
  const [spotifyUrl, setSpotifyUrl] = useState("");
  const [spotifyName, setSpotifyName] = useState("");
  const [loading, setLoading] = useState(false);
  const [importStatusText, setImportStatusText] = useState("");

  const handleCreate = async (e) => {
    e?.preventDefault();
    if (!name.trim()) {
      toast.error("Playlist name is required");
      return;
    }

    setLoading(true);
    try {
      const res = await createPlaylist(name.trim());
      if (res?.success === true) {
        toast.success(res.message || "Playlist created");
        const createdItem = res?.data?.playlist || {
          _id: res?.data?._id || Date.now().toString(),
          name: name.trim(),
          songs: [],
        };
        dispatch(addPlaylist(createdItem));
        onCreated?.(createdItem);
        setName("");
        setShow(false);
      } else {
        toast.error(res?.message || "Failed to create playlist");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleImportSpotify = async (e) => {
    e?.preventDefault();
    if (!spotifyUrl.trim()) {
      toast.error("Please enter a valid Spotify playlist link");
      return;
    }

    setLoading(true);
    setImportStatusText("Fetching Spotify tracklist & matching songs...");
    try {
      const res = await importSpotifyPlaylist(
        spotifyUrl.trim(),
        spotifyName.trim()
      );
      if (res?.success === true && res?.data?.playlist) {
        toast.success(res.message || "Playlist imported successfully!");
        const createdItem = res.data.playlist;
        dispatch(addPlaylist(createdItem));
        onCreated?.(createdItem);
        setSpotifyUrl("");
        setSpotifyName("");
        setShow(false);
        if (createdItem._id) {
          router.push(`/myPlaylists/${createdItem._id}`);
        }
      } else {
        toast.error(res?.message || "Failed to import Spotify playlist");
      }
    } catch {
      toast.error("Failed to import playlist. Please check your connection.");
    } finally {
      setLoading(false);
      setImportStatusText("");
    }
  };

  const handleFocus = () => dispatch(setIsTyping(true));
  const handleBlur = () => dispatch(setIsTyping(false));

  if (!show) return null;

  return (
    <div
      onClick={() => !loading && setShow(false)}
      className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#18181f]/95 border border-white/10 rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200 text-white backdrop-blur-2xl"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <h2 className="text-base font-bold text-white">Add Playlist</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Build custom mix or import from Spotify
            </p>
          </div>
          <button
            type="button"
            disabled={loading}
            onClick={() => setShow(false)}
            className="p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer disabled:opacity-30"
            title="Close"
          >
            <IoClose size={20} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1 bg-white/[0.04] rounded-xl my-4 border border-white/10">
          <button
            type="button"
            onClick={() => setActiveTab("create")}
            className={`py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === "create"
                ? "bg-white/10 text-white shadow-sm"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <FaPlus size={10} />
            <span>New Custom</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("spotify")}
            className={`py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === "spotify"
                ? "bg-[#1db954]/20 text-[#1ed760] shadow-sm border border-[#1db954]/30"
                : "text-gray-400 hover:text-[#1ed760]"
            }`}
          >
            <FaSpotify size={13} className="text-[#1ed760]" />
            <span>Import Spotify</span>
          </button>
        </div>

        {activeTab === "create" ? (
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label
                htmlFor="playlist-name"
                className="block text-xs font-semibold text-gray-300 mb-1.5"
              >
                Playlist Name
              </label>
              <input
                id="playlist-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onFocus={handleFocus}
                onBlur={handleBlur}
                placeholder="e.g. Late Night Vibes"
                autoFocus
                disabled={loading}
                className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/15 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#f43f5e] focus:ring-2 focus:ring-[#f43f5e]/20 transition-all font-medium"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShow(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 text-xs font-bold rounded-full bg-[#f43f5e] text-black hover:bg-[#fb7185] hover:shadow-[0_0_18px_rgba(244,63,94,0.45)] transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <FaPlus size={11} />
                )}
                Create
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleImportSpotify} className="space-y-4">
            <div>
              <label
                htmlFor="spotify-url"
                className="block text-xs font-semibold text-gray-300 mb-1.5"
              >
                Spotify Playlist Link
              </label>
              <input
                id="spotify-url"
                type="url"
                value={spotifyUrl}
                onChange={(e) => setSpotifyUrl(e.target.value)}
                onFocus={handleFocus}
                onBlur={handleBlur}
                placeholder="https://open.spotify.com/playlist/..."
                autoFocus
                disabled={loading}
                className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/15 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#1ed760] focus:ring-2 focus:ring-[#1ed760]/20 transition-all font-medium"
              />
              <p className="text-[11px] text-gray-400 mt-1">
                Paste any public Spotify playlist or album URL
              </p>
            </div>

            <div>
              <label
                htmlFor="spotify-name"
                className="block text-xs font-semibold text-gray-300 mb-1.5"
              >
                Custom Title (Optional)
              </label>
              <input
                id="spotify-name"
                type="text"
                value={spotifyName}
                onChange={(e) => setSpotifyName(e.target.value)}
                onFocus={handleFocus}
                onBlur={handleBlur}
                placeholder="Leave blank to use Spotify's name"
                disabled={loading}
                className="w-full px-4 py-2 bg-white/[0.04] border border-white/15 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#1ed760] transition-all"
              />
            </div>

            {loading && importStatusText && (
              <div className="p-3 rounded-xl bg-white/[0.04] border border-[#1ed760]/20 flex items-center gap-3 animate-in fade-in">
                <div className="w-4 h-4 border-2 border-[#1ed760] border-t-transparent rounded-full animate-spin flex-shrink-0" />
                <span className="text-xs text-[#1ed760] font-medium leading-tight">
                  {importStatusText}
                </span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShow(false)}
                disabled={loading}
                className="px-4 py-2 text-xs font-semibold text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-all cursor-pointer disabled:opacity-30"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 text-xs font-bold rounded-full bg-[#1ed760] text-black hover:bg-[#1db954] hover:shadow-[0_0_18px_rgba(30,215,96,0.45)] transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <FaSpotify size={13} />
                )}
                Import
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default PlaylistModal;
