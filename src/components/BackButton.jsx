"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { IoArrowBack } from "react-icons/io5";

const BackButton = ({
  className = "",
  fallbackHref = "/",
  iconOnly = false,
  label = "Back",
}) => {
  const router = useRouter();

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  };

  if (iconOnly) {
    return (
      <button
        type="button"
        onClick={handleBack}
        title="Go back"
        aria-label="Go back"
        className={`group w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/40 hover:bg-black/75 backdrop-blur-md border border-white/15 hover:border-white/35 text-white flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-md ${className}`}
      >
        <IoArrowBack
          size={17}
          className="group-hover:-translate-x-0.5 transition-transform text-white group-hover:text-rose-400"
        />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleBack}
      className={`group inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.14] border border-white/10 hover:border-rose-500/40 text-gray-300 hover:text-white text-xs sm:text-sm font-semibold transition-all cursor-pointer active:scale-95 backdrop-blur-md shadow-sm ${className}`}
      title="Go back"
    >
      <IoArrowBack className="text-base sm:text-lg group-hover:-translate-x-0.5 transition-transform text-[#f43f5e]" />
      <span>{label}</span>
    </button>
  );
};

export default BackButton;
