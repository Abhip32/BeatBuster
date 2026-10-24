// Single source of truth for SEO + metadata.
export const SITE_URL = process.env.NEXTAUTH_URL || "https://musify-music.vercel.app";
export const SITE_NAME = "Musify";
export const SITE_BRAND = "Musify";
export const SITE_TAGLINE = "Stream & Download Music in Lossless Quality";

export const DEFAULT_TITLE = `${SITE_NAME} - ${SITE_TAGLINE}`;
export const DEFAULT_DESCRIPTION =
  "Musify is a premium music streaming platform with modern glassmorphism design. Listen to Hindi, English, Punjabi, and global hits in 320kbps high quality with synchronized lyrics, offline downloads, and personal playlists.";

export const DEFAULT_KEYWORDS = [
  "musify",
  "musify app",
  "musify music",
  "music streaming",
  "free music streaming",
  "free music download",
  "mp3 download",
  "320kbps music",
  "synced lyrics",
  "hindi songs",
  "punjabi songs",
  "english songs",
  "latest songs",
  "trending songs",
  "music playlists",
  "glassmorphism music app",
];

export const OG_IMAGE = "/images/logo.png";
export const TWITTER_HANDLE = "@musify_app";

export const ORG_CONTACT_EMAIL = "contact@musify.app";

export const absoluteUrl = (path = "/") =>
  `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
