import React from "react";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";

const FavouriteButton = ({
  favouriteSongs,
  activeSong,
  loading,
  handleAddToFavourite,
  style = "",
  size = 25,
}) => {
  const isFav = Boolean(
    activeSong?.id &&
      Array.isArray(favouriteSongs) &&
      favouriteSongs.some(
        (item) => (typeof item === "object" ? item?.id : item) === activeSong?.id
      )
  );

  return (
    <div onClick={(e) => e.stopPropagation()} className="inline-flex items-center">
      {isFav ? (
        <button
          type="button"
          disabled={loading}
          onMouseDown={(e) => e.preventDefault()}
          onClick={(e) => {
            e.currentTarget.blur();
            handleAddToFavourite(activeSong);
          }}
          className="cursor-pointer outline-none focus:outline-none focus:ring-0 p-1 hover:scale-110 active:scale-95 transition-transform"
        >
          <AiFillHeart
            title="Remove from Favourites"
            size={size}
            className={`text-[var(--primary-accent,#ec4899)] drop-shadow-[0_0_10px_rgba(236,72,153,0.5)] ${style}`}
          />
        </button>
      ) : (
        <button
          type="button"
          disabled={loading}
          onMouseDown={(e) => e.preventDefault()}
          onClick={(e) => {
            e.currentTarget.blur();
            handleAddToFavourite(activeSong);
          }}
          className="cursor-pointer outline-none focus:outline-none focus:ring-0 p-1 text-gray-400 hover:text-white hover:scale-110 active:scale-95 transition-all"
        >
          <AiOutlineHeart
            title="Save to Favourites"
            size={size}
            className={style}
          />
        </button>
      )}
    </div>
  );
};

export default FavouriteButton;
