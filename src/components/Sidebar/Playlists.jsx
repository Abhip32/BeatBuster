"use client";
import React, { useState, useEffect } from "react";
import { FaPlus } from "react-icons/fa";
import { MdPlaylistPlay, MdOutlineDeleteOutline } from "react-icons/md";
import Link from "next/link";
import PlaylistModal from "./PlaylistModal";
import { deletePlaylist, getUserPlaylists } from "@/services/playlistApi";
import { toast } from "react-hot-toast";

const Playlists = ({ setShowNav }) => {
  const [show, setShow] = useState(false);
  const [playlists, setPlaylists] = useState([]);

  useEffect(() => {
    const getPlaylists = async () => {
      try {
        const res = await getUserPlaylists();
        if (res?.success === true) {
          setPlaylists(res?.data?.playlists || []);
        }
      } catch (e) {
        // Handle quietly
      }
    };
    getPlaylists();
  }, [show]);

  const handleDelete = async (id, e) => {
    e?.preventDefault();
    e?.stopPropagation();
    try {
      const res = await deletePlaylist(id);
      if (res?.success === true) {
        toast.success("Playlist deleted");
        setPlaylists((prev) => prev.filter((p) => p._id !== id));
      } else {
        toast.error(res?.message || "Failed to delete");
      }
    } catch {
      toast.error("Failed to delete playlist");
    }
  };

  return (
    <div className="py-2">
      <div className="flex items-center justify-between px-3 py-2">
        <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
          Playlists
        </span>
        <button
          type="button"
          onClick={() => setShow(true)}
          className="text-xs text-[#ec4899] hover:text-[#f472b6] transition-colors flex items-center gap-1.5 cursor-pointer font-semibold py-1 px-2.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10"
          title="Create Playlist"
        >
          <FaPlus size={10} />
          <span>New</span>
        </button>
      </div>

      <div className="flex flex-col gap-1 max-h-56 overflow-y-auto px-1 mt-1">
        {playlists && playlists.length > 0 ? (
          playlists.map((playlist) => (
            <div
              key={playlist._id}
              className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-white/[0.06] text-gray-300 hover:text-white group transition-all"
            >
              <Link
                href={`/myPlaylists/${playlist._id}`}
                onClick={() => setShowNav(false)}
                className="flex items-center gap-2.5 min-w-0 flex-1 mr-2"
              >
                <div className="w-7 h-7 rounded-md bg-[#242428] flex items-center justify-center flex-shrink-0 group-hover:bg-[#ec4899]/20">
                  <MdPlaylistPlay size={18} className="text-[#ec4899] flex-shrink-0" />
                </div>
                <span className="text-sm font-medium truncate">{playlist.name}</span>
              </Link>
              <button
                type="button"
                onClick={(e) => handleDelete(playlist._id, e)}
                className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-400 transition-all cursor-pointer rounded-lg hover:bg-white/10"
                title="Delete Playlist"
              >
                <MdOutlineDeleteOutline size={16} />
              </button>
            </div>
          ))
        ) : (
          <div className="py-3 px-3 text-left">
            <p className="text-xs text-gray-500 mb-1.5">No personal playlists yet</p>
            <button
              type="button"
              onClick={() => setShow(true)}
              className="text-xs text-[#ec4899] hover:underline cursor-pointer font-semibold"
            >
              + Create your first playlist
            </button>
          </div>
        )}
      </div>

      <PlaylistModal show={show} setShow={setShow} />
    </div>
  );
};

export default Playlists;
