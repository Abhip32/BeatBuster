"use client";
import React, { useEffect, useState } from "react";
import SwiperLayout from "@/components/Homepage/Swiper";
import SongCard from "@/components/Homepage/SongCard";
import { getSearchedData, getSongData } from "@/services/dataAPI";
import { useSelector, useDispatch } from "react-redux";
import { SwiperSlide } from "swiper/react";
import { BsPlayFill } from "react-icons/bs";
import { playPause, setActiveSong } from "@/redux/features/playerSlice";
import Link from "next/link";
import SongListSkeleton from "@/components/SongListSkeleton";
import SearchSkeleton from "@/components/Skeletons/SearchSkeleton";
import { setProgress } from "@/redux/features/loadingBarSlice";
import { useParams } from "next/navigation";

const SearchResultsPage = ({ params }) => {
  const routeParams = useParams();
  const rawQuery = routeParams?.query || params?.query || "";
  const dispatch = useDispatch();
  const [query, setQuery] = useState(rawQuery);
  const [searchedData, setSearchedData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { currentSongs } = useSelector((state) => state.player);

  useEffect(() => {
    if (rawQuery && rawQuery !== query) {
      setQuery(rawQuery);
    }
  }, [rawQuery, query]);

  useEffect(() => {
    const fetchData = async () => {
      dispatch(setProgress(70));
      const response = await getSearchedData(query);
      setSearchedData(response);
      setLoading(false);
      dispatch(setProgress(100));
    };
    fetchData();
  }, [query, dispatch]);

  if (loading) {
    return <SearchSkeleton />;
  }

  const handlePlayClick = async (song) => {
    if (song?.type === "song") {
      const Data = await getSongData(song?.id);
      const songData = Array.isArray(Data) ? Data[0] : Data || song;
      dispatch(
        setActiveSong({
          song: songData,
          data: currentSongs?.find((s) => s?.id === songData?.id)
            ? currentSongs
            : [...currentSongs, songData],
          i: currentSongs?.find((s) => s?.id === songData?.id)
            ? currentSongs?.findIndex((s) => s?.id === songData?.id)
            : currentSongs?.length,
        })
      );
      dispatch(playPause(true));
    }
  };

  const songResults = Array.isArray(searchedData?.songs?.results)
    ? searchedData.songs.results
    : Array.isArray(searchedData?.songs)
    ? searchedData.songs
    : [];

  const albumResults = Array.isArray(searchedData?.albums?.results)
    ? searchedData.albums.results
    : Array.isArray(searchedData?.albums)
    ? searchedData.albums
    : [];

  const artistResults = Array.isArray(searchedData?.artists?.results)
    ? searchedData.artists.results
    : Array.isArray(searchedData?.artists)
    ? searchedData.artists
    : [];

  const playlistResults = Array.isArray(searchedData?.playlists?.results)
    ? searchedData.playlists.results
    : Array.isArray(searchedData?.playlists)
    ? searchedData.playlists
    : [];

  const decodedTitle = decodeURIComponent(query || "").replaceAll("%20", " ");

  return (
    <div className="w-11/12 max-w-7xl mx-auto mt-8 mb-20">
      <div className="mb-8">
        <span className="text-xs font-bold uppercase tracking-widest text-[#a855f7]">
          Search Results
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-1">
          Showing results for &ldquo;{decodedTitle}&rdquo;
        </h1>
      </div>

      {/* Songs Section */}
      <div className="mt-8">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">
          Songs
        </h2>
        {loading ? (
          <SongListSkeleton />
        ) : songResults.length > 0 ? (
          <div className="flex flex-col gap-1.5">
            {songResults.slice(0, 8).map((song, index) => (
              <div
                key={song?.id || index}
                onClick={() => handlePlayClick(song)}
                className="group flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] backdrop-blur-md border border-white/[0.05] hover:border-white/15 transition-all duration-200 cursor-pointer"
              >
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <div className="relative w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-[#18181f]">
                    <img
                      src={
                        song?.image?.[2]?.url ||
                        song?.image?.[1]?.url ||
                        song?.image?.[0]?.url ||
                        ""
                      }
                      alt={song?.title || song?.name || "song"}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <BsPlayFill size={24} className="text-[#a855f7]" />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-white truncate group-hover:text-[#a855f7] transition-colors">
                      {(song?.title || song?.name)
                        ?.replaceAll("&#039;", "'")
                        ?.replaceAll("&amp;", "&")}
                    </p>
                    <p className="text-xs text-[#b3b3b3] truncate mt-0.5">
                      {song?.primaryArtists || song?.singers || "Artist"}
                    </p>
                  </div>
                </div>
                <div className="hidden sm:block text-xs text-gray-400 max-w-44 truncate">
                  {song?.album || "Single"}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-sm">No songs found.</p>
        )}
      </div>

      {/* Albums Section */}
      {albumResults.length > 0 && (
        <div className="mt-12">
          <SwiperLayout title="Albums">
            {albumResults.map((album, index) => (
              <SwiperSlide key={album?.id || index}>
                <SongCard song={album} />
              </SwiperSlide>
            ))}
          </SwiperLayout>
        </div>
      )}

      {/* Artists Section */}
      {artistResults.length > 0 && (
        <div className="mt-12">
          <SwiperLayout title="Artists">
            {artistResults.map((artist, index) => (
              <SwiperSlide key={artist?.id || index}>
                <Link href={`/artist/${artist?.id}`}>
                  <div className="group flex flex-col items-center p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] backdrop-blur-md border border-white/[0.05] hover:border-white/15 transition-all text-center">
                    <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-full overflow-hidden mb-3 bg-[#18181f] shadow-lg">
                      <img
                        src={
                          artist?.image?.[2]?.url ||
                          artist?.image?.[1]?.url ||
                          artist?.image?.[0]?.url ||
                          ""
                        }
                        alt={artist?.name || artist?.title || "artist"}
                        width={144}
                        height={144}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <p className="font-bold text-sm text-white truncate w-full group-hover:text-[#a855f7] transition-colors">
                      {(artist?.title || artist?.name)?.replaceAll("&amp;", "&")}
                    </p>
                    <span className="text-xs text-[#b3b3b3] mt-0.5">Artist</span>
                  </div>
                </Link>
              </SwiperSlide>
            ))}
          </SwiperLayout>
        </div>
      )}

      {/* Playlists Section */}
      {playlistResults.length > 0 && (
        <div className="mt-12">
          <SwiperLayout title="Playlists">
            {playlistResults.map((playlist, index) => (
              <SwiperSlide key={playlist?.id || index}>
                <SongCard song={playlist} />
              </SwiperSlide>
            ))}
          </SwiperLayout>
        </div>
      )}
    </div>
  );
};

export default SearchResultsPage;
