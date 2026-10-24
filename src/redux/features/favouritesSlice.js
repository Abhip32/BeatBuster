import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [],
  count: 0,
  isLoaded: false,
};

const favouritesSlice = createSlice({
  name: "favourites",
  initialState,
  reducers: {
    setFavourites: (state, action) => {
      const raw = Array.isArray(action.payload) ? action.payload : [];
      const seen = new Set();
      const unique = [];
      for (const item of raw) {
        if (!item) continue;
        const id = String(typeof item === "object" ? item?.id || item?.name : item);
        if (id && !seen.has(id)) {
          seen.add(id);
          unique.push(item);
        }
      }
      state.items = unique;
      state.count = unique.length;
      state.isLoaded = true;
    },
    toggleFavouriteSong: (state, action) => {
      const song = action.payload;
      if (!song) return;
      const songId = String(song.id || "");
      const songName = song.name?.trim().toLowerCase() || "";

      const existsIndex = state.items.findIndex((item) => {
        const itemId = String(typeof item === "object" ? item?.id : item);
        if (songId && itemId === songId) return true;
        if (typeof item === "object" && item?.name && songName) {
          return item.name.trim().toLowerCase() === songName;
        }
        return false;
      });

      if (existsIndex !== -1) {
        state.items.splice(existsIndex, 1);
      } else {
        // Prevent duplicate addition
        state.items.push(song);
      }
      state.count = state.items.length;
    },
    removeFavouriteSong: (state, action) => {
      const target = action.payload;
      const targetId = String(typeof target === "object" ? target?.id : target || "");
      const targetName = typeof target === "object" ? target?.name?.trim().toLowerCase() : "";

      state.items = state.items.filter((item) => {
        const itemId = String(typeof item === "object" ? item?.id : item);
        if (targetId && itemId === targetId) return false;
        if (targetName && typeof item === "object" && item?.name) {
          return item.name.trim().toLowerCase() !== targetName;
        }
        return true;
      });
      state.count = state.items.length;
    },
  },
});

export const { setFavourites, toggleFavouriteSong, removeFavouriteSong } =
  favouritesSlice.actions;
export default favouritesSlice.reducer;
