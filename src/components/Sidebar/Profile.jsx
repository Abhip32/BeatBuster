'use client'
import React from 'react'
import { signOut, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation';
import { getUserInfo } from '@/services/dataAPI';
import { MdLogout } from 'react-icons/md';
import { useState } from 'react';
import { useEffect } from 'react';


const Profile = ({setShowNav}) => {
    const router = useRouter();
    const {status, data} = useSession();

    
    const [user, setUser] = useState(null);
    useEffect(() => {
        const fetchUser = async () => {
            const res = await getUserInfo();
            // console.log('user',res);
            setUser(res);
        }
        fetchUser();
    }, [status]);
  return (
    <div className=' text-white'>
        {
        status === 'loading' ? <div className=' ml-16'> <span className="loading"></span> </div> :
            <div>
                {
                    status === 'unauthenticated' ? 
                    (
                        <div className=' flex gap-2'>
                            <button onClick={()=>{
                                setShowNav(false);
                                router.push('/login');
                            }} className=' border-2 rounded-lg  m-2 text-md  border-[#e0c3fc] hover:text-black hover:bg-white rounded-2xl px-6 py-3 shadow-md shadow-[#e0c3fc]'>
                            Login&nbsp;
                            </button>
                            <button onClick={()=>{
                                setShowNav(false);
                                router.push('/signup');
                            }} className=' border-2 rounded-lg m-2 text-md  border-[#e0c3fc] hover:text-black hover:bg-white rounded-2xl px-6 py-3 shadow-md shadow-[#e0c3fc]'>
                            Signup
                            </button>
                        </div>
                    ):
                    (
                        <div className=' flex gap-4 ml-1'>
                            <img src={data?.imageUrl || user?.imageUrl} alt='user' width={50} height={50} className='rounded-full' />
                            <div className='flex flex-col gap-1 w-full truncate'>
                                <div className='flex justify-between items-center'>
                            <h1 className='text-lg font-semibold'>{data?.userName || user?.userName}</h1>
                            <MdLogout size={20} onClick={()=>{
                                setShowNav(false);
                                signOut();
                            }} className='cursor-pointer text-white hover:text-[#e0c3fc]' />
                            </div>
                            <h2 className='text-[10px] truncate'>{data?.user?.email || user?.email }</h2>
                            </div>
                        </div>
                    )
                }
            </div>
        }
    </div>
  )
}

export default Profile