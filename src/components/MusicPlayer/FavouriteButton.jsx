import React from "react";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";

const FavouriteButton = ({
  favouriteSongs,
  activeSong,
  handleAddToFavourite,
  style = "",
  size = 25,
}) => {
  // If no song selected or active song is empty, hide the like button completely
  if (!activeSong || !activeSong.id) {
    return null;
  }

  const isFav = Boolean(
    Array.isArray(favouriteSongs) &&
      favouriteSongs.some((item) => {
        const itemId = String(typeof item === "object" ? item?.id : item);
        const songId = String(activeSong.id || "");
        if (songId && itemId === songId) return true;
        if (typeof item === "object" && item?.name && activeSong?.name) {
          return item.name.trim().toLowerCase() === activeSong.name.trim().toLowerCase();
        }
        return false;
      })
  );

  return (
    <div onClick={(e) => e.stopPropagation()} className="inline-flex items-center">
      {isFav ? (
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={(e) => {
            e.stopPropagation();
            e.currentTarget.blur();
            handleAddToFavourite(activeSong);
          }}
          className="cursor-pointer outline-none focus:outline-none focus:ring-0 p-1 hover:scale-115 active:scale-95 transition-transform"
        >
          <AiFillHeart
            title="Remove from Liked Songs"
            size={size}
            className={`text-[#f43f5e] drop-shadow-[0_0_12px_rgba(244,63,94,0.7)] ${style}`}
          />
        </button>
      ) : (
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={(e) => {
            e.stopPropagation();
            e.currentTarget.blur();
            handleAddToFavourite(activeSong);
          }}
          className="cursor-pointer outline-none focus:outline-none focus:ring-0 p-1 text-gray-400 hover:text-[#f43f5e] hover:scale-115 active:scale-95 transition-all"
        >
          <AiOutlineHeart
            title="Save to Liked Songs"
            size={size}
            className={style}
          />
        </button>
      )}
    </div>
  );
};

export default FavouriteButton;
