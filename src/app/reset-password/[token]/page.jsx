'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { setProgress } from '@/redux/features/loadingBarSlice';
import { resetPassword } from '@/services/dataAPI';
import { toast } from 'react-hot-toast';
import { HiOutlineLockClosed } from 'react-icons/hi';
import { hashClientPassword } from '@/utils/crypto';

const ResetPasswordTokenPage = () => {
    const params = useParams();
    const router = useRouter();
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: ''
    });

    const token = params?.token;

    const onChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }
        if (formData.password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        try {
            dispatch(setProgress(70));
            const secureHashedPassword = await hashClientPassword(formData.password);
            const res = await resetPassword(secureHashedPassword, secureHashedPassword, token);
            if (res?.success === true) {
                toast.success('Password reset successfully! Please log in.');
                router.push('/login');
            } else {
                toast.error(res?.message || 'Invalid or expired token');
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
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#a855f7]/20 rounded-full blur-3xl pointer-events-none" />

                <div className="text-center mb-4 relative z-10">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/5 border border-white/10 shadow-[0_0_20px_rgba(168,85,247,0.35)] mb-2">
                        <img src="/images/logo.png" alt="Musify" className="w-9 h-9 object-contain" />
                    </div>
                    <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mb-1">
                        New password
                    </h1>
                    <p className="text-neutral-400 text-xs">
                        Enter a strong password (minimum 6 characters)
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3 relative z-10">
                    <div>
                        <label className="block text-[11px] font-semibold text-neutral-300 uppercase tracking-wider mb-1" htmlFor="password">
                            New Password
                        </label>
                        <div className="relative">
                            <HiOutlineLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" size={17} />
                            <input
                                id="password"
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={onChange}
                                placeholder="Enter new password"
                                required
                                className="w-full pl-10 pr-3.5 py-2.5 rounded-full bg-white/5 border border-white/10 focus:border-[#a855f7] focus:bg-white/10 text-white placeholder-neutral-500 text-xs outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[11px] font-semibold text-neutral-300 uppercase tracking-wider mb-1" htmlFor="confirmPassword">
                            Confirm Password
                        </label>
                        <div className="relative">
                            <HiOutlineLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" size={17} />
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                value={formData.confirmPassword}
                                onChange={onChange}
                                placeholder="Re-enter new password"
                                required
                                className="w-full pl-10 pr-3.5 py-2.5 rounded-full bg-white/5 border border-white/10 focus:border-[#a855f7] focus:bg-white/10 text-white placeholder-neutral-500 text-xs outline-none transition-all"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-1 py-2.5 px-4 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-bold text-xs tracking-wide transition-all transform hover:scale-[1.01] active:scale-[0.98] shadow-lg shadow-purple-500/30 disabled:opacity-50 cursor-pointer"
                    >
                        {loading ? 'Updating password...' : 'Reset Password'}
                    </button>
                </form>

                <div className="mt-4 text-center text-xs text-neutral-400 relative z-10">
                    Remember your password?{' '}
                    <Link href="/login" className="text-white font-semibold hover:text-purple-400 underline transition-colors">
                        Log in
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordTokenPage;
