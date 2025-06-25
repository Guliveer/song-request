"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import SetTitle from "@/components/SetTitle"
import Link from "next/link"
import {
    Avatar,
    Container,
    Typography,
    Box,
    Tabs,
    Tab,
    Paper,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    CircularProgress,
    Alert,
    Snackbar,
} from "@mui/material"
import { PersonAdd, PersonRemove } from "@mui/icons-material"
import {
    getUserSongs,
    getUserVotes,
    removeSong,
    removeVotes,
    hardBanUser,
    followUser,
    unfollowUser,
    getUserInfo,
    getCurrentUser,
    isUserAdmin,
    isFollowingUser,
    genUserAvatar,
    isUserLoggedIn,
    getJoinedPlaylists,
    getPlaylistData,
} from "@/lib/actions"

function TabPanel(props) {
    const { children, value, index, ...other } = props

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`user-tabpanel-${index}`}
            aria-labelledby={`user-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
    )
}

export default function UserProfile({ userData }) {
    const router = useRouter()
    const [tabValue, setTabValue] = useState(0)
    const [songs, setSongs] = useState([])
    const [votes, setVotes] = useState([])
    const [loading, setLoading] = useState(true)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [itemToDelete, setItemToDelete] = useState(null)
    const [deleteType, setDeleteType] = useState("")
    const [banDialogOpen, setBanDialogOpen] = useState(false)
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" })
    const [userFollowed, setUserFollowed] = useState(false)
    const [followLoading, setFollowLoading] = useState(false)
    const [isAdmin, setIsAdmin] = useState(false)
    const [isSameUser, setIsSameUser] = useState(false)
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [avatarUrl, setAvatarUrl] = useState("")
    const [commonPlaylists, setCommonPlaylists] = useState([]);

    useEffect(() => {
        async function fetchData() {
            try {
                const curUser = await getCurrentUser()
                const currentUserData = await getUserInfo(curUser?.id)
                setSongs(await getUserSongs(userData.id))
                setVotes(await getUserVotes(userData.id))
                setUserFollowed(await isFollowingUser(userData.id)) // Check if the current user is following the viewed user
                setIsAdmin(await isUserAdmin()) // Check if the current user is an admin
                setAvatarUrl(await genUserAvatar(userData.id)) // Set the avatar URL
                setIsSameUser(currentUserData?.id === userData.id) // Check if the current user is the same as the viewed user
                setIsLoggedIn(await isUserLoggedIn())
            } catch (error) {
                console.error("Error fetching data:", error)
                setSnackbar({
                    open: true,
                    message: "Error loading user data",
                    severity: "error",
                })
            }
        }

        async function fetchCommonPlaylists() {
            try {
                const currentUser = await getCurrentUser();
                const currentUserPlaylists = await getJoinedPlaylists(currentUser.id);
                const displayedUserPlaylists = await getJoinedPlaylists(userData.id);

                // Find shared playlists
                const common = currentUserPlaylists.filter(playlist =>
                    displayedUserPlaylists.some(p => p.id === playlist.id)
                );

                // Return only data from getPlaylistData for each common playlist
                const enrichedCommon = await Promise.all(
                    common.map(async (playlist) => {
                        const playlistData = await getPlaylistData(playlist);
                        return {
                            id: playlistData.id,
                            name: playlistData.name,
                            description: playlistData.description,
                            host: playlistData.host,
                            url: playlistData.url,
                        }
                    })
                );

                setCommonPlaylists(enrichedCommon);
            } catch (error) {
                console.error("Error fetching shared playlists:", error);
            }
        }

        Promise.all([fetchData(), fetchCommonPlaylists()])
            .then(() => {
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error during data fetching:", error);
                setSnackbar({
                    open: true,
                    message: "Error loading user data or playlists",
                    severity: "error",
                });
            });
    }, [userData.id])

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue)
    }

    const handleDeleteClick = (id, type) => {
        setItemToDelete(id)
        setDeleteType(type)
        setDeleteDialogOpen(true)
    }

    const handleDeleteConfirm = async () => {
        try {
            if (deleteType === "song") {
                await removeSong(itemToDelete)
                setSongs(songs.filter((song) => song.id !== itemToDelete))
            } else if (deleteType === "vote") {
                await removeVotes(itemToDelete)
                setVotes(votes.filter((vote) => vote.id !== itemToDelete))
            }

            setSnackbar({
                open: true,
                message: `${deleteType === "song" ? "Song" : "Vote"} removed successfully`,
                severity: "success",
            })
        } catch (error) {
            console.error("Error deleting item:", error)
            setSnackbar({
                open: true,
                message: `Error removing ${deleteType}`,
                severity: "error",
            })
        } finally {
            setDeleteDialogOpen(false)
        }
    }

    const handleBanClick = () => {
        setBanDialogOpen(true)
    }

    const handleBanConfirm = async () => {
        try {
            await hardBanUser(userData.id)
            setSnackbar({
                open: true,
                message: `User ${userData.ban_status = 0 ? "unbanned" : "banned"} successfully`,
                severity: "success",
            })

            // Refresh the page to get updated user data
            router.refresh()
        } catch (error) {
            console.error("Error banning user:", error)
            setSnackbar({
                open: true,
                message: "Error updating user ban status",
                severity: "error",
            })
        } finally {
            setBanDialogOpen(false)
        }
    }

    const handleFollowToggle = async () => {
        if (isSameUser) return // Can't follow yourself

        setFollowLoading(true)
        try {
            if (userFollowed) {
                await unfollowUser(userData.id)
                setSnackbar({
                    open: true,
                    message: `Unfollowed ${userData.username}`,
                    severity: "success",
                })
                setUserFollowed(false)
            } else {
                await followUser(userData.id)
                setSnackbar({
                    open: true,
                    message: `Now following ${userData.username}`,
                    severity: "success",
                })
                setUserFollowed(true)
            }
        } catch (error) {
            console.error("Error toggling follow status:", error)
            setSnackbar({
                open: true,
                message: `Error ${userFollowed ? "unfollowing" : "following"} user`,
                severity: "error",
            })
        } finally {
            setFollowLoading(false)
        }
    }

    const handleSnackbarClose = () => {
        setSnackbar({ ...snackbar, open: false })
    }

    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                <CircularProgress />
            </Box>
        )
    }

    return (
        <>
        <SetTitle text={`${userData?.username} - User Panel`} />
        <Container maxWidth="lg" sx={{ mt: 4 }}>
            <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                    <Typography variant="h4" component="h1" sx={{
                        display: "flex",
                        flexDirection: "row",
                        gap: 2,
                    }}>
                        <Avatar alt={userData.username} src={avatarUrl} />
                        {userData.username}
                    </Typography>
                    <Box sx={{ display: "flex", gap: 2 }}>
                        {(!isSameUser && isLoggedIn) && (
                            <Button
                                variant="outlined"
                                color="primary"
                                onClick={handleFollowToggle}
                                disabled={followLoading}
                                startIcon={userFollowed ? <PersonRemove /> : <PersonAdd />}
                            >
                                {followLoading ? "Processing..." : userFollowed ? "Unfollow" : "Follow"}
                            </Button>
                        )}
                        {(isAdmin && !isSameUser) && (
                            <Button variant="contained" color={userData.ban_status > 0 ? "success" : "error"} onClick={handleBanClick}>
                                {userData.ban_status > 0 ? "Unban Account" : "Ban Account"}
                            </Button>
                        )}
                    </Box>
                </Box>

                <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                    <Tabs value={tabValue} onChange={handleTabChange} aria-label="user management tabs">
                        <Tab label="Details" id="user-tab-0" aria-controls="user-tabpanel-0" />
                        <Tab label="Songs" id="user-tab-1" aria-controls="user-tabpanel-1" />
                        <Tab label="Votes" id="user-tab-2" aria-controls="user-tabpanel-2" />
                        <Tab label="Common Playlists" id="user-tab-3" aria-controls="user-tabpanel-3" />
                    </Tabs>
                </Box>

                {/* User Info Tab */}
                <TabPanel value={tabValue} index={0}>
                    <TableContainer component={Paper} variant="outlined">
                        <Table>
                            <TableBody>
                                <TableRow>
                                    <TableCell component="th" scope="row" sx={{ fontWeight: "bold" }}>
                                        User ID
                                    </TableCell>
                                    <TableCell>{userData.id}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell component="th" scope="row" sx={{ fontWeight: "bold" }}>
                                        Username
                                    </TableCell>
                                    <TableCell>{userData.username}</TableCell>
                                </TableRow>
                                {isAdmin && (
                                    <TableRow>
                                        <TableCell component="th" scope="row" sx={{ fontWeight: "bold" }}>
                                            Status
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={userData.ban_status > 0 ? "Banned" : "Active"}
                                                color={userData.ban_status > 0 ? "error" : "success"}
                                            />
                                        </TableCell>
                                    </TableRow>
                                )}
                                <TableRow>
                                    <TableCell component="th" scope="row" sx={{ fontWeight: "bold" }}>
                                        Songs Added
                                    </TableCell>
                                    <TableCell>{songs.length}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell component="th" scope="row" sx={{ fontWeight: "bold" }}>
                                        Votes Cast
                                    </TableCell>
                                    <TableCell>{votes.length}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                </TabPanel>

                {/* Songs Tab */}
                <TabPanel value={tabValue} index={1}>
                    {songs.length === 0 ? (
                        <Typography variant="body1">No songs added by this user.</Typography>
                    ) : (
                        <TableContainer component={Paper} variant="outlined">
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Title</TableCell>
                                        <TableCell>Author</TableCell>
                                        <TableCell>Added At</TableCell>
                                        <TableCell>Score</TableCell>
                                        {isAdmin && <TableCell>Actions</TableCell>}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {songs.map((song) => (
                                        <TableRow key={song.id}>
                                            <TableCell>{song.title}</TableCell>
                                            <TableCell>{song.author}</TableCell>
                                            <TableCell>{new Date(song.added_at).toLocaleString()}</TableCell>
                                            <TableCell>{song.score}</TableCell>
                                            {isAdmin && (
                                                <TableCell>
                                                    <Button
                                                        variant="outlined"
                                                        color="error"
                                                        size="small"
                                                        onClick={() => handleDeleteClick(song.id, "song")}
                                                    >
                                                        Remove
                                                    </Button>
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </TabPanel>

                {/* Votes Tab */}
                <TabPanel value={tabValue} index={2}>
                    {votes.length === 0 ? (
                        <Typography variant="body1">No votes cast by this user.</Typography>
                    ) : (
                        <TableContainer component={Paper} variant="outlined">
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Song</TableCell>
                                        <TableCell>Vote</TableCell>
                                        <TableCell>Voted At</TableCell>
                                        {isAdmin && <TableCell>Actions</TableCell>}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {votes.map((vote) => (
                                        <TableRow key={vote.id}>
                                            <TableCell>
                                                {vote.queue ? `${vote.queue.title} - ${vote.queue.author}` : "Unknown Song"}
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={vote.vote > 0 ? "Upvote" : "Downvote"}
                                                    color={vote.vote > 0 ? "success" : "error"}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>{new Date(vote.voted_at).toLocaleString()}</TableCell>
                                            {isAdmin && (
                                                <TableCell>
                                                    <Button
                                                        variant="outlined"
                                                        color="error"
                                                        size="small"
                                                        onClick={() => handleDeleteClick(vote.id, "vote")}
                                                    >
                                                        Remove
                                                    </Button>
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </TabPanel>

                {/* Shared Playlists Tab */}
                <TabPanel value={tabValue} index={3}>
                    {commonPlaylists.length === 0 ? (
                        <Typography>No common playlists found.</Typography>
                    ) : (
                        <TableContainer component={Paper} variant="outlined">
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Playlist Name</TableCell>
                                        <TableCell>Description</TableCell>
                                        <TableCell>Host</TableCell>
                                        <TableCell>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {commonPlaylists.map((playlist) => (
                                        <TableRow key={playlist.id}>
                                            <TableCell>{playlist.name}</TableCell>
                                            <TableCell>{playlist.description}</TableCell>
                                            <TableCell>{playlist.host}</TableCell>
                                            <TableCell>
                                                <Link href={`/playlist/${playlist?.url}`} >
                                                    <Button variant="outlined" color="primary">
                                                        View
                                                    </Button>
                                                </Link>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </TabPanel>
            </Paper>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to remove this {deleteType}? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleDeleteConfirm} color="error" autoFocus>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Ban Confirmation Dialog */}
            <Dialog open={banDialogOpen} onClose={() => setBanDialogOpen(false)}>
                <DialogTitle>Confirm {userData.ban_status > 0 ? "Unban" : "Ban"}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to {userData.ban_status > 0 ? "unban" : "ban"} user {userData.username}?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setBanDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleBanConfirm} color={userData.ban_status > 0 ? "success" : "error"} autoFocus>
                        {userData.ban_status > 0 ? "Unban" : "Ban"} User
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar for notifications */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            >
                <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: "100%" }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container>
        </>
    )
}
