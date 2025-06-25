import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Box, CircularProgress } from '@mui/material';
import SongCard from '@/components/SongCard';
import {getPlaylistData, getSongData, getCurrentUser, getJoinedPlaylists} from '@/lib/actions';

export default function SongPage() {
    const router = useRouter();
    const { song: songQuery } = router.query; // Extract song ID from the URL
    const song = Array.isArray(songQuery) ? songQuery[0] : songQuery; // Handle catch-all route
    const [exists, setExists] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const fetchCurrentUser = async () => {
            const user = await getCurrentUser();
            setCurrentUser(user);
        };

        fetchCurrentUser();
    }, []);

    useEffect(() => {
        if (!song || !currentUser) return; // Ensure song and currentUser are defined
        const fetchSongData = async () => {
            if (song) {
                try {
                    const songData = await getSongData(song);
                    if (!songData) {
                        setExists(false);
                        return;
                    }

                    // If playlist is not public, check if the user has joined it
                    // If not joined, setExists to false
                    const playlistData = await getPlaylistData(songData.playlist);
                    if (!playlistData.is_public) {
                        const joinedPlaylists = await getJoinedPlaylists(currentUser.id);
                        if (!joinedPlaylists.includes(playlistData.id)) {
                            setExists(false);
                            return;
                        }
                    }

                    setExists(true);
                } catch (error) {
                    console.error('Error checking song:', error);
                    setExists(false);
                }
            }
        };

        fetchSongData();
    }, [song, currentUser]);

    if (exists === null) {
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
        )
    }

    if (!exists) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '90vh',
                }}
            >
                <p>Song not found</p>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '90vh',
            }}
        >
            <SongCard id={song} />
        </Box>
    );
}