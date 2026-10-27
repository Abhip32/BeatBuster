import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentSongs: [],
  currentIndex: 0,
  isActive: false,
  isPlaying: false,
  activeSong: {},
  fullScreen: false,
  autoAdd: false,
  openedByClick: false,
};

const playerSlice = createSlice({
  name: 'player',
  initialState,
  reducers: {
    setActiveSong: (state, action) => {
      if (action.payload.song) {
        const newSong = action.payload.song;
        const newSongId = String(newSong?.id || "");
      
        // Check if the song is not already in currentSongs
        if (newSongId && !state.currentSongs.some(song => String(song?.id) === newSongId)) {
          state.activeSong = newSong;
          state.currentSongs = [...state.currentSongs, newSong];
        }
        else
        {
          state.activeSong = newSong;
        }
      }
      

      if(action.payload.data){
      state.currentSongs = action.payload.data;
      }

      if(action.payload.i !== undefined){
      state.currentIndex = action.payload.i;
      }
      state.isActive = true;
      state.isPlaying = true;
      state.openedByClick = true;
    },

    nextSong: (state, action) => {
      if(state.currentSongs.length>0){
        state.activeSong = state.currentSongs[action.payload];
        state.currentIndex = action.payload;
        state.isActive = true;
        state.isPlaying = true;
        state.openedByClick = false;
      }
    },

    prevSong: (state, action) => {
      if(state.currentSongs.length>0){
        state.activeSong = state.currentSongs[action.payload];
        state.currentIndex = action.payload;
        state.isActive = true;
        state.isPlaying = true;
        state.openedByClick = false;
      }
    },

    playPause: (state, action) => {
      state.isPlaying = action.payload;
    },

    setFullScreen: (state, action) => {
      state.fullScreen = action.payload;
    },

    setAutoAdd: (state, action) => {
      state.autoAdd = action.payload;
    },

    resetOpenedByClick: (state) => {
      state.openedByClick = false;
    },

    deleteSong: (state, action) => {
      const payload = action.payload;
      let targetIndex = -1;
      if (typeof payload === "number") {
        targetIndex = payload;
      } else {
        const songIdToDelete = String(payload || "");
        targetIndex = state.currentSongs.findIndex(
          (song) => String(song?.id) === songIdToDelete
        );
      }

      if (targetIndex < 0 || targetIndex >= state.currentSongs.length) return;

      const isRemovingActive = state.currentIndex === targetIndex;
      state.currentSongs.splice(targetIndex, 1);

      if (state.currentSongs.length === 0) {
        state.activeSong = {};
        state.isActive = false;
        state.isPlaying = false;
        state.currentIndex = 0;
      } else if (isRemovingActive) {
        const newIndex =
          targetIndex < state.currentSongs.length
            ? targetIndex
            : state.currentSongs.length - 1;
        state.currentIndex = newIndex;
        state.activeSong = state.currentSongs[newIndex] || {};
      } else if (targetIndex < state.currentIndex) {
        state.currentIndex = Math.max(0, state.currentIndex - 1);
      }
    },
    removeFromQueue: (state, action) => {
      const payload = action.payload;
      let targetIndex = -1;

      if (typeof payload === "number") {
        targetIndex = payload;
      } else if (payload && typeof payload === "object") {
        if (typeof payload.index === "number") {
          targetIndex = payload.index;
        } else if (payload.songId || payload.id) {
          const targetId = String(payload.songId || payload.id);
          targetIndex = state.currentSongs.findIndex(
            (s) => String(s?.id) === targetId
          );
        }
      }

      if (targetIndex < 0 || targetIndex >= state.currentSongs.length) return;

      const isRemovingActive = state.currentIndex === targetIndex;
      state.currentSongs.splice(targetIndex, 1);

      if (state.currentSongs.length === 0) {
        state.activeSong = {};
        state.isActive = false;
        state.isPlaying = false;
        state.currentIndex = 0;
      } else if (isRemovingActive) {
        const newIndex =
          targetIndex < state.currentSongs.length
            ? targetIndex
            : state.currentSongs.length - 1;
        state.currentIndex = newIndex;
        state.activeSong = state.currentSongs[newIndex] || {};
      } else if (targetIndex < state.currentIndex) {
        state.currentIndex = Math.max(0, state.currentIndex - 1);
      }
    },
    addToQueue: (state, action) => {
      const newSong = action.payload.song;
      const newSongId = String(newSong?.id || "");
      const isSongInQueue = Boolean(
        newSongId && state.currentSongs.some(song => String(song?.id) === newSongId)
      );
      
      if (!isSongInQueue) {
        state.currentSongs = [...state.currentSongs, newSong];
      }
      state.fullScreen = true;
    }
  },
});

export const {
  setActiveSong,
  nextSong,
  prevSong,
  playPause,
  setFullScreen,
  setAutoAdd,
  resetOpenedByClick,
  deleteSong,
  removeFromQueue,
  addToQueue
} = playerSlice.actions;

export default playerSlice.reducer;
