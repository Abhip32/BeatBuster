"use client";
import React, { useEffect, useState } from "react";
import { setProgress } from "@/redux/features/loadingBarSlice";
import { getAlbumData } from "@/services/dataAPI";
import PlayButton from "@/components/PlayButton";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useDispatch } from "react-redux";
import SongList from "@/components/SongsList";
import { useQuery } from "@tanstack/react-query";
import PlaylistSkeleton from "@/components/Skeletons/PlaylistSkeleton";
import decodeHtml from "@/utils/decodeHtml";

const AlbumPage = ({ params }) => {
  const routeParams = useParams();
  const albumId = routeParams?.albumId || params?.albumId;
  const dispatch = useDispatch();

  const { data: albumData, isLoading: loading } = useQuery({
    queryKey: ["album", albumId],
    queryFn: async () => {
      dispatch(setProgress(50));
      try {
        const response = await getAlbumData(albumId);
        dispatch(setProgress(100));
        return response;
      } catch (err) {
        dispatch(setProgress(100));
        throw err;
      }
    },
    enabled: Boolean(albumId),
    staleTime: 10 * 60 * 1000,
  });

  if (loading) {
    return <PlaylistSkeleton type="album" count={8} />;
  }

  if (!albumData) {
    return (
      <div className="w-11/12 max-w-7xl mx-auto py-24 text-center flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center mb-4">
          <img src="/images/logo.png" alt="Musify" className="w-10 h-10 rounded-full opacity-60" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Album Not Found</h2>
        <p className="text-sm text-gray-400 max-w-md mb-6">
          The requested album could not be loaded or may no longer be available.
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
    albumData?.image?.[2]?.url ||
    albumData?.image?.[1]?.url ||
    albumData?.image?.[0]?.url ||
    "";

  const primaryArtistsList = Array.isArray(albumData?.artists?.primary)
    ? albumData.artists.primary
    : Array.isArray(albumData?.artists)
    ? albumData.artists
    : null;

  return (
    <div className="w-11/12 max-w-7xl mx-auto mt-8 mb-20">
      {/* Spotify Album Banner */}
      <div className="relative rounded-3xl p-6 sm:p-8 lg:p-10 bg-gradient-to-b from-white/[0.08] to-white/[0.02] backdrop-blur-2xl border border-white/10 shadow-2xl flex flex-col md:flex-row items-center md:items-end gap-6 lg:gap-10">
        <div className="relative w-48 h-48 sm:w-56 sm:h-56 lg:w-64 lg:h-64 flex-shrink-0 rounded-2xl overflow-hidden shadow-2xl bg-[#18181f]">
          {loading ? (
            <div className="w-full h-full animate-pulse bg-white/10" />
          ) : coverUrl ? (
            <img
              className="w-full h-full object-cover"
              src={coverUrl}
              alt={albumData?.name || "album"}
              width={256}
              height={256}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-white/5 text-gray-500">
              <img src="/images/logo.png" alt="Musify" className="w-16 h-16 rounded-full opacity-60" />
            </div>
          )}
        </div>

        <div className="flex flex-col text-center md:text-left text-white min-w-0 flex-1">
          <span className="text-xs uppercase font-extrabold tracking-widest text-[#f43f5e] mb-1">
            Album
          </span>
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight line-clamp-2">
            {decodeHtml(albumData?.name || "Album")}
          </h1>

          {/* Artists */}
          <div className="text-sm font-semibold text-gray-200 mt-2">
            {primaryArtistsList && primaryArtistsList.length > 0 ? (
              primaryArtistsList.map((artist, idx) => (
                <React.Fragment key={artist?.id || idx}>
                  <Link
                    href={`/artist/${artist?.id}`}
                    className="hover:text-[#f43f5e] hover:underline transition-colors"
                  >
                    {decodeHtml(artist?.name)}
                  </Link>
                  {idx < primaryArtistsList.length - 1 && ", "}
                </React.Fragment>
              ))
            ) : albumData?.primaryArtists ? (
              <span>{decodeHtml(albumData.primaryArtists)}</span>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-xs text-gray-400 mt-3 font-semibold">
            {albumData?.year && <span>{albumData.year}</span>}
            {albumData?.songCount && (
              <>
                <span>•</span>
                <span>{albumData.songCount} songs</span>
              </>
            )}
          </div>

          <PlayButton songList={albumData} />
        </div>
      </div>

      {/* Songs Section */}
      <div className="mt-10">
        <h2 className="text-2xl font-bold tracking-tight text-white mb-2">
          Tracklist
        </h2>
        <SongList SongData={albumData?.songs} loading={loading} />
      </div>
    </div>
  );
};

export default AlbumPage;
