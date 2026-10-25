// Helper to get sanitized API base URL
export const getApiBase = () => {
  const url = process.env.NEXT_PUBLIC_SAAVN_API || "https://jiosavanapo.vercel.app";
  return url.replace(/\/+$/, "");
};

// home page data
export async function homePageData(language) {
  const base = getApiBase();
  const lang = Array.isArray(language)
    ? language.join(",")
    : language?.toString() || "english,hindi";

  // 1. First attempt: standard /api/modules endpoint
  try {
    const response = await fetch(
      `${base}/api/modules?language=${encodeURIComponent(lang)}`,
      {
        next: { revalidate: 3600 },
      }
    );
    if (response.ok) {
      const data = await response.json();
      if (data?.data && (data.data.trending || data.data.charts || data.data.albums)) {
        return data.data;
      }
    }
  } catch (error) {
    // Proceed to fallback
  }

  // 2. Second attempt: /modules
  try {
    const response = await fetch(
      `${base}/modules?language=${encodeURIComponent(lang)}`,
      {
        next: { revalidate: 3600 },
      }
    );
    if (response.ok) {
      const data = await response.json();
      if (data?.data && (data.data.trending || data.data.charts || data.data.albums)) {
        return data.data;
      }
    }
  } catch (error) {
    // Proceed to fallback
  }

  // 3. Robust Fallback: Curated authentic JioSaavn Top Charts and deduplicated Trending Songs
  try {
    const OFFICIAL_CHARTS = [
      { id: "1134548194", name: "India Superhits Top 50", title: "India Superhits Top 50" },
      { id: "1134543272", name: "Hindi: India Superhits Top 50", title: "Hindi: India Superhits Top 50" },
      { id: "47599074", name: "Now Trending", title: "Now Trending" },
      { id: "158224864", name: "Todays Top Hits", title: "Todays Top Hits" },
      { id: "1297282877", name: "Trending Songs India 2026", title: "Trending Songs India 2026" },
      { id: "1210453303", name: "Latest Hindi Songs", title: "Latest Hindi Songs" },
      { id: "1223482895", name: "Insta Trending Viral Hits", title: "Insta Trending Viral Hits" },
      { id: "1191142644", name: "Arijit Singh Trending Hits", title: "Arijit Singh Trending Hits" },
      { id: "1134643225", name: "Telugu: India Superhits Top 50", title: "Telugu: India Superhits Top 50" },
      { id: "1134591169", name: "Kannada: India Superhits Top 50", title: "Kannada: India Superhits Top 50" },
    ];

    // Fetch playlist details for top charts and extract raw songs
    const playlistPromises = OFFICIAL_CHARTS.slice(0, 6).map((cp) =>
      fetch(`${base}/api/playlists?id=${cp.id}`)
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null)
    );

    // Parallel fetch albums, english albums, and featured playlists
    const [playlistResults, hindiAlbumsRes, englishAlbumsRes, hindiPlaylistsRes, englishPlaylistsRes] = await Promise.all([
      Promise.all(playlistPromises),
      fetch(`${base}/api/search/albums?query=hindi%20hits&limit=15`)
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null),
      fetch(`${base}/api/search/albums?query=english%20hits&limit=15`)
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null),
      fetch(`${base}/api/search/playlists?query=hindi%20trending&limit=10`)
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null),
      fetch(`${base}/api/search/playlists?query=english%20trending&limit=10`)
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null),
    ]);

    const charts = [];
    const hindiSongs = [];
    const englishSongs = [];
    const generalSongs = [];

    playlistResults.forEach((res, index) => {
      const cp = OFFICIAL_CHARTS[index];
      if (res?.data?.name) {
        charts.push({
          id: res.data.id || cp.id,
          title: res.data.name || cp.name,
          name: res.data.name || cp.name,
          image: res.data.image,
          songCount: res.data.songCount,
          followerCount: res.data.followerCount,
          type: "playlist",
        });
        const songs = Array.isArray(res.data.songs) ? res.data.songs : [];
        if (cp.id === "1134543272" || cp.id === "1210453303") {
          hindiSongs.push(...songs);
        } else if (cp.id === "158224864") {
          englishSongs.push(...songs);
        } else {
          generalSongs.push(...songs);
        }
      } else {
        charts.push({ ...cp, type: "playlist" });
      }
    });

    // Interleave Hindi and English songs so both appear prominently in Trending Songs
    const combinedSongs = [];
    const maxLen = Math.max(hindiSongs.length, englishSongs.length, generalSongs.length);
    for (let i = 0; i < maxLen; i++) {
      if (hindiSongs[i]) combinedSongs.push(hindiSongs[i]);
      if (englishSongs[i]) combinedSongs.push(englishSongs[i]);
      if (generalSongs[i]) combinedSongs.push(generalSongs[i]);
    }

    // Deduplicate songs by normalized title so every song is completely unique
    const seenSongNames = new Set();
    const uniqueTrendingSongs = [];
    for (const s of combinedSongs) {
      if (!s || !s.id) continue;
      const cleanTitle = (s.name || s.title || "")
        .toLowerCase()
        .replace(/\s*\(.*\)/g, "")
        .replace(/[^a-z0-9]/g, "");
      if (cleanTitle && !seenSongNames.has(cleanTitle)) {
        seenSongNames.add(cleanTitle);
        uniqueTrendingSongs.push({ ...s, type: "song" });
      }
    }

    // Interleave Hindi and English albums for Trending Albums
    const hAlbums = (hindiAlbumsRes?.data?.results || []).map((a) => ({ ...a, type: "album" }));
    const eAlbums = (englishAlbumsRes?.data?.results || []).map((a) => ({ ...a, type: "album" }));
    const interleavedAlbums = [];
    const maxAlbLen = Math.max(hAlbums.length, eAlbums.length);
    for (let i = 0; i < maxAlbLen; i++) {
      if (hAlbums[i]) interleavedAlbums.push(hAlbums[i]);
      if (eAlbums[i]) interleavedAlbums.push(eAlbums[i]);
    }

    // Interleave Playlists
    const hPlaylists = (hindiPlaylistsRes?.data?.results || []).map((p) => ({ ...p, type: "playlist" }));
    const ePlaylists = (englishPlaylistsRes?.data?.results || []).map((p) => ({ ...p, type: "playlist" }));
    const interleavedPlaylists = [];
    const maxPlLen = Math.max(hPlaylists.length, ePlaylists.length);
    for (let i = 0; i < maxPlLen; i++) {
      if (hPlaylists[i]) interleavedPlaylists.push(hPlaylists[i]);
      if (ePlaylists[i]) interleavedPlaylists.push(ePlaylists[i]);
    }

    return {
      trending: {
        songs: uniqueTrendingSongs,
        albums: interleavedAlbums.slice(0, 16),
      },
      charts: charts.length > 0 ? charts : OFFICIAL_CHARTS,
      albums: interleavedAlbums,
      playlists: interleavedPlaylists,
    };
  } catch (err) {
    console.error("homePageData fallback error:", err);
    return {
      trending: { songs: [], albums: [] },
      charts: [],
      albums: [],
      playlists: [],
    };
  }
}

// get song data
export async function getSongData(id) {
  try {
    // If id is already a fully resolved song object with downloadUrl, return it directly
    if (
      typeof id === "object" &&
      id !== null &&
      Array.isArray(id.downloadUrl) &&
      id.downloadUrl.length > 0
    ) {
      return id;
    }
    const rawId = typeof id === "object" ? id?.id : id;
    if (!rawId || typeof rawId !== "string" || rawId === "[object Object]") {
      return null;
    }
    const base = getApiBase();
    const response = await fetch(`${base}/api/songs/${rawId}`);
    if (!response.ok) return null;
    const data = await response.json();
    if (Array.isArray(data?.data)) {
      return data.data[0] || null;
    }
    return data?.data || null;
  } catch (error) {
    console.error("getSongData error:", error);
    return null;
  }
}

// get album data
export async function getAlbumData(id) {
  try {
    const base = getApiBase();
    const response = await fetch(`${base}/api/albums?id=${id}`);
    if (!response.ok) return null;
    const data = await response.json();
    return data?.data || null;
  } catch (error) {
    console.error("getAlbumData error:", error);
    return null;
  }
}

// get playlist data
export async function getplaylistData(id) {
  try {
    const base = getApiBase();
    const response = await fetch(`${base}/api/playlists?id=${id}&limit=100`);
    if (!response.ok) return null;
    const data = await response.json();
    return data?.data || null;
  } catch (error) {
    console.error("getplaylistData error:", error);
    return null;
  }
}

// get Lyrics data from lrclib.net
export async function getlyricsData(songOrId) {
  try {
    let trackName = "";
    let artistName = "";
    let albumName = "";
    let duration = null;

    if (typeof songOrId === "object" && songOrId !== null) {
      trackName = songOrId.name || songOrId.title || "";
      const primaryArtists = Array.isArray(songOrId?.artists?.primary)
        ? songOrId.artists.primary
        : Array.isArray(songOrId?.artists)
        ? songOrId.artists
        : [];
      artistName =
        primaryArtists?.[0]?.name ||
        (typeof songOrId.artists === "string" ? songOrId.artists : "");
      albumName = songOrId.album?.name || songOrId.album || "";
      if (songOrId.duration) {
        duration = Math.round(Number(songOrId.duration));
      }
    } else if (typeof songOrId === "string") {
      trackName = songOrId;
    }

    const cleanTrack = trackName
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
      .replace(/&apos;/g, "'")
      .replace(/&#39;/g, "'")
      .replace(/&amp;/g, "&")
      .replace(/\s*\([^)]*version[^)]*\)/gi, "")
      .replace(/\s*\[[^\]]*version[^\]]*\]/gi, "")
      .trim();

    const cleanArtist = artistName
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
      .replace(/&apos;/g, "'")
      .replace(/&#39;/g, "'")
      .replace(/&amp;/g, "&")
      .trim();

    if (!cleanTrack) return null;

    // 1. Try exact match using /api/get
    const params = new URLSearchParams({
      track_name: cleanTrack,
    });
    if (cleanArtist) params.append("artist_name", cleanArtist);
    if (albumName) params.append("album_name", albumName);
    if (duration) params.append("duration", duration.toString());

    let res = await fetch(`https://lrclib.net/api/get?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      if (data && (data.syncedLyrics || data.plainLyrics || data.instrumental)) {
        return data;
      }
    }

    // 2. If exact get failed, try /api/get without album_name
    if (albumName) {
      const noAlbumParams = new URLSearchParams({
        track_name: cleanTrack,
      });
      if (cleanArtist) noAlbumParams.append("artist_name", cleanArtist);
      if (duration) noAlbumParams.append("duration", duration.toString());
      res = await fetch(`https://lrclib.net/api/get?${noAlbumParams.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data && (data.syncedLyrics || data.plainLyrics || data.instrumental)) {
          return data;
        }
      }
    }

    // 3. Fallback to /api/search with track_name and artist_name
    const searchParams = new URLSearchParams({
      track_name: cleanTrack,
    });
    if (cleanArtist) searchParams.append("artist_name", cleanArtist);
    res = await fetch(`https://lrclib.net/api/search?${searchParams.toString()}`);
    if (res.ok) {
      const items = await res.json();
      if (Array.isArray(items) && items.length > 0) {
        const withSynced = items.filter((item) => item.syncedLyrics);
        if (withSynced.length > 0) {
          if (duration) {
            withSynced.sort(
              (a, b) =>
                Math.abs((a.duration || 0) - duration) -
                Math.abs((b.duration || 0) - duration)
            );
          }
          return withSynced[0];
        }
        return items[0];
      }
    }

    // 4. Last resort: /api/search with query string
    const q = `${cleanTrack} ${cleanArtist}`.trim();
    res = await fetch(`https://lrclib.net/api/search?q=${encodeURIComponent(q)}`);
    if (res.ok) {
      const items = await res.json();
      if (Array.isArray(items) && items.length > 0) {
        const withSynced = items.filter((item) => item.syncedLyrics);
        return withSynced.length > 0 ? withSynced[0] : items[0];
      }
    }

    return null;
  } catch (error) {
    console.error("getlyricsData error:", error);
    return null;
  }
}

// get artist data
export async function getArtistData(id) {
  try {
    const base = getApiBase();
    const response = await fetch(`${base}/api/artists?id=${id}`);
    if (!response.ok) return null;
    const data = await response.json();
    return data?.data || null;
  } catch (error) {
    console.error("getArtistData error:", error);
    return null;
  }
}

// get artist songs
export async function getArtistSongs(id, page = 0) {
  try {
    const base = getApiBase();
    const response = await fetch(`${base}/api/artists/${id}/songs?page=${page}&limit=50`);
    if (!response.ok) return null;
    const data = await response.json();
    return data?.data || null;
  } catch (error) {
    console.error("getArtistSongs error:", error);
    return null;
  }
}

// get artist albums
export async function getArtistAlbums(id, page = 0) {
  try {
    const base = getApiBase();
    const response = await fetch(`${base}/api/artists/${id}/albums?page=${page}&limit=50`);
    if (!response.ok) return null;
    const data = await response.json();
    return data?.data || null;
  } catch (error) {
    console.error("getArtistAlbums error:", error);
    return null;
  }
}

// search songs specifically (returns up to limit songs with full data)
export async function searchSongs(query, page = 1, limit = 40) {
  try {
    const base = getApiBase();
    const response = await fetch(
      `${base}/api/search/songs?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`
    );
    if (!response.ok) return [];
    const data = await response.json();
    return Array.isArray(data?.data?.results) ? data.data.results : [];
  } catch (error) {
    console.error("searchSongs error:", error);
    return [];
  }
}

// search albums specifically
export async function searchAlbums(query, page = 1, limit = 20) {
  try {
    const base = getApiBase();
    const response = await fetch(
      `${base}/api/search/albums?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`
    );
    if (!response.ok) return [];
    const data = await response.json();
    return Array.isArray(data?.data?.results) ? data.data.results : [];
  } catch (error) {
    console.error("searchAlbums error:", error);
    return [];
  }
}

// search artists specifically
export async function searchArtists(query, page = 1, limit = 20) {
  try {
    const base = getApiBase();
    const response = await fetch(
      `${base}/api/search/artists?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`
    );
    if (!response.ok) return [];
    const data = await response.json();
    return Array.isArray(data?.data?.results) ? data.data.results : [];
  } catch (error) {
    console.error("searchArtists error:", error);
    return [];
  }
}

// search playlists specifically
export async function searchPlaylists(query, page = 1, limit = 20) {
  try {
    const base = getApiBase();
    const response = await fetch(
      `${base}/api/search/playlists?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`
    );
    if (!response.ok) return [];
    const data = await response.json();
    return Array.isArray(data?.data?.results) ? data.data.results : [];
  } catch (error) {
    console.error("searchPlaylists error:", error);
    return [];
  }
}

// get comprehensive search data (combines topQuery from global overview + full specific searches)
export async function getSearchedData(query) {
  try {
    const base = getApiBase();
    const [globalRes, songsRes, albumsRes, artistsRes, playlistsRes] = await Promise.all([
      fetch(`${base}/api/search?query=${encodeURIComponent(query)}`)
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null),
      fetch(`${base}/api/search/songs?query=${encodeURIComponent(query)}&limit=40`)
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null),
      fetch(`${base}/api/search/albums?query=${encodeURIComponent(query)}&limit=20`)
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null),
      fetch(`${base}/api/search/artists?query=${encodeURIComponent(query)}&limit=20`)
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null),
      fetch(`${base}/api/search/playlists?query=${encodeURIComponent(query)}&limit=20`)
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null),
    ]);

    const globalData = globalRes?.data || {};
    const topQuery = Array.isArray(globalData?.topQuery?.results)
      ? globalData.topQuery.results
      : [];

    const songs = Array.isArray(songsRes?.data?.results) && songsRes.data.results.length > 0
      ? songsRes.data.results
      : Array.isArray(globalData?.songs?.results)
      ? globalData.songs.results
      : [];

    const albums = Array.isArray(albumsRes?.data?.results) && albumsRes.data.results.length > 0
      ? albumsRes.data.results
      : Array.isArray(globalData?.albums?.results)
      ? globalData.albums.results
      : [];

    const artists = Array.isArray(artistsRes?.data?.results) && artistsRes.data.results.length > 0
      ? artistsRes.data.results
      : Array.isArray(globalData?.artists?.results)
      ? globalData.artists.results
      : [];

    const playlists = Array.isArray(playlistsRes?.data?.results) && playlistsRes.data.results.length > 0
      ? playlistsRes.data.results
      : Array.isArray(globalData?.playlists?.results)
      ? globalData.playlists.results
      : [];

    return {
      topQuery,
      songs,
      albums,
      artists,
      playlists,
      totalSongs: songsRes?.data?.total || songs.length,
      totalAlbums: albumsRes?.data?.total || albums.length,
      totalArtists: artistsRes?.data?.total || artists.length,
      totalPlaylists: playlistsRes?.data?.total || playlists.length,
    };
  } catch (error) {
    console.error("getSearchedData error:", error);
    return null;
  }
}

// add and remove from favourite
export async function addFavourite(id) {
  try {
    const response = await fetch("/api/favourite", {
      method: "POST",
      body: JSON.stringify({ id }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Add favourite API error", error);
    return null;
  }
}

// get favourite
export async function getFavourite() {
  try {
    const response = await fetch("/api/favourite");
    if (!response.ok) return null;
    const data = await response.json();
    return data?.data?.favourites || [];
  } catch (error) {
    console.error("Get favourite API error", error);
    return [];
  }
}

// user info
export async function getUserInfo() {
  try {
    const response = await fetch("/api/userInfo");
    if (!response.ok) return null;
    const data = await response.json();
    return data?.data || null;
  } catch (error) {
    console.error("Get user info API error", error);
    return null;
  }
}

// reset password
export async function resetPassword(password, confirmPassword, token) {
  try {
    const response = await fetch("/api/forgotPassword", {
      method: "PUT",
      body: JSON.stringify({ password, confirmPassword, token }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Reset password API error", error);
    return null;
  }
}

// send reset password link
export async function sendResetPasswordLink(email) {
  try {
    const response = await fetch("/api/forgotPassword", {
      method: "POST",
      body: JSON.stringify({ email }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Send reset password link API error", error);
    return null;
  }
}

// get recommended songs
export async function getRecommendedSongs(artistId, songId) {
  try {
    const base = getApiBase();
    const response = await fetch(`${base}/api/songs/${songId}/suggestions`);
    if (!response.ok) return [];
    const data = await response.json();
    return Array.isArray(data?.data) ? data.data : [];
  } catch (error) {
    console.error("getRecommendedSongs error:", error);
    return [];
  }
}
