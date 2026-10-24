"use client";
import React, { useEffect, useState } from "react";
import SwiperLayout from "@/components/Homepage/Swiper";
import SongCard from "@/components/Homepage/SongCard";
import SongListSkeleton from "@/components/SongListSkeleton";
import ArtistSkeleton from "@/components/Skeletons/ArtistSkeleton";
import SongList from "@/components/SongsList";
import { setProgress } from "@/redux/features/loadingBarSlice";
import {
  getArtistAlbums,
  getArtistData,
  getArtistSongs,
} from "@/services/dataAPI";
import { useDispatch } from "react-redux";
import { SwiperSlide } from "swiper/react";
import { useParams } from "next/navigation";
import { MdVerified } from "react-icons/md";
import PlayButton from "@/components/PlayButton";

const ArtistPage = ({ params }) => {
  const routeParams = useParams();
  const artistId = routeParams?.artistId || params?.artistId;
  const dispatch = useDispatch();
  const [artistDetails, setArtistDetails] = useState({});
  const [artistSongs, setArtistSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [artistAlbums, setArtistAlbums] = useState([]);

  useEffect(() => {
    if (!artistId) return;
    const fetchData = async () => {
      dispatch(setProgress(30));
      const details = await getArtistData(artistId);
      dispatch(setProgress(60));
      setArtistDetails(details || {});
      const songs = await getArtistSongs(artistId, 0);
      dispatch(setProgress(85));
      setArtistSongs(songs);
      const albums = await getArtistAlbums(artistId, 0);
      setArtistAlbums(albums?.albums || (Array.isArray(albums) ? albums : []));
      dispatch(setProgress(100));
      setLoading(false);
    };
    fetchData();
  }, [artistId, dispatch]);

  if (loading) {
    return <ArtistSkeleton />;
  }

  const coverUrl =
    artistDetails?.image?.[2]?.url ||
    artistDetails?.image?.[1]?.url ||
    artistDetails?.image?.[0]?.url ||
    "";

  const songsList = Array.isArray(artistSongs?.songs)
    ? artistSongs.songs
    : Array.isArray(artistSongs)
    ? artistSongs
    : [];

  const albumsList = Array.isArray(artistAlbums) ? artistAlbums : [];

  return (
    <div className="w-11/12 max-w-7xl mx-auto mt-8 mb-20">
      {/* Spotify Artist Banner */}
      <div className="relative rounded-3xl p-6 sm:p-8 lg:p-10 bg-gradient-to-b from-white/[0.08] to-white/[0.02] backdrop-blur-2xl border border-white/10 shadow-2xl flex flex-col md:flex-row items-center md:items-end gap-6 lg:gap-10">
        <div className="relative w-48 h-48 sm:w-56 sm:h-56 lg:w-64 lg:h-64 flex-shrink-0 rounded-full overflow-hidden shadow-2xl bg-[#18181f] border-2 border-white/10">
          {loading ? (
            <div className="w-full h-full animate-pulse bg-white/10" />
          ) : coverUrl ? (
            <img
              src={coverUrl}
              alt={artistDetails?.name || "artist"}
              width={256}
              height={256}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-white/5 text-gray-500 font-bold text-3xl">
              {artistDetails?.name?.[0] || "A"}
            </div>
          )}
        </div>

        <div className="flex flex-col text-center md:text-left text-white min-w-0 flex-1">
          <div className="flex items-center justify-center md:justify-start gap-1.5 text-xs uppercase font-extrabold tracking-widest text-[#a855f7] mb-1">
            <MdVerified className="text-[#a855f7] text-base" />
            <span>Verified Artist</span>
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight line-clamp-2">
            {artistDetails?.name || "Artist"}
          </h1>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-xs text-gray-300 mt-3 font-semibold">
            <span>
              {Number(
                artistDetails?.fanCount || artistDetails?.followerCount || 100000
              ).toLocaleString()}{" "}
              monthly listeners
            </span>
            {artistDetails?.dominantLanguage && (
              <>
                <span>•</span>
                <span className="capitalize">{artistDetails.dominantLanguage}</span>
              </>
            )}
          </div>

          {songsList.length > 0 && (
            <PlayButton songList={{ songs: songsList, name: artistDetails?.name }} />
          )}
        </div>
      </div>

      {/* Top Songs */}
      <div className="mt-10">
        <h2 className="text-2xl font-bold tracking-tight text-white mb-2">
          Popular Tracks
        </h2>
        {loading ? (
          <SongListSkeleton />
        ) : (
          <SongList SongData={songsList} loading={false} />
        )}
      </div>

      {/* Albums */}
      {albumsList.length > 0 && (
        <div className="mt-12">
          <SwiperLayout title="Discography & Albums">
            {albumsList.map((album, index) => (
              <SwiperSlide key={album?.id || index}>
                <SongCard song={album} />
              </SwiperSlide>
            ))}
          </SwiperLayout>
        </div>
      )}
    </div>
  );
};

export default ArtistPage;
