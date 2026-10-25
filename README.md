This is a free music streaming web application built with Next.js and powered by the [savan API](https://github.com/sumitkolhe/jiosaavn-api). The app allows users to search and stream music from a vast collection of songs available on the Saavn platform.

## Features
* Search and stream music from vast collection.
* Play, pause, skip, and control the playback of songs.
* Create your own playlists.
* **Spotify Playlist Importer**: One-click import from any public Spotify playlist or album link with automatic song resolution (zero developer credentials required).
* **AI Music DJ (Google Gemini 2.5 Flash)**: Conversational vibe and mood-based music curator that generates playable tracklists on the fly.
* **Interactive Floating AI Mascot**: Cyber-DJ assistant floating across the application for instant vibe curation.
* Add songs to your favorite.
* Auto add similar songs to queue.
* Display song details such as title, artist, album, and album artwork.
* Responsive and mobile-friendly design for a great user experience.
* Minimalistic and intuitive user interface.

## Architecture & Data Flows

### 1. Spotify Playlist Importer (Zero-Credential Architecture)

Users can paste any public Spotify playlist or album URL (`https://open.spotify.com/playlist/...`). The system imports the entire tracklist without needing Spotify OAuth tokens or developer client secrets.

```mermaid
flowchart TD
    A["User Pastes Spotify URL\n(playlist or album)"] --> B["Backend Route\n(/api/spotify/import)"]
    B --> C["Extract Playlist / Album ID"]
    C --> D["Fetch Public Embed HTML\n(open.spotify.com/embed/playlist/ID)"]
    D --> E["Extract JSON state from\n`<script id='__NEXT_DATA__'>`"]
    E --> F["Parse Tracklist\n(Title, Artists, Durations)"]
    F --> G["Batch Search JioSaavn API\n(/api/search/songs)"]
    G --> H["Resolve to 320kbps Audio Streams &\nHigh-Res Artwork"]
    H --> I["Save Playlist to MongoDB &\nSync Redux State"]
    I --> J["Redirect to /myPlaylists/ID with\nInstant Playback Ready"]
```

#### Why it works without a Spotify API Key:
- Spotify's public embed player (`open.spotify.com/embed/...`) is a server-side rendered Next.js application.
- Next.js injects its pre-rendered state inside a `<script id="__NEXT_DATA__">` JSON block in the raw HTML.
- Our backend extracts this JSON directly, parses all song titles and artists, and then queries the JioSaavn audio database to deliver playable 320kbps streams without DRM restrictions.

---

### 2. AI Music DJ Flow (Google Gemini 2.5 Flash)

The AI Music DJ blends generative AI intelligence with streaming audio discovery to curate tailored sets based on moods, genres, or currently playing songs.

```mermaid
flowchart TD
    A["User Prompt / Mood Chip\n(e.g., 'Late night drive acoustic Bollywood')\n+ Optional Currently Playing Track"] --> B["Backend Route\n(/api/ai/dj)"]
    B --> C["Construct System Prompt &\nDJ Instructions"]
    C --> D["Call Google Gemini 2.5 Flash\n(Structured JSON Output Mode)"]
    D --> E["Gemini Generates DJ Commentary &\n6-10 Recommended Track Objects"]
    E --> F["Concurrent JioSaavn Audio Search\nResolves Each Song Title + Artist"]
    F --> G["Construct Full Playable Song Objects\n(Audio URL, Artwork, Duration)"]
    G --> H["Client Modal (AiDjModal)"]
    H -->|Play Mix| I["Inject to Redux Player Queue &\nPlay Immediately"]
    H -->|Save Playlist| J["Persist as Named Playlist in\nMongoDB Library"]
```

---

### 3. Floating AI Mascot Companion

- Located at the bottom-right corner of the application above the playback bar.
- Features dynamic animated SVG headphones, neon equalizer visor, responsive speech bubble notifications, and idle hover animations.
- Provides one-click access to summon the AI DJ modal from any page in the app.

---


## Screenshots

### Home Page
Bilingual Hindi & English trending tracks, Quick Access cards, live Liked Songs badge, and one-click New Playlist creation.
![Home Page](./screenshots/Screenshot%202026-10-25%20014108.png)

### Navigation Drawer & Multi-Language Preferences
Slide-out drawer featuring official Musify branding, user profile, custom playlists, and multi-language selection.
![Navigation Drawer and Languages](./screenshots/Screenshot%202026-10-25%20014126.png)

### Trending Songs & Trending Albums Sliders
Dual independent carousels organizing trending songs and trending albums in high-fidelity cards.
![Trending Songs and Albums](./screenshots/Screenshot%202026-10-25%20014150.png)

### Search Experience
Real-time search across songs, albums, and artists with instant playback support.
![Search Results](./screenshots/Screenshot%202026-10-25%20014359.png)

### Liked Songs (Dedicated View)
Single official Liked Songs page featuring Neon Rose gradient hero banner, live song count, and row-level heart toggles.
![Liked Songs](./screenshots/Screenshot%202026-10-25%20014456.png)

### Curated Playlist & Bulk Downloader
Full playlist view with high-res artwork, Lossless 320kbps playback, and one-click ZIP bulk downloader.
![Playlist View](./screenshots/Screenshot%202026-10-25%20014611.png)

### Fullscreen Music Player (Queue View)
Immersive full-screen playback with dynamic ambient lighting, upcoming track queue, and lossless controls.
![Fullscreen Music Player](./screenshots/Screenshot%202026-10-25%20014209.png)

### Time-Synced Lyrics
Real-time synchronized karaoke lyrics with dynamic highlight tracking.
![Time-Synced Lyrics](./screenshots/Screenshot%202026-10-25%20014234.png)

***

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.
