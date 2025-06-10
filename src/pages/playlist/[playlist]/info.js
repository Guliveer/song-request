import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import {
    getCurrentUser,
    getJoinedPlaylists,
    getPlaylistData, getPlaylistModerators
} from "@/utils/actions";
import {
    Box,
    CircularProgress,
} from "@mui/material";
import SetTitle from "@/components/SetTitle";
import PlaylistMenu from "@/components/PlaylistManagement/PlaylistMenu";

export default function ManagePlaylist() {
    const router = useRouter();
    const { playlist } = router.query; // Use 'playlist' from the URL
    const playlistId = Array.isArray(playlist) ? playlist[0] : playlist;
    const [playlistData, setPlaylistData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);

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

                    if ((data.is_public === false && data.method === 'id' && !joinStatus) || !allowAccess) {
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

    if (loading) {
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

    return (
        <>
            <SetTitle text={`Playlist Info - ${playlistData.name}`} />

            {/* Menu */}
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                padding: '1rem 2rem',
            }}>
                <PlaylistMenu playlistId={playlistData.id} />
            </Box>

            <Box>
                {/* TODO */}
            </Box>
        </>
    )
}