import Link from "next/link";
import { BsFillPlayFill } from "react-icons/bs";
import { useEffect, useState } from "react";
import getPixels from "get-pixels";
import { extractColors } from "extract-colors";

const SongBar = ({ playlist, i }) => {
  const [cardColor, setCardColor] = useState(null);

  useEffect(() => {
    const src =
      playlist?.image?.[1]?.url ||
      playlist?.image?.[1]?.link ||
      playlist?.image?.[2]?.url ||
      playlist?.image?.[0]?.url;
    if (!src) return;
    try {
      getPixels(src, (err, pixels) => {
        if (!err && pixels?.data) {
          const data = [...pixels.data];
          const width = Math.round(Math.sqrt(data.length / 4));
          const height = width;

          extractColors({ data, width, height })
            .then((colors) => {
              if (colors && colors.length >= 3) {
                setCardColor(colors);
              }
            })
            .catch(() => {});
        }
      });
    } catch {}
  }, [playlist]);

  const bgStyle = cardColor
    ? {
        background: `linear-gradient(90deg, rgba(${cardColor[0].red}, ${cardColor[0].green}, ${cardColor[0].blue}, 0.25) 0%, rgba(${cardColor[1].red}, ${cardColor[1].green}, ${cardColor[1].blue}, 0.15) 50%, rgba(255, 255, 255, 0.03) 100%)`,
      }
    : {};

  return (
    <Link href={`/playlist/${playlist?.id}`}>
      <div
        className="w-full flex items-center group p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] backdrop-blur-md border border-white/[0.06] hover:border-white/20 transition-all duration-300 cursor-pointer mb-2.5 shadow-md"
        style={bgStyle}
      >
        <span className="w-8 text-center text-sm font-bold text-gray-400 group-hover:text-white transition-colors">
          {i + 1}
        </span>
        <div className="flex-1 flex items-center gap-3.5 min-w-0">
          <img
            width={64}
            height={64}
            loading="lazy"
            alt={playlist?.title || playlist?.name || "chart"}
            src={
              playlist?.image?.[1]?.url ||
              playlist?.image?.[1]?.link ||
              playlist?.image?.[2]?.url ||
              playlist?.image?.[0]?.url ||
              ""
            }
            className="w-14 h-14 rounded-xl object-cover shadow-md flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm lg:text-base text-white truncate group-hover:text-[#f43f5e] transition-colors">
              {playlist?.title || playlist?.name}
            </p>
            <p className="text-xs text-[#b3b3b3] mt-0.5 capitalize truncate">
              {playlist?.language || "Top Charts"}
            </p>
          </div>
        </div>
        <div className="w-10 h-10 rounded-full bg-[#f43f5e] text-black flex items-center justify-center opacity-0 group-hover:opacity-100 shadow-lg transform translate-x-1 group-hover:translate-x-0 transition-all duration-300 mr-2">
          <BsFillPlayFill size={20} className="ml-0.5" />
        </div>
      </div>
    </Link>
  );
};

export default SongBar;
