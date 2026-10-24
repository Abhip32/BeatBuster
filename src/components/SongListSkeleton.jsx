import React from "react";
import TracklistSkeleton from "./Skeletons/TracklistSkeleton";

const SongListSkeleton = ({ count = 8 }) => {
  return <TracklistSkeleton count={count} />;
};

export default SongListSkeleton;
