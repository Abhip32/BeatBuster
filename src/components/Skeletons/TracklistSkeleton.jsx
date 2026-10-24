import React from "react";

const TracklistSkeleton = ({ count = 8 }) => {
  return (
    <div className="w-full flex flex-col gap-2 mt-4">
      {/* Table Header Placeholder */}
      <div className="hidden sm:grid grid-cols-12 gap-4 px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-white/[0.06]">
        <div className="col-span-1 text-center">#</div>
        <div className="col-span-6 md:col-span-5">Title</div>
        <div className="hidden md:block md:col-span-4">Album</div>
        <div className="col-span-5 md:col-span-2 text-right">Time</div>
      </div>

      {/* Row Shimmers */}
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="grid grid-cols-12 gap-4 items-center px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"
        >
          {/* Index / Number */}
          <div className="col-span-1 hidden sm:flex justify-center">
            <div className="w-4 h-4 rounded shimmer" />
          </div>

          {/* Title + Thumbnail + Artist */}
          <div className="col-span-10 sm:col-span-5 md:col-span-5 flex items-center gap-3.5 min-w-0">
            <div className="w-12 h-12 rounded-lg flex-shrink-0 shimmer" />
            <div className="flex flex-col gap-2 min-w-0 flex-1">
              <div
                className="h-4 rounded-md shimmer"
                style={{ width: `${Math.floor(55 + (idx % 4) * 12)}%` }}
              />
              <div
                className="h-3 rounded-md shimmer-dark"
                style={{ width: `${Math.floor(35 + (idx % 3) * 10)}%` }}
              />
            </div>
          </div>

          {/* Album */}
          <div className="hidden md:flex md:col-span-4 items-center">
            <div
              className="h-3.5 rounded-md shimmer-dark"
              style={{ width: `${Math.floor(40 + (idx % 3) * 15)}%` }}
            />
          </div>

          {/* Duration */}
          <div className="col-span-2 sm:col-span-6 md:col-span-2 flex items-center justify-end gap-3">
            <div className="w-10 h-3.5 rounded shimmer" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default TracklistSkeleton;
