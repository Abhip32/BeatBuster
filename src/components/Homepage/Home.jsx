"use client";
import { homePageData, getFavourite, getSongData } from "@/services/dataAPI";
import { setFavourites } from "@/redux/features/favouritesSlice";
import React, { useEffect, useState } from "react";
import { SwiperSlide } from "swiper/react";
import SongCard from "./SongCard";
import { useDispatch, useSelector } from "react-redux";
import SwiperLayout from "./Swiper";
import { setProgress } from "@/redux/features/loadingBarSlice";
import SongCardSkeleton from "./SongCardSkeleton";
import SongBar from "./SongBar";
import OnlineStatus from "./OnlineStatus";
import ListenAgain from "./ListenAgain";
import HomeSkeleton from "@/components/Skeletons/HomeSkeleton";
import TracklistSkeleton from "@/components/Skeletons/TracklistSkeleton";
import SongsList from "@/components/SongsList";
import PlayButton from "@/components/PlayButton";
import { useSession } from "next-auth/react";
import { AiFillHeart } from "react-icons/ai";
import { BsFillPlayFill } from "react-icons/bs";
import Link from "next/link";

const Home = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [salutation, setSalutation] = useState("Welcome to Musify");
  const [activeTab, setActiveTab] = useState("all");
  const [likedSongs, setLikedSongs] = useState([]);
  const [loadingLiked, setLoadingLiked] = useState(false);

  const dispatch = useDispatch();
  const { data: session, status } = useSession();
  const { activeSong, isPlaying } = useSelector((state) => state.player);
  const { count: likedCount, items: favouriteItems } = useSelector((state) => state.favourites || { count: 0, items: [] });
  const { languages } = useSelector((state) => state.languages);

  const displayName =
    session?.user?.name ||
    (session?.user?.email ? session.user.email.split("@")[0] : null);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      setSalutation("Good morning");
    } else if (hour >= 12 && hour < 17) {
      setSalutation("Good afternoon");
    } else if (hour >= 17 && hour < 22) {
      setSalutation("Good evening");
    } else {
      setSalutation("Good night");
    }
  }, []);

  useEffect(() => {
    let isCancelled = false;
    const fetchData = async () => {
      setLoading(true);
      dispatch(setProgress(50));
      try {
        const res = await homePageData(languages);
        if (!isCancelled) {
          setData(res || null);
        }
      } catch (e) {
        console.error("Home page data fetch error:", e);
      } finally {
        if (!isCancelled) {
          dispatch(setProgress(100));
          setLoading(false);
        }
      }
    };
    fetchData();
    return () => {
      isCancelled = true;
    };
  }, [languages, dispatch]);

  // Fetch liked songs when Liked Songs tab is clicked or for Quick Access tile
  useEffect(() => {
    if (status === "authenticated" && likedSongs.length === 0) {
      const fetchFavs = async () => {
        setLoadingLiked(true);
        try {
          const items = await getFavourite();
          if (Array.isArray(items) && items.length > 0) {
            const resolved = await Promise.all(
              items.slice(0, 30).map(async (item) => {
                if (item && typeof item === "object" && (item.name || item.title)) {
                  return item;
                }
                const songId = typeof item === "object" ? item?.id : item;
                if (!songId || typeof songId !== "string") return null;
                const data = await getSongData(songId);
                return Array.isArray(data) ? data[0] : data || null;
              })
            );
            const list = resolved.filter(Boolean).reverse();
            setLikedSongs(list);
            dispatch(setFavourites(items));
          }
        } catch (err) {
          console.error("Error fetching liked songs:", err);
        } finally {
          setLoadingLiked(false);
        }
      };
      fetchFavs();
    }
  }, [status, likedSongs.length]);

  const trendingSongs = Array.isArray(data?.trending?.songs)
    ? data.trending.songs
    : [];
  const trendingAlbums = Array.isArray(data?.trending?.albums)
    ? data.trending.albums
    : [];
  const charts = Array.isArray(data?.charts) ? data.charts : [];
  const albums = Array.isArray(data?.albums) ? data.albums : [];
  const playlists = Array.isArray(data?.playlists) ? data.playlists : [];

  if (loading && !data) {
    return <HomeSkeleton />;
  }

  return (
    <div className="w-11/12 max-w-7xl mx-auto pt-6 pb-12">
      <OnlineStatus />

      {/* Spotify Header Salutation Banner */}
      <div className="flex items-center justify-between mb-6 pb-3 border-b border-white/[0.06]">
        <div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white flex items-center gap-3">
            {salutation}
          </h1>
          <p className="text-sm text-[#b3b3b3] mt-1 font-medium">
            Discover trending tracks, chart toppers, and your personal favorites
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 shadow-[0_0_15px_rgba(244, 63, 94,0.2)]">
          <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
          <span>Lossless 320kbps</span>
        </div>
      </div>

      {/* Spotify Category Tabs */}
      <div className="flex items-center gap-2.5 mb-8 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setActiveTab("all")}
          className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeTab === "all"
              ? "glass-pill-active"
              : "glass-pill text-gray-300 hover:text-white"
          }`}
        >
          All
        </button>

        <Link
          href="/favourite"
          className="glass-pill px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 text-gray-300 hover:text-white hover:border-[#f43f5e]/50 cursor-pointer"
        >
          <AiFillHeart className="text-[#f43f5e]" />
          <span>Liked Songs</span>
          {(likedCount > 0 || likedSongs.length > 0) && (
            <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-[#f43f5e]/20 text-rose-300">
              {likedCount || likedSongs.length}
            </span>
          )}
        </Link>

        <button
          onClick={() => setActiveTab("trending")}
          className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeTab === "trending"
              ? "glass-pill-active"
              : "glass-pill text-gray-300 hover:text-white"
          }`}
        >
          Trending
        </button>

        <button
          onClick={() => setActiveTab("charts")}
          className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeTab === "charts"
              ? "glass-pill-active"
              : "glass-pill text-gray-300 hover:text-white"
          }`}
        >
          Top Charts
        </button>
      </div>

      {/* Quick Access Tiles (Shown on All tab) */}
      {activeTab === "all" && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-8">
          {/* Liked Songs Tile */}
          <Link
            href="/favourite"
            className="group flex items-center gap-3.5 p-2 rounded-xl bg-gradient-to-r from-rose-950/30 via-rose-900/15 to-white/[0.03] hover:from-rose-900/40 hover:to-white/[0.07] backdrop-blur-md border border-[#f43f5e]/30 hover:border-[#f43f5e]/60 transition-all duration-300 shadow-md cursor-pointer"
          >
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#f43f5e] to-[#be123c] flex items-center justify-center flex-shrink-0 shadow-md shadow-[#f43f5e]/25 group-hover:scale-105 transition-transform">
              <AiFillHeart className="text-white text-2xl drop-shadow" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-white truncate">Liked Songs</h3>
              <p className="text-xs text-rose-300 font-medium">
                {(likedCount > 0 || likedSongs.length > 0) ? `${likedCount || likedSongs.length} songs` : "Collection"}
              </p>
            </div>
            <div className="w-9 h-9 rounded-full musify-play-btn opacity-0 group-hover:opacity-100 transition-all mr-1.5 flex items-center justify-center shadow-md">
              <BsFillPlayFill className="text-white text-lg translate-x-0.5" />
            </div>
          </Link>

          {/* First 3 Charts as Quick Access Tiles */}
          {charts.slice(0, 3).map((chart, idx) => (
            <Link
              key={chart?.id || idx}
              href={`/playlist/${chart?.id}`}
              className="group flex items-center gap-3.5 p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] backdrop-blur-md border border-white/[0.06] hover:border-white/15 transition-all duration-300 shadow-md cursor-pointer"
            >
              <img
                src={
                  chart?.image?.[1]?.url ||
                  chart?.image?.[0]?.url ||
                  "/images/vinyl.png"
                }
                alt={chart?.name || "chart"}
                className="w-12 h-12 rounded-lg object-cover flex-shrink-0 shadow"
              />
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-white truncate">
                  {chart?.name || chart?.title}
                </h3>
                <p className="text-xs text-gray-400 font-medium">Top Chart</p>
              </div>
              <div className="w-9 h-9 rounded-full musify-play-btn opacity-0 group-hover:opacity-100 transition-all mr-1.5 flex items-center justify-center shadow-md">
                <BsFillPlayFill className="text-white text-lg translate-x-0.5" />
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* ALL & TRENDING TABS */}
      {(activeTab === "all" || activeTab === "trending") && (
        <>
          {/* Listen Again (Only on All tab) */}
          {activeTab === "all" && <ListenAgain />}

          {/* Trending Songs (Hindi & English) */}
          <SwiperLayout title="Trending Songs">
            {loading ? (
              <SongCardSkeleton />
            ) : (
              trendingSongs.map((song) => (
                <SwiperSlide key={song?.id}>
                  <SongCard
                    song={song}
                    activeSong={activeSong}
                    isPlaying={isPlaying}
                  />
                </SwiperSlide>
              ))
            )}
          </SwiperLayout>

          {/* Trending Albums (Hindi & English) */}
          {trendingAlbums.length > 0 && (
            <SwiperLayout title="Trending Albums">
              {loading ? (
                <SongCardSkeleton />
              ) : (
                trendingAlbums.map((album) => (
                  <SwiperSlide key={album?.id}>
                    <SongCard
                      song={album}
                      activeSong={activeSong}
                      isPlaying={isPlaying}
                    />
                  </SwiperSlide>
                ))
              )}
            </SwiperLayout>
          )}
        </>
      )}

      {/* ALL & CHARTS TABS */}
      {(activeTab === "all" || activeTab === "charts") && (
        <div className="my-8 lg:my-14">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-2xl lg:text-3xl font-bold tracking-tight text-white">
              Top Charts
            </h2>
            <span className="text-xs text-[#b3b3b3] font-semibold uppercase tracking-wider">
              Updated daily
            </span>
          </div>
          <div className="grid md:grid-cols-2 gap-x-6 gap-y-1">
            {loading ? (
              <div className="col-span-2">
                <SongCardSkeleton />
              </div>
            ) : charts.length > 0 ? (
              charts
                .slice(0, 10)
                .map((playlist, index) => (
                  <SongBar
                    key={playlist?.id || index}
                    playlist={playlist}
                    i={index}
                  />
                ))
            ) : (
              <div className="col-span-2 py-8 text-center text-gray-500">
                No chart data available right now.
              </div>
            )}
          </div>
        </div>
      )}

      {/* NEW RELEASES & FEATURED PLAYLISTS (Shown on All tab) */}
      {activeTab === "all" && (
        <>
          {/* New Releases */}
          <SwiperLayout title="New Releases">
            {loading ? (
              <SongCardSkeleton />
            ) : (
              albums.map((song) => (
                <SwiperSlide key={song?.id}>
                  <SongCard
                    song={song}
                    activeSong={activeSong}
                    isPlaying={isPlaying}
                  />
                </SwiperSlide>
              ))
            )}
          </SwiperLayout>

          {/* Featured Playlists */}
          <SwiperLayout title="Featured Playlists">
            {loading ? (
              <SongCardSkeleton />
            ) : (
              playlists.map((song) => (
                <SwiperSlide key={song?.id}>
                  <SongCard
                    key={song?.id}
                    song={song}
                    activeSong={activeSong}
                    isPlaying={isPlaying}
                  />
                </SwiperSlide>
              ))
            )}
          </SwiperLayout>
        </>
      )}
    </div>
  );
};

export default Home;
