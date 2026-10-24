"use client";
import React, { useEffect, useState } from "react";
import { FiSearch } from "react-icons/fi";
import { IoClose } from "react-icons/io5";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { setIsTyping } from "@/redux/features/loadingBarSlice";

const Searchbar = ({ mobileSearchOpen, setMobileSearchOpen }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    router.push(`/search/${encodeURIComponent(searchTerm.trim())}`);
  };

  const handleFocus = () => {
    dispatch(setIsTyping(true));
  };
  const handleBlur = () => {
    dispatch(setIsTyping(false));
  };

  useEffect(() => {
    if (!mobileSearchOpen) {
      setSearchTerm("");
    }
  }, [mobileSearchOpen]);

  const closeMobileSearch = () => {
    setMobileSearchOpen(false);
    handleBlur();
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setMobileSearchOpen(true)}
        className={`mr-2 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/5 border border-white/10 text-white transition-all hover:bg-white/10 hover:border-[#ec4899] hover:text-[#ec4899] md:hidden ${
          mobileSearchOpen ? "hidden" : ""
        }`}
        aria-label="Open search"
      >
        <FiSearch className="h-4 w-4" />
      </button>

      <form
        onSubmit={handleSubmit}
        autoComplete="off"
        className={`text-gray-400 transition-all duration-300 focus-within:text-white ${
          mobileSearchOpen
            ? "fixed inset-x-0 top-0 z-50 flex h-[70px] w-screen items-center bg-[#121215]/95 backdrop-blur-2xl px-4 md:static md:z-auto md:h-auto md:w-auto md:bg-transparent md:px-0"
            : "hidden md:ml-auto md:flex md:items-center md:px-2 md:w-auto"
        }`}
      >
        <div
          className={`flex items-center transition-all duration-300 ${
            mobileSearchOpen
              ? "w-full gap-3 rounded-full border border-white/15 bg-white/10 backdrop-blur-md px-4 py-2.5 focus-within:border-[#ec4899] focus-within:ring-2 focus-within:ring-[#ec4899]/20"
              : "gap-2.5 rounded-full border border-white/10 bg-[#242428]/70 backdrop-blur-md px-4 py-2 md:w-[15rem] lg:w-[18rem] focus-within:w-[18rem] lg:focus-within:w-[22rem] hover:bg-[#2a2a30]/80 hover:border-white/20 focus-within:border-[#ec4899] focus-within:ring-2 focus-within:ring-[#ec4899]/25 shadow-inner"
          }`}
        >
          <FiSearch
            aria-hidden="true"
            className="h-4 w-4 text-gray-400 group-hover:text-white transition-colors"
          />
          <input
            onFocus={handleFocus}
            onBlur={handleBlur}
            name="search-field"
            autoComplete="off"
            id="search-field"
            className="min-w-0 flex-1 bg-transparent outline-none text-sm text-white placeholder-gray-400 font-medium"
            placeholder="What do you want to play?"
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape" && mobileSearchOpen) {
                closeMobileSearch();
              }
            }}
          />

          {mobileSearchOpen && (
            <button
              type="button"
              onClick={closeMobileSearch}
              className="ml-1 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/80 hover:text-white transition-colors md:hidden"
              aria-label="Close search"
            >
              <IoClose className="h-5 w-5" />
            </button>
          )}
        </div>
      </form>
    </>
  );
};

export default Searchbar;
