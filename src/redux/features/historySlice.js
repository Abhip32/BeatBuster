import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [],
  count: 0,
  isLoaded: false,
};

const historySlice = createSlice({
  name: "history",
  initialState,
  reducers: {
    setHistory: (state, action) => {
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
    addHistoryItem: (state, action) => {
      const song = action.payload;
      if (!song) return;
      const rawSongId = typeof song === "object" ? song?.id : song;
      const songId = typeof rawSongId === "string" ? rawSongId.trim() : String(rawSongId || "");
      if (!songId || songId === "undefined" || songId === "null") return;

      const filtered = state.items.filter((item) => {
        const rawItemId = typeof item === "object" ? item?.id : item;
        const itemId = typeof rawItemId === "string" ? rawItemId.trim() : String(rawItemId || "");
        return Boolean(itemId && itemId !== songId);
      });

      state.items = [song, ...filtered].slice(0, 100);
      state.count = state.items.length;
      state.isLoaded = true;
    },
    removeHistoryItem: (state, action) => {
      const songId = String(action.payload || "").trim();
      if (!songId) return;
      state.items = state.items.filter((item) => {
        const sid = typeof item === "object" ? item?.id : item;
        return String(sid || "").trim() !== songId;
      });
      state.count = state.items.length;
    },
    clearHistoryState: (state) => {
      state.items = [];
      state.count = 0;
      state.isLoaded = true;
    },
  },
});

export const {
  setHistory,
  addHistoryItem,
  removeHistoryItem,
  clearHistoryState,
} = historySlice.actions;

export default historySlice.reducer;
