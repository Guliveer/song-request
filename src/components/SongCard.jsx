import PropTypes from 'prop-types';
import React, {useState, useEffect, useCallback} from 'react';
import Link from "next/link";
import {supabase} from '@/lib/supabase';
import {useRouter} from 'next/router';
import SkeletonSongCard from "@/components/skeletons/SkeletonSongCard";
import {
    getUserInfo, getSongData, getCurrentUser, removeUserVote,
    updateUserVote, playSound, genUserAvatar
} from "@/lib/actions";
import debounce from 'lodash.debounce';
import {extractYoutubeVideoId, fetchYouTubeMetadata} from "@/lib/youtube";
import { extractSpotifyTrackId} from "@/lib/spotify";
import { fetchSpotifyMetadata } from "@/lib/spotify";
import SpotifyPlayer from "@/components/SpotifyPlayer";
import YouTube from 'react-youtube';
import {
    Card,
    CardContent
} from "shadcn/card"
import {
    Tooltip,
    TooltipTrigger,
    TooltipContent,
    TooltipProvider
} from "shadcn/tooltip"
import { Button } from "shadcn/button"
import { Avatar, AvatarFallback, AvatarImage } from "shadcn/avatar"
import {
    ExternalLink,
    Music,
    CirclePlay,
    StopCircle,
    User,
    ChevronUp as VoteUp,
    ChevronDown as VoteDown,
    Trash2,
    Ban,
    RotateCw,
    CalendarClock as DateAddedIcon,
} from "lucide-react"
import {Spotify as SpotifyIcon} from "@/lib/authProviders";

function SongCard({id, currentlyPreviewingSongId, setCurrentlyPreviewingSongId}) {
    const [songData, setSongData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [userVote, setUserVote] = useState(null);
    const [error, setError] = useState(null);
    const [isFollowing, setIsFollowing] = useState(false);
    const [followedUsersVotes, setFollowedUsersVotes] = useState([]);
    const router = useRouter();
    const [isBanned, setIsBanned] = useState(false);
    const [hovered, setHovered] = useState(false);
    const [ytMetadataLoading, setYtMetadataLoading] = useState(false);
    const [spotifyConnected, setSpotifyConnected] = useState(false);
    const [showPlayer, setShowPlayer] = useState(false);

    const isAdminPanel = router.pathname.startsWith("/admin");

    const fetchData = useCallback(async () => {
        try {
            const [song, currentUser] = await Promise.all([getSongData(id), getCurrentUser()]);

            if (currentUser) {
                setUser(currentUser);

                const {data: banData, error: banError} = await supabase
                    .from('users')
                    .select('ban_status')
                    .eq('id', currentUser.id)
                    .single();

                if (!banError && banData?.ban_status > 0) {
                    setIsBanned(true);
                }

                const {data: voteData, error: voteError} = await supabase
                    .from('votes')
                    .select('vote')
                    .eq('song_id', id)
                    .eq('user_id', currentUser.id)
                    .single();

                if (!voteError) {
                    setUserVote(voteData.vote);
                } else {
                    setUserVote(null);
                }

                const {data: userData, error: userError} = await supabase
                    .from('users')
                    .select('followed_users')
                    .eq('id', currentUser.id)
                    .single();

                if (!userError && userData.followed_users) {
                    setIsFollowing(userData.followed_users.includes(song.user_id));
                    if (userData.followed_users.length > 0) {
                        const {data: followedVotes, error: followedVotesError} = await supabase
                            .from('votes')
                            .select('user_id, vote')
                            .eq('song_id', id)
                            .in('user_id', userData.followed_users);

                        if (!followedVotesError && followedVotes) {
                            const votesWithUsernames = await Promise.all(followedVotes.map(async (vote) => {
                                const userInfo = await getUserInfo(vote.user_id);
                                const avatarUrl = await genUserAvatar(vote.user_id);
                                return {
                                    ...vote,
                                    username: userInfo ? userInfo.username : 'User',
                                    avatar: avatarUrl
                                };
                            }));

                            setFollowedUsersVotes(votesWithUsernames);
                        }
                    }
                }
            }

            const userInfo = await getUserInfo(song.user_id);
            song.username = userInfo ? '@' + userInfo.username : song.user_id;
            song.rawUsername = userInfo ? userInfo.username : '';
            song.rawUserId = song.user_id;

            setSongData(song);

            // If title or author is missing – get from YouTube
            if ((!song.title || !song.author) && song.url.includes('youtube.com')) {
                setYtMetadataLoading(true);
                try {
                    const videoId = extractYoutubeVideoId(song.url);
                    if (videoId) {
                        const metadata = await fetchYouTubeMetadata(videoId);
                        if (metadata) {
                            song.title = metadata.title;
                            song.author = metadata.channelTitle;
                            setSongData({ ...song }); // update state
                        }
                    }
                } catch (err) {
                    console.error("Error fetching YouTube metadata", err);
                } finally {
                    setYtMetadataLoading(false);
                }
            }

            // Additionally, if title or author is missing – get from Spotify
            if ((!song.title || !song.author) && song.url.includes("spotify.com")) {
                try {
                    const trackId = extractSpotifyTrackId(song.url);
                    if (trackId) {
                        const metadata = await fetchSpotifyMetadata(trackId);
                        if (metadata) {
                            song.title = metadata.title;
                            song.author = metadata.author;
                            setSongData({ ...song }); // update
                        }
                    }
                } catch (err) {
                    console.error("Error fetching Spotify metadata", err);
                }
            }

        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        if (!songData) return;

        const spotifyTrackId = extractSpotifyTrackId(songData.url);
        const isSpotify = Boolean(spotifyTrackId);

        async function checkSpotify() {
            const { data } = await supabase.auth.getUserIdentities();
            const spotify = data?.identities?.find(id => id.provider === "spotify");
            setSpotifyConnected(!!spotify);
        }

        if (isSpotify) checkSpotify();
    }, [songData]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleVote = useCallback(debounce(async (newVoteValue) => {
        if (!user) {
            setError("You have to be logged in to vote.");
            return;
        }

        let resultVoteVal = null;

        try {
            if (userVote === newVoteValue) {
                const response = await removeUserVote(id, user.id);
                if (response !== true) {
                    setError(`Error while removing vote: ${response}`);
                    resultVoteVal = null;
                }
            } else {
                const response = await updateUserVote(id, user.id, newVoteValue);
                if (response !== true) {
                    setError(`Voting error: ${response}`);
                    return;
                }
                resultVoteVal = newVoteValue;

                if (
                    user.id !== songData.rawUserId && // do not send notifications to yourself
                    newVoteValue === 1                // only for likes (upvotes)
                ) {
                    // Use props.id as the song identifier!
                    const { data: existingNotifications } = await supabase
                        .from("notifications")
                        .select("id")
                        .eq("user_id", songData.rawUserId)
                        .eq("sender_id", user.id)
                        .eq("type", "song_like")
                        .eq("link", `/song/${id}`);

                    if (!existingNotifications || existingNotifications.length === 0) {
                        let username = user?.username;
                        if (!username) {
                            const { data: userInfo } = await supabase
                                .from('users')
                                .select('username')
                                .eq('id', user.id)
                                .single();
                            username = userInfo?.username || user.id;
                        }
                        await supabase
                            .from("notifications")
                            .insert([{
                                user_id: songData.rawUserId,
                                sender_id: user.id,
                                type: "song_like",
                                message: `User ${username} liked your song "${songData.title}".`,
                                link: `/song/${id}`,
                                read: false
                            }]);
                    }
                }
            }

            await playSound('click', 0.75);
        } catch (error) {
            console.error("Error while placing a vote:", error);
            setError(`Something went wrong: ${error.message}`);
        } finally {
            await fetchData();
            setUserVote(resultVoteVal);
        }
    }, 300), [user, userVote, id, fetchData, songData]);

    // Admin actions
    const handleDelete = async () => {
        const {error} = await supabase
            .from('queue')
            .delete()
            .eq('id', id);

        if (error) {
            setError("Błąd podczas usuwania piosenki.");
        } else {
            router.reload();
        }
    };

    const handleYouTubeReady = (event) => {
        event.target.playVideo();
    };

    const handleResetVotes = async () => {
        const {error} = await supabase
            .from('votes')
            .delete()
            .eq('song_id', id);

        if (error) {
            setError("Błąd podczas resetowania głosów.");
        } else {
            router.reload();
        }
    };

    const handleBanAndDelete = async () => {
        const {error: insertError} = await supabase
            .from('banned_url')
            .insert([{url: songData.url}]);

        if (insertError) {
            setError("Błąd podczas banowania URL.");
            return;
        }

        const {error: deleteError} = await supabase
            .from('queue')
            .delete()
            .eq('id', id);

        if (deleteError) {
            setError("Błąd podczas usuwania piosenki.");
        } else {
            router.reload();
        }
    };

    const handleFollow = async () => {
        if (!user || !songData || user.id === songData.rawUserId) {
            return;
        }

        try {
            const {data: userData, error: userError} = await supabase
                .from('users')
                .select('followed_users')
                .eq('id', user.id)
                .single();

            if (userError) {
                setError("Cannot retrieve user data");
                return;
            }

            const currentFollowed = userData.followed_users || [];
            const updatedFollowed = [...currentFollowed, songData.rawUserId];

            const {error: updateError} = await supabase
                .from('users')
                .update({followed_users: updatedFollowed})
                .eq('id', user.id);

            if (updateError) {
                setError("Cannot update followed users list");
                return;
            }

            let username = user.username;
            if (!username) {
                const { data: userInfo } = await supabase
                    .from('users')
                    .select('username')
                    .eq('id', user.id)
                    .single();
                username = userInfo?.username || user.id;
            }

            await supabase
                .from("notifications")
                .insert([{
                    user_id: songData.rawUserId, // odbiorca powiadomienia (autor piosenki)
                    sender_id: user.id,          // kto dodał (Ty)
                    type: "new_follower",
                    message: `User ${username} started following you!`,
                    link: `/user/${user.id}`,
                    read: false
                }]);

            setIsFollowing(true);
            await playSound('click', 0.5);
        } catch (error) {
            console.error("Error following user:", error);
            setError(`Something went wrong: ${error.message}`);
        }
    };

    if (loading || !songData) {
        return <SkeletonSongCard/>
    }

    const {title, author, url, added_at, score, rank, username} = songData;
    const trackId = extractSpotifyTrackId(url);
    const youtubeVideoId = extractYoutubeVideoId(url);
    const spotifyTrackId = extractSpotifyTrackId(url);
    const isSpotify = Boolean(spotifyTrackId);

    return (
        <Card
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className={"px-2 transition-all duration-200 w-fit h-min cursor-default border rounded-2xl relative overflow-hidden hover:shadow-xl"}
        >
            <CardContent className={"py-2"}>
                {/* Header Row */}
                <div className="flex items-center justify-between">
                    <span className="text-muted-foreground font-mono font-normal text-sm">#{rank}</span>
                    <TooltipProvider>
                        <Tooltip variant={"outline"}>
                            <TooltipTrigger asChild>
                                <Link href={`/song/${id}`} className="text-muted-foreground">
                                    <ExternalLink className="w-4 h-4" />
                                </Link>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">
                                Open song page
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>

                {/* Main Content */}
                <div className="flex gap-3 items-center my-4">
                    {/* Cover + Play */}
                    <div className="relative w-14 h-14 rounded-md flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
                        <Music className="w-6 h-6 text-primary opacity-80" />
                        {hovered && (
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center rounded-md transition-opacity">
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="w-full h-full"
                                    onClick={() => {
                                        if (!isSpotify) {
                                            setCurrentlyPreviewingSongId(currentlyPreviewingSongId === id ? null : id)
                                            return
                                        }
                                        if (spotifyConnected && trackId) {
                                            setShowPlayer(true)
                                            if (window.toggleSpotifyPlayback) window.toggleSpotifyPlayback()
                                        } else {
                                            window.open(`https://open.spotify.com/track/${trackId}`, "_blank")
                                        }
                                    }}
                                >
                                    {isSpotify ? (
                                        spotifyConnected && showPlayer ?
                                            <StopCircle className="w-4 h-4" /> :
                                            <SpotifyIcon className="w-4 h-4" />
                                        ) :
                                        (currentlyPreviewingSongId === id ?
                                            <StopCircle className="w-4 h-4" /> :
                                            <CirclePlay className="w-4 h-4" />
                                        )
                                    }
                                    {spotifyConnected && showPlayer && trackId && (
                                        <SpotifyPlayer trackId={trackId} />
                                    )}
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Song Info */}
                    <div className="flex-1 min-w-0 mr-1">
                        <div className="relative w-[300px] overflow-hidden whitespace-nowrap">
                            <Link href={url} target="_blank" className="text-base font-semibold text-foreground inline-block">
                                {title}
                            </Link>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{author}</p>

                        <div className="flex items-center gap-3 flex-wrap mt-1.5">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <User className="w-3.5 h-3.5" />
                                <Link href={`/user/${songData.rawUserId}`} className="hover:underline">
                                    {username}
                                </Link>
                                {user && songData.rawUserId !== user.id && !isFollowing && (
                                    <Button variant="ghost" size="icon" className="w-5 h-5 ml-1" onClick={handleFollow}>
                                        <User className="w-3.5 h-3.5" />
                                    </Button>
                                )}
                            </div>

                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <DateAddedIcon className="w-3.5 h-3.5" />
                                <span>{new Date(added_at).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Voting */}
                    <div className="flex flex-col items-center gap-1 py-1 min-w-[48px] w-fit">
                        <Button
                            size="icon"
                            variant="ghost"
                            className={`w-8 h-8 hover:bg-white/10`}
                            onClick={() => handleVote(1)}
                            disabled={isBanned}
                        >
                            <VoteUp className={`w-6 h-6 stroke-3 ${userVote === 1 ? 'text-green-500' : 'text-muted-foreground'}`} />
                        </Button>
                        <span className="text-sm font-bold text-center text-primary">{score}</span>
                        <Button
                            size="icon"
                            variant="ghost"
                            className={`w-8 h-8 hover:bg-white/10`}
                            onClick={() => handleVote(-1)}
                            disabled={isBanned}
                        >
                            <VoteDown className={`w-6 h-6 stroke-3 ${userVote === -1 ? 'text-rose-500' : 'text-muted-foreground'}`} />
                        </Button>
                    </div>
                </div>

                {/* Voters */}
                {followedUsersVotes.length > 0 && (
                    <div className="flex items-center justify-end mt-4 gap-0.5">
                        {followedUsersVotes.slice(0, 3).map(vote => (
                            <TooltipProvider key={vote.user_id}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Avatar className={`w-5 h-auto aspect-square border`}>
                                            <AvatarImage src={vote.avatar} />
                                            <AvatarFallback>{vote.username.charAt(0).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                    </TooltipTrigger>
                                    <TooltipContent side="bottom">
                                        {vote.username} {vote.vote === 1 ? 'upvoted' : 'downvoted'}
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        ))}
                        {followedUsersVotes.length > 3 && (
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="w-5 h-auto aspect-square flex items-center justify-center rounded-full bg-muted text-xs cursor-default">
                                            +{followedUsersVotes.length - 3}
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent side="bottom">
                                        {`${followedUsersVotes.length - 3} more voted`}
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        )}
                    </div>
                )}

                {/* Admin Panel */}
                {isAdminPanel && (
                    <div className="flex justify-between items-center mt-4">
                        <div className="flex gap-3">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="ghost" size="icon" onClick={handleBanAndDelete}>
                                            <Ban className="w-6 h-6" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="bottom">Ban URL</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="ghost" size="icon" onClick={handleDelete}>
                                            <Trash2 className="w-6 h-6" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="bottom">Remove song</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="ghost" size="icon" onClick={handleResetVotes}>
                                            <RotateCw className="w-6 h-6" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="bottom">Reset votes</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    </div>
                )}

                {currentlyPreviewingSongId === id && youtubeVideoId && (
                    <YouTube
                        videoId={youtubeVideoId}
                        opts={{
                            height: '0',
                            width: '0',
                            playerVars: {
                                autoplay: 1,
                                controls: 0,
                                modestbranding: 1,
                            },
                        }}
                        onReady={handleYouTubeReady}
                    />
                )}

                {/* Error Display */}
                {error && (
                    <div className="mt-4 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md p-2">
                        {error}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

SongCard.propTypes = {
    id: PropTypes.number.isRequired,
    currentlyPreviewingSongId: PropTypes.number,
    setCurrentlyPreviewingSongId: PropTypes.func.isRequired,
};

export default React.memo(SongCard);