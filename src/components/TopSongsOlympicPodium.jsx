"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { sortSongs } from "@/lib/actions";
import PropTypes from "prop-types";
import { Card } from "shadcn/card";
import { Typography } from "shadcn/typography";
import { Skeleton } from "shadcn/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { Disc3 as AlbumIcon, Music as MusicNoteIcon, Star as StarIcon, Trophy as EmojiEventsIcon } from "lucide-react";

export default function TopSongsOlympicPodium({playlist}) {
    const [topSongs, setTopSongs] = useState([]);
    const [loading, setLoading] = useState(true);
    const isMobile = useIsMobile();
    const [mounted, setMounted] = useState(false);

    const [sortCriteria, setSortCriteria] = useState("score");
    const [sortOrder, setSortOrder] = useState("desc");

    useEffect(() => {
        async function fetchTopSongs() {
            try {
                const {data, error} = await supabase
                    .from("queue")
                    .select("id, title, author, added_at, score, user_id")
                    .eq("playlist", playlist)
                    .order(sortCriteria, {ascending: sortOrder === "asc"})
                    .limit(3);

                if (error) throw error;

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
                        <Skeleton className="w-8 h-8 rounded-full bg-yellow-400/20"/>
                        <Skeleton className="w-44 h-10 bg-white/10"/>
                    </div>

                    {showMobileLayout ? (
                        // Enhanced Mobile skeleton
                        <div className="flex flex-col gap-3 px-3 pb-6">
                            {[1, 2, 3].map((position) => {
                                const skeletonStyles = {
                                    1: {
                                        bg: "bg-yellow-400/10",
                                        border: "border-2 border-yellow-400/30",
                                        scale: "scale-100"
                                    },
                                    2: {bg: "bg-gray-400/10", border: "border-2 border-gray-300/30", scale: "scale-95"},
                                    3: {
                                        bg: "bg-orange-500/10",
                                        border: "border-2 border-orange-400/30",
                                        scale: "scale-90"
                                    },
                                }[position];

                                return (
                                    <div key={position}
                                         className={cn("p-4 rounded-xl relative overflow-hidden transition-all duration-500 backdrop-blur-sm shadow-lg", skeletonStyles.bg, skeletonStyles.border, skeletonStyles.scale)}>
                                        {/* Position badge skeleton */}
                                        <div className="absolute -right-3 -top-3 z-10">
                                            <Skeleton className="w-12 h-12 rounded-full bg-white/20"/>
                                        </div>

                                        {/* Rank indicator */}
                                        <div
                                            className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-white/20 to-transparent"></div>

                                        <div className="flex gap-4 items-center">
                                            {/* Enhanced Album Art skeleton */}
                                            <div className="relative">
                                                <Skeleton
                                                    className="w-16 h-16 sm:w-18 sm:h-18 rounded-xl bg-white/10 flex-shrink-0"/>
                                                <div
                                                    className="absolute -bottom-1 -right-1 w-6 h-6 bg-white/20 rounded-full"></div>
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                {/* Title skeleton */}
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Skeleton className="w-5 h-5 rounded-full bg-white/10"/>
                                                    <Skeleton className="w-3/4 h-5 sm:h-6 bg-white/10"/>
                                                </div>

                                                {/* Author skeleton */}
                                                <div className="flex items-center gap-2 mb-3">
                                                    <Skeleton className="w-4 h-4 rounded-full bg-white/10"/>
                                                    <Skeleton className="w-1/2 h-4 bg-white/10"/>
                                                </div>

                                                {/* Votes and indicators skeleton */}
                                                <div className="flex items-center justify-between">
                                                    <Skeleton className="w-20 h-7 rounded-full bg-white/10"/>
                                                    <div className="flex items-center gap-1">
                                                        {[...Array(3)].map((_, i) => (
                                                            <Skeleton key={i}
                                                                      className="w-2 h-2 rounded-full bg-white/10"/>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Shine effect skeleton */}
                                        <div
                                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 pointer-events-none"></div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        // Desktop skeleton - Olympic podium (2-1-3 layout)
                        <div className="relative mx-auto max-w-7xl pb-8 px-4">
                            <div
                                className="flex items-end justify-center gap-2 sm:gap-4 md:gap-6 lg:gap-8 min-h-[400px] md:min-h-[500px]">
                                {/* Second Place Skeleton - Left */}
                                <div className="flex flex-col items-center">
                                    <div className="flex flex-col items-center mb-4">
                                        <Skeleton
                                            className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gray-300/20 mb-3"/>
                                        <Skeleton className="w-24 md:w-32 h-4 md:h-5 bg-white/10 mb-1"/>
                                        <Skeleton className="w-20 md:w-28 h-3 md:h-4 bg-white/10 mb-2"/>
                                        <Skeleton className="w-16 md:w-20 h-6 rounded-full bg-white/10"/>
                                    </div>
                                    <Skeleton
                                        className="w-24 md:w-32 lg:w-36 h-32 md:h-40 lg:h-44 bg-gray-500/20 rounded-t-xl"/>
                                </div>

                                {/* First Place Skeleton - Center (Highest) */}
                                <div className="flex flex-col items-center">
                                    <div className="flex flex-col items-center mb-4">
                                        <Skeleton
                                            className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-yellow-400/20 mb-3"/>
                                        <Skeleton className="w-28 md:w-36 h-5 md:h-6 bg-white/10 mb-1"/>
                                        <Skeleton className="w-24 md:w-32 h-4 md:h-5 bg-white/10 mb-2"/>
                                        <Skeleton className="w-20 md:w-24 h-7 rounded-full bg-white/10"/>
                                    </div>
                                    <Skeleton
                                        className="w-28 md:w-36 lg:w-40 h-40 md:h-52 lg:h-60 bg-yellow-500/20 rounded-t-xl"/>
                                </div>

                                {/* Third Place Skeleton - Right */}
                                <div className="flex flex-col items-center">
                                    <div className="flex flex-col items-center mb-4">
                                        <Skeleton
                                            className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-orange-600/20 mb-3"/>
                                        <Skeleton className="w-24 md:w-32 h-4 md:h-5 bg-white/10 mb-1"/>
                                        <Skeleton className="w-20 md:w-28 h-3 md:h-4 bg-white/10 mb-2"/>
                                        <Skeleton className="w-16 md:w-20 h-6 rounded-full bg-white/10"/>
                                    </div>
                                    <Skeleton
                                        className="w-24 md:w-32 lg:w-36 h-24 md:h-32 lg:h-36 bg-orange-600/20 rounded-t-xl"/>
                                </div>
                            </div>

                            {/* Spotlight Effects */}
                            <div
                                className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-full h-32 bg-gradient-radial from-teal-500/15 via-teal-500/10 to-transparent rounded-full blur-3xl"></div>
                            <div
                                className="absolute bottom-10 left-1/4 w-32 h-32 bg-yellow-400/10 rounded-full blur-2xl"></div>
                            <div
                                className="absolute bottom-10 right-1/4 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl"></div>
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
                    <div
                        className="absolute left-1/2 top-1/2 w-32 h-32 bg-teal-500/20 rounded-full blur-2xl transform -translate-x-1/2 -translate-y-1/2 z-0"/>
                    <Typography variant="h4"
                                className="font-bold text-white flex items-center justify-center gap-2 relative z-10">
                        <EmojiEventsIcon className="w-8 h-8 text-yellow-400"/>
                        Top 3 Songs
                    </Typography>
                </div>

                {isMobile ? (
                    // Mobile Layout - Enhanced Olympic Cards
                    <div className="flex flex-col gap-3 px-3 pb-6">
                        {sortedSongs.map((song) => {
                            // Enhanced style based on position
                            const positionStyles = {
                                1: {
                                    gradient: "bg-gradient-to-br from-yellow-500/30 via-yellow-400/20 to-yellow-600/30",
                                    border: "border-2 border-yellow-400/60",
                                    badgeColor: "bg-gradient-to-br from-yellow-300 to-yellow-500",
                                    badgeText: "text-yellow-900",
                                    icon: <EmojiEventsIcon className="w-5 h-5 text-yellow-400"/>,
                                    scale: "scale-100",
                                    shadow: "shadow-xl shadow-yellow-400/20",
                                    glow: "ring-2 ring-yellow-400/30",
                                },
                                2: {
                                    gradient: "bg-gradient-to-br from-gray-400/30 via-gray-300/20 to-gray-500/30",
                                    border: "border-2 border-gray-300/60",
                                    badgeColor: "bg-gradient-to-br from-gray-200 to-gray-400",
                                    badgeText: "text-gray-800",
                                    icon: <StarIcon className="w-5 h-5 text-gray-300"/>,
                                    scale: "scale-95",
                                    shadow: "shadow-lg shadow-gray-400/20",
                                    glow: "ring-2 ring-gray-300/30",
                                },
                                3: {
                                    gradient: "bg-gradient-to-br from-orange-500/30 via-orange-400/20 to-orange-700/30",
                                    border: "border-2 border-orange-500/60",
                                    badgeColor: "bg-gradient-to-br from-orange-400 to-orange-600",
                                    badgeText: "text-white",
                                    icon: <StarIcon className="w-5 h-5 text-orange-400"/>,
                                    scale: "scale-90",
                                    shadow: "shadow-lg shadow-orange-500/20",
                                    glow: "ring-2 ring-orange-400/30",
                                },
                            }[song.position];

                            return (
                                <Card key={song.id}
                                      className={cn(positionStyles.gradient, positionStyles.border, positionStyles.scale, positionStyles.shadow, positionStyles.glow, "p-4 relative overflow-hidden transition-all duration-500 hover:scale-105 hover:shadow-2xl backdrop-blur-sm")}>
                                    {/* Enhanced Position Badge */}
                                    <div className="absolute -right-3 -top-3 z-10">
                                        <div
                                            className={cn(positionStyles.badgeColor, "w-12 h-12 rounded-full flex items-center justify-center shadow-lg border-2 border-white/50")}>
                                            <Typography
                                                className={cn("font-bold text-lg", positionStyles.badgeText)}>{song.position}</Typography>
                                        </div>
                                    </div>

                                    {/* Rank indicator on the left */}
                                    <div
                                        className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-white/30 to-transparent"></div>

                                    <div className="flex gap-4 items-center">
                                        {/* Enhanced Album Art */}
                                        <div className="relative">
                                            <div
                                                className="w-16 h-16 sm:w-18 sm:h-18 rounded-xl bg-gradient-to-br from-black/60 to-black/40 flex items-center justify-center flex-shrink-0 border-2 border-teal-400/40 shadow-lg">
                                                <AlbumIcon className="w-8 h-8 sm:w-9 sm:h-9 text-teal-400/80"/>
                                            </div>
                                            {/* Rank number overlay */}
                                            <div
                                                className="absolute -bottom-1 -right-1 w-6 h-6 bg-white/90 rounded-full flex items-center justify-center text-xs font-bold text-gray-800 shadow-md">{song.position}</div>
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            {/* Title with icon */}
                                            <div className="flex items-center gap-2 mb-2">
                                                {positionStyles.icon}
                                                <Typography
                                                    className="font-bold text-white text-base sm:text-lg truncate leading-tight">{song.title}</Typography>
                                            </div>

                                            {/* Author */}
                                            <div className="flex items-center gap-2 mb-3">
                                                <MusicNoteIcon className="w-4 h-4 text-teal-400 flex-shrink-0"/>
                                                <Typography variant="sm" className="text-gray-200 truncate">
                                                    {song.author}
                                                </Typography>
                                            </div>

                                            {/* Enhanced votes display */}
                                            <div className="flex items-center justify-between">
                                                <div
                                                    className="bg-black/40 backdrop-blur-sm rounded-full px-3 py-1.5 border border-white/20">
                                                    <Typography variant="xs" className="font-semibold text-teal-100">
                                                        {song.votes} votes
                                                    </Typography>
                                                </div>

                                                {/* Position indicator */}
                                                <div className="flex items-center gap-1">
                                                    {[...Array(3)].map((_, i) => (
                                                        <div key={i}
                                                             className={cn("w-2 h-2 rounded-full transition-all duration-300", i < song.position ? (song.position === 1 ? "bg-yellow-400" : song.position === 2 ? "bg-gray-300" : "bg-orange-400") : "bg-white/20")}/>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Subtle shine effect */}
                                    <div
                                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-200%] transition-transform duration-1000 pointer-events-none"></div>
                                </Card>
                            );
                        })}
                    </div>
                ) : (
                    // Desktop Layout - Olympic Podium (2-1-3 layout)
                    <div className="relative mx-auto max-w-7xl pb-8 px-4">
                        <div
                            className="flex items-end justify-center gap-2 sm:gap-4 md:gap-6 lg:gap-8 min-h-[400px] md:min-h-[500px]">
                            {/* Second Place - Left */}
                            <div className="flex flex-col items-center group">
                                {/* Winner Info */}
                                <div
                                    className="flex flex-col items-center mb-4 transform transition-all duration-500 group-hover:scale-105">
                                    <div className="relative mb-3">
                                        <div
                                            className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-gray-200 to-gray-400 flex items-center justify-center border-4 border-gray-300 shadow-xl">
                                            <StarIcon className="w-8 h-8 md:w-10 md:h-10 text-gray-600"/>
                                        </div>
                                        <div
                                            className="absolute -top-2 -right-2 w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-black font-bold text-lg border-2 border-white shadow-lg">2
                                        </div>
                                    </div>
                                    <Typography
                                        className="font-bold text-white text-center text-sm md:text-base max-w-[120px] md:max-w-[150px] truncate mb-1">{sortedSongs[1]?.title || "—"}</Typography>
                                    <Typography variant="sm"
                                                className="text-gray-300 text-center max-w-[120px] md:max-w-[150px] truncate mb-2">
                                        {sortedSongs[1]?.author || "—"}
                                    </Typography>
                                    <div
                                        className="bg-gray-800/60 backdrop-blur-sm rounded-full px-3 py-1 border border-gray-400/30">
                                        <Typography variant="xs" className="font-medium text-gray-200">
                                            {sortedSongs[1]?.votes || 0} votes
                                        </Typography>
                                    </div>
                                </div>

                                {/* Podium Block */}
                                <div className="relative w-24 md:w-32 lg:w-36 h-32 md:h-40 lg:h-44">
                                    <div
                                        className="w-full h-full bg-gradient-to-t from-gray-600 via-gray-500 to-gray-400 rounded-t-xl shadow-2xl border-t-4 border-gray-300 relative overflow-hidden">
                                        {/* Shine effect */}
                                        <div
                                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 animate-pulse"></div>
                                        {/* Podium number */}
                                        <div
                                            className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-10 h-10 md:w-12 md:h-12 bg-gray-300 text-gray-800 font-bold rounded-full flex items-center justify-center text-xl md:text-2xl shadow-lg border-2 border-white">2
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* First Place - Center (Highest) */}
                            <div className="flex flex-col items-center group">
                                {/* Winner Info */}
                                <div
                                    className="flex flex-col items-center mb-4 transform transition-all duration-500 group-hover:scale-105">
                                    <div className="relative mb-3">
                                        <div
                                            className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-600 flex items-center justify-center border-4 border-yellow-400 shadow-2xl shadow-yellow-400/50">
                                            <EmojiEventsIcon className="w-10 h-10 md:w-12 md:h-12 text-yellow-800"/>
                                        </div>
                                        <div
                                            className="absolute -top-3 -right-3 w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center text-yellow-900 font-bold text-xl border-2 border-white shadow-xl">1
                                        </div>
                                        {/* Crown effect */}
                                        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                                            <div
                                                className="w-8 h-6 bg-gradient-to-t from-yellow-400 to-yellow-300 rounded-t-full border-2 border-yellow-500"></div>
                                        </div>
                                    </div>
                                    <Typography variant="h6"
                                                className="font-bold text-white text-center max-w-[140px] md:max-w-[180px] truncate mb-1">
                                        {sortedSongs[0]?.title || "—"}
                                    </Typography>
                                    <Typography
                                        className="text-gray-200 text-center max-w-[140px] md:max-w-[180px] truncate mb-2">{sortedSongs[0]?.author || "—"}</Typography>
                                    <div
                                        className="bg-yellow-900/60 backdrop-blur-sm rounded-full px-4 py-1 border border-yellow-400/50">
                                        <Typography variant="sm" className="font-medium text-yellow-100">
                                            {sortedSongs[0]?.votes || 0} votes
                                        </Typography>
                                    </div>
                                </div>

                                {/* Podium Block - Highest */}
                                <div className="relative w-28 md:w-36 lg:w-40 h-40 md:h-52 lg:h-60">
                                    <div
                                        className="w-full h-full bg-gradient-to-t from-yellow-700 via-yellow-600 to-yellow-400 rounded-t-xl shadow-2xl border-t-4 border-yellow-300 relative overflow-hidden">
                                        {/* Shine effect */}
                                        <div
                                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 animate-pulse"></div>
                                        {/* Podium number */}
                                        <div
                                            className="absolute bottom-6 left-1/2 transform -translate-x-1/2 w-12 h-12 md:w-14 md:h-14 bg-yellow-400 text-yellow-900 font-bold rounded-full flex items-center justify-center text-2xl md:text-3xl shadow-xl border-2 border-white">1
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Third Place - Right */}
                            <div className="flex flex-col items-center group">
                                {/* Winner Info */}
                                <div
                                    className="flex flex-col items-center mb-4 transform transition-all duration-500 group-hover:scale-105">
                                    <div className="relative mb-3">
                                        <div
                                            className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-orange-400 to-orange-700 flex items-center justify-center border-4 border-orange-500 shadow-xl">
                                            <StarIcon className="w-8 h-8 md:w-10 md:h-10 text-orange-100"/>
                                        </div>
                                        <div
                                            className="absolute -top-2 -right-2 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-lg border-2 border-white shadow-lg">3
                                        </div>
                                    </div>
                                    <Typography
                                        className="font-bold text-white text-center text-sm md:text-base max-w-[120px] md:max-w-[150px] truncate mb-1">{sortedSongs[2]?.title || "—"}</Typography>
                                    <Typography variant="sm"
                                                className="text-gray-300 text-center max-w-[120px] md:max-w-[150px] truncate mb-2">
                                        {sortedSongs[2]?.author || "—"}
                                    </Typography>
                                    <div
                                        className="bg-orange-900/60 backdrop-blur-sm rounded-full px-3 py-1 border border-orange-400/30">
                                        <Typography variant="xs" className="font-medium text-orange-200">
                                            {sortedSongs[2]?.votes || 0} votes
                                        </Typography>
                                    </div>
                                </div>

                                {/* Podium Block */}
                                <div className="relative w-24 md:w-32 lg:w-36 h-24 md:h-32 lg:h-36">
                                    <div
                                        className="w-full h-full bg-gradient-to-t from-orange-800 via-orange-700 to-orange-500 rounded-t-xl shadow-2xl border-t-4 border-orange-400 relative overflow-hidden">
                                        {/* Shine effect */}
                                        <div
                                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 animate-pulse"></div>
                                        {/* Podium number */}
                                        <div
                                            className="absolute bottom-3 left-1/2 transform -translate-x-1/2 w-10 h-10 md:w-12 md:h-12 bg-orange-500 text-white font-bold rounded-full flex items-center justify-center text-xl md:text-2xl shadow-lg border-2 border-white">3
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Enhanced Spotlight Effects */}
                        <div
                            className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-full h-32 bg-gradient-radial from-teal-500/20 via-teal-500/10 to-transparent rounded-full blur-3xl"></div>
                        <div
                            className="absolute bottom-10 left-1/4 w-32 h-32 bg-yellow-400/15 rounded-full blur-2xl animate-pulse"></div>
                        <div
                            className="absolute bottom-10 right-1/4 w-32 h-32 bg-teal-500/15 rounded-full blur-2xl animate-pulse"></div>

                        {/* Confetti effect */}
                        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
                            <div className="absolute top-10 left-1/4 w-2 h-2 bg-yellow-400 rounded-full animate-bounce"
                                 style={{animationDelay: "0s"}}></div>
                            <div className="absolute top-16 right-1/3 w-2 h-2 bg-teal-400 rounded-full animate-bounce"
                                 style={{animationDelay: "0.5s"}}></div>
                            <div className="absolute top-8 left-2/3 w-2 h-2 bg-orange-400 rounded-full animate-bounce"
                                 style={{animationDelay: "1s"}}></div>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
}

TopSongsOlympicPodium.propTypes = {
    playlist: PropTypes.number.isRequired,
};
