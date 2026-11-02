"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { IoArrowBack } from "react-icons/io5";

const BackButton = ({ className = "", fallbackHref = "/", label = "Back" }) => {
  const router = useRouter();

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  };

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
