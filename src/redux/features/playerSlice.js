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
      
        // Check if the song is not already in currentSongs
        if (!state.currentSongs.some(song => song.id === newSong.id)) {
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
      state.openedByClick = true;
    },

    nextSong: (state, action) => {
      if(state.currentSongs.length>0){
        state.activeSong = state.currentSongs[action.payload];
        state.currentIndex = action.payload;
        state.isActive = true;
        state.openedByClick = false;
      }
    },

    prevSong: (state, action) => {
      if(state.currentSongs.length>0){
        state.activeSong = state.currentSongs[action.payload];
        state.currentIndex = action.payload;
        state.isActive = true;
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
      const songIdToDelete = action.payload;

      state.currentSongs = state.currentSongs.filter(song => song.id !== songIdToDelete);

      if (state.activeSong === songIdToDelete) {
        state.activeSong = {};
        state.isActive = false;
      }

      if (state.currentSongs.length === 0) {
        state.currentIndex = 0;
      } else if (state.currentIndex >= state.currentSongs.length) {
        state.currentIndex = state.currentSongs.length - 1;
      }
    },
    addToQueue: (state, action) => {
      const newSong = action.payload.song;
      const isSongInQueue = state.currentSongs.some(song => song.id === newSong.id);
      
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
  addToQueue
} = playerSlice.actions;

export default playerSlice.reducer;
