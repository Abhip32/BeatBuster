import { configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import createWebStorage from "redux-persist/lib/storage/createWebStorage";
import thunk from "redux-thunk";

import playerReducer from "./features/playerSlice";
import loadingBarReducer from "./features/loadingBarSlice";
import languagesReducer from "./features/languagesSlice";
import settingsReducer from "./features/settingsSlice";
import favouritesReducer from "./features/favouritesSlice";

const createNoopStorage = () => {
  return {
    getItem(_key) {
      return Promise.resolve(null);
    },
    setItem(_key, value) {
      return Promise.resolve(value);
    },
    removeItem(_key) {
      return Promise.resolve();
    },
  };
};
const storage =
  typeof window !== "undefined"
    ? createWebStorage("local")
    : createNoopStorage();

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["languages"],
};

const languagePersistedReducer = persistReducer(
  persistConfig,
  languagesReducer
);

const settingsPersistConfig = {
  key: "settings",
  storage,
};

const settingsPersistedReducer = persistReducer(
  settingsPersistConfig,
  settingsReducer
);

export const store = configureStore({
  reducer: {
    player: playerReducer,
    loadingBar: loadingBarReducer,
    languages: languagePersistedReducer,
    settings: settingsPersistedReducer,
    favourites: favouritesReducer,
  },
  middleware: [thunk],
});

export const persistor = persistStore(store);
