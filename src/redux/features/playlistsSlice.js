import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  playlists: [],
  count: 0,
  isLoaded: false,
};

const playlistsSlice = createSlice({
  name: "playlists",
  initialState,
  reducers: {
    setPlaylists: (state, action) => {
      const raw = Array.isArray(action.payload) ? action.payload : [];
      const seen = new Set();
      const unique = [];
      for (const p of raw) {
        if (!p) continue;
        const id = String(p._id || p.id || "");
        if (id && !seen.has(id)) {
          seen.add(id);
          unique.push({
            ...p,
            songs: Array.isArray(p.songs) ? p.songs : [],
          });
        }
      }
      state.playlists = unique;
      state.count = unique.length;
      state.isLoaded = true;
    },
    addPlaylist: (state, action) => {
      const playlist = action.payload;
      if (!playlist) return;
      const id = String(playlist._id || playlist.id || "");
      if (!id) return;
      const exists = state.playlists.some((p) => String(p._id || p.id) === id);
      if (!exists) {
        state.playlists.unshift({
          ...playlist,
          songs: Array.isArray(playlist.songs) ? playlist.songs : [],
        });
        state.count = state.playlists.length;
        state.isLoaded = true;
      }
    },
    removePlaylist: (state, action) => {
      const targetId = String(action.payload || "");
      if (!targetId) return;
      state.playlists = state.playlists.filter(
        (p) => String(p._id || p.id) !== targetId
      );
      state.count = state.playlists.length;
    },
    addSongToPlaylistState: (state, action) => {
      const { playlistId, song } = action.payload || {};
      if (!playlistId || !song) return;
      const p = state.playlists.find(
        (item) => String(item._id || item.id) === String(playlistId)
      );
      if (p) {
        if (!Array.isArray(p.songs)) p.songs = [];
        const songId = String(typeof song === "object" ? song.id : song);
        const exists = p.songs.some(
          (s) => String(typeof s === "object" ? s.id : s) === songId
        );
        if (!exists) {
          p.songs.push(song);
        }
      }
    },
    removeSongFromPlaylistState: (state, action) => {
      const { playlistId, song } = action.payload || {};
      if (!playlistId) return;
      const songId = String(typeof song === "object" ? song?.id : song || "");
      const p = state.playlists.find(
        (item) => String(item._id || item.id) === String(playlistId)
      );
      if (p && Array.isArray(p.songs)) {
        p.songs = p.songs.filter(
          (s) => String(typeof s === "object" ? s?.id : s) !== songId
        );
      }
    },
  },
});

export const {
  setPlaylists,
  addPlaylist,
  removePlaylist,
  addSongToPlaylistState,
  removeSongFromPlaylistState,
} = playlistsSlice.actions;

export default playlistsSlice.reducer;
