import Link from "next/link";
import PlayButton from "@/components/PlayButton";
import SongList from "@/components/SongsList";
import { getplaylistData, homePageData } from "@/services/dataAPI";

const page = async ({ params }) => {
  const resolvedParams = await params;
  const playlistId = resolvedParams?.playlistId;
  const playlistData = await getplaylistData(playlistId);

  if (!playlistData) {
    return (
      <div className="w-11/12 max-w-7xl mx-auto py-24 text-center flex flex-col items-center justify-center">
        <div className="w-20 h-20 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-4">
          <img src="/images/logo.png" alt="Musify" className="w-10 h-10 rounded-full" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Playlist Not Found</h2>
        <p className="text-sm text-gray-400 max-w-md mb-6">
          The requested playlist could not be loaded or may no longer be available.
        </p>
        <Link
          href="/"
          className="px-6 py-2.5 rounded-full bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-bold text-sm shadow-lg shadow-rose-500/25 transition-all"
        >
          Explore Music
        </Link>
      </div>
    );
  }

  const coverUrl =
    playlistData?.image?.[2]?.url ||
    playlistData?.image?.[1]?.url ||
    playlistData?.image?.[0]?.url ||
    "";

  return (
    <div className="w-11/12 max-w-7xl mx-auto mt-8 mb-20 animate-fade-in">
      {/* Featured Playlist Hero Banner */}
      <div className="relative rounded-3xl p-5 sm:p-8 lg:p-10 bg-gradient-to-b from-rose-950/40 via-white/[0.03] to-transparent backdrop-blur-2xl border border-rose-500/15 shadow-2xl flex flex-col md:flex-row items-center md:items-end gap-5 sm:gap-7 lg:gap-10">
        <div className="relative w-36 h-36 sm:w-52 sm:h-52 lg:w-60 lg:h-60 flex-shrink-0 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl bg-[#18181f] border border-rose-400/20 shadow-[0_12px_36px_rgba(244,63,94,0.3)] group">
          {coverUrl ? (
            <img
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              src={coverUrl}
              alt={playlistData?.name || "playlist"}
              width={256}
              height={256}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-white/5 text-gray-500">
              <img src="/images/logo.png" alt="Musify" className="w-16 h-16 rounded-full opacity-60" />
            </div>
          )}
        </div>

        <div className="flex flex-col text-center md:text-left text-white min-w-0 flex-1 w-full md:w-auto">
          <span className="text-[11px] sm:text-xs uppercase font-extrabold tracking-widest text-[#f43f5e] mb-1.5 flex items-center justify-center md:justify-start gap-2">
            <span>Featured</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#f43f5e]" />
            <span>Playlist</span>
          </span>
          <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15] sm:leading-[1.1] pb-1.5">
            {playlistData?.name || "Featured Playlist"}
          </h1>
          {playlistData?.description && (
            <p className="text-xs sm:text-sm text-[#b3b3b3] mt-2 line-clamp-2 max-w-2xl font-medium">
              {playlistData.description.replace(/<[^>]*>?/gm, "")}
            </p>
          )}

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-xs text-gray-300 mt-3 font-semibold">
            <span className="flex items-center gap-1.5 text-white">
              <img src="/images/logo.png" alt="Musify" className="w-4 h-4 rounded-full object-cover" /> Musify
            </span>
            {playlistData?.followerCount && (
              <>
                <span>•</span>
                <span>{Number(playlistData.followerCount).toLocaleString()} saves</span>
              </>
            )}
            {playlistData?.songCount && (
              <>
                <span>•</span>
                <span>{playlistData.songCount} songs</span>
              </>
            )}
          </div>

          <PlayButton songList={playlistData} />
        </div>
      </div>

      {/* Songs Section */}
      <div className="mt-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white">
              Songs
            </h2>
            <p className="text-xs text-gray-400 mt-0.5 font-medium">
              Featured tracks included in this playlist
            </p>
          </div>
          {playlistData?.songs?.length > 0 && (
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30">
              {playlistData.songs.length} {playlistData.songs.length === 1 ? "track" : "tracks"}
            </span>
          )}
        </div>
        <SongList SongData={playlistData?.songs} loading={false} />
      </div>
    </div>
  );
};

export default page;

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const res = await homePageData(["english", "hindi", "punjabi"]);
    if (Array.isArray(res?.charts) && res.charts.length > 0) {
      return res.charts
        .filter((playlist) => Boolean(playlist?.id))
        .map((playlist) => ({
          playlistId: playlist.id.toString(),
        }));
    }
    return [];
  } catch (error) {
    console.error("generateStaticParams error:", error);
    return [];
  }
}
