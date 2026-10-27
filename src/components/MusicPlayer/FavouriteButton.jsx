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
    activeSong?.id &&
      Array.isArray(favouriteSongs) &&
      favouriteSongs.some((item) => {
        const rawItemId = typeof item === "object" ? item?.id : item;
        const itemId = typeof rawItemId === "string" ? rawItemId.trim() : String(rawItemId || "");
        const songId = String(activeSong.id || "").trim();
        return Boolean(songId && itemId && songId === itemId);
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
