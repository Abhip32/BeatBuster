import PlayButton from "@/components/PlayButton";
import SongList from "@/components/SongsList";
import { getplaylistData, homePageData } from "@/services/dataAPI";
import { BsSpotify } from "react-icons/bs";

const page = async ({ params }) => {
  const resolvedParams = await params;
  const playlistId = resolvedParams?.playlistId;
  const playlistData = await getplaylistData(playlistId);

  const coverUrl =
    playlistData?.image?.[2]?.url ||
    playlistData?.image?.[1]?.url ||
    playlistData?.image?.[0]?.url ||
    "";

  return (
    <div className="w-11/12 max-w-7xl mx-auto mt-8 mb-20">
      {/* Spotify Hero Banner */}
      <div className="relative rounded-3xl p-6 sm:p-8 lg:p-10 bg-gradient-to-b from-white/[0.08] to-white/[0.02] backdrop-blur-2xl border border-white/10 shadow-2xl flex flex-col md:flex-row items-center md:items-end gap-6 lg:gap-10">
        <div className="relative w-48 h-48 sm:w-56 sm:h-56 lg:w-64 lg:h-64 flex-shrink-0 rounded-2xl overflow-hidden shadow-2xl bg-[#18181f]">
          {coverUrl ? (
            <img
              className="w-full h-full object-cover"
              src={coverUrl}
              alt={playlistData?.name || "playlist"}
              width={256}
              height={256}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-white/5 text-gray-500">
              <BsSpotify size={64} className="text-[#f43f5e]" />
            </div>
          )}
        </div>

        <div className="flex flex-col text-center md:text-left text-white min-w-0 flex-1">
          <span className="text-xs uppercase font-extrabold tracking-widest text-[#f43f5e] mb-1">
            Playlist
          </span>
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight line-clamp-2">
            {playlistData?.name || "Featured Playlist"}
          </h1>
          {playlistData?.description && (
            <p className="text-xs sm:text-sm text-[#b3b3b3] mt-2 line-clamp-2 max-w-2xl font-medium">
              {playlistData.description.replace(/<[^>]*>?/gm, "")}
            </p>
          )}

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-xs text-gray-300 mt-4 font-semibold">
            <span className="flex items-center gap-1.5 text-white">
              <BsSpotify className="text-[#f43f5e]" /> Musify
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
        <h2 className="text-2xl font-bold tracking-tight text-white mb-2">
          Songs
        </h2>
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
