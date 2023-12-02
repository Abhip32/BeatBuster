'use client'
import React from 'react'
import Image from 'next/image'
import Searchbar from './Searchbar'
import Link from 'next/link'
import { useDispatch } from 'react-redux'
import { setProgress } from '@/redux/features/loadingBarSlice'
import { MdOutlineMenu } from 'react-icons/md'
import { IoClose } from 'react-icons/io5'
import Sidebar from './Sidebar/Sidebar'


const Navbar = () => {
  const dispatch = useDispatch();
  const [showNav, setShowNav] = React.useState(false);
  return (
    <>
      <div className='bg-[#020813] h-[70px] text-white flex justify-between relative'>
        <div className=' flex'>
          <MdOutlineMenu onClick={
            () => setShowNav(true)
          } className=' mx-4 text-2xl lg:text-3xl my-auto cursor-pointer' />
          <div className=' flex justify-center items-center gap-5'>
            <Link href='/'>
              <div className='flex items-center justify-center'>
                <img onClick={() => { dispatch(setProgress(100)) }}
                src='/images/logo.png' alt="logo" className=' lg:py-2  w-[40px]' />
              </div>
            </Link>
            <h1 className='sm:text-sm lg:text-lg' style={{fontFamily: "'Dancing Script', cursive", fontWeight: 'bold', fontVariant: 'small-caps', textAlign: 'center', color: 'rgb(255, 255, 255)', textShadow: 'rgb(0, 0, 0) 3px 8px 7px'}}>BeatBuster</h1>
          </div>
        </div>
        <Searchbar />
      </div>

      <Sidebar showNav={showNav} setShowNav={setShowNav} />
      {/* overlay */}
      <div onClick={() => setShowNav(false)}
        className={`${showNav ? '' : 'hidden'} transition-all duration-200 fixed top-0 left-0 z-30 w-screen h-screen bg-black bg-opacity-50`}></div>
      <div onClick={
        () => setShowNav(false)
      } className={`${showNav ? '' : 'hidden'} md:hidden fixed top-7 right-10 z-50 text-3xl text-white`}>
        <IoClose />
      </div>
    </>
  )
}

export default Navbar