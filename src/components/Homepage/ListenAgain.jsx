'use client';
import React, { useEffect, useState, useCallback } from "react";
import ListenAgainCard from "../ListenAgainCard";
import { useDispatch } from "react-redux";
import { setAutoAdd } from "@/redux/features/playerSlice";
import { setLanguages } from "@/redux/features/languagesSlice";
import { useSession } from "next-auth/react";
import { getSongHistory } from "@/services/dataAPI";

const ListenAgain = () => {
  const [songHistory, setSongHistory] = useState([]);
  const dispatch = useDispatch();
  const { status } = useSession();

  // Instant local load from localStorage
  const loadLocalHistory = useCallback(() => {
    try {
      const stored = localStorage.getItem("songHistory");
      if (stored) {
        setSongHistory(JSON.parse(stored));
      }
    } catch (e) {}
  }, []);

  useEffect(() => {
    loadLocalHistory();

    try {
      const lang = localStorage.getItem("languages")
        ? JSON.parse(localStorage.getItem("languages"))
        : ["english"];
      dispatch(
        setAutoAdd(
          localStorage.getItem("autoAdd")
            ? JSON.parse(localStorage.getItem("autoAdd"))
            : false
        )
      );
      dispatch(setLanguages(lang));
    } catch (e) {}

    // Listen to real-time history updates from SongsHistory
    window.addEventListener("songHistoryUpdated", loadLocalHistory);
    return () => {
      window.removeEventListener("songHistoryUpdated", loadLocalHistory);
    };
  }, [dispatch, loadLocalHistory]);

  // Cloud sync: hydrate from DB for logged-in user
  useEffect(() => {
    let isCancelled = false;
    if (status === "authenticated") {
      getSongHistory()
        .then((dbHistory) => {
          if (!isCancelled && Array.isArray(dbHistory) && dbHistory.length > 0) {
            setSongHistory(dbHistory);
            try {
              localStorage.setItem("songHistory", JSON.stringify(dbHistory));
            } catch (e) {}
          }
        })
        .catch(() => {});
    }
    return () => {
      isCancelled = true;
    };
  }, [status]);

  if (!songHistory || songHistory.length === 0) {
    return null;
  }

  return (
    <div className="mb-10">
      <h2 className="text-white mt-4 text-2xl lg:text-3xl font-semibold mb-4 tracking-tight">
        Listen Again
      </h2>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {songHistory.map((song, index) => (
          <ListenAgainCard
            key={song?.id || index}
            song={song}
            SongData={songHistory}
            index={index}
          />
        ))}
      </div>
    </div>
  );
};

export default ListenAgain;
