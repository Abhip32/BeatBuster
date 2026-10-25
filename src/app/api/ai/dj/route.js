import { NextResponse } from "next/server";
import { getApiBase } from "@/services/dataAPI";

export const dynamic = "force-dynamic";

const MOOD_FALLBACKS = {
  chill: [
    { title: "Kasoor", artist: "Prateek Kuhad" },
    { title: "Iktara", artist: "Amit Trivedi" },
    { title: "Baarishein", artist: "Anuv Jain" },
    { title: "Sham", artist: "Amit Trivedi" },
    { title: "Kho Gaye Hum Kahan", artist: "Jasleen Royal" },
    { title: "Cold/Mess", artist: "Prateek Kuhad" },
  ],
  workout: [
    { title: "Zinda", artist: "Siddharth Mahadevan" },
    { title: "Brothers Anthem", artist: "Ajay-Atul" },
    { title: "Challa", artist: "Rabbi Shergill" },
    { title: "Dhurandhar", artist: "Shashwat Sachdev" },
    { title: "Kar Har Maidaan Fateh", artist: "Sukhwinder Singh" },
    { title: "Sultan", artist: "Sukhwinder Singh" },
  ],
  party: [
    { title: "Kala Chashma", artist: "Badshah, Neha Kakkar" },
    { title: "Ghungroo", artist: "Arijit Singh, Shilpa Rao" },
    { title: "Kar Gayi Chull", artist: "Badshah, Fazilpuria" },
    { title: "Abhi Toh Party Shuru Hui Hai", artist: "Badshah" },
    { title: "The Humma Song", artist: "Badshah, Jubin Nautiyal" },
  ],
  romantic: [
    { title: "Tum Hi Ho", artist: "Arijit Singh" },
    { title: "Apna Bana Le", artist: "Arijit Singh" },
    { title: "Raataan Lambiyan", artist: "Jubin Nautiyal, Asees Kaur" },
    { title: "Kesariya", artist: "Arijit Singh" },
    { title: "Pee Loon", artist: "Mohit Chauhan" },
    { title: "Hawayein", artist: "Arijit Singh" },
  ],
  sad: [
    { title: "Channa Mereya", artist: "Arijit Singh" },
    { title: "Agar Tum Saath Ho", artist: "Arijit Singh, Alka Yagnik" },
    { title: "Kabira", artist: "Tochi Raina, Rekha Bhardwaj" },
    { title: "Ae Dil Hai Mushkil", artist: "Arijit Singh" },
    { title: "Tujhe Kitna Chahne Lage", artist: "Arijit Singh" },
  ],
};

export async function POST(req) {
  try {
    const { prompt = "", currentSong = null, apiKey = "" } = await req.json();

    const cleanPrompt = String(prompt || "").trim();
    const effectiveApiKey =
      apiKey ||
      process.env.GEMINI_API_KEY ||
      process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    let rawSuggestions = [];
    let commentary = "";

    if (effectiveApiKey) {
      try {
        const systemPrompt = `You are Musify AI DJ, an expert music curator. The user will ask for a music recommendation, playlist theme, or mood.
Return a STRICT JSON object in this format with NO markdown code fences:
{
  "commentary": "Short 1-2 sentence DJ remark about the vibe",
  "tracks": [
    { "title": "Song Title", "artist": "Primary Artist" }
  ]
}
Recommend 6 to 10 popular, recognizable songs fitting the request. Include Indian/Bollywood or International songs depending on context.`;

        const userMessage = currentSong
          ? `Current playing song: "${currentSong?.name || currentSong?.title}" by ${currentSong?.primaryArtists || currentSong?.singers || "Artist"}. User request: "${cleanPrompt || "recommend similar vibe"}"`
          : `Create a playlist for: "${cleanPrompt || "chill late night music"}"`;

        const model = "gemini-2.5-flash";
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${effectiveApiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  role: "user",
                  parts: [{ text: `${systemPrompt}\n\n${userMessage}` }],
                },
              ],
              generationConfig: {
                temperature: 0.7,
                responseMimeType: "application/json",
              },
            }),
          }
        );

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          const text =
            geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
          const parsed = JSON.parse(text);
          if (Array.isArray(parsed?.tracks) && parsed.tracks.length > 0) {
            rawSuggestions = parsed.tracks;
            commentary = parsed.commentary || "Curated especially for you by Musify AI DJ.";
          }
        }
      } catch (geminiErr) {
        console.error("Gemini API error, falling back to heuristics:", geminiErr);
      }
    }

    // Fallback if no Gemini key or Gemini request did not return tracks
    if (rawSuggestions.length === 0) {
      const p = cleanPrompt.toLowerCase();
      let key = "chill";
      if (p.includes("workout") || p.includes("gym") || p.includes("energy") || p.includes("run")) {
        key = "workout";
      } else if (p.includes("party") || p.includes("dance") || p.includes("club") || p.includes("dj")) {
        key = "party";
      } else if (p.includes("love") || p.includes("romance") || p.includes("romantic")) {
        key = "romantic";
      } else if (p.includes("sad") || p.includes("breakup") || p.includes("cry") || p.includes("alone")) {
        key = "sad";
      }
      rawSuggestions = MOOD_FALLBACKS[key] || MOOD_FALLBACKS.chill;
      commentary = `Here's an intelligent ${key} mix tuned for your session.`;
    }

    // Resolve song tracks against JioSaavn search
    const apiBase = getApiBase();
    const resolveSong = async (item) => {
      const q = `${item.title} ${item.artist || ""}`.trim();
      try {
        const res = await fetch(
          `${apiBase}/api/search/songs?query=${encodeURIComponent(q)}&limit=1`
        );
        if (res.ok) {
          const d = await res.json();
          const s = d?.data?.results?.[0];
          if (s && (s.downloadUrl || s.url)) {
            return s;
          }
        }
      } catch {}
      return null;
    };

    // Parallel resolve in batches
    const resolvedSongs = [];
    const batchSize = 4;
    for (let i = 0; i < rawSuggestions.length; i += batchSize) {
      const batch = rawSuggestions.slice(i, i + batchSize);
      const results = await Promise.all(batch.map((t) => resolveSong(t)));
      for (const song of results) {
        if (song && !resolvedSongs.some((s) => s.id === song.id)) {
          resolvedSongs.push(song);
        }
      }
    }

    return NextResponse.json({
      success: true,
      commentary,
      prompt: cleanPrompt,
      songs: resolvedSongs,
      count: resolvedSongs.length,
      hasGeminiKey: Boolean(effectiveApiKey),
    });
  } catch (error) {
    console.error("AI DJ error:", error);
    return NextResponse.json(
      { success: false, message: "AI DJ could not generate playlist" },
      { status: 500 }
    );
  }
}
