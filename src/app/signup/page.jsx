'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { setProgress } from '@/redux/features/loadingBarSlice';
import { toast } from 'react-hot-toast';
import { FcGoogle } from 'react-icons/fc';
import { HiOutlineUser, HiOutlineMail, HiOutlineLockClosed } from 'react-icons/hi';
import { hashClientPassword } from '@/utils/crypto';

const SignUpPage = () => {
    const { status } = useSession();
    const router = useRouter();
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        userName: '',
        email: '',
        password: ''
    });

    const onChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            dispatch(setProgress(70));
            const secureHashedPassword = await hashClientPassword(formData.password);
            const res = await fetch('/api/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userName: formData.userName,
                    email: formData.email,
                    password: secureHashedPassword,
                    imageUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(formData.userName || 'user')}`,
                })
            });
            const data = await res.json();
            if (data.success === true) {
                toast.success('Account created! Logging in...');
                const loginRes = await signIn('credentials', {
                    redirect: false,
                    email: formData.email,
                    password: secureHashedPassword,
                });
                if (!loginRes?.error) {
                    router.push('/');
                } else {
                    router.push('/login');
                }
            } else {
                toast.error(data?.message || 'Could not create account');
            }
        } catch (error) {
            toast.error(error?.message || 'Failed to sign up');
        } finally {
            setLoading(false);
            dispatch(setProgress(100));
        }
    };

    if (status === 'loading') {
        return (
            <div className="w-full min-h-[60vh] flex justify-center items-center">
                <div className="w-8 h-8 border-3 border-[#ec4899] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (status === 'authenticated') {
        redirect('/');
    }

    return (
        <div className="min-h-[75vh] flex items-center justify-center px-4 py-4">
            <div className="w-full max-w-[390px] bg-[#120f1e]/85 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 sm:p-7 shadow-2xl relative overflow-hidden">
                {/* Purple ambient glow */}
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#ec4899]/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-[#ec4899]/15 rounded-full blur-3xl pointer-events-none" />

                {/* Header */}
                <div className="text-center mb-4 relative z-10">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/5 border border-white/10 shadow-[0_0_20px_rgba(168,85,247,0.35)] mb-2">
                        <img src="/images/logo.png" alt="Musify" className="w-9 h-9 object-contain" />
                    </div>
                    <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                        Sign up for Musify
                    </h1>
                    <p className="text-neutral-400 text-xs mt-0.5">
                        Free unlimited streaming and lossless downloads
                    </p>
                </div>

                {/* Google Sign In */}
                <div className="relative z-10 mb-3">
                    <button
                        onClick={() => signIn('google')}
                        type="button"
                        className="w-full py-2.5 px-4 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 text-white font-medium text-xs flex items-center justify-center gap-2.5 transition-all hover:border-white/30 hover:scale-[1.01] active:scale-[0.99]"
                    >
                        <FcGoogle size={18} />
                        <span>Sign up with Google</span>
                    </button>
                </div>

                {/* Divider */}
                <div className="flex items-center my-3 relative z-10">
                    <div className="flex-1 border-t border-white/10"></div>
                    <span className="px-3 text-[11px] uppercase tracking-wider text-neutral-400 font-semibold">or</span>
                    <div className="flex-1 border-t border-white/10"></div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-3 relative z-10">
                    <div>
                        <label className="block text-[11px] font-semibold text-neutral-300 uppercase tracking-wider mb-1" htmlFor="userName">
                            Profile Name
                        </label>
                        <div className="relative">
                            <HiOutlineUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" size={17} />
                            <input
                                id="userName"
                                name="userName"
                                type="text"
                                value={formData.userName}
                                onChange={onChange}
                                placeholder="Enter your name"
                                required
                                className="w-full pl-10 pr-3.5 py-2.5 rounded-full bg-white/5 border border-white/10 focus:border-[#ec4899] focus:bg-white/10 text-white placeholder-neutral-500 text-xs outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[11px] font-semibold text-neutral-300 uppercase tracking-wider mb-1" htmlFor="email">
                            Email address
                        </label>
                        <div className="relative">
                            <HiOutlineMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" size={17} />
                            <input
                                id="email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={onChange}
                                placeholder="name@domain.com"
                                required
                                className="w-full pl-10 pr-3.5 py-2.5 rounded-full bg-white/5 border border-white/10 focus:border-[#ec4899] focus:bg-white/10 text-white placeholder-neutral-500 text-xs outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[11px] font-semibold text-neutral-300 uppercase tracking-wider mb-1" htmlFor="password">
                            Password
                        </label>
                        <div className="relative">
                            <HiOutlineLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" size={17} />
                            <input
                                id="password"
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={onChange}
                                placeholder="Create a password"
                                required
                                className="w-full pl-10 pr-3.5 py-2.5 rounded-full bg-white/5 border border-white/10 focus:border-[#ec4899] focus:bg-white/10 text-white placeholder-neutral-500 text-xs outline-none transition-all"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-1 py-2.5 px-4 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-bold text-xs tracking-wide transition-all transform hover:scale-[1.01] active:scale-[0.98] shadow-lg shadow-purple-500/30 disabled:opacity-50 cursor-pointer"
                    >
                        {loading ? 'Creating account...' : 'Create Account'}
                    </button>
                </form>

                {/* Footer link */}
                <div className="mt-4 text-center text-xs text-neutral-400 relative z-10">
                    Already have an account?{' '}
                    <Link href="/login" className="text-white font-semibold hover:text-purple-400 underline transition-colors">
                        Log in
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default SignUpPage;
