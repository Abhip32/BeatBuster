'use client'
import React from 'react'
import { useDispatch } from 'react-redux';
import { BsFillPlayFill } from 'react-icons/bs';

import { playPause, setActiveSong } from "@/redux/features/playerSlice";
const PlayButton = ({ songList }) => {
    const dispatch = useDispatch();
    const handlePlayClick = (song, index) => {
        dispatch(setActiveSong({ song, data: songList?.songs, i: index }));
        dispatch(playPause(true));
    };
    return (
        <div
            onClick={() => { handlePlayClick(songList?.songs?.[0], 0); }}
            className="flex items-center gap-2 mt-5 rounded-3xl py-2 px-3 hover:border-[#e0c3fc] group w-fit cursor-pointer border border-white shadow-md shadow-[#e0c3fc] hover:bg-[white] hover:text-zinc-900">
            <BsFillPlayFill size={25} className="text-gray-200 group-hover:text-[#e0c3fc]" />
            <p className="text-lg font-semibold">Play</p>
        </div>
    )
}

export default PlayButton