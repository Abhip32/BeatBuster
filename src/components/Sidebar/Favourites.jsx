import Link from 'next/link'
import React from 'react'
import { AiFillHeart } from 'react-icons/ai'


const Favourites = ({setShowNav}) => {
  return (
    <div className=' mt-7 w-[95%] '>
    <Link href='/favourite' className='flex cursor-pointer items-center' onClick={()=>setShowNav(false)}>
    <AiFillHeart title='Favourites' size={30} color={'pink'} className={` mb-7 `} />
    <p className=' font-semibold text-2xl text-white mx-3 mb-7'>Favourites</p>

    </Link>
    </div>
  )
}

export default Favourites