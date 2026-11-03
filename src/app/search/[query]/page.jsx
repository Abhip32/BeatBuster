"use client";
import React, { useEffect, useState } from "react";
import { BiHeadphone } from "react-icons/bi";
import { BsFillPlayFill, BsPlayFill } from "react-icons/bs";
import { MdPlaylistPlay } from "react-icons/md";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useSelector, useDispatch } from "react-redux";
import { playPause, setActiveSong } from "@/redux/features/playerSlice";
import { setProgress } from "@/redux/features/loadingBarSlice";
import { getSearchedData, getSongData } from "@/services/dataAPI";
import SongsList from "@/components/SongsList";
import SongCard from "@/components/Homepage/SongCard";
import SwiperLayout from "@/components/Homepage/Swiper";
import { SwiperSlide } from "swiper/react";
import { useQuery } from "@tanstack/react-query";
import SearchSkeleton from "@/components/Skeletons/SearchSkeleton";
import decodeHtml from "@/utils/decodeHtml";

const SearchResultsPage = ({ params }) => {
  const router = useRouter();
  const routeParams = useParams();
  const rawQuery = routeParams?.query || params?.query || "";
  const dispatch = useDispatch();

  const [query, setQuery] = useState(rawQuery);
  const [activeTab, setActiveTab] = useState("all");

  const { activeSong, isPlaying } = useSelector((state) => state.player);

  useEffect(() => {
    if (rawQuery && rawQuery !== query) {
      setQuery(rawQuery);
    }
  }, [rawQuery, query]);

  const { data: searchedData, isLoading: loading } = useQuery({
    queryKey: ["search", query],
    queryFn: async () => {
      dispatch(setProgress(50));
      try {
        const response = await getSearchedData(query);
        dispatch(setProgress(100));
        return response;
      } catch (err) {
        dispatch(setProgress(100));
        throw err;
      }
    },
    enabled: Boolean(query),
    staleTime: 5 * 60 * 1000,
  });

  if (loading) {
    return <SearchSkeleton />;
  }

  const songResults = Array.isArray(searchedData?.songs)
    ? searchedData.songs
    : Array.isArray(searchedData?.songs?.results)
    ? searchedData.songs.results
    : [];

  const albumResults = Array.isArray(searchedData?.albums)
    ? searchedData.albums
    : Array.isArray(searchedData?.albums?.results)
    ? searchedData.albums.results
    : [];

  const artistResults = Array.isArray(searchedData?.artists)
    ? searchedData.artists
    : Array.isArray(searchedData?.artists?.results)
    ? searchedData.artists.results
    : [];

  const playlistResults = Array.isArray(searchedData?.playlists)
    ? searchedData.playlists
    : Array.isArray(searchedData?.playlists?.results)
    ? searchedData.playlists.results
    : [];

  const topQueryResults = Array.isArray(searchedData?.topQuery)
    ? searchedData.topQuery
    : [];

  // Determine the best Top Result card
  const topResult =
    topQueryResults[0] ||
    (artistResults.length > 0 && {
      ...artistResults[0],
      type: "artist",
      title: artistResults[0]?.name || artistResults[0]?.title,
    }) ||
    (songResults.length > 0 && {
      ...songResults[0],
      type: "song",
      title: songResults[0]?.name || songResults[0]?.title,
    }) ||
    null;

  let decodedTitle = query || "";
  try {
    decodedTitle = decodeURIComponent(query || "").replaceAll("%20", " ");
  } catch {
    decodedTitle = (query || "").replaceAll("%20", " ");
  }

  const hasAnyResults =
    songResults.length > 0 ||
    albumResults.length > 0 ||
    artistResults.length > 0 ||
    playlistResults.length > 0;

  const handlePlayTopResult = async (item) => {
    if (!item) return;
    const type = item?.type || (item?.singers || item?.duration ? "song" : "artist");
    if (type === "song") {
      let songData = item;
      if (!Array.isArray(item?.downloadUrl) || item.downloadUrl.length === 0) {
        const fetched = await getSongData(item.id);
        songData = Array.isArray(fetched) ? fetched[0] : fetched || item;
      }
      if (songData) {
        const queue = songResults.some((s) => s?.id === songData?.id)
          ? songResults
          : [songData, ...songResults];
        const index = queue.findIndex((s) => s?.id === songData?.id);
        dispatch(
          setActiveSong({
            song: songData,
            data: queue,
            i: Math.max(0, index),
          })
        );
        dispatch(playPause(true));
      }
    } else if (type === "artist") {
      router.push(`/artist/${item.id}`);
    } else if (type === "album") {
      router.push(`/album/${item.id}`);
    } else if (type === "playlist") {
      router.push(`/playlist/${item.id}`);
    }
  };

  const handlePlaySong = (song, index) => {
    dispatch(setActiveSong({ song, data: songResults, i: index }));
    dispatch(playPause(true));
  };

  const formatDuration = (sec) => {
    if (!sec) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.round(sec % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="w-11/12 max-w-7xl mx-auto mt-6 mb-24">
      {/* Search Header Banner */}
      <div className="mb-6">
        <span className="text-xs font-bold uppercase tracking-widest text-[#f43f5e]">
          Search Results
        </span>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight mt-1">
          &ldquo;{decodedTitle}&rdquo;
        </h1>
      </div>

      {/* Filter Category Pills */}
      {hasAnyResults && (
        <div className="flex items-center gap-2.5 mb-8 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === "all"
                ? "glass-pill-active"
                : "glass-pill text-gray-300 hover:text-white"
            }`}
          >
            All
          </button>

          {songResults.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveTab("songs")}
              className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === "songs"
                  ? "glass-pill-active"
                  : "glass-pill text-gray-300 hover:text-white"
              }`}
            >
              <span>Songs</span>
              <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-white/10 text-gray-300 font-bold">
                {songResults.length}
              </span>
            </button>
          )}

          {artistResults.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveTab("artists")}
              className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === "artists"
                  ? "glass-pill-active"
                  : "glass-pill text-gray-300 hover:text-white"
              }`}
            >
              <span>Artists</span>
              <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-white/10 text-gray-300 font-bold">
                {artistResults.length}
              </span>
            </button>
          )}

          {albumResults.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveTab("albums")}
              className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === "albums"
                  ? "glass-pill-active"
                  : "glass-pill text-gray-300 hover:text-white"
              }`}
            >
              <span>Albums</span>
              <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-white/10 text-gray-300 font-bold">
                {albumResults.length}
              </span>
            </button>
          )}

          {playlistResults.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveTab("playlists")}
              className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === "playlists"
                  ? "glass-pill-active"
                  : "glass-pill text-gray-300 hover:text-white"
              }`}
            >
              <span>Playlists</span>
              <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-white/10 text-gray-300 font-bold">
                {playlistResults.length}
              </span>
            </button>
          )}
        </div>
      )}

      {/* EMPTY STATE */}
      {!hasAnyResults && (
        <div className="py-24 text-center flex flex-col items-center justify-center rounded-3xl bg-white/[0.02] border border-white/[0.06] p-8 max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-4 text-[#f43f5e]">
            <BiHeadphone size={34} />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">
            No results found for &ldquo;{decodedTitle}&rdquo;
          </h3>
          <p className="text-sm text-gray-400 max-w-md mb-6 leading-relaxed">
            Please make sure words are spelled correctly or try searching for another track, artist, or album.
          </p>
          <Link
            href="/"
            className="px-6 py-2.5 rounded-full bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white text-xs font-bold tracking-wide shadow-[0_4px_16px_rgba(244,63,94,0.35)] transition-all"
          >
            Explore Trending Tracks
          </Link>
        </div>
      )}

      {/* ========================================================= */}
      {/* ALL TAB: TOP RESULT + TOP SONGS + SHELVES */}
      {/* ========================================================= */}
      {activeTab === "all" && hasAnyResults && (
        <div className="space-y-12">
          {/* Top Result + Songs Split Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Top Result Hero Card */}
            {topResult && (
              <div className="lg:col-span-5">
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">
                  Top result
                </h2>
                <div
                  onClick={() => handlePlayTopResult(topResult)}
                  className="group relative p-6 rounded-3xl bg-gradient-to-br from-white/[0.07] via-white/[0.03] to-transparent hover:from-white/[0.12] hover:via-white/[0.06] border border-white/10 hover:border-[#f43f5e]/40 transition-all duration-300 cursor-pointer shadow-xl flex flex-col justify-between min-h-[220px]"
                >
                  <div className="flex flex-col gap-4">
                    <div
                      className={`relative w-24 h-24 sm:w-28 sm:h-28 overflow-hidden shadow-2xl bg-[#18181f] ${
                        topResult.type === "artist" ? "rounded-full" : "rounded-2xl"
                      }`}
                    >
                      <img
                        src={
                          topResult?.image?.[2]?.url ||
                          topResult?.image?.[1]?.url ||
                          topResult?.image?.[0]?.url ||
                          "/images/vinyl.png"
                        }
                        alt={topResult?.title || topResult?.name || "top result"}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.src = "/images/vinyl.png";
                        }}
                      />
                    </div>

                    <div>
                      <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight line-clamp-2 group-hover:text-[#f43f5e] transition-colors">
                        {decodeHtml(topResult?.title || topResult?.name)}
                      </h3>
                      <div className="flex items-center gap-2 mt-2 text-xs text-gray-400 font-medium">
                        <span className="px-2 py-0.5 rounded-full bg-white/10 text-white font-semibold uppercase text-[10px] tracking-wider">
                          {topResult?.type || "Top result"}
                        </span>
                        {topResult?.description && (
                          <span>• {topResult.description}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Play Action Button */}
                  <div className="flex justify-end mt-4">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlayTopResult(topResult);
                      }}
                      className="w-12 h-12 rounded-full musify-play-btn shadow-[0_4px_20px_rgba(244,63,94,0.5)] flex items-center justify-center group-hover:scale-105 active:scale-95 transition-all cursor-pointer"
                      title="Play"
                    >
                      <BsFillPlayFill className="text-white text-2xl translate-x-0.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Top Songs (4-6 tracks) */}
            {songResults.length > 0 && (
              <div className={topResult ? "lg:col-span-7" : "lg:col-span-12"}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl sm:text-2xl font-bold text-white">
                    Songs
                  </h2>
                  {songResults.length > 4 && (
                    <button
                      type="button"
                      onClick={() => setActiveTab("songs")}
                      className="text-xs font-semibold text-gray-400 hover:text-white transition-colors cursor-pointer"
                    >
                      See all ({songResults.length})
                    </button>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  {songResults.slice(0, 5).map((song, index) => {
                    const isThisActive =
                      Boolean(activeSong?.id && String(activeSong.id) === String(song?.id));
                    const artistName =
                      (Array.isArray(song?.artists?.primary) &&
                        song.artists.primary.map((a) => a?.name).join(", ")) ||
                      (Array.isArray(song?.artists) &&
                        song.artists.map((a) => a?.name).join(", ")) ||
                      song?.primaryArtists ||
                      song?.singers ||
                      "Artist";

                    return (
                      <div
                        key={song?.id || index}
                        onClick={() => handlePlaySong(song, index)}
                        className={`group flex items-center justify-between p-2 rounded-xl transition-all duration-200 cursor-pointer ${
                          isThisActive
                            ? "bg-white/[0.08] border border-[#f43f5e]/40 shadow-md"
                            : "bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.04] hover:border-white/10"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1 mr-3">
                          <div className="relative w-11 h-11 flex-shrink-0 rounded-lg overflow-hidden bg-[#18181f]">
                            <img
                              src={
                                song?.image?.[2]?.url ||
                                song?.image?.[1]?.url ||
                                song?.image?.[0]?.url ||
                                "/images/vinyl.png"
                              }
                              alt={song?.name || song?.title || "song"}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = "/images/vinyl.png";
                              }}
                            />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                              <BsFillPlayFill size={20} className="text-[#f43f5e] translate-x-0.5" />
                            </div>
                          </div>

                          <div className="min-w-0 flex-1">
                            <p
                              className={`text-sm font-semibold truncate ${
                                isThisActive ? "text-[#f43f5e]" : "text-white group-hover:text-[#f43f5e]"
                              } transition-colors`}
                            >
                              {decodeHtml(song?.name || song?.title)}
                            </p>
                            <p className="text-xs text-gray-400 truncate mt-0.5">
                              {decodeHtml(artistName)}
                            </p>
                          </div>
                        </div>

                        <div className="text-xs text-gray-400 font-medium tabular-nums flex-shrink-0 pr-2">
                          {formatDuration(song?.duration)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Artists Shelf */}
          {artistResults.length > 0 && (
            <SwiperLayout
              title="Artists"
              action={
                artistResults.length > 6 && (
                  <button
                    type="button"
                    onClick={() => setActiveTab("artists")}
                    className="text-xs font-semibold text-gray-400 hover:text-white transition-colors cursor-pointer mr-1"
                  >
                    See all ({artistResults.length})
                  </button>
                )
              }
            >
              {artistResults.map((artist, index) => (
                <SwiperSlide key={artist?.id || index}>
                  <Link href={`/artist/${artist?.id}`}>
                    <div className="group flex flex-col items-center p-3.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.05] hover:border-white/15 transition-all text-center cursor-pointer">
                      <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-full overflow-hidden mb-3 bg-[#18181f] shadow-lg">
                        <img
                          src={
                            artist?.image?.[2]?.url ||
                            artist?.image?.[1]?.url ||
                            artist?.image?.[0]?.url ||
                            "/images/vinyl.png"
                          }
                          alt={artist?.name || artist?.title || "artist"}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.currentTarget.src = "/images/vinyl.png";
                          }}
                        />
                      </div>
                      <p className="font-bold text-sm text-white truncate w-full group-hover:text-[#f43f5e] transition-colors">
                        {decodeHtml(artist?.name || artist?.title)}
                      </p>
                      <span className="text-xs text-gray-400 mt-0.5">Artist</span>
                    </div>
                  </Link>
                </SwiperSlide>
              ))}
            </SwiperLayout>
          )}

          {/* Albums Shelf */}
          {albumResults.length > 0 && (
            <SwiperLayout
              title="Albums"
              action={
                albumResults.length > 6 && (
                  <button
                    type="button"
                    onClick={() => setActiveTab("albums")}
                    className="text-xs font-semibold text-gray-400 hover:text-white transition-colors cursor-pointer mr-1"
                  >
                    See all ({albumResults.length})
                  </button>
                )
              }
            >
              {albumResults.map((album, index) => (
                <SwiperSlide key={album?.id || index}>
                  <SongCard song={album} />
                </SwiperSlide>
              ))}
            </SwiperLayout>
          )}

          {/* Playlists Shelf */}
          {playlistResults.length > 0 && (
            <SwiperLayout
              title="Featured Playlists"
              action={
                playlistResults.length > 6 && (
                  <button
                    type="button"
                    onClick={() => setActiveTab("playlists")}
                    className="text-xs font-semibold text-gray-400 hover:text-white transition-colors cursor-pointer mr-1"
                  >
                    See all ({playlistResults.length})
                  </button>
                )
              }
            >
              {playlistResults.map((playlist, index) => (
                <SwiperSlide key={playlist?.id || index}>
                  <SongCard song={playlist} />
                </SwiperSlide>
              ))}
            </SwiperLayout>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* SONGS TAB (FULL TRACK LIST) */}
      {/* ========================================================= */}
      {activeTab === "songs" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              Songs ({songResults.length})
            </h2>
          </div>
          <SongsList SongData={songResults} />
        </div>
      )}

      {/* ========================================================= */}
      {/* ARTISTS TAB (GRID) */}
      {/* ========================================================= */}
      {activeTab === "artists" && (
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-6">
            Artists ({artistResults.length})
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {artistResults.map((artist, index) => (
              <Link key={artist?.id || index} href={`/artist/${artist?.id}`}>
                <div className="group flex flex-col items-center p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.05] hover:border-white/15 transition-all text-center cursor-pointer shadow-lg">
                  <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-full overflow-hidden mb-3 bg-[#18181f] shadow-lg">
                    <img
                      src={
                        artist?.image?.[2]?.url ||
                        artist?.image?.[1]?.url ||
                        artist?.image?.[0]?.url ||
                        "/images/vinyl.png"
                      }
                      alt={artist?.name || artist?.title || "artist"}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.src = "/images/vinyl.png";
                      }}
                    />
                  </div>
                  <p className="font-bold text-sm text-white truncate w-full group-hover:text-[#f43f5e] transition-colors">
                    {decodeHtml(artist?.name || artist?.title)}
                  </p>
                  <span className="text-xs text-gray-400 mt-1">Artist</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* ALBUMS TAB (GRID) */}
      {/* ========================================================= */}
      {activeTab === "albums" && (
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-6">
            Albums ({albumResults.length})
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {albumResults.map((album, index) => (
              <div key={album?.id || index}>
                <SongCard song={album} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* PLAYLISTS TAB (GRID) */}
      {/* ========================================================= */}
      {activeTab === "playlists" && (
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-6">
            Playlists ({playlistResults.length})
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {playlistResults.map((playlist, index) => (
              <div key={playlist?.id || index}>
                <SongCard song={playlist} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchResultsPage;
