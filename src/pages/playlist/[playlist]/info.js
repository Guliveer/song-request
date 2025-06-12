import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import {
    getCurrentUser,
    getJoinedPlaylists,
    getPlaylistData
} from "@/utils/actions";
import {
    Box,
    CircularProgress,
} from "@mui/material";

export default function ManagePlaylist() {
    const router = useRouter();
    const { playlist } = router.query; // Use 'playlist' from the URL
    const playlistId = Array.isArray(playlist) ? playlist[0] : playlist;
    const [playlistData, setPlaylistData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);
    const [hasJoined, setHasJoined] = useState(null);
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
                    const joinedPlaylists = await getJoinedPlaylists(currentUser.id);
                    const joinStatus = joinedPlaylists.includes(data?.id);

                    if (data.is_public === false && data.method === 'id' && !joinStatus) {
                        console.warn("You cannot access this playlist right now.");
                        setPlaylistData(null);
                        setLoading(false);
                        return;
                    }

                    setIsAllowed(joinStatus || data.is_public);
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

    if (!isAllowed || loading) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '90vh',
                }}
            >
                <CircularProgress />
            </Box>
        );
    }

    if (playlistData === null) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '90vh',
                }}
            >
                <p>Playlist not found</p>
            </Box>
        );
    }

    const isHost = currentUser?.id === playlistData.host; //? Must be here - at the end of all loadings and checks

    return (
        <div>
            {playlistData.name} - Info
        </div>
    )
}