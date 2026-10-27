"use client";
import React, { useEffect, useState } from "react";
import SongsList from "@/components/SongsList";
import BulkDownloadButton from "@/components/BulkDownloadButton";
import PlayButton from "@/components/PlayButton";
import { getFavourite, getSongData } from "@/services/dataAPI";
import PlaylistSkeleton from "@/components/Skeletons/PlaylistSkeleton";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { AiFillHeart } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import { setFavourites } from "@/redux/features/favouritesSlice";

const FavouritePage = () => {
  const dispatch = useDispatch();
  const reduxCount = useSelector((state) => state.favourites?.count ?? null);
  const [favouriteSongs, setFavouriteSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { status, data: session } = useSession();

  useEffect(() => {
    const fetchFavorites = async () => {
      setLoading(true);
      try {
        const items = await getFavourite();
        if (Array.isArray(items) && items.length > 0) {
          const resolved = await Promise.all(
            items.map(async (item) => {
              if (item && typeof item === "object" && item?.id && (item.name || item.title)) {
                return item;
              }
              const songId = typeof item === "object" ? item?.id : item;
              if (!songId || typeof songId !== "string") return null;
              const data = await getSongData(songId);
              return Array.isArray(data) ? data[0] : data || null;
            })
          );
          const validSongs = resolved.filter(Boolean).reverse();
          setFavouriteSongs(validSongs);
          dispatch(setFavourites(validSongs));
        } else {
          setFavouriteSongs([]);
          dispatch(setFavourites([]));
        }
      } catch (err) {
        console.error("fetchFavorites error:", err);
      } finally {
        setLoading(false);
      }
    };
    if (status === "authenticated") {
      fetchFavorites();
    } else if (status === "unauthenticated") {
      setLoading(false);
    }
  }, [status, dispatch]);

  if (status === "loading" || (status === "authenticated" && loading)) {
    return <PlaylistSkeleton type="Liked Songs" count={8} />;
  }

  if (status === "unauthenticated") {
    redirect("/login");
  }

  return (
    <div className="w-11/12 max-w-7xl mx-auto mt-8 mb-20">
      {/* Liked Songs Hero Banner */}
      <div className="relative rounded-3xl p-6 sm:p-8 lg:p-10 bg-gradient-to-b from-rose-950/40 via-white/[0.04] to-transparent backdrop-blur-2xl border border-white/10 shadow-2xl flex flex-col md:flex-row items-center md:items-end gap-6 lg:gap-10">
        <div className="relative w-48 h-48 sm:w-56 sm:h-56 lg:w-64 lg:h-64 flex-shrink-0 rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-[#f43f5e] via-[#e11d48] to-[#9f1239] flex items-center justify-center border border-white/10 shadow-[0_8px_32px_rgba(244,63,94,0.35)]">
          <AiFillHeart size={90} className="text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.5)]" />
        </div>

        <div className="flex flex-col text-center md:text-left text-white min-w-0 flex-1">
          <span className="text-xs uppercase font-extrabold tracking-widest text-[#f43f5e] mb-1">
            Playlist
          </span>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight line-clamp-2">
            Liked Songs
          </h1>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-xs text-gray-300 mt-3 font-semibold">
            <span>{session?.user?.name || "You"}</span>
            <span>•</span>
            <span>{favouriteSongs.length} songs</span>
          </div>

          {favouriteSongs.length > 0 && (
            <div className="mt-4">
              <PlayButton songList={{ name: "Liked Songs", songs: favouriteSongs }} />
            </div>
          )}
        </div>
      </div>

      {/* Tracks */}
      <div className="mt-10">
        <h2 className="text-2xl font-bold tracking-tight text-white mb-2">
          Songs
        </h2>
        {favouriteSongs.length === 0 && !loading ? (
          <div className="py-12 text-center text-gray-400">
            Songs you like will appear here. Click the heart icon on any track to save it!
          </div>
        ) : (
          <SongsList
            SongData={favouriteSongs}
            loading={loading}
            isFavouritePage={true}
            setSongs={setFavouriteSongs}
          />
        )}
      </div>
    </div>
  );
};

export default FavouritePage;
