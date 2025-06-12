import { useState, useEffect } from "react";
import {
    setPlaylistName,
    setPlaylistVisibility,
    setPlaylistUrl,
    setPlaylistDescription,
    setPlaylistHost,
    addPlaylistModerator,
    removePlaylistModerator,
    deletePlaylist,
    getPlaylistMembers,
    getPlaylistModerators,
    getPlaylistData,
} from "@/utils/actions";
import {
    TextField,
    Button,
    Box,
    CircularProgress,
    Typography,
    Switch,
    Divider,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Select,
    MenuItem,
} from "@mui/material";
import {
    AccountCircleRounded as ProfileIcon,
    DeleteRounded as DeleteIcon,
} from "@mui/icons-material";
import {supabase} from "@/utils/supabase";
import PropTypes from "prop-types";

export default function PlaylistSettings({ playlistId }) {
    const [playlistData, setPlaylistData] = useState(null);
    const [name, setName] = useState("");
    const [tempName, setTempName] = useState("");
    const [isPublic, setIsPublic] = useState(null);
    const [tempIsPublic, setTempIsPublic] = useState(null);
    const [url, setUrl] = useState("");
    const [tempUrl, setTempUrl] = useState("");
    const [description, setDescription] = useState("");
    const [tempDescription, setTempDescription] = useState("");
    const [selectedHost, setSelectedHost] = useState("");
    const [tempSelectedHost, setTempSelectedHost] = useState("");
    const [username, setUsername] = useState("");
    const [moderatorList, setModeratorList] = useState([]);
    const [members, setMembers] = useState([]);
    const [hasChanges, setHasChanges] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const fetchPlaylistData = async () => {
        try {
            const data = await getPlaylistData(playlistId);
            if (data) {
                setPlaylistData(data);

                setName(data.name);
                setTempName(data.name);

                setIsPublic(data.is_public);
                setTempIsPublic(data.is_public);

                setUrl(data.url);
                setTempUrl(data.url);

                setDescription(data.description);
                setTempDescription(data.description);
            }
        } catch (error) {
            console.error("Error fetching playlist data:", error.message);
        }
    };

    const fetchPlaylistModerators = async () => {
        try {
            const moderators = await getPlaylistModerators(playlistId);
            if (moderators && typeof moderators === "object") {
                const formattedModerators = Object.entries(moderators).map(([id, username]) => ({
                    id,
                    username,
                }));
                setModeratorList(formattedModerators);
            } else {
                console.warn("Unexpected format:", moderators);
            }
        } catch (error) {
            console.error("Error fetching moderators:", error.message);
        }
    }

    const fetchPlaylistMembers = async () => {
        try {
            const membersData = await getPlaylistMembers(playlistId);
            setMembers(membersData);
        } catch (error) {
            console.error("Error fetching playlist members:", error.message);
        }
    };

    useEffect(() => {
        fetchPlaylistData();
        fetchPlaylistModerators();
        fetchPlaylistMembers();
    }, [playlistId]);

    useEffect(() => {
        setHasChanges(
            tempName !== name ||
            tempIsPublic !== isPublic ||
            tempUrl !== url ||
            tempDescription !== description ||
            tempSelectedHost !== selectedHost
        );
    }, [tempName, tempIsPublic, tempUrl, tempDescription, tempSelectedHost, name, isPublic, url, description, selectedHost]);

    const handleSave = async () => {
        try {
            if (tempName !== name) await setPlaylistName(playlistId, tempName);
            if (tempIsPublic !== isPublic) await setPlaylistVisibility(playlistId, tempIsPublic);
            if (tempUrl !== url) await setPlaylistUrl(playlistId, tempUrl);
            if (tempDescription !== description) await setPlaylistDescription(playlistId, tempDescription);
            if (tempSelectedHost !== selectedHost) await setPlaylistHost(playlistId, tempSelectedHost);
            alert("Settings updated successfully.");
        } catch (error) {
            console.error("Error saving settings:", error.message);
        } finally {
            setHasChanges(false);
            await fetchPlaylistData();
            setTempName(name);
            setTempIsPublic(isPublic);
            setTempUrl(url);
            setTempDescription(description);
            setTempSelectedHost(selectedHost);
        }
    };

    const handleCancel = async () => {
        await fetchPlaylistData();
    };

    const handleDeletePlaylist = async () => {
        try {
            await deletePlaylist(playlistId);
            alert("Playlist deleted successfully.");
            setDeleteDialogOpen(false);
        } catch (error) {
            console.error("Error deleting playlist:", error.message);
        }
    };

    const handleAddModerator = async () => {
        try {
            const { data: userInfo, error: userError } = await supabase
                .from('users')
                .select('id, username')
                .eq('username', username)
                .single();

            if (!userInfo || userError) {
                alert("User not found.");
                return;
            }
            await addPlaylistModerator(playlistId, userInfo.id);
            alert("Moderator added successfully.");
            setModeratorList([...moderatorList, userInfo]);
            setUsername("");
        } catch (error) {
            console.error("Error adding moderator:", error.message);
        }
    };

    const handleRemoveModerator = async (userId) => {
        try {
            await removePlaylistModerator(playlistId, userId);
            alert("Moderator removed successfully.");
            setModeratorList(moderatorList.filter(
                (moderator) => moderator.id !== userId
            ));
        } catch (error) {
            console.error("Error removing moderator:", error.message);
        }
    };

    if (!playlistData) {
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
            <Typography variant="h5" component="h2" sx={{color: 'white', fontWeight: 500}}>
                Playlist Management
            </Typography>

            <Divider sx={{
                my: 3,
            }}/>

            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 3,
            }}>
                {/* Change Visibility */}
                <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Typography sx={{ mr: 2 }}>Change Visibility:</Typography>
                    <Switch
                        checked={tempIsPublic}
                        onChange={(e) => setTempIsPublic(e.target.checked)}
                    />
                    <Typography sx={{ ml: 1 }}>
                        {tempIsPublic ? "Public" : "Private"}
                    </Typography>
                </Box>

                {/* Change Name */}
                <Box>
                    <TextField
                        label="Change Name"
                        fullWidth
                        value={tempName}
                        onChange={(e) => setTempName(e.target.value)}
                    />
                </Box>

                {/* Change URL */}
                <Box>
                    <TextField
                        label="Change Access URL"
                        fullWidth
                        value={tempUrl}
                        onChange={(e) => setTempUrl(e.target.value)}
                    />
                </Box>

                {/* Change Description */}
                <Box>
                    <TextField
                        label="Change Description"
                        fullWidth
                        multiline
                        rows={4}
                        value={tempDescription}
                        onChange={(e) => setTempDescription(e.target.value)}
                    />
                </Box>

                {/* Change Host */}
                <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                    <Typography variant="h6" component="h3" sx={{ color: "white", fontWeight: 500 }}>
                        Change Playlist Host
                    </Typography>
                    <Select
                        value={tempSelectedHost}
                        onChange={(e) => setTempSelectedHost(e.target.value)}
                        displayEmpty
                        sx={{ minWidth: 200 }}
                    >
                        <MenuItem value="" disabled>
                            Select a new host
                        </MenuItem>
                        {members.map((member) => (
                            <MenuItem key={member.id} value={member.id}>
                                {member.username}
                            </MenuItem>
                        ))}
                    </Select>
                </Box>

                {/* Save and Cancel Buttons */}
                <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={() => setDeleteDialogOpen(true)}
                    >
                        Delete Playlist
                    </Button>

                    <Box sx={{ display: "flex", gap: 2 }}>
                        <Button
                            variant="contained"
                            color="error"
                            onClick={handleCancel}
                            disabled={!hasChanges}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleSave}
                            disabled={!hasChanges}
                        >
                            Save
                        </Button>
                    </Box>
                </Box>

            </Box>

            <Divider sx={{
                my: 3,
            }}/>

            <Typography variant="h5" component="h2" sx={{color: 'white', fontWeight: 500}}>
                Playlist Moderators
            </Typography>

            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 3,
                mt: 3,
            }}>
                {/* Add Moderator */}
                <Box>
                    <TextField
                        label="Add Moderator by Username"
                        fullWidth
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <Button variant="contained" sx={{ mt: 1 }} onClick={handleAddModerator}>
                        Add
                    </Button>
                </Box>

                {/* Moderator List */}
                {moderatorList.length > 0 && (
                    <>
                        <Box
                            sx={{
                                maxHeight: 200, // Fixed height for the box
                                overflowY: "auto", // Enable vertical scrolling
                                border: "1px solid #ccc", // Optional: Add a border for better visibility
                                borderRadius: 2, // Optional: Rounded corners
                                bgcolor: "background.paper", // Background color
                                p: 1, // Padding inside the box
                            }}
                        >
                            <List>
                                {moderatorList.map((mod) => (
                                    <ListItem key={mod.id}>
                                        <ListItemText
                                            primary={mod.username || mod.id}
                                            secondary={`ID: ${mod.id}`}
                                        />
                                        <ListItemSecondaryAction>
                                            <IconButton
                                                edge="end"
                                                color="primary"
                                                href={`/user/${mod.username || mod.id}`}
                                            >
                                                <ProfileIcon />
                                            </IconButton>
                                            <IconButton
                                                edge="end"
                                                color="error"
                                                onClick={() => handleRemoveModerator(mod.id)}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                ))}
                            </List>
                        </Box>
                    </>
                )}
            </Box>

            {/* Confirmation Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
            >
                <DialogTitle>Confirm Deletion</DialogTitle>
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
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
PlaylistSettings.propTypes = {
    playlistId: PropTypes.number.isRequired,
}
