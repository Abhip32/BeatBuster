"use client";
import React, { useState, useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { getUserInfo } from "@/services/dataAPI";
import { MdLogout } from "react-icons/md";
import { FaUserCircle } from "react-icons/fa";

const Profile = ({ setShowNav }) => {
  const router = useRouter();
  const { status, data } = useSession();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await getUserInfo();
        setUser(res);
      } catch {
        setUser(null);
      }
    };
    if (status === "authenticated") {
      fetchUser();
    }
  }, [status]);

  if (status === "loading") {
    return (
      <div className="px-3 py-3 border-b border-white/[0.08] flex items-center gap-3 animate-pulse">
        <div className="w-9 h-9 rounded-full bg-white/10" />
        <div className="h-3 bg-white/10 rounded w-24" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="px-3 py-3 border-b border-white/[0.08] flex items-center gap-2">
        <button
          type="button"
          onClick={() => {
            setShowNav(false);
            router.push("/login");
          }}
          className="flex-1 py-2 px-3 text-xs font-bold rounded-full bg-[#f43f5e] text-black hover:bg-[#fb7185] hover:shadow-[0_0_15px_rgba(244, 63, 94,0.35)] transition-all text-center cursor-pointer"
        >
          Log In
        </button>
        <button
          type="button"
          onClick={() => {
            setShowNav(false);
            router.push("/signup");
          }}
          className="flex-1 py-2 px-3 text-xs font-semibold rounded-full border border-white/20 text-white hover:bg-white/10 transition-all text-center cursor-pointer"
        >
          Sign Up
        </button>
      </div>
    );
  }

  const displayName = user?.userName || data?.user?.name || "Music Lover";
  const displayImage = user?.imageUrl || data?.user?.image;

  return (
    <div className="px-3 py-3 border-b border-white/[0.08] flex items-center justify-between">
      <div className="flex items-center gap-2.5 min-w-0">
        {displayImage ? (
          <img
            src={displayImage}
            alt={displayName}
            className="w-8 h-8 rounded-full object-cover border border-[#f43f5e]/50 shadow-[0_0_10px_rgba(244, 63, 94,0.2)]"
          />
        ) : (
          <FaUserCircle className="w-8 h-8 text-gray-400" />
        )}
        <div className="min-w-0">
          <p className="text-xs font-bold text-white truncate">{displayName}</p>
          <span className="text-[10px] font-semibold text-[#f43f5e] bg-[#f43f5e]/10 px-1.5 py-0.2 rounded border border-[#f43f5e]/30">
            Free Plan
          </span>
        </div>
      </div>
      <button
        type="button"
        onClick={() => {
          signOut();
          setShowNav(false);
        }}
        title="Log out"
        className="p-1.5 rounded-full text-gray-400 hover:text-red-400 hover:bg-white/10 transition-colors"
      >
        <MdLogout size={18} />
      </button>
    </div>
  );
};

export default Profile;
