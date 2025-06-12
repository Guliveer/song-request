import { useEffect, useState } from "react";
import Link from "next/link";
import {
    getPlaylistData,
    getCurrentUser,
    getJoinedPlaylists,
    leavePlaylist,
} from "@/utils/actions";
import {
    IconButton,
    Menu,
    MenuItem,
    Box,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
} from "@mui/material";
import {
    MoreVertRounded as MenuVertButtonIcon,
    ExitToAppRounded as LeavePlaylistIcon,
    HomeRepairServiceRounded as ManageIcon,
    InfoOutlined as PlaylistInfoIcon,
    PlaylistPlay as PlaylistIcon,
} from "@mui/icons-material";

export default function PlaylistMenu({ playlistId }) {
    const [anchorEl, setAnchorEl] = useState(null);
    const [playlistData, setPlaylistData] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [hasJoined, setHasJoined] = useState(false);
    const [isHost, setIsHost] = useState(false);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            const user = await getCurrentUser();
            setCurrentUser(user);

            const playlist = await getPlaylistData(playlistId);
            setPlaylistData(playlist);

            if (user && playlist) {
                const joined = await getJoinedPlaylists(user.id);
                const has = joined.includes(playlist.id);
                setHasJoined(has);

                setIsHost(user.id === playlist.host);
            }

            setLoading(false);
        };
        fetchData();
    }, [playlistId]);

    const handleMenuOpen = (e) => setAnchorEl(e.currentTarget);
    const handleMenuClose = () => setAnchorEl(null);

    const handleConfirmLeave = () => {
        handleMenuClose();
        setConfirmDialogOpen(true);
    };

    const handleCancelLeave = () => setConfirmDialogOpen(false);

    const handleLeavePlaylist = async () => {
        if (!currentUser || !playlistData) return;
        try {
            await leavePlaylist(playlistData.id, currentUser.id);
            setHasJoined(false);
            window.location.reload();
        } catch (err) {
            console.error("Unexpected error:", err.message);
        } finally {
            setConfirmDialogOpen(false);
        }
    };

    if (loading || !playlistData) {
        return (
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
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: 0.5,
                    }}
                >
                    <CircularProgress sx={{
                        mx: 8,
                        my: 2,
                    }}/>
                </Menu>
            </>
        );
    }

    return (
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

                {(isHost || hasJoined) && (
                    <MenuItem onClick={handleMenuClose}>
                        <Link href={`/playlist/${playlistId}/info`} passHref>
                            <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
                                <PlaylistInfoIcon sx={{ mr: 1 }} />
                                Playlist Info
                            </Box>
                        </Link>
                    </MenuItem>
                )}

                {isHost && (
                    <MenuItem onClick={handleMenuClose}>
                        <Link href={`/playlist/${playlistId}/manage`} passHref>
                            <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
                                <ManageIcon sx={{ mr: 1 }} />
                                Manage Playlist
                            </Box>
                        </Link>
                    </MenuItem>
                )}

                {!isHost && hasJoined && (
                    <MenuItem onClick={handleConfirmLeave}>
                        <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
                            <LeavePlaylistIcon sx={{ mr: 1 }} />
                            Leave Playlist
                        </Box>
                    </MenuItem>
                )}
            </Menu>

            <Dialog open={confirmDialogOpen} onClose={handleCancelLeave}>
                <DialogTitle>Confirm: Leave Playlist</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Leaving this playlist will remove all your placed votes and added songs. Are you sure you want to proceed?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancelLeave} color="primary">Cancel</Button>
                    <Button onClick={handleLeavePlaylist} color="error">Leave</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}