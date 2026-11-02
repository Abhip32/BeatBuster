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
import BackButton from "@/components/BackButton";

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
    <div className="w-11/12 max-w-7xl mx-auto mt-6 mb-20 animate-fade-in">
      {/* Liked Songs Hero Banner */}
      <div className="relative rounded-3xl pt-12 sm:pt-14 md:pt-10 pb-5 sm:pb-8 lg:pb-10 px-5 sm:px-8 lg:px-10 bg-gradient-to-b from-rose-950/40 via-white/[0.03] to-transparent backdrop-blur-2xl border border-rose-500/15 shadow-2xl flex flex-col md:flex-row items-center md:items-end gap-5 sm:gap-7 lg:gap-10">
        <BackButton
          iconOnly
          className="absolute top-3.5 left-3.5 sm:top-4 sm:left-4 z-20"
        />

        <div className="relative w-36 h-36 sm:w-52 sm:h-52 lg:w-60 lg:h-60 flex-shrink-0 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-[#f43f5e] via-[#e11d48] to-[#881337] flex items-center justify-center border border-rose-400/20 shadow-[0_12px_36px_rgba(244,63,94,0.35)] group">
          <AiFillHeart className="w-16 h-16 sm:w-24 sm:h-24 lg:w-28 lg:h-28 text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.5)] transition-transform duration-300 group-hover:scale-105" />
        </div>

        <div className="flex flex-col text-center md:text-left text-white min-w-0 flex-1 w-full md:w-auto">
          <span className="text-[11px] sm:text-xs uppercase font-extrabold tracking-widest text-[#f43f5e] mb-1.5 flex items-center justify-center md:justify-start gap-2">
            <span>Jump Back In</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#f43f5e]" />
            <span>Collection</span>
          </span>
          <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15] sm:leading-[1.1] pb-1.5">
            Liked Songs
          </h1>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-xs text-gray-300 mt-2.5 font-semibold">
            <span>{session?.user?.name || "You"}</span>
            <span>•</span>
            <span>{favouriteSongs.length} songs</span>
            <span>•</span>
            <span className="text-rose-300">Auto-synced</span>
          </div>

          {favouriteSongs.length > 0 && (
            <PlayButton songList={{ name: "Liked Songs", songs: favouriteSongs }} />
          )}
        </div>
      </div>

      {/* Tracks */}
      <div className="mt-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white">
              Songs
            </h2>
            <p className="text-xs text-gray-400 mt-0.5 font-medium">
              Tracks you have saved to your personal favorites
            </p>
          </div>
          {favouriteSongs.length > 0 && (
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30">
              {favouriteSongs.length} {favouriteSongs.length === 1 ? "song" : "songs"}
            </span>
          )}
        </div>

        {favouriteSongs.length === 0 && !loading ? (
          <div className="py-14 text-center rounded-2xl bg-white/[0.02] border border-white/[0.06] p-8 max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto mb-4">
              <AiFillHeart size={32} className="text-rose-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1.5">
              No liked songs yet
            </h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              Songs you like will appear here automatically. Click the heart icon on any track to save it!
            </p>
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
