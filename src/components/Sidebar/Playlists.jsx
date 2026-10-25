"use client";
import React, { useState, useEffect } from "react";
import { FaPlus } from "react-icons/fa";
import { MdPlaylistPlay, MdOutlineDeleteOutline } from "react-icons/md";
import Link from "next/link";
import PlaylistModal from "./PlaylistModal";
import { deletePlaylist, getUserPlaylists } from "@/services/playlistApi";
import { toast } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { setPlaylists, removePlaylist } from "@/redux/features/playlistsSlice";
import { useSession } from "next-auth/react";

const Playlists = ({ setShowNav }) => {
  const [show, setShow] = useState(false);
  const dispatch = useDispatch();
  const { status } = useSession();
  const playlists = useSelector((state) => state.playlists.playlists);
  const isLoaded = useSelector((state) => state.playlists.isLoaded);

  useEffect(() => {
    if (status === "authenticated" && !isLoaded) {
      const getPlaylists = async () => {
        try {
          const res = await getUserPlaylists();
          if (res?.success === true) {
            dispatch(setPlaylists(res?.data?.playlists || []));
          }
        } catch (e) {
          // Handle quietly
        }
      };
      getPlaylists();
    }
  }, [status, isLoaded, dispatch]);

  const handleDelete = async (id, e) => {
    e?.preventDefault();
    e?.stopPropagation();
    try {
      // Optimistic update
      dispatch(removePlaylist(id));
      const res = await deletePlaylist(id);
      if (res?.success === true) {
        toast.success("Playlist deleted");
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
          Playlists {playlists.length > 0 && `(${playlists.length})`}
        </span>
        <button
          type="button"
          onClick={() => setShow(true)}
          className="text-xs text-[#f43f5e] hover:text-[#fb7185] transition-colors flex items-center gap-1.5 cursor-pointer font-semibold py-1 px-2.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10"
          title="Create Playlist"
        >
          <FaPlus size={10} />
          <span>New</span>
        </button>
      </div>

      <div className="flex flex-col gap-1 max-h-56 overflow-y-auto px-1 mt-1 scrollbar-thin">
        {playlists && playlists.length > 0 ? (
          playlists.map((playlist) => {
            const trackCount = Array.isArray(playlist.songs)
              ? playlist.songs.length
              : 0;
            return (
              <div
                key={playlist._id}
                className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-white/[0.06] text-gray-300 hover:text-white group transition-all"
              >
                <Link
                  href={`/myPlaylists/${playlist._id}`}
                  onClick={() => setShowNav(false)}
                  className="flex items-center gap-2.5 min-w-0 flex-1 mr-2"
                >
                  <div className="w-7 h-7 rounded-md bg-[#242428] flex items-center justify-center flex-shrink-0 group-hover:bg-[#f43f5e]/20 transition-colors">
                    <MdPlaylistPlay size={18} className="text-[#f43f5e] flex-shrink-0" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-sm font-medium truncate block leading-tight">
                      {playlist.name}
                    </span>
                    <span className="text-[11px] text-gray-400">
                      {trackCount} {trackCount === 1 ? "track" : "tracks"}
                    </span>
                  </div>
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
            );
          })
        ) : (
          <div className="py-3 px-3 text-left">
            <p className="text-xs text-gray-500 mb-1.5">No personal playlists yet</p>
            <button
              type="button"
              onClick={() => setShow(true)}
              className="text-xs text-[#f43f5e] hover:underline cursor-pointer font-semibold"
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
