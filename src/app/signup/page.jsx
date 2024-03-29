'use client'
import { setProgress } from '@/redux/features/loadingBarSlice';
import Link from 'next/link';
import React from 'react'
import { useState } from 'react'
import { toast } from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { FcGoogle } from 'react-icons/fc';



const page = () => {
    const {status} = useSession();
    const router = useRouter();
    const [formData, setFormData] = useState({
        userName: '',
        email: '',
        password: ''
    });
    const onchange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    };
    const dispatch = useDispatch();

    const handelSubmit = async (e) => {
        e.preventDefault();
        try {
            dispatch(setProgress(70));
            const res = await fetch('/api/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userName: formData.userName,
                    email: formData.email,
                    password: formData.password,
                    imageUrl: `https://api.dicebear.com/6.x/thumbs/svg?seed=${formData.userName}`,
                })
            });
            const data = await res.json();
            if (data.success === true) {
                toast.success('Account created successfully');
                router.push('/login');

            } else {
                toast.error(data?.message);
            }
            console.log(data);
            
        } catch (error) {
            toast.error(error?.message);
        }finally{
            dispatch(setProgress(100));
        }
    };

    // redirect if user is authenticated
    if(status === 'loading'){
        return   <div className=' w-screen h-screen flex justify-center items-center'>
                      <span className="loader"></span>
                  </div>
    }
    if(status === 'authenticated'){
        redirect('/');
    }
    return (
        <section class="flex items-stretch text-white ">
        <div class="lg:flex w-1/2 hidden bg-gray-500 bg-no-repeat bg-cover relative items-center" style={{backgroundImage: "url(https://png.pngtree.com/thumb_back/fh260/background/20230612/pngtree-pair-of-headphones-on-the-water-at-nighttime-image_2931863.jpg)"}}>
            <div class="absolute bg-black opacity-60 inset-0 z-0"></div>
            <div class="w-full px-24 z-10">
                <h1 class="text-5xl font-bold text-left tracking-wide">Keep it special</h1>
                <p class="text-3xl my-4">Capture your personal memory in unique way, anywhere.</p>
            </div>
            <div class="bottom-0 absolute p-4 text-center right-0 left-0 flex justify-center space-x-4">
                <span>
                    <svg fill="#fff" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
                </span>
                <span>
                    <svg fill="#fff" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/></svg>
                </span>
                <span>
                    <svg fill="#fff" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </span>
            </div>
        </div>
        <div class="lg:w-1/2 w-full flex items-center justify-center text-center md:px-16 px-0 z-0" style={{backgroundColor: "transparant"}}>

            <div class="w-full py-6 z-20">
                <h1 class="my-6 text-3xl font-bold text-[]#e0c3fc">
                   SIGN UP
                </h1>
              
                <form action="" class="sm:w-2/3 w-full px-4 lg:px-0 mx-auto"  onSubmit={handelSubmit} >
                    <div class="pb-2 pt-4">
                    <input onChange={onchange} value={formData.userName} type="text" placeholder="Name" required id='userName' name='userName' class="block w-full p-5 text-lg rounded-full bg-black" />
                    </div>

                    <div class="pb-2 pt-4">
                    <input onChange={onchange} value={formData.email} name='email' type="email" placeholder="Email" required class="block w-full p-5 text-lg rounded-full bg-black"/>
                    </div>

                    <div class="pb-2 pt-4">
                    <input onChange={onchange} value={formData.password} name='password' type="password" placeholder="Password" required class="block w-full p-5 text-lg rounded-full bg-black" />
                    </div>
                   
                    <div class="px-4 pb-2 pt-4">
                        <button class="uppercase block w-full p-4 text-md rounded-full bg-[#e0c3fc] hover:bg-[#e0c3fc] focus:outline-none text-black">sign up</button>
                    </div>

                    <p class="text-gray-100">
                    OR
                </p>

                    <div class="px-4 pb-2 pt-4">
                    <button
                        onClick={() => signIn('google')}
                        type='button'
                        className="uppercase block w-full p-4 text-md rounded-10 flex items-center gap-1 hover:border-[#e0c3fc] justify-center px-4 py-2 group font-medium border-2 border-white rounded-sm bg-white text-black text-md"
                        >
                        <FcGoogle className="text-[#4285F4] group-hover:text-[#e0c3fc]" size={30}/>
                        Continue with Google
                        </button>
                        <p className=" w-full flex justify-center gap-2 mt-2">
                            Already have an account? <Link href={'/login'} className=' text-purple-400 font-semibold'> Login</Link>
                        </p>
 
                </div>


                   
                </form>
            </div>
        </div>
    </section>
    )
}

export default page