"use client"
import {useRouter} from "next/router";
import {useEffect, useState} from "react";
import SetTitle from "@/components/SetTitle";
import PlaylistMenu from "@/components/PlaylistManagement/PlaylistMenu";
import TopSongsOlympicPodium from "@/components/TopSongsOlympicPodium";
import Queue from "@/components/Queue";
import AddSongForm from "@/components/AddSongForm";
import {
    getPlaylistData,
    getCurrentUser,
    getJoinedPlaylists,
    isUserLoggedIn,
    joinPlaylist,
} from "@/lib/actions";
import { Button } from "shadcn/button"
import { Spinner } from "shadcn/spinner"
import { AudioLines as PlaylistIcon, PlusCircle } from "lucide-react"

export default function Playlist() {
    const router = useRouter();
    const { playlist } = router.query; // Use 'playlist' from the URL
    const playlistId = Array.isArray(playlist) ? playlist[0] : playlist;
    const [playlistData, setPlaylistData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);
    const [loggedIn, setLoggedIn] = useState(false);
    const [hasJoined, setHasJoined] = useState(null);

    useEffect(() => {
        const fetchCurrentUser = async () => {
            const user = await getCurrentUser();
            setCurrentUser(user);

            const logInStatus = await isUserLoggedIn()
            setLoggedIn(logInStatus);
        };

        fetchCurrentUser();
    }, []);

    useEffect(() => {
        if (!router.isReady || !playlist) return;

        const fetchPlaylistData = async () => {
            try {
                const data = await getPlaylistData(playlistId);

                if (currentUser && data) {
                    const joinedPlaylists = await getJoinedPlaylists(currentUser.id);
                    const joinStatus = joinedPlaylists.includes(data?.id);
                    setHasJoined(joinStatus);

                    if (data.is_public === false && data.method === 'id' && !joinStatus) {
                        console.warn("You cannot access this playlist right now.");
                        setPlaylistData(null);
                        setLoading(false);
                        return;
                    }
                }

                setPlaylistData(data);
            } catch (error) {
                console.error('Unexpected error:', error);
                setPlaylistData(null);
            } finally {
                setLoading(false);
            }
        };

        fetchPlaylistData();
    }, [currentUser, router.isReady, playlist, playlistId]);

    const handleJoinPlaylist = async () => {
        if (!currentUser || !playlistData) return;

        await joinPlaylist(playlistData.id);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[90vh]">
                <Spinner />
            </div>
        );
    }

    if (!playlistData) {
        return (
            <div className="flex justify-center items-center h-[90vh]">
                <p className="text-muted-foreground">Playlist not found</p>
            </div>
        );
    }

    const isHost = currentUser?.id === playlistData.host

    return (
        <>
            <SetTitle text={playlistData.name} />

            <div className="flex items-center justify-between px-6 py-4">
                <h1 className="text-2xl font-semibold flex items-center align-center gap-2">
                    <PlaylistIcon className="w-auto h-full aspect-square" />
                    {playlistData.name}
                </h1>

                {(!isHost && !hasJoined && loggedIn && playlistData) ? (
                    <Button onClick={handleJoinPlaylist}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Join
                    </Button>
                ) : (
                    <PlaylistMenu playlistId={playlistData.id} />
                )}
            </div>

            <TopSongsOlympicPodium playlist={playlistData.id} />
            <Queue playlist={playlistData.id} />
            {hasJoined && <AddSongForm playlist={playlistData.id} />}
        </>
    );
}