"use client";
import React, { useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import {
  FreeMode,
  Navigation,
  Mousewheel,
  Keyboard,
  Virtual,
} from "swiper/modules";
import { MdNavigateNext, MdNavigateBefore } from "react-icons/md";

const SwiperLayout = ({ children, title, action, className = "" }) => {
  const albumNext = useRef(null);
  const albumPrv = useRef(null);

  const renderSlide = (slideData) => {
    return React.Children.map(slideData, (child) => {
      if (React.isValidElement(child) && child.type === SwiperSlide) {
        return child.props.children;
      }
      return null;
    });
  };

  return (
    <div className={`my-6 sm:my-8 ${className}`}>
      {(title || action) && (
        <div className="flex justify-between items-center mb-3 sm:mb-4">
          {title ? (
            <h2 className="text-white text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">
              {title}
            </h2>
          ) : (
            <div />
          )}
          <div className="flex items-center gap-2.5">
            {action}
            <div className="hidden sm:flex items-center gap-1.5">
              <button
                ref={albumPrv}
                type="button"
                aria-label="Previous"
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-white flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95 disabled:opacity-30"
              >
                <MdNavigateBefore size={22} />
              </button>
              <button
                ref={albumNext}
                type="button"
                aria-label="Next"
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-white flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95 disabled:opacity-30"
              >
                <MdNavigateNext size={22} />
              </button>
            </div>
          </div>
        </div>
      )}
      <Swiper
        modules={[Navigation, FreeMode, Mousewheel, Keyboard, Virtual]}
        breakpoints={{
          300: { slidesPerView: 2.2, spaceBetween: 12 },
          480: { slidesPerView: 2.6, spaceBetween: 14 },
          640: { slidesPerView: 3.5, spaceBetween: 16 },
          768: { slidesPerView: 4.2, spaceBetween: 16 },
          1024: { slidesPerView: 5.2, spaceBetween: 18 },
          1280: { slidesPerView: 6.2, spaceBetween: 20 },
        }}
        mousewheel={{
          enabled: true,
          forceToAxis: true,
        }}
        freeMode={true}
        navigation={{
          nextEl: albumNext.current,
          prevEl: albumPrv.current,
        }}
        onInit={(swiper) => {
          swiper.params.navigation.prevEl = albumPrv.current;
          swiper.params.navigation.nextEl = albumNext.current;
          swiper.navigation.init();
          swiper.navigation.update();
        }}
        className="mySwiper !overflow-visible"
      >
        {children}
      </Swiper>
    </div>
  );
};

export default SwiperLayout;
