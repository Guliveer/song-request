"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { sortSongs } from "@/lib/actions";
import PropTypes from "prop-types";
import { Card } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { Music as MusicNoteIcon, Trophy as EmojiEventsIcon, Star as StarIcon, Disc3 as AlbumIcon } from "lucide-react";

export default function TopSongsOlympicPodium({ playlist }) {
  const [topSongs, setTopSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const isMobile = useIsMobile();
  const [mounted, setMounted] = useState(false);

  // Dodajemy stany dla kryteriów sortowania - domyślnie score/desc
  const [sortCriteria, setSortCriteria] = useState("score");
  const [sortOrder, setSortOrder] = useState("desc");

  // Pobierz dane z Supabase
  useEffect(() => {
    async function fetchTopSongs() {
      try {
        const { data, error } = await supabase
          .from("queue")
          .select("id, title, author, added_at, score, user_id")
          .eq("playlist", playlist)
          .order(sortCriteria, { ascending: sortOrder === "asc" })
          .limit(3);

        if (error) throw error;

        // Używamy funkcji sortSongs do ostatecznego sortowania
        const sortedData = sortSongs(data, sortCriteria, sortOrder);

        const formattedSongs = sortedData.map((song, index) => ({
          id: song.id,
          position: index + 1,
          title: song.title,
          author: song.author,
          date: new Date(song.added_at).toLocaleString(),
          votes: song.score,
        }));

        setTopSongs(formattedSongs);
      } catch (error) {
        console.error("Error fetching songs:", error);
        setTopSongs([]);
      } finally {
        setLoading(false);
      }
    }

    fetchTopSongs();
    setMounted(true);
  }, [sortCriteria, sortOrder]);

  // Sort songs by position
  const sortedSongs = [...topSongs].sort((a, b) => a.position - b.position);
  const showMobileLayout = mounted ? isMobile : false;

  if (loading)
    return (
      <div className="w-full px-1 md:px-2">
        <Card className="relative overflow-hidden bg-gradient-to-b from-teal-500/20 to-teal-500/5 p-6">
          {/* Title skeleton */}
          <div className="relative text-center mb-6 flex justify-center items-center gap-2">
            <Skeleton className="w-8 h-8 rounded-full bg-yellow-400/20" />
            <Skeleton className="w-44 h-10 bg-white/10" />
          </div>

          {showMobileLayout ? (
            // Mobile skeleton
            <div className="flex flex-col gap-4 px-2 pb-6">
              {[1, 2, 3].map((position) => (
                <div
                  key={position}
                  className="p-4 rounded-lg bg-white/10 flex gap-3"
                  style={{
                    transform: `scale(${1 - (position - 1) * 0.05})`,
                    transformOrigin: "center top",
                  }}>
                  <Skeleton className="w-16 h-16 rounded bg-white/5 flex-shrink-0" />
                  <div className="w-full">
                    <div className="flex items-center gap-2 mb-1">
                      <Skeleton className="w-5 h-5 rounded-full bg-white/5" />
                      <Skeleton className="w-3/4 h-6 bg-white/5" />
                    </div>
                    <div className="flex items-center gap-1 mb-2">
                      <Skeleton className="w-3.5 h-3.5 rounded-full bg-white/5" />
                      <Skeleton className="w-1/2 h-4 bg-white/5" />
                    </div>
                    <Skeleton className="w-20 h-6 rounded-full bg-white/5" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Desktop skeleton - podium
            <div className="relative h-90 mx-auto max-w-6xl">
              <div className="grid grid-cols-3 justify-center items-end h-full">
                {/* Second Place Skeleton */}
                <div className="h-74 flex flex-col">
                  <div className="flex-1 flex flex-col items-center justify-end pb-2">
                    <Skeleton className="w-16 h-16 rounded-full bg-gray-300/20 mb-2" />
                    <Skeleton className="w-30 h-6 bg-white/10" />
                    <Skeleton className="w-25 h-4 bg-white/10 mt-1" />
                    <Skeleton className="w-20 h-6 rounded-full bg-white/10 mt-2" />
                  </div>
                  <Skeleton className="h-44 bg-gray-500/20 rounded-t-lg" />
                </div>

                {/* First Place Skeleton */}
                <div className="h-90 flex flex-col z-10">
                  <div className="flex-1 flex flex-col items-center justify-end pb-2">
                    <Skeleton className="w-20 h-20 rounded-full bg-yellow-400/20 mb-2" />
                    <Skeleton className="w-35 h-8 bg-white/10" />
                    <Skeleton className="w-30 h-5 bg-white/10 mt-1" />
                    <Skeleton className="w-25 h-7 rounded-full bg-white/10 mt-2" />
                  </div>
                  <Skeleton className="h-60 bg-yellow-500/20 rounded-t-lg" />
                </div>

                {/* Third Place Skeleton */}
                <div className="h-60 flex flex-col">
                  <div className="flex-1 flex flex-col items-center justify-end pb-2">
                    <Skeleton className="w-16 h-16 rounded-full bg-orange-600/20 mb-2" />
                    <Skeleton className="w-30 h-6 bg-white/10" />
                    <Skeleton className="w-25 h-4 bg-white/10 mt-1" />
                    <Skeleton className="w-20 h-6 rounded-full bg-white/10 mt-2" />
                  </div>
                  <Skeleton className="h-30 bg-orange-600/20 rounded-t-lg" />
                </div>
              </div>

              {/* Spotlight Effects */}
              <div className="absolute bottom-20 left-1/4 w-25 h-45 bg-teal-500/15 rounded-full blur-3xl" />
              <div className="absolute bottom-20 right-1/4 w-25 h-45 bg-teal-500/15 rounded-full blur-3xl" />
            </div>
          )}
        </Card>
      </div>
    );

  return (
    <div className="w-full px-1 md:px-2">
      <Card className="relative overflow-hidden bg-gradient-to-b from-teal-500/20 to-teal-500/5">
        {/* Title */}
        <div className="relative text-center mb-6 pt-6">
          <div className="absolute left-1/2 top-1/2 w-32 h-32 bg-teal-500/20 rounded-full blur-2xl transform -translate-x-1/2 -translate-y-1/2 z-0" />
          <Typography variant="h4" className="font-bold text-white flex items-center justify-center gap-2 relative z-10">
            <EmojiEventsIcon className="w-8 h-8 text-yellow-400" />
            Top 3 Songs
          </Typography>
        </div>

        {isMobile ? (
          // Mobile Layout - Stacked cards
          <div className="flex flex-col gap-4 px-2 pb-6">
            {sortedSongs.map((song) => {
              // Style based on position
              const positionStyles = {
                1: {
                  gradient: "bg-gradient-to-r from-yellow-600/20 via-yellow-400/10 to-yellow-600/20",
                  border: "border border-yellow-400/50",
                  badgeColor: "bg-yellow-400",
                  icon: <EmojiEventsIcon className="w-5 h-5 text-yellow-400" />,
                  scale: "scale-100",
                },
                2: {
                  gradient: "bg-gradient-to-r from-gray-400/20 via-gray-300/10 to-gray-400/20",
                  border: "border border-gray-300/50",
                  badgeColor: "bg-gray-300",
                  icon: <StarIcon className="w-5 h-5 text-gray-300" />,
                  scale: "scale-95",
                },
                3: {
                  gradient: "bg-gradient-to-r from-orange-600/20 via-orange-500/10 to-orange-600/20",
                  border: "border border-orange-500/50",
                  badgeColor: "bg-orange-600",
                  icon: <StarIcon className="w-5 h-5 text-orange-600" />,
                  scale: "scale-90",
                },
              }[song.position];

              return (
                <Card key={song.id} className={cn(positionStyles.gradient, positionStyles.border, positionStyles.scale, "p-4 relative overflow-hidden transition-transform duration-300 hover:scale-105")}>
                  {/* Position Badge */}
                  <div className="absolute -right-4 -top-4 w-16 h-16">
                    <div className={cn(positionStyles.badgeColor, "transform rotate-45 w-20 h-10 origin-bottom-right")}>
                      <Typography className="absolute bottom-0 right-5 text-black font-bold">#{song.position}</Typography>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    {/* Album Art */}
                    <div className="w-16 h-16 rounded bg-black/50 flex items-center justify-center flex-shrink-0 border border-teal-500/30">
                      <AlbumIcon className="w-8 h-8 text-teal-400/70" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {positionStyles.icon}
                        <Typography className="font-bold text-white truncate">{song.title}</Typography>
                      </div>

                      <div className="flex items-center gap-1 mb-2">
                        <MusicNoteIcon className="w-3.5 h-3.5 text-teal-400" />
                        <Typography variant="sm" className="text-gray-300 truncate">
                          {song.author}
                        </Typography>
                      </div>

                      <div className="bg-black/30 rounded-full px-2 py-1 inline-block">
                        <Typography variant="xs" className="font-medium text-teal-200">
                          {song.votes} votes
                        </Typography>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          // Desktop Layout - Podium
          <div className="relative h-90 mx-auto max-w-6xl pb-6">
            <div className="absolute bottom-0 left-0 right-0 flex items-end justify-center h-full">
              {/* Podiums for 2nd, 1st and 3rd place */}
              <div className="grid grid-cols-3 justify-center items-end w-full">
                {/* Second Place */}
                <div className="h-74 flex flex-col relative">
                  <div className="flex-1 flex flex-col items-center justify-end pb-2">
                    <div className="w-16 h-16 rounded-full bg-black/50 flex items-center justify-center mb-2 border-2 border-gray-300/50 shadow-lg shadow-gray-300/30">
                      <StarIcon className="w-8 h-8 text-gray-300" />
                    </div>
                    <Typography className="font-bold text-white text-center max-w-50 truncate">{sortedSongs[1]?.title || "—"}</Typography>
                    <Typography variant="sm" className="text-gray-300 max-w-50 truncate">
                      {sortedSongs[1]?.author || "—"}
                    </Typography>
                    <div className="mt-1 bg-black/30 rounded-full px-3 py-1">
                      <Typography variant="sm" className="font-medium text-teal-200">
                        Score: {sortedSongs[1]?.votes || 0}
                      </Typography>
                    </div>
                  </div>

                  {/* Podium Block */}
                  <div className="h-44 w-full bg-gradient-to-t from-gray-600/50 to-gray-500/30 border-t-2 border-gray-300/50 relative shadow-inner">
                    {/* Number on podium */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-9 h-9 bg-gray-300 text-black font-bold rounded-full flex items-center justify-center text-xl shadow-md border-2 border-white/70">2</div>
                  </div>
                </div>

                {/* First Place */}
                <div className="h-90 flex flex-col relative z-10">
                  <div className="flex-1 flex flex-col items-center justify-end pb-2">
                    <div className="w-20 h-20 rounded-full bg-black/50 flex items-center justify-center mb-2 border-2 border-yellow-400/50 shadow-lg shadow-yellow-400/40">
                      <EmojiEventsIcon className="w-10 h-10 text-yellow-400" />
                    </div>
                    <Typography variant="h6" className="font-bold text-white text-center max-w-50 truncate">
                      {sortedSongs[0]?.title || "—"}
                    </Typography>
                    <Typography className="text-gray-200 max-w-50 truncate">{sortedSongs[0]?.author || "—"}</Typography>
                    <div className="mt-2 bg-black/30 rounded-full px-4 py-1">
                      <Typography className="font-medium text-teal-100">Score: {sortedSongs[0]?.votes || 0}</Typography>
                    </div>
                  </div>

                  {/* Podium Block */}
                  <div className="h-60 w-full bg-gradient-to-t from-yellow-700/50 to-yellow-600/30 border-t-2 border-yellow-400/50 relative shadow-inner">
                    {/* Number on podium */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-11 h-11 bg-yellow-400 text-black font-bold rounded-full flex items-center justify-center text-2xl shadow-md border-2 border-white/70">1</div>
                  </div>
                </div>

                {/* Third Place */}
                <div className="h-60 flex flex-col relative">
                  <div className="flex-1 flex flex-col items-center justify-end pb-2">
                    <div className="w-16 h-16 rounded-full bg-black/50 flex items-center justify-center mb-2 border-2 border-orange-600/50 shadow-lg shadow-orange-600/30">
                      <StarIcon className="w-8 h-8 text-orange-600" />
                    </div>
                    <Typography className="font-bold text-white text-center max-w-50 truncate">{sortedSongs[2]?.title || "—"}</Typography>
                    <Typography variant="sm" className="text-gray-300 max-w-50 truncate">
                      {sortedSongs[2]?.author || "—"}
                    </Typography>
                    <div className="mt-1 bg-black/30 rounded-full px-3 py-1">
                      <Typography variant="sm" className="font-medium text-teal-200">
                        Score: {sortedSongs[2]?.votes || 0}
                      </Typography>
                    </div>
                  </div>

                  {/* Podium Block */}
                  <div className="h-30 w-full bg-gradient-to-t from-orange-800/50 to-orange-600/30 border-t-2 border-orange-600/50 relative shadow-inner">
                    {/* Number on podium */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-9 h-9 bg-orange-600 text-black font-bold rounded-full flex items-center justify-center text-xl shadow-md border-2 border-white/70">3</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Spotlight Effects */}
            <div className="absolute bottom-20 left-1/4 w-25 h-45 bg-teal-500/15 rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-1/4 w-25 h-45 bg-teal-500/15 rounded-full blur-3xl" />
          </div>
        )}
      </Card>
    </div>
  );
}

TopSongsOlympicPodium.propTypes = {
  playlist: PropTypes.number.isRequired,
};
