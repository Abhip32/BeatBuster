"use client";
import { homePageData, getFavourite, getSongData, searchSongs } from "@/services/dataAPI";
import { setFavourites } from "@/redux/features/favouritesSlice";
import { setPlaylists } from "@/redux/features/playlistsSlice";
import { setHistory } from "@/redux/features/historySlice";
import { getUserPlaylists, getSinglePlaylist } from "@/services/playlistApi";
import { playPause, setActiveSong } from "@/redux/features/playerSlice";
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
import { useQuery } from "@tanstack/react-query";
import { AiFillHeart, AiOutlineLoading3Quarters } from "react-icons/ai";
import { BsFillPlayFill } from "react-icons/bs";
import { FaPlus, FaSpotify } from "react-icons/fa";
import { MdPlaylistPlay, MdRadio, MdHistory } from "react-icons/md";
import { IoSparkles } from "react-icons/io5";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import PlaylistModal from "@/components/Sidebar/PlaylistModal";
import AiDjModal from "@/components/AiDj/AiDjModal";
import decodeHtml from "@/utils/decodeHtml";

const Home = () => {
  const router = useRouter();
  const [salutation, setSalutation] = useState("Welcome to Musify");
  const [activeTab, setActiveTab] = useState("all");
  const [likedSongs, setLikedSongs] = useState([]);
  const [loadingLiked, setLoadingLiked] = useState(false);
  const [showCreatePlaylist, setShowCreatePlaylist] = useState(false);
  const [initialModalTab, setInitialModalTab] = useState("create");
  const [showAiDj, setShowAiDj] = useState(false);
  const [activeMoodLoading, setActiveMoodLoading] = useState(null);
  const [activeRadioLoading, setActiveRadioLoading] = useState(null);

  const dispatch = useDispatch();
  const { data: session, status } = useSession();
  const { activeSong, isPlaying } = useSelector((state) => state.player);
  const { count: likedCount, items: favouriteItems } = useSelector((state) => state.favourites || { count: 0, items: [] });
  const { count: historyCount, items: historyItems } = useSelector((state) => state.history || { count: 0, items: [] });
  const { playlists: userPlaylists, count: playlistCount, isLoaded: isPlaylistsLoaded } = useSelector((state) => state.playlists || { playlists: [], count: 0, isLoaded: false });
  const rawLanguages = useSelector((state) => state.languages?.languages || state.languages);
  const languages = Array.isArray(rawLanguages) && rawLanguages.length > 0
    ? rawLanguages
    : ["hindi", "english"];
  const languagesKey = Array.isArray(languages)
    ? languages.map((l) => String(l).toLowerCase().trim()).sort().join(",")
    : String(languages).toLowerCase().trim();

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

  const { data, isLoading: loading } = useQuery({
    queryKey: ["homePageData", languagesKey],
    queryFn: async () => {
      dispatch(setProgress(50));
      try {
        const res = await homePageData(languages);
        dispatch(setProgress(100));
        return res;
      } catch (err) {
        dispatch(setProgress(100));
        throw err;
      }
    },
    staleTime: 5 * 60 * 1000,
  });

  // Hydrate history from localStorage for instant Quick Access tile counts
  useEffect(() => {
    try {
      const stored = localStorage.getItem("songHistory");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          dispatch(setHistory(parsed));
        }
      }
    } catch (e) {}
  }, [dispatch]);

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
                if (item && typeof item === "object" && item?.id && (item.name || item.title)) {
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
            dispatch(setFavourites(list));
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

  // Fetch user playlists when authenticated
  useEffect(() => {
    if (status === "authenticated" && !isPlaylistsLoaded) {
      const fetchPlaylists = async () => {
        try {
          const res = await getUserPlaylists();
          if (res?.success === true) {
            dispatch(setPlaylists(res?.data?.playlists || []));
          }
        } catch (e) {
          console.error("Home playlists fetch error:", e);
        }
      };
      fetchPlaylists();
    }
  }, [status, isPlaylistsLoaded, dispatch]);

  const handlePlayUserPlaylist = async (pl) => {
    if (!pl?._id) return;
    try {
      const res = await getSinglePlaylist(pl._id);
      if (res?.success === true && Array.isArray(res?.data?.songs) && res.data.songs.length > 0) {
        const rawSongs = res.data.songs;
        const fetched = await Promise.all(
          rawSongs.map(async (item) => {
            if (item && typeof item === "object" && item?.id && (item.name || item.title)) {
              return item;
            }
            const songId = typeof item === "object" ? item?.id : item;
            if (!songId || typeof songId !== "string") return null;
            const data = await getSongData(songId);
            return Array.isArray(data) ? data[0] : data || null;
          })
        );
        const validSongs = fetched.filter(Boolean);
        if (validSongs.length > 0) {
          dispatch(setActiveSong({ song: validSongs[0], data: validSongs, i: 0 }));
          dispatch(playPause(true));
          return;
        }
      }
      router.push(`/myPlaylists/${pl._id}`);
    } catch {
      router.push(`/myPlaylists/${pl._id}`);
    }
  };

  const trendingSongs = Array.isArray(data?.trending?.songs)
    ? data.trending.songs
    : [];
  const trendingAlbums = Array.isArray(data?.trending?.albums)
    ? data.trending.albums
    : [];
  const charts = Array.isArray(data?.charts) ? data.charts : [];
  const albums = Array.isArray(data?.albums) ? data.albums : [];
  const playlists = Array.isArray(data?.playlists) ? data.playlists : [];
  const discover = Array.isArray(data?.discover) ? data.discover : [];
  const radio = Array.isArray(data?.radio) ? data.radio : [];

  const handlePlayHistory = () => {
    if (!historyItems || historyItems.length === 0) {
      toast.error("No recently played songs yet");
      return;
    }
    dispatch(setActiveSong({ song: historyItems[0], data: historyItems, i: 0 }));
    dispatch(playPause(true));
  };

  const handlePlayRadio = async (station) => {
    if (!station?.title) return;
    const cleanTitle = decodeHtml(station.title);
    const stationId = station.id || station.title;
    try {
      setActiveRadioLoading(stationId);
      toast.loading(`Tuning into ${cleanTitle} Radio...`, { id: "radio-tune" });
      const rawSongs = await searchSongs(cleanTitle, 1, 30);
      const songs = Array.isArray(rawSongs)
        ? rawSongs.filter((song, idx, arr) => arr.findIndex((s) => s.id === song.id) === idx)
        : [];
      if (songs.length > 0) {
        dispatch(setActiveSong({ song: songs[0], data: songs, i: 0 }));
        dispatch(playPause(true));
        toast.success(`Playing ${cleanTitle} Radio 📻`, { id: "radio-tune" });
      } else {
        toast.error(`Could not load tracks for ${cleanTitle}`, { id: "radio-tune" });
      }
    } catch {
      toast.error(`Could not tune into ${cleanTitle}`, { id: "radio-tune" });
    } finally {
      setActiveRadioLoading(null);
    }
  };

  const handleExploreMood = async (item) => {
    if (!item?.title) return;
    const cleanTitle = decodeHtml(item.title);
    const moodId = item.id || item.title;
    try {
      setActiveMoodLoading(moodId);
      toast.loading(`Tuning into ${cleanTitle} Station...`, { id: "mood-tune" });
      const rawSongs = await searchSongs(cleanTitle, 1, 30);
      const validSongs = Array.isArray(rawSongs)
        ? rawSongs.filter((song, idx, arr) => arr.findIndex((s) => s.id === song.id) === idx)
        : [];
      if (validSongs.length > 0) {
        dispatch(setActiveSong({ song: validSongs[0], data: validSongs, i: 0 }));
        dispatch(playPause(true));
        toast.success(`Playing ${cleanTitle} Station 🎵`, { id: "mood-tune" });
      } else {
        toast.error(`Could not load tracks for ${cleanTitle}`, { id: "mood-tune" });
      }
    } catch {
      toast.error(`Could not tune into ${cleanTitle} Station`, { id: "mood-tune" });
    } finally {
      setActiveMoodLoading(null);
    }
  };

  const handleOpenCreatePlaylist = (tab = "create") => {
    if (status === "unauthenticated") {
      toast.error("Please log in to manage playlists");
      router.push("/login");
      return;
    }
    setInitialModalTab(tab);
    setShowCreatePlaylist(true);
  };

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
        <div className="hidden sm:flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.2)]">
            <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
            <span>Lossless 320kbps</span>
          </div>
      </div>

      {/* Spotify Category Tabs */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
        <button
          onClick={() => setActiveTab("all")}
          className={`whitespace-nowrap flex-shrink-0 px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeTab === "all"
              ? "glass-pill-active"
              : "glass-pill text-gray-300 hover:text-white"
          }`}
        >
          All
        </button>

        <button
          type="button"
          onClick={() => setShowAiDj(true)}
          className="whitespace-nowrap flex-shrink-0 glass-pill px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 text-purple-300 hover:text-white border-purple-500/30 hover:border-purple-500/60 shadow-[0_0_12px_rgba(168,85,247,0.2)] cursor-pointer"
        >
          <IoSparkles className="text-purple-400 text-sm animate-pulse" />
          <span>AI DJ</span>
        </button>

        <Link
          href="/favourite"
          className="whitespace-nowrap flex-shrink-0 glass-pill px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 text-gray-300 hover:text-white hover:border-[#f43f5e]/50 cursor-pointer"
        >
          <AiFillHeart className="text-[#f43f5e]" />
          <span>Liked Songs</span>
          {(likedCount > 0 || likedSongs.length > 0) && (
            <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-[#f43f5e]/20 text-rose-300">
              {likedCount || likedSongs.length}
            </span>
          )}
        </Link>

        <Link
          href="/history"
          className="whitespace-nowrap flex-shrink-0 glass-pill px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 text-gray-300 hover:text-white hover:border-purple-500/50 cursor-pointer"
        >
          <MdHistory className="text-purple-400" />
          <span>Recently Played</span>
          {historyCount > 0 && (
            <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-purple-500/20 text-purple-300 font-bold">
              {historyCount}
            </span>
          )}
        </Link>

        <button
          onClick={() => setActiveTab("playlists")}
          className={`whitespace-nowrap flex-shrink-0 px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === "playlists"
              ? "glass-pill-active"
              : "glass-pill text-gray-300 hover:text-white"
          }`}
        >
          <MdPlaylistPlay className="text-[#f43f5e] text-base" />
          <span>Playlists</span>
          {playlistCount > 0 && (
            <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-[#f43f5e]/20 text-rose-300 font-bold">
              {playlistCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("trending")}
          className={`whitespace-nowrap flex-shrink-0 px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeTab === "trending"
              ? "glass-pill-active"
              : "glass-pill text-gray-300 hover:text-white"
          }`}
        >
          Trending
        </button>

        <button
          onClick={() => setActiveTab("charts")}
          className={`whitespace-nowrap flex-shrink-0 px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeTab === "charts"
              ? "glass-pill-active"
              : "glass-pill text-gray-300 hover:text-white"
          }`}
        >
          Top Charts
        </button>

        {radio.length > 0 && (
          <button
            onClick={() => setActiveTab("radio")}
            className={`whitespace-nowrap flex-shrink-0 px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "radio"
                ? "glass-pill-active"
                : "glass-pill text-gray-300 hover:text-white"
            }`}
          >
            <MdRadio className="text-[#f43f5e] text-base" />
            <span>Radio</span>
            <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-[#f43f5e]/20 text-rose-300 font-bold">
              {radio.length}
            </span>
          </button>
        )}
      </div>

      {/* Quick Access Tiles (Shown on All tab) */}
      {activeTab === "all" && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 mb-8">
          {/* Liked Songs Tile */}
          <Link
            href="/favourite"
            className="group flex items-center gap-2 sm:gap-3 p-2 sm:p-2.5 min-h-[58px] sm:min-h-[64px] rounded-xl bg-gradient-to-r from-rose-950/30 via-rose-900/15 to-white/[0.03] hover:from-rose-900/40 hover:to-white/[0.07] backdrop-blur-md border border-[#f43f5e]/30 hover:border-[#f43f5e]/60 transition-all duration-300 shadow-md cursor-pointer min-w-0"
          >
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg bg-gradient-to-br from-[#f43f5e] to-[#be123c] flex items-center justify-center flex-shrink-0 shadow-md shadow-[#f43f5e]/25 group-hover:scale-105 transition-transform">
              <AiFillHeart className="text-white text-lg sm:text-xl drop-shadow" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xs sm:text-sm font-bold text-white line-clamp-2 leading-tight break-words">
                Liked Songs
              </h3>
              <p className="text-[10px] sm:text-xs text-rose-300 font-medium truncate mt-0.5">
                {(likedCount > 0 || likedSongs.length > 0) ? `${likedCount || likedSongs.length} songs` : "Collection"}
              </p>
            </div>
            <div className="hidden sm:flex w-9 h-9 rounded-full musify-play-btn opacity-0 group-hover:opacity-100 transition-all mr-1.5 items-center justify-center shadow-md flex-shrink-0">
              <BsFillPlayFill className="text-white text-lg translate-x-0.5" />
            </div>
          </Link>

          {/* Recently Played Tile */}
          <Link
            href="/history"
            className="group flex items-center gap-2 sm:gap-3 p-2 sm:p-2.5 min-h-[58px] sm:min-h-[64px] rounded-xl bg-gradient-to-r from-rose-950/30 via-rose-900/15 to-white/[0.03] hover:from-rose-900/40 hover:to-white/[0.07] backdrop-blur-md border border-[#f43f5e]/30 hover:border-[#f43f5e]/60 transition-all duration-300 shadow-md cursor-pointer min-w-0"
          >
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg bg-gradient-to-br from-[#f43f5e] via-[#be123c] to-[#4c0519] flex items-center justify-center flex-shrink-0 shadow-md shadow-[#f43f5e]/25 group-hover:scale-105 transition-transform border border-rose-400/20">
              <MdHistory className="text-white text-lg sm:text-xl drop-shadow" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xs sm:text-sm font-bold text-white line-clamp-2 leading-tight break-words">
                Recently Played
              </h3>
              <p className="text-[10px] sm:text-xs text-rose-300 font-medium truncate mt-0.5">
                {historyCount > 0 ? `${historyCount} tracks` : "Jump Back In"}
              </p>
            </div>
            {historyItems.length > 0 && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handlePlayHistory();
                }}
                className="hidden sm:flex w-9 h-9 rounded-full musify-play-btn opacity-0 group-hover:opacity-100 transition-all mr-1.5 items-center justify-center shadow-md flex-shrink-0 cursor-pointer"
                title="Play recently played"
              >
                <BsFillPlayFill className="text-white text-lg translate-x-0.5" />
              </button>
            )}
          </Link>

          {/* User Playlist or Create Playlist Tile */}
          {userPlaylists && userPlaylists.length > 0 ? (
            <Link
              href={`/myPlaylists/${userPlaylists[0]._id}`}
              className="group flex items-center gap-2 sm:gap-3 p-2 sm:p-2.5 min-h-[58px] sm:min-h-[64px] rounded-xl bg-white/[0.03] hover:bg-white/[0.08] backdrop-blur-md border border-white/[0.06] hover:border-white/15 transition-all duration-300 shadow-md cursor-pointer min-w-0"
            >
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg bg-gradient-to-br from-rose-950/80 via-zinc-900 to-black flex items-center justify-center flex-shrink-0 border border-white/10 group-hover:border-[#f43f5e]/40 transition-colors shadow">
                <MdPlaylistPlay className="text-[#f43f5e] text-xl" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xs sm:text-sm font-bold text-white line-clamp-2 leading-tight break-words">
                  {userPlaylists[0].name}
                </h3>
                <p className="text-[10px] sm:text-xs text-gray-400 font-medium truncate mt-0.5">
                  {userPlaylists[0].songs?.length || 0}{" "}
                  {userPlaylists[0].songs?.length === 1 ? "track" : "tracks"}
                </p>
              </div>
              <div className="hidden sm:flex w-9 h-9 rounded-full musify-play-btn opacity-0 group-hover:opacity-100 transition-all mr-1.5 items-center justify-center shadow-md flex-shrink-0">
                <BsFillPlayFill className="text-white text-lg translate-x-0.5" />
              </div>
            </Link>
          ) : (
            <button
              type="button"
              onClick={handleOpenCreatePlaylist}
              className="group flex items-center gap-2 sm:gap-3 p-2 sm:p-2.5 min-h-[58px] sm:min-h-[64px] rounded-xl bg-gradient-to-r from-white/[0.04] to-white/[0.02] hover:from-rose-950/30 hover:to-white/[0.06] backdrop-blur-md border border-dashed border-white/20 hover:border-rose-500/60 transition-all duration-300 shadow-md text-left cursor-pointer min-w-0"
            >
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg bg-white/[0.05] border border-white/10 group-hover:border-rose-500/50 group-hover:bg-rose-500/15 flex items-center justify-center flex-shrink-0 transition-all shadow">
                <FaPlus className="text-gray-400 group-hover:text-rose-400 text-sm sm:text-base transition-colors" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-rose-200 line-clamp-2 leading-tight break-words transition-colors">
                  New Playlist
                </h3>
                <p className="text-[10px] sm:text-xs text-gray-400 font-medium truncate mt-0.5">Build mix</p>
              </div>
            </button>
          )}

          {/* Top Chart as Quick Access Tile */}
          {charts.slice(0, 1).map((chart, idx) => (
            <Link
              key={chart?.id || idx}
              href={`/playlist/${chart?.id}`}
              className="group flex items-center gap-2 sm:gap-3 p-2 sm:p-2.5 min-h-[58px] sm:min-h-[64px] rounded-xl bg-white/[0.03] hover:bg-white/[0.08] backdrop-blur-md border border-white/[0.06] hover:border-white/15 transition-all duration-300 shadow-md cursor-pointer min-w-0"
            >
              <img
                src={
                  chart?.image?.[1]?.url ||
                  chart?.image?.[0]?.url ||
                  "/images/vinyl.png"
                }
                alt={chart?.name || "chart"}
                className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg object-cover flex-shrink-0 shadow"
              />
              <div className="flex-1 min-w-0">
                <h3 className="text-xs sm:text-sm font-bold text-white line-clamp-2 leading-tight break-words">
                  {chart?.name || chart?.title}
                </h3>
                <p className="text-[10px] sm:text-xs text-gray-400 font-medium truncate mt-0.5">Top Chart</p>
              </div>
              <div className="hidden sm:flex w-9 h-9 rounded-full musify-play-btn opacity-0 group-hover:opacity-100 transition-all mr-1.5 items-center justify-center shadow-md flex-shrink-0">
                <BsFillPlayFill className="text-white text-lg translate-x-0.5" />
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* YOUR PLAYLISTS SECTION ON ALL TAB */}
      {activeTab === "all" && userPlaylists && userPlaylists.length > 0 && (
        <div className="mb-10">
          <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2.5 mb-3">
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg sm:text-2xl font-bold tracking-tight text-white">
                Your Playlists
              </h2>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                {userPlaylists.length}
              </span>
            </div>
            <div className="w-full sm:w-auto flex items-center gap-2 flex-shrink-0">
              <button
                type="button"
                onClick={() => handleOpenCreatePlaylist("spotify")}
                className="text-xs font-semibold text-[#1ed760] hover:text-[#1db954] transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 cursor-pointer"
                title="Import from Spotify"
              >
                <FaSpotify size={12} className="text-[#1ed760]" />
                <span>Import</span>
              </button>
              <button
                type="button"
                onClick={() => handleOpenCreatePlaylist("create")}
                className="text-xs font-semibold text-[#f43f5e] hover:text-[#fb7185] transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 cursor-pointer"
              >
                <FaPlus size={10} />
                <span>New</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("playlists")}
                className="ml-auto sm:ml-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors cursor-pointer flex-shrink-0"
              >
                Show all
              </button>
            </div>
          </div>

          <div className="flex items-stretch gap-3 sm:gap-4 overflow-x-auto pb-4 pt-1 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
            {userPlaylists.map((pl) => {
              const trackCount = Array.isArray(pl.songs) ? pl.songs.length : 0;
              return (
                <div
                  key={pl._id}
                  className="w-[145px] sm:w-[170px] md:w-[190px] flex-shrink-0 group relative p-2.5 sm:p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] hover:border-white/15 transition-all duration-300 flex flex-col"
                >
                  <Link
                    href={`/myPlaylists/${pl._id}`}
                    className="relative aspect-square w-full rounded-xl bg-gradient-to-br from-rose-950/60 via-[#18181b] to-black flex items-center justify-center overflow-hidden border border-white/10 group-hover:border-[#f43f5e]/40 transition-colors shadow-lg"
                  >
                    <MdPlaylistPlay
                      size={42}
                      className="text-[#f43f5e] group-hover:scale-110 transition-transform duration-300"
                    />
                    {trackCount > 0 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handlePlayUserPlaylist(pl);
                        }}
                        className="absolute bottom-2 right-2 w-9 h-9 rounded-full musify-play-btn opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 flex items-center justify-center shadow-xl cursor-pointer"
                        title="Play playlist"
                      >
                        <BsFillPlayFill className="text-white text-lg translate-x-0.5" />
                      </button>
                    )}
                  </Link>
                  <div className="mt-2.5 min-w-0">
                    <Link
                      href={`/myPlaylists/${pl._id}`}
                      className="text-xs sm:text-sm font-bold text-white hover:text-[#f43f5e] transition-colors truncate block"
                    >
                      {pl.name}
                    </Link>
                    <p className="text-[11px] sm:text-xs text-gray-400 mt-0.5 font-medium truncate">
                      {trackCount} {trackCount === 1 ? "track" : "tracks"}
                    </p>
                  </div>
                </div>
              );
            })}

            {/* Trailing "Create New" card */}
            <button
              type="button"
              onClick={() => handleOpenCreatePlaylist("create")}
              className="w-[145px] sm:w-[170px] md:w-[190px] flex-shrink-0 p-3 rounded-2xl bg-white/[0.02] hover:bg-white/[0.06] border border-dashed border-white/20 hover:border-rose-500/50 transition-all duration-300 flex flex-col items-center justify-center text-center group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <FaPlus size={16} />
              </div>
              <span className="text-xs sm:text-sm font-bold text-white group-hover:text-rose-300 transition-colors">
                New Playlist
              </span>
              <span className="text-[11px] text-gray-400 mt-0.5">Create mix</span>
            </button>
          </div>
        </div>
      )}

      {/* PLAYLISTS TAB CONTENT */}
      {activeTab === "playlists" && (
        <div className="my-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl lg:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                <span>Your Playlists</span>
                {userPlaylists.length > 0 && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
                    {userPlaylists.length}
                  </span>
                )}
              </h2>
              <p className="text-xs sm:text-sm text-gray-400 mt-1">
                Custom collections and mixes crafted by you
              </p>
            </div>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => handleOpenCreatePlaylist("spotify")}
                className="text-xs sm:text-sm font-semibold text-[#1ed760] bg-[#1db954]/10 hover:bg-[#1db954]/20 border border-[#1db954]/30 transition-all px-4 py-2 rounded-full shadow-sm flex items-center gap-2 cursor-pointer"
              >
                <FaSpotify size={14} className="text-[#1ed760]" />
                <span>Import Spotify</span>
              </button>
              <button
                type="button"
                onClick={() => handleOpenCreatePlaylist("create")}
                className="text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 transition-all px-4 py-2 rounded-full shadow-[0_4px_16px_rgba(244,63,94,0.35)] flex items-center gap-2 cursor-pointer"
              >
                <FaPlus size={12} />
                <span>Create Playlist</span>
              </button>
            </div>
          </div>

          {userPlaylists && userPlaylists.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {/* Card to create new playlist */}
              <button
                type="button"
                onClick={handleOpenCreatePlaylist}
                className="group p-3 rounded-2xl bg-white/[0.02] hover:bg-white/[0.06] border border-dashed border-white/20 hover:border-rose-500/50 transition-all duration-300 flex flex-col items-center justify-center text-center aspect-square cursor-pointer"
              >
                <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-rose-500/20 transition-all">
                  <FaPlus className="text-rose-400 text-lg" />
                </div>
                <span className="text-sm font-bold text-white group-hover:text-rose-300 transition-colors">
                  New Playlist
                </span>
                <span className="text-xs text-gray-400 mt-1">Create mix</span>
              </button>

              {userPlaylists.map((pl) => {
                const trackCount = Array.isArray(pl.songs) ? pl.songs.length : 0;
                return (
                  <div
                    key={pl._id}
                    className="group relative p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] hover:border-white/15 transition-all duration-300 flex flex-col"
                  >
                    <Link
                      href={`/myPlaylists/${pl._id}`}
                      className="relative aspect-square w-full rounded-xl bg-gradient-to-br from-rose-950/60 via-[#18181b] to-black flex items-center justify-center overflow-hidden border border-white/10 group-hover:border-[#f43f5e]/40 transition-colors shadow-lg"
                    >
                      <MdPlaylistPlay
                        size={48}
                        className="text-[#f43f5e] group-hover:scale-110 transition-transform duration-300"
                      />
                      {trackCount > 0 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handlePlayUserPlaylist(pl);
                          }}
                          className="absolute bottom-2 right-2 w-9 h-9 rounded-full musify-play-btn opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 flex items-center justify-center shadow-xl cursor-pointer"
                          title="Play playlist"
                        >
                          <BsFillPlayFill className="text-white text-lg translate-x-0.5" />
                        </button>
                      )}
                    </Link>
                    <div className="mt-3 min-w-0">
                      <Link
                        href={`/myPlaylists/${pl._id}`}
                        className="text-sm font-bold text-white hover:text-[#f43f5e] transition-colors truncate block"
                      >
                        {pl.name}
                      </Link>
                      <p className="text-xs text-gray-400 mt-0.5 font-medium">
                        {trackCount} {trackCount === 1 ? "track" : "tracks"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-16 text-center rounded-2xl bg-white/[0.02] border border-white/[0.06] p-8 max-w-lg mx-auto">
              <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto mb-4">
                <MdPlaylistPlay size={32} className="text-[#f43f5e]" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1.5">
                No personal playlists yet
              </h3>
              <p className="text-xs text-gray-400 mb-6 max-w-sm mx-auto">
                Create your first custom playlist to group your favorite songs together.
              </p>
              <button
                type="button"
                onClick={handleOpenCreatePlaylist}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white text-xs font-bold tracking-wide shadow-[0_4px_16px_rgba(244,63,94,0.35)] cursor-pointer transition-all"
              >
                <FaPlus size={11} />
                <span>Create Playlist</span>
              </button>
            </div>
          )}
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

      {/* RADIO TAB CONTENT */}
      {activeTab === "radio" && (
        <div className="my-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl lg:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                <span>Featured Radio Stations</span>
                {radio.length > 0 && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
                    {radio.length}
                  </span>
                )}
              </h2>
              <p className="text-xs sm:text-sm text-gray-400 mt-1">
                Non-stop radio broadcasts curated by language, genre, and decade
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {radio.map((station, idx) => {
              const stationKey = station?.id || station?.title || idx;
              const isLoadingThis = activeRadioLoading === (station?.id || station?.title);
              return (
                <div
                  key={stationKey}
                  onClick={() => handlePlayRadio(station)}
                  className="group relative flex flex-col p-2.5 sm:p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] active:scale-[0.98] backdrop-blur-md border border-white/[0.06] hover:border-white/15 transition-all duration-300 shadow-lg cursor-pointer select-none"
                >
                  <div className="relative w-full aspect-square rounded-xl mb-2.5 sm:mb-3 shadow-md overflow-hidden bg-[#18181f]">
                    <img
                      loading="lazy"
                      alt={station?.title || "radio"}
                      src={
                        station?.image?.[2]?.url ||
                        station?.image?.[1]?.url ||
                        station?.image?.[0]?.url ||
                        "/images/vinyl.png"
                      }
                      onError={(e) => {
                        e.currentTarget.src = "/images/vinyl.png";
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute right-2 bottom-2 sm:right-2.5 sm:bottom-2.5 w-8 h-8 sm:w-10 sm:h-10 rounded-full musify-play-btn opacity-90 sm:opacity-0 translate-y-0 sm:translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 flex items-center justify-center shadow-xl">
                      {isLoadingThis ? (
                        <AiOutlineLoading3Quarters className="animate-spin text-white text-sm sm:text-base" />
                      ) : (
                        <BsFillPlayFill className="text-white text-base sm:text-xl translate-x-0.5" />
                      )}
                    </div>
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-rose-500/80 text-white backdrop-blur-md tracking-wider uppercase">
                      Live
                    </span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <p className="font-bold text-xs sm:text-sm text-white truncate w-full group-hover:text-[#f43f5e] transition-colors">
                      {decodeHtml(station?.title)}
                    </p>
                    <p className="text-[11px] sm:text-xs truncate text-[#b3b3b3] mt-0.5 group-hover:text-gray-300 transition-colors">
                      {station?.subtitle || "Radio Station"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
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

      {/* NEW RELEASES & FEATURED PLAYLISTS & RADIO & DISCOVER (Shown on All tab) */}
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

          {/* Featured Radio Stations */}
          {radio.length > 0 && (
            <SwiperLayout title="Featured Radio Stations">
              {radio.map((station, idx) => {
                const stationKey = station?.id || station?.title || idx;
                const isLoadingThis = activeRadioLoading === (station?.id || station?.title);
                return (
                  <SwiperSlide key={stationKey}>
                    <div
                      onClick={() => handlePlayRadio(station)}
                      className="group relative flex flex-col p-2.5 sm:p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] active:scale-[0.98] backdrop-blur-md border border-white/[0.06] hover:border-white/15 transition-all duration-300 shadow-lg cursor-pointer h-full select-none"
                    >
                      <div className="relative w-full aspect-square rounded-xl mb-2.5 sm:mb-3 shadow-md overflow-hidden bg-[#18181f]">
                        <img
                          loading="lazy"
                          alt={station?.title || "radio"}
                          src={
                            station?.image?.[2]?.url ||
                            station?.image?.[1]?.url ||
                            station?.image?.[0]?.url ||
                            "/images/vinyl.png"
                          }
                          onError={(e) => {
                            e.currentTarget.src = "/images/vinyl.png";
                          }}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute right-2 bottom-2 sm:right-2.5 sm:bottom-2.5 w-8 h-8 sm:w-10 sm:h-10 rounded-full musify-play-btn opacity-90 sm:opacity-0 translate-y-0 sm:translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 flex items-center justify-center shadow-xl">
                          {isLoadingThis ? (
                            <AiOutlineLoading3Quarters className="animate-spin text-white text-sm sm:text-base" />
                          ) : (
                            <BsFillPlayFill className="text-white text-base sm:text-xl translate-x-0.5" />
                          )}
                        </div>
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-rose-500/80 text-white backdrop-blur-md tracking-wider uppercase">
                          Radio
                        </span>
                      </div>
                      <div className="flex flex-col min-w-0">
                        <p className="font-bold text-xs sm:text-sm text-white truncate w-full group-hover:text-[#f43f5e] transition-colors">
                          {decodeHtml(station?.title)}
                        </p>
                        <p className="text-[11px] sm:text-xs truncate text-[#b3b3b3] mt-0.5 group-hover:text-gray-300 transition-colors">
                          {station?.subtitle || "Radio Station"}
                        </p>
                      </div>
                    </div>
                  </SwiperSlide>
                );
              })}
            </SwiperLayout>
          )}

          {/* Explore Moods & Genres */}
          {discover.length > 0 && (
            <div className="my-8 lg:my-14">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-2xl lg:text-3xl font-bold tracking-tight text-white flex items-center gap-2.5">
                    <span>Explore Moods & Genres</span>
                    <span className="text-[10px] sm:text-xs font-semibold px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30">
                      Instant Stations
                    </span>
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-400 mt-1">
                    Tap any vibe to launch a continuous, curated music station
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                {discover.slice(0, 12).map((item, idx) => {
                  const itemId = item?.id || item?.title || idx;
                  const isLoadingThis = activeMoodLoading === (item?.id || item?.title);
                  return (
                    <div
                      key={itemId}
                      onClick={() => handleExploreMood(item)}
                      className="group relative p-2.5 sm:p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] active:scale-[0.98] backdrop-blur-md border border-white/[0.06] hover:border-white/15 transition-all duration-300 flex flex-col cursor-pointer shadow-lg select-none"
                    >
                      <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-2.5 shadow-md bg-[#18181f]">
                        <img
                          loading="lazy"
                          alt={item?.title || "mood"}
                          src={
                            item?.image?.[2]?.url ||
                            item?.image?.[1]?.url ||
                            item?.image?.[0]?.url ||
                            "/images/vinyl.png"
                          }
                          onError={(e) => {
                            e.currentTarget.src = "/images/vinyl.png";
                          }}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {item?.badge && (
                          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-[#f43f5e] text-white shadow-md">
                            {item.badge}
                          </span>
                        )}
                        <div className="absolute right-2 bottom-2 sm:right-2.5 sm:bottom-2.5 w-8 h-8 sm:w-10 sm:h-10 rounded-full musify-play-btn opacity-90 sm:opacity-0 translate-y-0 sm:translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 flex items-center justify-center shadow-xl">
                          {isLoadingThis ? (
                            <AiOutlineLoading3Quarters className="animate-spin text-white text-sm sm:text-base" />
                          ) : (
                            <BsFillPlayFill className="text-white text-base sm:text-xl translate-x-0.5" />
                          )}
                        </div>
                      </div>
                      <p className="text-xs sm:text-sm font-bold text-white group-hover:text-[#f43f5e] truncate transition-colors">
                        {decodeHtml(item?.title)}
                      </p>
                      <p className="text-[11px] sm:text-xs text-gray-400 capitalize truncate mt-0.5">
                        {item?.subType || "Mood"} Station
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* Create / Import Playlist Modal */}
      <PlaylistModal
        show={showCreatePlaylist}
        setShow={setShowCreatePlaylist}
        initialTab={initialModalTab}
      />

      {/* AI DJ Modal */}
      <AiDjModal show={showAiDj} setShow={setShowAiDj} />
    </div>
  );
};

export default Home;
