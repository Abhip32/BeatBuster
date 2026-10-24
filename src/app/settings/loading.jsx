import React from "react";

export default function Loading() {
  return (
    <div className="w-11/12 max-w-4xl mx-auto mt-8 mb-20 animate-fade-in">
      <div className="h-8 w-40 rounded-lg shimmer mb-6" />
      <div className="flex flex-col gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between"
          >
            <div className="flex flex-col gap-2">
              <div className="h-4 w-48 rounded shimmer" />
              <div className="h-3 w-64 rounded shimmer-dark" />
            </div>
            <div className="w-12 h-6 rounded-full shimmer" />
          </div>
        ))}
      </div>
    </div>
  );
}
