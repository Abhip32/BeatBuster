import React from "react";

const HomeSkeleton = () => {
  return (
    <div className="w-11/12 max-w-7xl mx-auto pt-6 pb-12 animate-fade-in">
      {/* Spotify Header Salutation Banner Shimmer */}
      <div className="flex items-center justify-between mb-8 pb-2 border-b border-white/[0.06]">
        <div className="flex flex-col gap-2">
          <div className="h-10 sm:h-12 w-64 sm:w-80 rounded-xl shimmer" />
          <div className="h-4 w-72 rounded-md shimmer-dark" />
        </div>
        <div className="w-32 h-8 rounded-full shimmer hidden sm:block" />
      </div>

      {/* Quick Access / Listen Again Grid Shimmer */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-10">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 h-16 rounded-xl bg-white/[0.03] border border-white/[0.05] p-2"
          >
            <div className="w-12 h-12 rounded-lg shimmer flex-shrink-0" />
            <div className="h-4 w-28 rounded shimmer-dark" />
          </div>
        ))}
      </div>

      {/* Trending Songs Carousel Shimmer */}
      <div className="mb-10">
        <div className="flex justify-between items-center mb-4">
          <div className="h-7 w-44 rounded-lg shimmer" />
          <div className="h-4 w-16 rounded shimmer-dark" />
        </div>
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

      {/* Trending Albums Carousel Shimmer */}
      <div className="mb-10">
        <div className="flex justify-between items-center mb-4">
          <div className="h-7 w-44 rounded-lg shimmer" />
          <div className="h-4 w-16 rounded shimmer-dark" />
        </div>
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

      {/* Top Charts 2-Column Grid Shimmer */}
      <div className="my-8 lg:my-14">
        <div className="flex items-center justify-between mb-5">
          <div className="h-7 w-36 rounded-lg shimmer" />
          <div className="h-4 w-24 rounded shimmer-dark" />
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.025] border border-white/[0.05]"
            >
              <div className="w-14 h-14 rounded-lg shimmer flex-shrink-0" />
              <div className="flex flex-col gap-2 flex-1 min-w-0">
                <div className="h-4 w-3/5 rounded shimmer" />
                <div className="h-3 w-2/5 rounded shimmer-dark" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* New Releases Carousel Shimmer */}
      <div className="mb-10">
        <div className="h-7 w-40 rounded-lg shimmer mb-4" />
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

export default HomeSkeleton;
