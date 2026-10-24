import React from "react";

const AuthSkeleton = () => {
  return (
    <div className="min-h-[calc(100vh-160px)] flex items-center justify-center py-6 px-4">
      <div className="w-full max-w-[390px] rounded-2xl p-6 sm:p-7 bg-white/[0.04] backdrop-blur-2xl border border-white/10 shadow-2xl flex flex-col items-center">
        {/* Logo shimmer */}
        <div className="w-12 h-12 rounded-full shimmer mb-3" />
        {/* Title shimmer */}
        <div className="h-6 w-36 rounded-md shimmer mb-2" />
        <div className="h-3.5 w-48 rounded-md shimmer-dark mb-6" />

        {/* Inputs */}
        <div className="w-full flex flex-col gap-3">
          <div className="h-10 w-full rounded-xl shimmer" />
          <div className="h-10 w-full rounded-xl shimmer" />
          <div className="h-10 w-full rounded-xl shimmer mt-2" />
        </div>
      </div>
    </div>
  );
};

export default AuthSkeleton;
