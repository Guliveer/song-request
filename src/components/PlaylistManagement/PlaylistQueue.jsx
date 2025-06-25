import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import {
    getPlaylistData,
    getBannedSongs,
    removeSong,
    banSong,
    unbanSong,
} from "@/lib/actions";
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    NativeSelect,
    Box,
    Divider,
    Typography,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Button,
    List,
    ListItem,
    ListItemText,
} from "@mui/material";
import {
    DeleteRounded as DeleteIcon,
    BlockRounded as BanIcon,
    UndoRounded as UndoIcon,
} from "@mui/icons-material";
import PropTypes from "prop-types";

export default function PlaylistSettings({ playlistId }) {
    const [playlistData, setPlaylistData] = useState(null);
    const [queue, setQueue] = useState(null);
    const [sortCriteria, setSortCriteria] = useState("rank");
    const [sortOrder, setSortOrder] = useState("asc");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogAction, setDialogAction] = useState(null);
    const [selectedSongUrl, setSelectedSongUrl] = useState(null);
    const [bannedSongs, setBannedSongs] = useState([]);
    const [bannedDialogOpen, setBannedDialogOpen] = useState(false);

    const fetchPlaylistData = async () => {
        try {
            const data = await getPlaylistData(playlistId);
            if (data) {
                setPlaylistData(data);
            }
        } catch (error) {
            console.error("Error fetching playlist data:", error.message);
        }
    };

    const fetchQueue = async () => {
        try {
            const { data: queueData, error: queueError } = await supabase
                .from("queue")
                .select("id, title, author, score, url, user_id, added_at, users(id, username)")
                .eq("playlist", playlistId);

            if (queueError || !queueData) {
                console.error("Error fetching queue:", queueError?.message || "No data");
                setQueue([]);
                return;
            }

            const rankedQueue = queueData
                .sort((a, b) => {
                    if (b.score !== a.score) {
                        return b.score - a.score;
                    }
                    return new Date(a.added_at) - new Date(b.added_at);
                })
                .map((song, index) => ({
                    ...song,
                    rank: index + 1,
                }));

            const sortedQueue = rankedQueue.sort((a, b) => {
                let comparison = 0;

                if (sortCriteria === "rank") {
                    comparison = a.rank - b.rank;
                } else if (sortCriteria === "title") {
                    comparison = a.title.localeCompare(b.title);
                } else if (sortCriteria === "author") {
                    comparison = a.author.localeCompare(b.author);
                } else if (sortCriteria === "user_id") {
                    comparison = a.users?.username.localeCompare(b.users?.username || "");
                } else if (sortCriteria === "added_at") {
                    comparison = new Date(a.added_at) - new Date(b.added_at);
                }

                return sortOrder === "asc" ? comparison : -comparison;
            });

            setQueue(sortedQueue);
        } catch (error) {
            console.error("Error fetching queue:", error.message);
            setQueue([]);
        }
    };

    const fetchBannedSongs = async () => {
        try {
            const songs = await getBannedSongs(playlistId);
            setBannedSongs(songs);
        } catch (error) {
            console.error("Error fetching banned songs:", error.message);
        }
    };

    const handleDialogOpen = (action, songUrl = null) => {
        setDialogAction(action);
        setSelectedSongUrl(songUrl);
        setDialogOpen(true);
    };

    const handleDialogClose = () => {
        setDialogOpen(false);
        setDialogAction(null);
        setSelectedSongUrl(null);
    };

    const handleDialogConfirm = async () => {
        if (dialogAction === "ban") {
            await banSong(playlistId, selectedSongUrl);
        } else if (dialogAction === "delete") {
            await removeSong(selectedSongUrl);
        } else if (dialogAction === "clear") {
            await supabase.from("queue").delete().eq("playlist", playlistId);
        }
        fetchQueue();
        handleDialogClose();
    };

    const handleBannedDialogOpen = async () => {
        await fetchBannedSongs();
        setBannedDialogOpen(true);
    };

    const handleBannedDialogClose = () => {
        setBannedDialogOpen(false);
    };

    const handleUnbanSong = async (songUrl) => {
        try {
            await unbanSong(playlistId, songUrl);
            await fetchBannedSongs(); // Refresh the list after unbanning
        } catch (error) {
            console.error("Error unbanning song:", error.message);
        }
    };

    useEffect(() => {
        fetchPlaylistData();
        fetchQueue();
    }, [playlistId, sortCriteria, sortOrder]);

    if (!playlistData || !queue) {
        return (
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
            }}>
                <Typography variant="h5" component="h2" sx={{color: 'white', fontWeight: 500}}>
                    Queue Management
                </Typography>

                <Button
                    variant="contained"
                    onClick={handleBannedDialogOpen}
                >
                    View Banned Songs
                </Button>
            </Box>

            <Divider sx={{
                my: 3,
            }}/>

            <Box sx={{ display: "flex", gap: 2, alignItems: "center", width: '100%', justifyContent: 'space-between' }}>
                <Box sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                }}>
                    <Typography variant="subtitle1">Sort By:</Typography>
                    <NativeSelect
                        value={sortCriteria}
                        onChange={(e) => setSortCriteria(e.target.value)}
                    >
                        <option value="rank">Rank</option>
                        <option value="title">Title</option>
                        <option value="author">Author</option>
                        <option value="user_id">User</option>
                        <option value="added_at">Added Time</option>
                    </NativeSelect>
                    <NativeSelect
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                    >
                        <option value="asc">Ascending</option>
                        <option value="desc">Descending</option>
                    </NativeSelect>
                </Box>
                <Button
                    variant="contained"
                    color="error"
                    onClick={() => handleDialogOpen("clear")}
                >
                    Clear Queue
                </Button>
            </Box>

            <Box sx={{ maxHeight: 600, overflow: 'auto' }}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Rank</TableCell>
                                <TableCell>Title</TableCell>
                                <TableCell>Author</TableCell>
                                <TableCell>User</TableCell>
                                <TableCell>Score</TableCell>
                                <TableCell>Added Time</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {queue.map((song) => (
                                <TableRow key={song.id}>
                                    <TableCell>{song.rank}</TableCell>
                                    <TableCell>{song.title}</TableCell>
                                    <TableCell>{song.author}</TableCell>
                                    <TableCell>{song.users?.username || "Unknown"}</TableCell>
                                    <TableCell>{song.score}</TableCell>
                                    <TableCell>{new Date(song.added_at).toLocaleString()}</TableCell>
                                    <TableCell>
                                        <IconButton
                                            color="warning"
                                            onClick={() => handleDialogOpen("delete", song.id)}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                        <IconButton
                                            color="error"
                                            onClick={() => handleDialogOpen("ban", song.url)}
                                        >
                                            <BanIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>

            <Dialog open={dialogOpen} onClose={handleDialogClose}>
                <DialogTitle>Confirm Action</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {(() => {
                            switch (dialogAction) {
                                case "delete":
                                    return "Are you sure you want to delete this song?";
                                case "ban":
                                    return "Are you sure you want to ban this song?";
                                case "clear":
                                    return "Are you sure you want to clear the entire queue?";
                                default:
                                    return "Are you sure you want to proceed?";
                            }
                        })()}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDialogClose} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleDialogConfirm} color="error">
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={bannedDialogOpen} onClose={handleBannedDialogClose}>
                <DialogTitle>Banned Songs</DialogTitle>
                <DialogContent>
                    <List
                        component="div"
                        sx={{
                            maxHeight: 400, // Set the maximum height for the scrollable area
                            overflowY: "auto",
                            borderRadius: 2,
                            padding: 1,
                        }}
                    >
                        {bannedSongs.map((song, index) => (
                            <ListItem key={index} sx={{ display: "flex", justifyContent: "space-between" }}>
                                <Box>
                                    <ListItemText
                                        primary={song.title}
                                        secondary={`Author: ${song.author}`}
                                    />
                                    <Box sx={{ mt: 1 }}>
                                        <Link href={song.url} target="_blank" rel="noopener noreferrer">
                                            {song.url}
                                        </Link>
                                    </Box>
                                </Box>
                                <IconButton
                                    color="primary"
                                    onClick={() => handleUnbanSong(song.url)}
                                >
                                    <UndoIcon />
                                </IconButton>
                            </ListItem>
                        ))}
                    </List>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleBannedDialogClose} color="primary">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
PlaylistSettings.propTypes = {
    playlistId: PropTypes.number.isRequired,
}
