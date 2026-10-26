import React from "react";

const SearchSkeleton = () => {
  return (
    <div className="w-11/12 max-w-7xl mx-auto mt-6 mb-24 animate-fade-in">
      {/* Search Header Shimmer */}
      <div className="mb-6">
        <div className="w-24 h-3.5 rounded shimmer mb-2" />
        <div className="h-9 sm:h-12 w-64 sm:w-80 rounded-xl shimmer" />
      </div>

      {/* Filter Category Pills Shimmer */}
      <div className="flex items-center gap-2.5 mb-8 overflow-hidden">
        <div className="w-16 h-8 rounded-full shimmer" />
        <div className="w-20 h-8 rounded-full shimmer" />
        <div className="w-20 h-8 rounded-full shimmer" />
        <div className="w-20 h-8 rounded-full shimmer" />
        <div className="w-24 h-8 rounded-full shimmer" />
      </div>

      {/* Split Section: Top Result Hero (5 cols) + Top Songs (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mb-12">
        {/* Top Result Hero Card */}
        <div className="lg:col-span-5">
          <div className="h-6 w-28 rounded shimmer mb-4" />
          <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/10 min-h-[220px] flex flex-col justify-between">
            <div className="flex flex-col gap-4">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl shimmer shadow-lg" />
              <div>
                <div className="h-7 w-3/4 rounded shimmer mb-2" />
                <div className="h-4 w-1/3 rounded shimmer" />
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <div className="w-12 h-12 rounded-full shimmer" />
            </div>
          </div>
        </div>

        {/* Songs List (5 rows) */}
        <div className="lg:col-span-7">
          <div className="h-6 w-20 rounded shimmer mb-4" />
          <div className="flex flex-col gap-1.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="p-2 rounded-xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-between"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1 mr-3">
                  <div className="w-11 h-11 rounded-lg shimmer flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="h-4 w-40 rounded shimmer mb-1.5" />
                    <div className="h-3 w-24 rounded shimmer-dark" />
                  </div>
                </div>
                <div className="h-3 w-8 rounded shimmer pr-2" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Artists Shelf Shimmer */}
      <div className="mt-12">
        <div className="h-6 w-24 rounded shimmer mb-4" />
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-28 sm:w-36 flex flex-col items-center p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.04]"
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full shimmer mb-3" />
              <div className="h-4 w-16 rounded shimmer" />
            </div>
          ))}
        </div>
      </div>

      {/* Albums Carousel Shimmer */}
      <div className="mt-12">
        <div className="h-6 w-24 rounded shimmer mb-4" />
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
