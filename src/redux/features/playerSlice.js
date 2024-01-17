import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentSongs: [],
  currentIndex: 0,
  isActive: false,
  isPlaying: false,
  activeSong: {},
  fullScreen: false,
  autoAdd: false,
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

      if(action.payload.i){
      state.currentIndex = action.payload.i;
      }
      state.isActive = true;
    },

    nextSong: (state, action) => {

      if(state.currentSongs.length>0){
      state.activeSong = state.currentSongs[action.payload];
    
      state.currentIndex = action.payload;
      state.isActive = true;
      }
    },

    prevSong: (state, action) => {

      if(state.currentSongs.length>0){
      state.activeSong = state.currentSongs[action.payload];
      state.currentIndex = action.payload;
      state.isActive = true;
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

    deleteSong: (state, action) => {
      const songIdToDelete = action.payload;

      // Filter out the song with the specified ID
      state.currentSongs = state.currentSongs.filter(song => song.id !== songIdToDelete);
      

      // If the deleted song was the active song, reset the activeSong and isActive state
      if (state.activeSong === songIdToDelete) {
        state.activeSong = {};
        state.isActive = false;
      }

      // If the deleted song was the only song or the last song in the playlist, reset currentIndex
      if (state.currentSongs.length === 0) {
        state.currentIndex = 0;
      } else if (state.currentIndex >= state.currentSongs.length) {
        state.currentIndex = state.currentSongs.length - 1;
      }
    },
    addToQueue: (state, action) => {
      const newSong = action.payload.song;
      console.log(newSong);
      // Check if the song is already in the queue
      const isSongInQueue = state.currentSongs.some(song => song.id === newSong.id);
      
      if (!isSongInQueue) {
        // If the song is not in the queue, add it
        state.currentSongs = [...state.currentSongs, newSong];
        state.fullScreen = true;
      }
      state.fullScreen = true;
    }
    
   
  },
});

export const { setActiveSong, nextSong, prevSong, playPause, setFullScreen, setAutoAdd,deleteSong,addToQueue } = playerSlice.actions;

export default playerSlice.reducer;
