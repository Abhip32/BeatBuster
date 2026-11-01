"use client";
import React, { useEffect, useState, useRef } from "react";
import { FiSearch } from "react-icons/fi";
import { IoClose } from "react-icons/io5";
import { MdHistory } from "react-icons/md";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { setIsTyping } from "@/redux/features/loadingBarSlice";

const Searchbar = ({ mobileSearchOpen, setMobileSearchOpen }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [recentSearches, setRecentSearches] = useState([]);
  const [showRecentDropdown, setShowRecentDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("recentSearches");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setRecentSearches(parsed.slice(0, 8));
        }
      }
    } catch {}
  }, []);

  const saveRecentSearch = (term) => {
    try {
      const updated = [
        term,
        ...recentSearches.filter((s) => s.toLowerCase() !== term.toLowerCase()),
      ].slice(0, 8);
      setRecentSearches(updated);
      localStorage.setItem("recentSearches", JSON.stringify(updated));
    } catch {}
  };

  const handleClearRecent = (e) => {
    e?.stopPropagation();
    setRecentSearches([]);
    try {
      localStorage.removeItem("recentSearches");
    } catch {}
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    const trimmed = searchTerm.trim();
    if (!trimmed) return;
    saveRecentSearch(trimmed);
    setShowRecentDropdown(false);
    if (mobileSearchOpen) setMobileSearchOpen(false);
    handleBlur();
    router.push(`/search/${encodeURIComponent(trimmed)}`);
  };

  const handleSelectRecent = (term) => {
    setSearchTerm(term);
    saveRecentSearch(term);
    setShowRecentDropdown(false);
    if (mobileSearchOpen) setMobileSearchOpen(false);
    handleBlur();
    router.push(`/search/${encodeURIComponent(term)}`);
  };

  const handleFocus = () => {
    dispatch(setIsTyping(true));
    setShowRecentDropdown(true);
  };

  const handleBlur = () => {
    dispatch(setIsTyping(false));
    // Delay hiding dropdown slightly so click events on pills register
    setTimeout(() => {
      setShowRecentDropdown(false);
    }, 200);
  };

  useEffect(() => {
    if (!mobileSearchOpen) {
      setSearchTerm("");
      setShowRecentDropdown(false);
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
        className={`mr-2 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/5 border border-white/10 text-white transition-all hover:bg-white/10 hover:border-[#f43f5e] hover:text-[#f43f5e] md:hidden ${
          mobileSearchOpen ? "hidden" : ""
        }`}
        aria-label="Open search"
      >
        <FiSearch className="h-4 w-4" />
      </button>

      <form
        onSubmit={handleSubmit}
        autoComplete="off"
        className={`relative text-gray-400 transition-all duration-300 focus-within:text-white ${
          mobileSearchOpen
            ? "fixed inset-x-0 top-0 z-50 flex h-[70px] w-screen items-center bg-[#121215]/95 backdrop-blur-2xl px-4 md:static md:z-auto md:h-auto md:w-auto md:bg-transparent md:px-0"
            : "hidden md:ml-auto md:flex md:items-center md:px-2 md:w-auto"
        }`}
      >
        <div
          className={`flex items-center transition-all duration-300 ${
            mobileSearchOpen
              ? "w-full gap-3 rounded-full border border-white/15 bg-white/10 backdrop-blur-md px-4 py-2.5 focus-within:border-[#f43f5e] focus-within:ring-2 focus-within:ring-[#f43f5e]/20"
              : "gap-2.5 rounded-full border border-white/10 bg-[#242428]/70 backdrop-blur-md px-4 py-2 md:w-[15rem] lg:w-[18rem] focus-within:w-[18rem] lg:focus-within:w-[22rem] hover:bg-[#2a2a30]/80 hover:border-white/20 focus-within:border-[#f43f5e] focus-within:ring-2 focus-within:ring-[#f43f5e]/25 shadow-inner"
          }`}
        >
          <FiSearch
            aria-hidden="true"
            className="h-4 w-4 text-gray-400 group-hover:text-white transition-colors cursor-pointer"
            onClick={handleSubmit}
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
              if (e.key === "Escape") {
                setShowRecentDropdown(false);
                if (mobileSearchOpen) closeMobileSearch();
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

        {/* Recent Searches Dropdown (Shown on focus when input is empty & history exists) */}
        {showRecentDropdown && !searchTerm.trim() && recentSearches.length > 0 && (
          <div
            ref={dropdownRef}
            className={`absolute z-50 rounded-2xl bg-[#18181f]/95 backdrop-blur-2xl border border-white/10 shadow-2xl p-3 text-white ${
              mobileSearchOpen
                ? "top-[72px] left-4 right-4"
                : "top-12 left-2 right-2 w-[calc(100%-16px)]"
            }`}
          >
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10 text-xs">
              <span className="font-bold text-gray-400 flex items-center gap-1.5">
                <MdHistory size={15} className="text-rose-400" />
                <span>Recent Searches</span>
              </span>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={handleClearRecent}
                className="text-[11px] font-semibold text-rose-400 hover:text-rose-300 hover:underline cursor-pointer"
              >
                Clear
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {recentSearches.map((term, i) => (
                <button
                  key={`${term}-${i}`}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSelectRecent(term)}
                  className="px-3 py-1 rounded-full bg-white/[0.06] hover:bg-rose-500/20 text-xs text-gray-300 hover:text-rose-300 border border-white/10 hover:border-rose-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <MdHistory size={12} className="text-gray-400" />
                  <span>{term}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </form>
    </>
  );
};

export default Searchbar;
