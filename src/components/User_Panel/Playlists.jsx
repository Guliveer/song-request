import {useEffect, useState} from "react";
import {
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Divider,
    IconButton,
    List,
    ListItem,
    Menu,
    MenuItem,
    Typography,
    Tooltip,
} from "@mui/material";
import {
    DeleteRounded as DeletePlaylistIcon,
    ExitToAppRounded as LeavePlaylistIcon,
    GroupRounded as MembersIcon,
    MoreVertRounded as MenuVertButtonIcon,
    VisibilityRounded as ViewPlaylistIcon,
    StarRounded as PlaylistHostIcon,
} from "@mui/icons-material";
import Link from "next/link";
import {useRouter} from "next/router";
import {supabase} from "@/utils/supabase";
import {getCurrentUser, getPlaylistData, leavePlaylist} from "@/utils/actions";

export default function Playlists() {
    const router = useRouter();
    const [playlists, setPlaylists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedPlaylist, setSelectedPlaylist] = useState(null);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    useEffect(() => {
        const fetchCurrentUser = async () => {
            const user = await getCurrentUser();
            setCurrentUser(user);
        };
        fetchCurrentUser();
    }, []);

    useEffect(() => {
        if (!router.isReady || !currentUser) return;

        const fetchPlaylists = async () => {
            try {
                const {data, error} = await supabase
                    .from("users")
                    .select("playlists")
                    .eq("id", currentUser.id)
                    .single();

                if (error) {
                    console.error("Error fetching playlists:", error);
                    setPlaylists([]);
                    setLoading(false);
                    return;
                }

                const playlistDetails = await Promise.all(
                    data.playlists.map(async (playlistId) => {
                        return await getPlaylistData(playlistId);
                    })
                );
                setPlaylists(playlistDetails.filter(Boolean));
            } catch (error) {
                console.error("Unexpected error:", error);
                setPlaylists([]);
            } finally {
                setLoading(false);
            }
        };

        fetchPlaylists();
    }, [router.isReady, currentUser]);

    const handleMenuOpen = (event, playlist) => {
        setSelectedPlaylist(playlist);
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        if (anchorEl == null) {
            setSelectedPlaylist(null)
        }
    };

    const handleLeavePlaylist = async () => {
        if (!currentUser || !selectedPlaylist) return;

        try {
            await leavePlaylist(selectedPlaylist.id);
            const updatedPlaylists = playlists.filter((playlist) => playlist.id !== selectedPlaylist.id);
            setPlaylists(updatedPlaylists);
        } catch (error) {
            console.error("Error leaving playlist:", error.message);
        } finally {
            setConfirmDialogOpen(false);
            handleMenuClose();
        }
    };

    const handleDeletePlaylist = async () => {
        if (!currentUser || !selectedPlaylist) return;

        try {
            await handleDeletePlaylist(selectedPlaylist.id);
            setPlaylists((prev) => prev.filter((playlist) => playlist.id !== selectedPlaylist.id));
        } catch (error) {
            console.error("Unexpected error:", error.message);
        } finally {
            setDeleteDialogOpen(false);
            handleMenuClose();
        }
    };

    if (loading) {
        return (
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "90vh",
                }}
            >
                <CircularProgress/>
            </Box>
        );
    }

    if (playlists.length === 0) {
        return (
            <>
                <Typography variant="h5" component="h2" sx={{color: 'white', mb: 3, fontWeight: 500}}>
                    Joined Playlists
                </Typography>
                <Divider sx={{mb: 3, backgroundColor: '#333'}}/>
                <Typography variant="body1">
                    You have not joined any playlists yet.
                </Typography>
            </>
        );
    }

    return (
        <>
            <Typography variant="h5" component="h2" sx={{color: 'white', fontWeight: 500}}>
                Joined Playlists
            </Typography>
            <Divider sx={{my: 2}}/>
            <List>
                {playlists.map((playlist, index) => (
                    <Box key={playlist.id}>
                        <ListItem
                            sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                py: 2,
                            }}
                        >
                            <Box>
                                <Link href={`/playlist/${playlist.url}`} passHref legacyBehavior>
                                    <Typography
                                        variant="body1"
                                        sx={{
                                            fontWeight: "bold",
                                            color: "primary.main",
                                            display: "inline-flex",
                                            alignItems: "center",
                                            cursor: "pointer",
                                            textDecoration: "underline",
                                            '&:hover': {color: "secondary.main"}
                                        }}
                                        component="a"
                                    >
                                        {currentUser?.id === playlist.host && (
                                            <Tooltip title="You are the host">
                                                <PlaylistHostIcon fontSize="small" sx={{color: "gold", mr: 0.5}}/>
                                            </Tooltip>
                                        )}
                                        {playlist.name}
                                    </Typography>
                                </Link>
                                <Typography variant="body2" color="text.secondary">
                                    {playlist.description || "No description available"}
                                </Typography>
                                <Box sx={{display: "inline-flex", alignItems: "center", mt: 1}}>
                                    <MembersIcon fontSize="small" sx={{mr: 0.5}}/>
                                    <Typography variant="body2">
                                        {playlist.userCount} members
                                    </Typography>
                                </Box>
                            </Box>
                            <IconButton onClick={(event) => handleMenuOpen(event, playlist)}>
                                <MenuVertButtonIcon/>
                            </IconButton>
                        </ListItem>
                        {index < playlists.length - 1 && <Divider/>}
                    </Box>
                ))}
            </List>

            {/* Menu */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                anchorOrigin={{vertical: "bottom", horizontal: "right"}}
                transformOrigin={{vertical: "top", horizontal: "right"}}
            >
                <MenuItem>
                    <Link href={`/playlist/${selectedPlaylist?.url}`} passHref legacyBehavior>
                        <Box sx={{display: "flex", alignItems: "center"}} component="a">
                            <ViewPlaylistIcon sx={{marginRight: 1}}/>
                            Open Playlist
                        </Box>
                    </Link>
                </MenuItem>
                {(currentUser?.id !== selectedPlaylist?.host) && (
                    <MenuItem onClick={() => setConfirmDialogOpen(true)}
                              sx={{color: (theme) => theme.palette.error.main}}>
                        <Box sx={{display: "flex", alignItems: "center"}}>
                            <LeavePlaylistIcon sx={{marginRight: 1}}/>
                            Leave Playlist
                        </Box>
                    </MenuItem>
                )}
                {(currentUser?.id === selectedPlaylist?.host) && (
                    <MenuItem onClick={() => setDeleteDialogOpen(true)}
                              sx={{color: (theme) => theme.palette.error.main}}>
                        <Box sx={{display: "flex", alignItems: "center"}}>
                            <DeletePlaylistIcon sx={{marginRight: 1}}/>
                            Delete Playlist
                        </Box>
                    </MenuItem>
                )}
            </Menu>

            {/* Leave Confirmation Dialog */}
            <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)}>
                <DialogTitle>Confirm: Leave Playlist</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to leave this playlist?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmDialogOpen(false)} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleLeavePlaylist} color="error">
                        Leave
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>Confirm: Delete Playlist</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this playlist? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleDeletePlaylist} color="error">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}