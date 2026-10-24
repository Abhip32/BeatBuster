import React from "react";

const MediaHeaderSkeleton = ({ type = "playlist", isCircle = false }) => {
  return (
    <div className="relative rounded-3xl p-6 sm:p-8 lg:p-10 bg-gradient-to-b from-white/[0.08] to-white/[0.02] backdrop-blur-2xl border border-white/10 shadow-2xl flex flex-col md:flex-row items-center md:items-end gap-6 lg:gap-10">
      {/* Cover Image Shimmer */}
      <div
        className={`relative w-48 h-48 sm:w-56 sm:h-56 lg:w-64 lg:h-64 flex-shrink-0 shadow-2xl shimmer ${
          isCircle ? "rounded-full border-2 border-white/10" : "rounded-2xl"
        }`}
      />

      {/* Info Shimmer */}
      <div className="flex flex-col text-center md:text-left min-w-0 flex-1 w-full items-center md:items-start">
        {/* Type pill */}
        <div className="w-16 h-4 rounded-md shimmer mb-2" />

        {/* Big Title */}
        <div className="h-10 sm:h-12 w-3/4 max-w-md rounded-lg shimmer mb-3" />

        {/* Subtitle / Artist lines */}
        <div className="h-4 w-1/2 max-w-xs rounded-md shimmer-dark mb-2" />
        <div className="h-3.5 w-1/3 max-w-[200px] rounded-md shimmer-dark mb-4" />

        {/* Meta badges & Play button */}
        <div className="flex items-center gap-4 mt-2">
          <div className="w-12 h-12 rounded-full shimmer" />
          <div className="w-24 h-4 rounded-md shimmer-dark" />
        </div>
      </div>
    </div>
  );
};

export default MediaHeaderSkeleton;
