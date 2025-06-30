import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
    getPlaylistData,
    getUserInfo,
    getCurrentUser,
    getFriendsOnPlaylist,
    genUserAvatar,
    getJoinedPlaylists
} from "@/lib/actions";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import SetTitle from "@/components/SetTitle";
import PlaylistMenu from "@/components/PlaylistManagement/PlaylistMenu";
import { Button } from "shadcn/button";
import { Card, CardContent } from "shadcn/card";
import { Avatar, AvatarImage } from "shadcn/avatar";
import { Separator } from "shadcn/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "shadcn/tooltip";
import { LoaderCircle, Users, Info, Music2, Star, ArrowLeft } from "lucide-react";

export default function PlaylistInfo() {
    const router = useRouter();
    const { playlist } = router.query;
    const [playlistData, setPlaylistData] = useState(null);
    const [hostData, setHostData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [friends, setFriends] = useState([]);
    const [hostAvatarUrl, setHostAvatarUrl] = useState(null);
    const [friendAvatars, setFriendAvatars] = useState({});
    const [currentUser, setCurrentUser] = useState(null);
    const [joinStatus, setJoinStatus] = useState(null);
    const [isAllowed, setIsAllowed] = useState(false);

    useEffect(() => {
        const fetchCurrentUser = async () => {
            const user = await getCurrentUser();
            setCurrentUser(user);
        };

        fetchCurrentUser();
    }, []);

    // Funkcje nawigacji
    const navigateToPlaylist = () => {
        if (playlistData?.id) {
            router.push(`/playlist/${playlist}`);
        }
    };

    const goBack = () => {
        if (playlistData?.id) {
            router.push(`/playlist/${playlist}`);
        }
    };

    useEffect(() => {
        const fetchAll = async () => {
            if (!router.isReady || !playlist) return;
            setLoading(true);

            try {
                // Get playlist data
                const data = await getPlaylistData(playlist);
                setPlaylistData(data);

                // Check if the playlist is public or if the user has joined
                if (data?.id && currentUser) {
                    const joinedPlaylists = await getJoinedPlaylists(currentUser.id);
                    const joinStatus = joinedPlaylists.includes(data.id);
                    setJoinStatus(joinStatus);
                } else {
                    setJoinStatus(false);
                }

                // Get host information
                if (data?.host) {
                    const hostInfo = await getUserInfo(data.host);
                    setHostData(hostInfo);
                    // Generate avatar for host if not available
                    if (hostInfo?.avatar_url) {
                        setHostAvatarUrl(hostInfo.avatar_url);
                    } else {
                        const avatarUrl = await genUserAvatar(data.host);
                        setHostAvatarUrl(avatarUrl);
                    }
                }

                setIsAllowed(data?.host || joinStatus || data.is_public);

                // Get friends on playlist
                const user = await getCurrentUser();
                if (user && data?.id) {
                    const friendsOnPlaylist = await getFriendsOnPlaylist(user.id, data.id);
                    const friendsOnPlaylistFiltered = friendsOnPlaylist.filter(friend => friend.id !== user.id);
                    setFriends(friendsOnPlaylistFiltered);

                    // Generate avatars for friends
                    const avatars = {};
                    for (const friend of friendsOnPlaylistFiltered) {
                        avatars[friend.id] = friend.avatar_url || await genUserAvatar(friend.id);
                    }
                    setFriendAvatars(avatars);
                } else {
                    setFriends([]);
                }
            } catch (error) {
                console.error("Error fetching playlist data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, [router.isReady, playlist, currentUser]);

    if (loading) return (
        <div className="flex justify-center mt-12">
            <LoaderCircle className="animate-spin w-10 h-10 text-muted-foreground" />
        </div>
    );
    if (!playlistData || !isAllowed) return (
        <p className="text-center text-destructive mt-10">
            Playlist not found.
        </p>
    );

    const createdAt = playlistData.created_at
        ? format(new Date(playlistData.created_at), "MMMM d, yyyy, HH:mm:ss", { locale: enUS })
        : "Unknown";

    return (
        <>
            <SetTitle>{playlistData.name}</SetTitle>

            <div className="flex justify-between px-6 py-4">
                <Button variant="ghost" size="sm" onClick={() => router.push(`/playlist/${playlist}`)} className="mb-3">
                    <ArrowLeft className="mr-1 w-4 h-4" /> Back
                </Button>
                <PlaylistMenu playlistId={playlistData.id} />
            </div>

            <div className="flex justify-center py-2">
                <Card className="w-full max-w-md">
                    <CardContent className="flex flex-col items-start gap-3">
                        <div className="flex items-center gap-3">
                            <Info className="w-7 h-7" />
                            <div className="inline-flex flex-col gap-1">
                                <h2 className="text-lg text-primary font-semibold truncate">{playlistData.name}</h2>
                                {playlistData.description && <p className="text-muted-foreground text-sm truncate">{playlistData.description}</p>}
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {hostData && (
                                <>
                                    <Avatar className="w-6 h-6 text-xs">
                                        <AvatarImage src={hostAvatarUrl} alt="Avatar" className={"w-fit h-fit"} />
                                    </Avatar>
                                    <Link href={`/user/${hostData.username}`}>
                                        <p className="text-xs font-semibold text-muted-foreground">@{hostData.username}</p>
                                    </Link>
                                </>
                            )}
                            <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-secondary text-secondary-foreground">
                                <Star className="w-3 h-3" /> Host
                            </div>
                        </div>

                        <p className="text-xs text-muted-foreground">Created: {createdAt}</p>

                        <div className="flex gap-2">
                            <div className="text-xs px-3 py-1 border rounded-md flex items-center gap-1">
                                <Music2 className="w-3.5 h-3.5" /> {playlistData.songCount ?? 0} songs
                            </div>
                            <div className="text-xs px-3 py-1 border rounded-md flex items-center gap-1">
                                <Users className="w-3.5 h-3.5" /> {playlistData.userCount ?? 0} members
                            </div>
                        </div>

                        <Separator className="my-2" />

                        <h4 className="text-sm font-semibold text-foreground">Friends who joined</h4>
                        {friends.length > 0 ? (
                            <div className="flex gap-2 flex-wrap">
                                {friends.map(friend => (
                                    <TooltipProvider key={friend.id}>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Avatar className="w-7 h-7 border border-cyan-300 shadow-md text-xs hover:scale-105 transition-transform">
                                                    <AvatarImage src={friendAvatars[friend.id]} alt={friend.username} />
                                                </Avatar>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                @{friend.username}
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">None of your friends have joined this playlist yet.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
