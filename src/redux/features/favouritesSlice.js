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
        const rawId = typeof item === "object" ? item?.id : item;
        const id = typeof rawId === "string" ? rawId.trim() : String(rawId || "");
        if (id && id !== "undefined" && id !== "null" && !seen.has(id)) {
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
      const rawSongId = typeof song === "object" ? song?.id : song;
      const songId = typeof rawSongId === "string" ? rawSongId.trim() : String(rawSongId || "");
      if (!songId || songId === "undefined" || songId === "null") return;

      const existsIndex = state.items.findIndex((item) => {
        const rawItemId = typeof item === "object" ? item?.id : item;
        const itemId = typeof rawItemId === "string" ? rawItemId.trim() : String(rawItemId || "");
        return Boolean(itemId && itemId === songId);
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
      const rawTarget = typeof target === "object" ? target?.id : target;
      const targetId = typeof rawTarget === "string" ? rawTarget.trim() : String(rawTarget || "");
      if (!targetId || targetId === "undefined" || targetId === "null") return;

      state.items = state.items.filter((item) => {
        const rawItemId = typeof item === "object" ? item?.id : item;
        const itemId = typeof rawItemId === "string" ? rawItemId.trim() : String(rawItemId || "");
        return itemId !== targetId;
      });
      state.count = state.items.length;
    },
  },
});

export const { setFavourites, toggleFavouriteSong, removeFavouriteSong } =
  favouritesSlice.actions;
export default favouritesSlice.reducer;
