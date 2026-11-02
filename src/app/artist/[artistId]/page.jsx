"use client";
import Link from "next/link";
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
import BackButton from "@/components/BackButton";
import { useQuery } from "@tanstack/react-query";

const ArtistPage = ({ params }) => {
  const routeParams = useParams();
  const artistId = routeParams?.artistId || params?.artistId;
  const dispatch = useDispatch();

  const { data, isLoading: loading } = useQuery({
    queryKey: ["artist", artistId],
    queryFn: async () => {
      dispatch(setProgress(40));
      try {
        const [details, songs, albums] = await Promise.all([
          getArtistData(artistId),
          getArtistSongs(artistId, 0),
          getArtistAlbums(artistId, 0),
        ]);
        dispatch(setProgress(100));
        return {
          details: details || {},
          songs: songs || [],
          albums: albums?.albums || (Array.isArray(albums) ? albums : []),
        };
      } catch (err) {
        dispatch(setProgress(100));
        throw err;
      }
    },
    enabled: Boolean(artistId),
    staleTime: 10 * 60 * 1000,
  });

  const artistDetails = data?.details || {};
  const artistSongs = data?.songs || [];
  const artistAlbums = data?.albums || [];

  if (loading) {
    return <ArtistSkeleton />;
  }

  if (!artistDetails?.name && songsList.length === 0) {
    return (
      <div className="w-11/12 max-w-7xl mx-auto py-24 text-center flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center mb-4">
          <img src="/images/logo.png" alt="Musify" className="w-10 h-10 rounded-full opacity-60" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Artist Not Found</h2>
        <p className="text-sm text-gray-400 max-w-md mb-6">
          The requested artist could not be loaded or may no longer be available.
        </p>
        <Link
          href="/"
          className="px-6 py-2.5 rounded-full bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-bold text-sm shadow-lg shadow-rose-500/25 transition-all"
        >
          Explore Music
        </Link>
      </div>
    );
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
    <div className="w-11/12 max-w-7xl mx-auto mt-6 mb-20 animate-fade-in">
      {/* Spotify Artist Banner */}
      <div className="relative rounded-3xl pt-12 sm:pt-14 md:pt-10 pb-5 sm:pb-8 lg:pb-10 px-5 sm:px-8 lg:px-10 bg-gradient-to-b from-rose-950/40 via-white/[0.03] to-transparent backdrop-blur-2xl border border-rose-500/15 shadow-2xl flex flex-col md:flex-row items-center md:items-end gap-5 sm:gap-7 lg:gap-10">
        <BackButton
          iconOnly
          className="absolute top-3.5 left-3.5 sm:top-4 sm:left-4 z-20"
        />

        <div className="relative w-36 h-36 sm:w-52 sm:h-52 lg:w-60 lg:h-60 flex-shrink-0 rounded-full overflow-hidden shadow-2xl bg-[#18181f] border border-rose-400/20 shadow-[0_12px_36px_rgba(244,63,94,0.3)] group">
          {loading ? (
            <div className="w-full h-full animate-pulse bg-white/10" />
          ) : coverUrl ? (
            <img
              src={coverUrl}
              alt={artistDetails?.name || "artist"}
              width={256}
              height={256}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-white/5 text-gray-500 font-bold text-3xl">
              {artistDetails?.name?.[0] || "A"}
            </div>
          )}
        </div>

        <div className="flex flex-col text-center md:text-left text-white min-w-0 flex-1 w-full md:w-auto">
          <span className="text-[11px] sm:text-xs uppercase font-extrabold tracking-widest text-[#f43f5e] mb-1.5 flex items-center justify-center md:justify-start gap-2">
            <MdVerified className="text-[#f43f5e] text-base" />
            <span>Verified Artist</span>
          </span>
          <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15] sm:leading-[1.1] pb-1.5">
            {artistDetails?.name || "Artist"}
          </h1>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-xs text-gray-300 mt-2.5 font-semibold">
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
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white">
              Popular Tracks
            </h2>
            <p className="text-xs text-gray-400 mt-0.5 font-medium">
              Top streamed tracks by {artistDetails?.name || "this artist"}
            </p>
          </div>
          {songsList.length > 0 && (
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30">
              {songsList.length} {songsList.length === 1 ? "track" : "tracks"}
            </span>
          )}
        </div>
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
