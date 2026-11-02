"use client";
import React from "react";
import Searchbar from "./Searchbar";
import UpdatesBell from "./UpdatesBell";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { setProgress } from "@/redux/features/loadingBarSlice";
import { MdOutlineMenu } from "react-icons/md";
import { IoClose, IoSettingsOutline, IoChevronBack, IoChevronForward } from "react-icons/io5";
import Sidebar from "./Sidebar/Sidebar";

const Navbar = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [showNav, setShowNav] = React.useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = React.useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 h-[70px] bg-[#101014]/80 backdrop-blur-xl border-b border-white/[0.07] px-4 lg:px-8 flex items-center justify-between transition-all">
        {/* Left: Sidebar toggle, History Navigation & Logo */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => setShowNav(true)}
            aria-label="Open navigation menu"
            className="p-2 -ml-2 rounded-full text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <MdOutlineMenu className="text-2xl lg:text-3xl" />
          </button>

          {/* History Back & Forward Buttons (Desktop & Tablet) */}
          <div className="hidden sm:flex items-center gap-1.5 mr-0.5">
            <button
              type="button"
              onClick={() => router.back()}
              title="Go back"
              aria-label="Go back"
              className="w-8 h-8 rounded-full bg-white/[0.05] hover:bg-white/[0.12] border border-white/10 text-gray-300 hover:text-white flex items-center justify-center transition-all cursor-pointer active:scale-95"
            >
              <IoChevronBack size={16} />
            </button>
            <button
              type="button"
              onClick={() => router.forward()}
              title="Go forward"
              aria-label="Go forward"
              className="w-8 h-8 rounded-full bg-white/[0.05] hover:bg-white/[0.12] border border-white/10 text-gray-300 hover:text-white flex items-center justify-center transition-all cursor-pointer active:scale-95"
            >
              <IoChevronForward size={16} />
            </button>
          </div>

          <Link
            href="/"
            onClick={() => dispatch(setProgress(100))}
            className={`flex items-center gap-2.5 group transition-all duration-300 ${
              mobileSearchOpen ? "hidden md:flex" : "flex"
            }`}
          >
            <img
              src="/images/logo.png"
              alt="Musify Logo"
              className="w-9 h-9 object-contain drop-shadow-[0_0_12px_rgba(244, 63, 94,0.45)] group-hover:scale-105 transition-transform"
            />
            <span className="text-xl font-extrabold tracking-tight text-white group-hover:text-rose-400 transition-colors">
              Musify
            </span>
          </Link>
        </div>

        {/* Center / Right: Search, Updates, Settings */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Searchbar
            mobileSearchOpen={mobileSearchOpen}
            setMobileSearchOpen={setMobileSearchOpen}
          />
          <UpdatesBell mobileSearchOpen={mobileSearchOpen} />
          <Link
            href="/settings"
            aria-label="Settings"
            className="hidden sm:inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/5 border border-white/10 text-white/80 transition-all hover:bg-white/10 hover:border-[#f43f5e] hover:text-[#f43f5e]"
          >
            <IoSettingsOutline className="h-5 w-5" />
          </Link>
        </div>
      </header>

      <Sidebar showNav={showNav} setShowNav={setShowNav} />

      {/* Overlay backdrop */}
      <div
        onClick={() => setShowNav(false)}
        className={`${
          showNav
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        } transition-opacity duration-300 fixed inset-0 z-40 bg-black/70 backdrop-blur-sm`}
      />
    </>
  );
};

export default Navbar;
