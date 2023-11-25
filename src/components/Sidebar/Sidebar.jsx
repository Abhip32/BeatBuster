import React from 'react'
import Languages from './Languages'
import Favourites from './Favourites'
import { FaGithub } from 'react-icons/fa'
import {MdOutlineMenu} from 'react-icons/md'
import Image from 'next/image'
import Link from 'next/link'
import Profile from './Profile'
import { useDispatch } from 'react-redux'
import Playlists from './Playlists'
import { setProgress } from '@/redux/features/loadingBarSlice'


const Sidebar = ({showNav, setShowNav}) => {
  const dispatch = useDispatch()
  return (
    <div className={`${showNav ? '':'translate-x-[-100%]' } transition-all duration-200  h-screen lg:w-[300px] md:w-[250px] w-[65vw] fixed top-0 left-0 z-40 bg-[#020813] flex flex-col justify-between`}>
    <div>
    <div className=' flex mt-3'>
      <MdOutlineMenu onClick={()=>setShowNav(false)} className=' mx-4 text-2xl lg:text-3xl my-auto text-white cursor-pointer' />
      <div className=' flex justify-center items-center'>
      <Link href='/'>
      <div className='flex items-center justify-center'>
                <img onClick={() => { dispatch(setProgress(100)) }}
                src='/images/logo.png' alt="logo" className=' lg:py-2  w-[50px] h-[60px]' />
                <h1 className='mx-3 text-xl'>BeatBuster</h1>
              </div>
      </Link>
      </div>
      </div>
      <div className=' mt-7 pb-7 border-b border-gray-400 w-[95%]'>
        <Profile setShowNav={setShowNav}/>
        </div>
      <div className=' mt-7 border-b border-gray-400 w-[95%]'>
        <Languages/>
      </div>
     <Favourites setShowNav={setShowNav} />
     <div className=' mt-7 border-b border-gray-400 w-[95%]'>
      <Playlists setShowNav={setShowNav}/>
      </div>
     </div>
     
    </div>
  )
}

export default Sidebar