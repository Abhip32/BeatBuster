import React from "react";

const SongCardSkeleton = () => {
  return (
    <div className="flex gap-4 lg:gap-6 overflow-hidden w-full">
      {Array(6)
        .fill(0)
        .map((_, i) => (
          <div
            key={i}
            className="flex flex-col flex-shrink-0 w-36 sm:w-44 lg:w-[200px] p-3 rounded-2xl bg-white/[0.03] backdrop-blur-md border border-white/[0.06] shadow-lg"
          >
            <div className="w-full aspect-square rounded-xl shimmer mb-3" />
            <div className="h-4 w-4/5 rounded-md shimmer mb-2" />
            <div className="h-3 w-1/2 rounded-md shimmer-dark" />
          </div>
        ))}
    </div>
  );
};

export default SongCardSkeleton;
