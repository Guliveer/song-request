import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Link from "next/link";
import SetTitle from "@/components/SetTitle";
import PlaylistQueue from "@/components/playlistManagement/PlaylistQueue";
import PlaylistMembers from "@/components/playlistManagement/PlaylistMembers";
import PlaylistSettings from "@/components/playlistManagement/PlaylistSettings";
import { getCurrentUser, getJoinedPlaylists, getPlaylistData, getPlaylistModerators } from "@/lib/actions";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Spinner } from "@/components/ui/spinner";
import {
    ArrowLeft as BackIcon,
    Globe as PublicIcon,
    Link as LinkIcon,
    ListMusic as QueueIcon,
    Lock as PrivateIcon,
    Music as PlaylistIcon,
    Settings as SettingsIcon,
    Users as MembersIcon
} from "lucide-react";
import PlaylistMenu from "@/components/playlistManagement/PlaylistMenu";

export default function ManagePlaylist() {
    const router = useRouter();
    const {playlist} = router.query; // Use 'playlist' from the URL
    const playlistId = Array.isArray(playlist) ? playlist[0] : playlist;
    const [playlistData, setPlaylistData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);
    const [activeTab, setActiveTab] = useState("queue");
    const [isAllowed, setIsAllowed] = useState(false);

    useEffect(() => {
        const fetchCurrentUser = async () => {
            const user = await getCurrentUser();
            setCurrentUser(user);
        };

        fetchCurrentUser();
    }, []);

    useEffect(() => {
        if (!router.isReady || !playlist) return;

        const fetchPlaylistData = async () => {
            try {
                const data = await getPlaylistData(playlistId);

                if (currentUser && data) {
                    // Check if the current user has joined the playlist
                    const joinedPlaylists = await getJoinedPlaylists(currentUser.id);
                    const joinStatus = joinedPlaylists.includes(data?.id);

                    // Check if the current user is a moderator or host
                    const moderators = await getPlaylistModerators(data?.id);
                    const allowAccess = Object.keys(moderators).includes(currentUser.id) || data.host === currentUser.id;
                    setIsAllowed(allowAccess || joinStatus);

                    if ((data.is_public === false && data.method === "id" && !joinStatus) || !allowAccess || !joinStatus) {
                        console.warn("You cannot access this playlist right now.");
                        setPlaylistData(null);
                        setLoading(false);
                        return;
                    }
                }

                setPlaylistData(data);
            } catch (error) {
                console.error("Unexpected error:", error);
                setPlaylistData(null);
            } finally {
                setLoading(false);
            }
        };

        fetchPlaylistData();
    }, [currentUser, router.isReady, playlist, playlistId]);

    if (!isAllowed || loading) {
        return (
            <div className="flex justify-center items-center h-[90vh]">
                <Spinner className="w-8 h-8"/>
            </div>
        );
    }

    if (playlistData === null) {
        return (
            <div className="flex justify-center items-center h-[90vh]">
                <p>Playlist not found</p>
            </div>
        );
    }

    const isHost = currentUser?.id === playlistData.host; //? Must be here - at the end of all loadings and checks

    return (
        <>
            <SetTitle text={`Manage Playlist - ${playlistData.name}`}/>

            {/* Menu */}
            <div className="flex w-full items-center justify-between p-4">
                <Link href={`/playlist/${playlistData.url}`} className="no-underline text-inherit">
                    <Button variant="ghost" size="sm" className="flex items-center gap-2">
                        <BackIcon className="w-4 h-4"/>
                    </Button>
                </Link>
                <PlaylistMenu playlistId={playlistData.id}/>
            </div>

            <Container className="mb-12 max-w-4xl">
                {/* Playlist Info Section */}
                <Card className="mb-8 p-8 text-center">
                    <CardContent className="space-y-6">
                        <PlaylistIcon className="w-24 h-24 mx-auto text-primary"/>

                        <h1 className="text-4xl font-bold">{playlistData?.name || ""}</h1>

                        {/* Visibility Badge */}
                        <div className="flex justify-center">
                            <Badge variant={playlistData?.is_public ? "default" : "secondary"}
                                   className="flex items-center gap-2">
                                {playlistData?.is_public ? <PublicIcon className="w-4 h-4"/> :
                                    <PrivateIcon className="w-4 h-4"/>}
                                {playlistData?.is_public ? "Public" : "Private"}
                            </Badge>
                        </div>

                        {/* Access URL */}
                        <div className="flex items-center justify-center gap-2 text-muted-foreground">
                            <LinkIcon className="w-4 h-4"/>
                            <Link href={"/playlist/" + playlistData?.url} className="font-medium hover:text-primary">
                                /{playlistData?.url}
                            </Link>
                        </div>

                        {/* Description */}
                        <p className="text-muted-foreground max-w-2xl mx-auto">{playlistData?.description ||
                            <span className="italic">No description provided.</span>}</p>

                        {/* Playlist Stats */}
                        <div className="flex justify-center items-center max-w-sm mx-auto">
                            <div className="flex-1 text-center">
                                <div className="text-3xl font-bold">{playlistData?.userCount || 0}</div>
                                <div className="text-sm font-medium text-muted-foreground mt-1">Members</div>
                            </div>
                            <Separator orientation="vertical" className="h-12 mx-4"/>
                            <div className="flex-1 text-center">
                                <div className="text-3xl font-bold">{playlistData?.songCount || 0}</div>
                                <div className="text-sm font-medium text-muted-foreground mt-1">Songs</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Tabs Section */}
                <Card className="overflow-hidden">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-3 h-auto">
                            <TabsTrigger value="queue" className="flex items-center gap-2 py-3">
                                <QueueIcon className="w-4 h-4"/>
                                Queue
                            </TabsTrigger>
                            <TabsTrigger value="members" className="flex items-center gap-2 py-3">
                                <MembersIcon className="w-4 h-4"/>
                                Members
                            </TabsTrigger>
                            {isHost && (
                                <TabsTrigger value="settings" className="flex items-center gap-2 py-3">
                                    <SettingsIcon className="w-4 h-4"/>
                                    Settings
                                </TabsTrigger>
                            )}
                        </TabsList>

                        <div className="p-6">
                            <TabsContent value="queue" className="mt-0">
                                <PlaylistQueue playlistId={playlistData.id}/>
                            </TabsContent>
                            <TabsContent value="members" className="mt-0">
                                <PlaylistMembers playlistId={playlistData.id}/>
                            </TabsContent>
                            {isHost && (
                                <TabsContent value="settings" className="mt-0">
                                    <PlaylistSettings playlistId={playlistData.id}/>
                                </TabsContent>
                            )}
                        </div>
                    </Tabs>
                </Card>
            </Container>
        </>
    );
}
