import React from "react";
import TracklistSkeleton from "./TracklistSkeleton";

const SearchSkeleton = () => {
  return (
    <div className="w-11/12 max-w-7xl mx-auto mt-8 mb-20 animate-fade-in">
      {/* Search Header Shimmer */}
      <div className="mb-8">
        <div className="w-24 h-4 rounded-md shimmer mb-2" />
        <div className="h-10 w-72 rounded-xl shimmer" />
      </div>

      {/* Songs Section Shimmer */}
      <div className="mt-8">
        <div className="h-7 w-28 rounded-md shimmer mb-4" />
        <TracklistSkeleton count={6} />
      </div>

      {/* Albums Carousel Shimmer */}
      <div className="mt-12">
        <div className="h-7 w-32 rounded-md shimmer mb-5" />
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-36 sm:w-44 p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex flex-col gap-3"
            >
              <div className="w-full aspect-square rounded-xl shimmer" />
              <div className="h-4 w-3/4 rounded shimmer" />
              <div className="h-3 w-1/2 rounded shimmer-dark" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchSkeleton;
