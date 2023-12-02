"use client";
import { homePageData } from "@/services/dataAPI";
import React from "react";
import { useEffect, useState } from "react";
import { SwiperSlide } from "swiper/react";
import SongCard from "./SongCard";
import { useDispatch, useSelector } from "react-redux";
import SwiperLayout from "./Swiper";
import { setProgress } from "@/redux/features/loadingBarSlice";
import SongCardSkeleton from "./SongCardSkeleton";
import { deletePlaylist, getUserPlaylists } from '@/services/playlistApi'
import { GiMusicalNotes } from 'react-icons/gi'
import SongBar from "./SongBar";
import { getUserInfo } from '@/services/dataAPI';
import OnlineStatus from "./OnlineStatus";
import ListenAgain from "./ListenAgain";
import Favourites from "../Sidebar/Favourites";
import { signOut, useSession } from 'next-auth/react'
import Playlists from "../Sidebar/Playlists";
import Link from "next/link";
import { BiSolidPlaylist } from "react-icons/bi";

const Home = () => {
  const [data, setData] = useState("");
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const { activeSong, isPlaying, } = useSelector((state) => state.player);
  const { languages } = useSelector((state) => state.languages);
  const [playlists, setPlaylists] = useState([]);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
      const getPlaylists = async () => {
          const res = await getUserPlaylists();
          if(res?.success == true){
              setPlaylists(res?.data?.playlists)
          }
      }
      getPlaylists()
  }, [])

  const {status, data1} = useSession();

  
  const [user, setUser] = useState(null);
  useEffect(() => {
      const fetchUser = async () => {
          const res = await getUserInfo();
          // console.log('user',res);
          setUser(res);
      }
      fetchUser();
  }, [status]);

  // salutation
  const currentTime = new Date();
  const currentHour = currentTime.getHours();

  let salutation = '';
  if (currentHour >= 5 && currentHour < 12) {
    salutation = 'Good Morning';
  } else if (currentHour >= 12 && currentHour < 18) {
    salutation = 'Good Afternoon';
  } else {
    salutation = 'Good Evening';
  }



  useEffect(() => {
    const fetchData = async () => {
      dispatch(setProgress(70))
      const res = await homePageData(languages);
      setData(res);
      dispatch(setProgress(100))
      setLoading(false);
    };
    fetchData();
  }, [languages]);



  return (
    <div>
     
      <OnlineStatus />
      <h1 className='text-4xl font-bold mx-2 m-9 text-white flex gap-2'>{salutation}</h1>

      {status === 'authenticated' &&  <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
  <div className="p-4 pt-4 rounded-lg">
    <Favourites />
  </div>

  {playlists.slice(0, 5).map((playlist) => (
    <div className="p-4 pt-4 rounded-lg" key={playlist._id}>
       <div className=' mt-1 bg-white/5 bg-opacity-80 backdrop-blur-sm rounded-lg cursor-pointer'>
        <Link href={`/myPlaylists/${playlist._id}`} className="flex items-center" onClick={() => setShowNav(false)}>
        <BiSolidPlaylist title="Favourites" size={20} color={"white"} className={`bg-gradient-to-br from-blue-500 to-black p-4 w-[80px] h-[80px]`} />
        <p className="font-semibold text-xl text-white mx-3">{playlist.name}</p>
      </Link>
    </div>
    </div>
  ))}
</div>

          </div>}

  
      <ListenAgain />

      {/* trending */}
      <SwiperLayout title={"Trending"} >
        {
          loading ? (
            <SongCardSkeleton />
          ) : (
            <>
              {data?.trending?.songs?.map(
                (song) =>
                (
                  <SwiperSlide key={song?.id}>
                    <SongCard song={song} activeSong={activeSong} isPlaying={isPlaying} />
                  </SwiperSlide>
                )
              )}

              {data?.trending?.albums?.map(
                (song) =>
                (
                  <SwiperSlide key={song?.id}>
                    <SongCard song={song} activeSong={activeSong} isPlaying={isPlaying} />
                  </SwiperSlide>
                )
              )}
            </>
          )
        }
      </SwiperLayout>

      {/* top charts */}
      <div className="my-4 lg:mt-14">
        <h2 className=" text-white mt-4 text-2xl lg:text-3xl font-semibold mb-4 ">Top Charts</h2>
        <div className="grid lg:grid-cols-2 gap-x-10 max-h-96 lg:max-h-full lg:overflow-y-auto overflow-y-scroll">
          {
            loading ? (
              <div className=" w-[90vw] overflow-x-hidden">
                <SongCardSkeleton />
              </div>
            ) : (
              data?.charts?.slice(0, 10)?.map(
                (playlist, index) =>
                (
                  <SongBar key={playlist?.id} playlist={playlist} i={index} />
                ))
            )
          }
        </div>
      </div>

      {/* New Releases */}
      <SwiperLayout title={"New Releases"}>
        {
          loading ? (
            <SongCardSkeleton />
          ) : (
            data?.albums?.map(
              (song) =>
              (
                <SwiperSlide key={song?.id}>
                  <SongCard song={song} activeSong={activeSong} isPlaying={isPlaying} />
                </SwiperSlide>
              )
            )
          )
        }
      </SwiperLayout>

      {/* featured playlists */}
      <SwiperLayout title={"Featured Playlists"}>
        {
          loading ? (
            <SongCardSkeleton />
          ) : (
            data?.playlists?.map(
              (song) =>
              (
                <SwiperSlide key={song?.id}>
                  <SongCard key={song?.id} song={song} activeSong={activeSong} isPlaying={isPlaying} />
                </SwiperSlide>
              )
            )
          )
        }
      </SwiperLayout>

    </div>
  );
};

export default Home;