import { useEffect, useState } from "react";
import Link from "next/link";
import {
    getPlaylistData,
    getPlaylistModerators,
    getPlaylistMembers,
    getPlaylistBannedUsers,
    banPlaylistUser,
    unbanPlaylistUser,
    leavePlaylist,
} from "@/utils/actions";
import {
    Divider,
    Avatar,
    CircularProgress,
    Menu,
    MenuItem,
    Button,
    Box,
    Typography,
    List,
    ListItem,
    ListItemText,
    IconButton,
    Dialog,
    DialogTitle,
    DialogActions,
    DialogContent,
    DialogContentText,
} from "@mui/material";
import { BlockRounded as BanIcon, UndoRounded as UnbanIcon } from "@mui/icons-material";

export default function PlaylistMembers({ playlistId }) {
    const [data, setData] = useState({
        playlist: null,
        moderators: [],
        members: [],
        bannedUsers: [],
    });
    const [uiState, setUiState] = useState({
        loading: true,
        dialogOpen: false,
        selectedGroup: "",
        anchorEl: null,
    });

    const fetchAllData = async () => {
        try {
            setUiState((prev) => ({ ...prev, loading: true }));
            const [playlist, moderators, members, bannedUsers] = await Promise.all([
                getPlaylistData(playlistId),
                getPlaylistModerators(playlistId),
                getPlaylistMembers(playlistId),
                getPlaylistBannedUsers(playlistId),
            ]);
            setData({ playlist, moderators, members, bannedUsers });
        } catch (error) {
            console.error("Error fetching data:", error.message);
        } finally {
            setUiState((prev) => ({ ...prev, loading: false }));
        }
    };

    useEffect(() => {
        fetchAllData();
    }, [playlistId]);

    const handleOpenDialog = (group) => {
        setUiState((prev) => ({ ...prev, dialogOpen: true, selectedGroup: group, anchorEl: null }));
    };

    const handleCloseDialog = () => {
        setUiState((prev) => ({ ...prev, dialogOpen: false, selectedGroup: "" }));
    };

    const handleBulkAction = async (group, action) => {
        try {
            const users = group === "everyone"
                ? data.members.map((user) => user.id)
                : group === "moderators"
                    ? data.moderators.map((user) => user.id)
                    : data.members.filter((user) => !data.moderators.includes(user.id)).map((user) => user.id);

            for (const userId of users) {
                if (action === "ban") await banPlaylistUser(playlistId, userId);
                if (action === "kick") await leavePlaylist(playlistId, userId);
            }
            await fetchAllData();
        } catch (error) {
            console.error(`Error performing bulk ${action}:`, error.message);
        } finally {
            handleCloseDialog();
        }
    };

    if (uiState.loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Typography variant="h5" component="h2" sx={{color: 'white', fontWeight: 500}}>
                    Members Management
                </Typography>
                <Button
                    color="error"
                    variant="contained"
                    onClick={(e) => setUiState((prev) => ({ ...prev, anchorEl: e.currentTarget }))}
                >
                    Bulk Actions
                </Button>
            </Box>

            <Divider sx={{ my: 3 }} />

            <List>
                {data.members.map((member) => (
                    <ListItem key={member.id}>
                        <Avatar src={member.avatar} alt={member.username}  sx={{ mr: 1.5 }} />
                        <Typography component="div" sx={{ textDecoration: "none", color: "inherit", width: "100%" }}>
                            <Link href={`/user/${member.username}`} style={{ textDecoration: "none", color: "inherit" }}>
                                {member.username}
                            </Link>
                        </Typography>
                        <IconButton onClick={() => banPlaylistUser(playlistId, member.id)}>
                            <BanIcon color="error" />
                        </IconButton>
                    </ListItem>
                ))}
            </List>

            <Menu
                anchorEl={uiState.anchorEl}
                open={Boolean(uiState.anchorEl)}
                onClose={() => setUiState((prev) => ({ ...prev, anchorEl: null }))}
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "right",
                }}
                transformOrigin={{
                    vertical: "top",
                    horizontal: "right",
                }}
            >
                <MenuItem onClick={() => handleOpenDialog("kick regular users")}>Kick Regular Users</MenuItem>
                <MenuItem onClick={() => handleOpenDialog("kick moderators")}>Kick Moderators</MenuItem>
                <MenuItem onClick={() => handleOpenDialog("kick everyone")}>Kick Everyone</MenuItem>
                <Divider />
                <MenuItem onClick={() => handleOpenDialog("ban regular users")}>Ban Regular Users</MenuItem>
                <MenuItem onClick={() => handleOpenDialog("ban moderators")}>Ban Moderators</MenuItem>
                <MenuItem onClick={() => handleOpenDialog("ban everyone")}>Ban Everyone</MenuItem>
            </Menu>

            <ConfirmationDialog
                open={uiState.dialogOpen}
                group={uiState.selectedGroup}
                onClose={handleCloseDialog}
                onConfirm={(action) => handleBulkAction(uiState.selectedGroup, action)}
            />
        </Box>
    );
}

function ConfirmationDialog({ open, group, onClose, onConfirm }) {
    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Confirm Action</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Are you sure you want to {group.includes("kick") ? "kick" : "ban"} {group} from this playlist?
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="primary">
                    Cancel
                </Button>
                <Button
                    onClick={() => onConfirm(group.includes("kick") ? "kick" : "ban")}
                    color="error"
                >
                    Confirm
                </Button>
            </DialogActions>
        </Dialog>
    );
}