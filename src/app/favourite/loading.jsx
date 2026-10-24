import React from "react";
import PlaylistSkeleton from "@/components/Skeletons/PlaylistSkeleton";

export default function Loading() {
  return <PlaylistSkeleton type="Liked Songs" count={8} />;
}
