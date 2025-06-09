import {useRouter} from "next/router";
import {useEffect, useState} from "react";
import {supabase} from "@/utils/supabase";
import {
    Box,
    Button,
    CircularProgress,
    IconButton,
    Menu,
    MenuItem,
    Typography,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
} from "@mui/material";
import Queue from "@/components/Queue";
import AddSongForm from "@/components/AddSongForm";
import TopSongsOlympicPodium from "@/components/TopSongsOlympicPodium";
import SetTitle from "@/components/SetTitle";
import {getPlaylistData, getCurrentUser, getJoinedPlaylists, leavePlaylist, isUserLoggedIn} from "@/utils/actions";
import {
    LocalLibraryRounded as PlaylistNameIcon,
    GroupAddRounded as JoinPlaylistIcon,
    MoreVertRounded as MenuVertButtonIcon,
    ExitToAppRounded as LeavePlaylistIcon,
    HomeRepairServiceRounded as ManageIcon,
    InfoOutlined as PlaylistInfoIcon, PlaylistPlay as PlaylistIcon,
} from "@mui/icons-material";
import Link from "next/link";

export default function Playlist() {
    const router = useRouter();
    const { playlist } = router.query; // Use 'playlist' from the URL
    const playlistId = Array.isArray(playlist) ? playlist[0] : playlist;
    const [playlistData, setPlaylistData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);
    const [loggedIn, setLoggedIn] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const [hasJoined, setHasJoined] = useState(null);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

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

        try {
            const joinedPlaylists = await getJoinedPlaylists(currentUser.id);

            const playlists = joinedPlaylists || [];
            if (playlists.includes(playlistData.id)) {
                console.warn("Playlist already joined.");
                return;
            }

            const updatedPlaylists = [...(joinedPlaylists || []), playlistData.id];

            const { error: updateError } = await supabase
                .from("users")
                .update({ playlists: updatedPlaylists })
                .eq("id", currentUser.id);

            if (updateError) {
                console.error("Error updating playlists:", updateError.message);
            } else {
                setHasJoined(true);
                console.log("Successfully joined the playlist.");
            }
        } catch (error) {
            console.error("Unexpected error:", error.message);
        }
    };

    const handleLeavePlaylist = async () => {
        if (!currentUser || !playlistData) return;

        try {
            await leavePlaylist(playlistData.id, currentUser.id);
            setHasJoined(false);
            console.info("Successfully left the playlist.");
            window.location.reload();
        } catch (error) {
            console.error("Unexpected error:", error.message);
        } finally {
            setConfirmDialogOpen(false);
        }
    };

    const handleConfirmLeave = () => {
        handleMenuClose();
        setConfirmDialogOpen(true);
    };

    const handleCancelLeave = () => {
        setConfirmDialogOpen(false);
    };

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
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
                {(!isHost && !hasJoined && loggedIn) ? (
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
                    <>
                        <IconButton onClick={handleMenuOpen}>
                            <MenuVertButtonIcon />
                        </IconButton>
                        <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={handleMenuClose}
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'right',
                            }}
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                        >
                            <MenuItem>
                                <Link href={`/playlist/${playlistId}`} passHref>
                                    <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
                                        <PlaylistIcon sx={{ marginRight: 1 }} />
                                        View Playlist
                                    </Box>
                                </Link>
                            </MenuItem>

                            {(isHost || hasJoined) && (
                                <MenuItem>
                                    <Link href={`/playlist/${playlistId}/info`} passHref> {/* TODO */}
                                        <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
                                            <PlaylistInfoIcon sx={{ marginRight: 1 }} />
                                            Playlist Info
                                        </Box>
                                    </Link>
                                </MenuItem>
                            )}

                            {isHost && (
                                <MenuItem>
                                    <Link href={`/playlist/${playlistId}/manage`} passHref> {/* TODO */}
                                        <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
                                            <ManageIcon sx={{ marginRight: 1 }} />
                                            Manage Playlist
                                        </Box>
                                    </Link>
                                </MenuItem>
                            )}

                            {(!isHost && hasJoined) && (
                                <MenuItem onClick={handleConfirmLeave}>
                                    <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
                                        <LeavePlaylistIcon sx={{ marginRight: 1 }} />
                                        Leave Playlist
                                    </Box>
                                </MenuItem>
                            )}

                        </Menu>
                    </>
                )}
            </Box>
            <TopSongsOlympicPodium playlist={playlistData.id} />
            <Queue playlist={playlistData.id} />
            {hasJoined && (
                <AddSongForm playlist={playlistData.id} />
            )}

            {/* Leave Confirmation Dialog */}
            <Dialog
                open={confirmDialogOpen}
                onClose={handleCancelLeave}
            >
                <DialogTitle>Confirm: Leave Playlist</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Leaving this playlist will remove all your placed votes and added songs. Are you sure you want to proceed?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancelLeave} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleLeavePlaylist} color="error">
                        Leave
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}