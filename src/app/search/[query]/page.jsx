"use client"
import SwiperLayout from '@/components/Homepage/Swiper';
import SongCard from '@/components/Homepage/SongCard';
import { getSearchedData, getSongData } from '@/services/dataAPI';
import React, { useEffect } from 'react';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { SwiperSlide } from 'swiper/react';
import { BsPlayFill } from 'react-icons/bs';
import { useDispatch } from 'react-redux';
import Image from 'next/image';
import Link from 'next/link';
import SongListSkeleton from '@/components/SongListSkeleton';
import { setProgress } from '@/redux/features/loadingBarSlice';
import { PiDotsThreeVerticalBold } from 'react-icons/pi';
import { addSongToPlaylist, getUserPlaylists } from '@/services/playlistApi';
import { toast } from 'react-hot-toast';
import { playPause, setActiveSong, setFullScreen, addToQueue } from "@/redux/features/playerSlice";

const Page = ({ params }) => {
  const dispatch = useDispatch();
  const [query, setQuery] = useState(params.query);
  const [searchedData, setSearchedData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { currentSongs } = useSelector(state => state.player);
  const [showMenu, setShowMenu] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const fullScreenMode = useSelector(state => state.player.fullScreen);

  useEffect(() => {
    const fetchData = async () => {
      dispatch(setProgress(70));
      const response = await getSearchedData(query);
      setSearchedData(response);
      setLoading(false);
      dispatch(setProgress(100));
    };
    fetchData();
  }, [query]);

  const handlePlayClick = async (song) => {
    if (song?.type === "song") {
      const Data = await getSongData(song?.id);
      const songData = await Data?.[0];
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
      dispatch(setFullScreen(true));
      dispatch(playPause(true));
    }
  };

  const handleAddToQueue = async (song) => {
    if (song?.type === "song") {
      const Data = await getSongData(song?.id);
      const songData = await Data?.[0]
      dispatch(addToQueue({ song: songData }));
      dispatch(setFullScreen(true));
      dispatch(playPause(true));
      setShowMenu(false);
    }
  }

  useEffect(() => {
    const getPlaylists = async () => {
      const res = await getUserPlaylists();
      if (res?.success == true) {
        setPlaylists(res?.data?.playlists)
      }
    }
    getPlaylists()
  }, [])

  const handleAddToPlaylist = async (song, playlistID) => {
    setShowMenu(false);
    const res = await addSongToPlaylist(playlistID, song);
    if (res?.success == true) {
      toast.success(res?.message)
      setShowMenu(false);
    }
    else {
      toast.error(res?.message)
    }
  }

  return (
    <div>
      <div className="w-11/12 m-auto mt-16">
        <div className="mt-10 text-gray-200">
          <h1 className="text-3xl font-bold">
            Search results for "{query.replaceAll("%20", " ")}"
          </h1>
          <div className="mt-10 text-gray-200">
            <h2 className="text-lg lg:text-4xl font-semibold">Songs</h2>
            {searchedData && searchedData?.songs?.results?.length > 0 ? (
              <div className="mt-5">
                {searchedData?.songs?.results?.map((song, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      handlePlayClick(song);
                    }}
                    className="flex items-center  mt-5 cursor-pointer group border-b-[1px] border-gray-400 justify-between"
                  >
                    <div className="flex items-center gap-5">
                      <div className=" relative">
                        <img
                          src={song?.image?.[2]?.url}
                          alt={song?.title}
                          width={50}
                          height={50}
                          className="mb-3"
                        />
                        <BsPlayFill
                          size={25}
                          className=" group-hover:block hidden absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-gray-200"
                        />
                      </div>
                      <div className="w-32 lg:w-80">
                        <p className="text-sm lg:text-lg font-semibold truncate">
                          {song?.title
                            ?.replace("&#039;", "'")
                            ?.replace("&amp;", "&")}
                        </p>
                      </div>
                    </div>

                    <div className='flex gap-2 items-center relative'>
                      <div className="hidden lg:block max-w-56">
                        {song?.primaryArtists && (
                          <p className="text-gray-400 truncate">By: {song?.primaryArtists}</p>
                        )}
                      </div>
                      <PiDotsThreeVerticalBold onClick={(e) => { e.stopPropagation(); setShowMenu(song?.id) }} size={25} className='text-gray-300' />
                      {showMenu === song?.id &&
                        <div onClick={() => { setShowMenu("sd"); }}
                          className='absolute text-white top-0 right-0 bg-black/50 bg-opacity-80 backdrop-blur-sm rounded-lg p-3 w-32 flex flex-col gap-2 z-40'>
                          {!fullScreenMode ? <button onClick={(e) => { e.stopPropagation(); handleAddToQueue(song) }} className='text-sm font-semibold flex gap-1 items-center hover:underline'>Add to Queue</button> : null}
                          <p className='text-sm font-semibold flex gap-1 empty:hidden border-b border-white items-center'>
                            {'Add to playlist'}
                          </p>
                          {
                            playlists?.length > 0 ?
                              playlists?.map((playlist, index) => (
                                <button key={index} onClick={(e) => { e.stopPropagation(); handleAddToPlaylist(song?.id, playlist._id) }} className='text-sm font-semibold flex gap-1 items-center hover:underline'>{playlist?.name}</button>
                              ))
                              :
                              <p className='text-sm font-semibold flex gap-1 items-center'>No Playlist</p>
                          }
                        </div>
                      }
                    </div>

                  </div>
                ))}
              </div>
            ) : (
              <SongListSkeleton />
            )}
          </div>

          <div className="mt-10 text-gray-200">
            <SwiperLayout title={"Albums"}>
              {searchedData &&
                searchedData?.albums?.results?.length > 0 &&
                searchedData?.albums?.results?.map((song) => (
                  <SwiperSlide key={song?.id}>
                    <SongCard song={song} />
                  </SwiperSlide>
                ))}
            </SwiperLayout>
          </div>
          <div className="mt-10 text-gray-200">
            <SwiperLayout title={"Artists"}>
              {searchedData &&
                searchedData?.artists?.results?.length > 0 &&
                searchedData?.artists?.results?.map((artist) => (
                  <SwiperSlide key={artist?.id}>
                    <Link href={`/artist/${artist?.id}`}>
                      <div className=" flex flex-col justify-center items-center">
                        <Image
                          src={artist?.image?.[2]?.url}
                          alt={artist?.name}
                          width={200}
                          height={200}
                          className="rounded-full"
                        />
                        <p className="lg:text-base lg:w-44 w-24 text-center text-xs font-semibold mt-3 truncate">
                          {artist?.title?.replace("&amp;", "&")}
                        </p>
                        <div>
                          {artist?.description && (
                            <p className="text-gray-400 truncate text-[8px] lg:text-xs">
                              {artist?.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </Link>
                  </SwiperSlide>
                ))}
            </SwiperLayout>
          </div>
          <div className="mt-10 text-gray-200">
            <SwiperLayout title={"Playlists"}>
              {searchedData &&
                searchedData?.albums?.results?.length > 0 &&
                searchedData?.playlists?.results?.map((song) => (
                  <SwiperSlide key={song?.id}>
                    <SongCard song={song} />
                  </SwiperSlide>
                ))}
            </SwiperLayout>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;