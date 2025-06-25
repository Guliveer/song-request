import {useRouter} from "next/router";
import {useEffect, useState} from "react";
import {supabase} from "@/lib/supabase";
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
import {
    Box,
    Button,
    CircularProgress,
    Typography,
} from "@mui/material";
import {
    GroupAddRounded as JoinPlaylistIcon,
    LocalLibraryRounded as PlaylistNameIcon,
} from "@mui/icons-material";

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
        <>
            <SetTitle text={playlistData.name} />
            <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1rem 2rem',
                }}
            >
                <Typography variant="h3" sx={{
                    display: 'inline-flex',
                    gap: 2,
                }}>
                    <PlaylistNameIcon sx={{ fontSize: '100%' }} />
                    <Typography
                        variant="inherit"
                        sx={{
                            fontWeight: '600',
                        }}
                    >{playlistData.name}</Typography>
                </Typography>
                {(!isHost && !hasJoined && loggedIn && playlistData) ? (
                    <Button
                        variant="contained"
                        color="primary"
                        sx={{
                            position: 'relative',
                            right: 0,
                            top: 0,
                        }}
                        startIcon={<JoinPlaylistIcon />}
                        onClick={handleJoinPlaylist}
                    >
                        Join
                    </Button>
                ) : (
                    <PlaylistMenu playlistId={playlistData.id} />
                    // <></>
                )}
            </Box>
            <TopSongsOlympicPodium playlist={playlistData.id} />
            <Queue playlist={playlistData.id} />
            {hasJoined && (
                <AddSongForm playlist={playlistData.id} />
            )}
        </>
    );
}