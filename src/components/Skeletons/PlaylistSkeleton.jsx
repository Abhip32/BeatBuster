import React from "react";
import MediaHeaderSkeleton from "./MediaHeaderSkeleton";
import TracklistSkeleton from "./TracklistSkeleton";

const PlaylistSkeleton = ({ count = 8, type = "playlist" }) => {
  return (
    <div className="w-11/12 max-w-7xl mx-auto mt-8 mb-20 animate-fade-in">
      <MediaHeaderSkeleton type={type} />
      <div className="mt-10">
        <div className="h-7 w-32 rounded-md shimmer mb-4" />
        <TracklistSkeleton count={count} />
      </div>
    </div>
  );
};

export default PlaylistSkeleton;
