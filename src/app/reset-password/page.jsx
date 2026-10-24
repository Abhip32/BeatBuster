'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useDispatch } from 'react-redux';
import { setProgress } from '@/redux/features/loadingBarSlice';
import { sendResetPasswordLink } from '@/services/dataAPI';
import { toast } from 'react-hot-toast';
import { HiOutlineMail } from 'react-icons/hi';
import { IoChevronBack } from 'react-icons/io5';

const ForgotPasswordPage = () => {
    const dispatch = useDispatch();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            dispatch(setProgress(70));
            const res = await sendResetPasswordLink(email);
            if (res?.success === true) {
                toast.success('Reset link sent to your email');
                setSubmitted(true);
            } else {
                toast.error(res?.message || 'Failed to send reset link');
            }
        } catch (error) {
            toast.error(error?.message || 'Something went wrong');
        } finally {
            setLoading(false);
            dispatch(setProgress(100));
        }
    };

    return (
        <div className="min-h-[75vh] flex items-center justify-center px-4 py-4">
            <div className="w-full max-w-[390px] bg-[#120f1e]/85 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 sm:p-7 shadow-2xl relative overflow-hidden">
                <div className="absolute -top-20 -left-20 w-40 h-40 bg-[#a855f7]/20 rounded-full blur-3xl pointer-events-none" />

                <div className="mb-3">
                    <Link
                        href="/login"
                        className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors"
                    >
                        <IoChevronBack size={14} /> Back to Login
                    </Link>
                </div>

                <div className="text-center mb-4 relative z-10">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/5 border border-white/10 shadow-[0_0_20px_rgba(168,85,247,0.35)] mb-2">
                        <img src="/images/logo.png" alt="Musify" className="w-9 h-9 object-contain" />
                    </div>
                    <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mb-1">
                        Reset password
                    </h1>
                    <p className="text-neutral-400 text-xs">
                        Enter your email to receive a password recovery link
                    </p>
                </div>

                {submitted ? (
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center space-y-3">
                        <div className="w-10 h-10 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center mx-auto text-xl">
                            ✓
                        </div>
                        <h2 className="text-white font-bold text-sm">Check your inbox</h2>
                        <p className="text-neutral-400 text-xs">
                            We've sent a reset link to <strong className="text-white">{email}</strong>.
                        </p>
                        <button
                            onClick={() => setSubmitted(false)}
                            className="text-xs text-purple-400 hover:underline block mx-auto pt-1 cursor-pointer"
                        >
                            Try another email
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-3 relative z-10">
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
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@domain.com"
                                    required
                                    className="w-full pl-10 pr-3.5 py-2.5 rounded-full bg-white/5 border border-white/10 focus:border-[#a855f7] focus:bg-white/10 text-white placeholder-neutral-500 text-xs outline-none transition-all"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2.5 px-4 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-bold text-xs tracking-wide transition-all transform hover:scale-[1.01] active:scale-[0.98] shadow-lg shadow-purple-500/30 disabled:opacity-50 cursor-pointer"
                        >
                            {loading ? 'Sending link...' : 'Send Reset Link'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
