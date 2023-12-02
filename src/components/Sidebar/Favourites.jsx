import Link from 'next/link'
import React from 'react'
import { AiFillHeart } from 'react-icons/ai'


const Favourites = ({setShowNav}) => {
  return (
    <div className=' mt-1 bg-white/5 bg-opacity-80 backdrop-blur-sm rounded-lg cursor-pointer'>
    <Link href='/favourite' className='flex items-center' onClick={()=>setShowNav(false)}>
    <AiFillHeart title='Favourites' color={'white'} className={` bg-gradient-to-br from-pink-500 to-black p-4 w-[80px] h-[80px]`} />
    <p className=' font-semibold sm:text-xs lg:text-xl text-white mx-3'>Favourites</p>

    </Link>
    </div>
  )
}

export default Favourites