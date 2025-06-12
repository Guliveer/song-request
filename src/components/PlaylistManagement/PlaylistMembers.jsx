import { useEffect, useState } from "react";
import Link from "next/link";
import {
    getPlaylistData,
    getPlaylistModerators,
    getPlaylistMembers,
    getPlaylistBannedUsers,
    banPlaylistUser,
    unbanPlaylistUser,
    leavePlaylist, getCurrentUser,
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
    IconButton,
    Dialog,
    DialogTitle,
    DialogActions,
    DialogContent,
    DialogContentText,
} from "@mui/material";
import {
    StarRounded as HostIcon,
    ShieldRounded as ModIcon,
    BlockRounded as BanIcon,
    ClearRounded as KickIcon,
    UndoRounded as UnbanIcon,
} from "@mui/icons-material";
import {FormField} from "@/components/Items";
import PropTypes from "prop-types";

export default function PlaylistMembers({ playlistId }) {
    const [data, setData] = useState({
        playlist: null,
        moderators: [],
        members: [],
        bannedUsers: [],
        currentUser: null,
    });
    const [uiState, setUiState] = useState({
        loading: true,
        dialogOpen: false,
        dialogOpenBulk: false,
        bannedDialogOpen: false,
        selectedGroup: "",
        selectedAction: "",
        selectedUser: null,
        anchorEl: null,
    });
    const [searchQuery, setSearchQuery] = useState("");

    const fetchAllData = async () => {
        try {
            setUiState((prev) => ({ ...prev, loading: true }));
            const [playlist, moderators, members, bannedUsers, currentUser] = await Promise.all([
                getPlaylistData(playlistId),
                getPlaylistModerators(playlistId),
                getPlaylistMembers(playlistId),
                getPlaylistBannedUsers(playlistId),
                getCurrentUser(),
            ]);
            setData({ playlist, moderators, members, bannedUsers, currentUser });
        } catch (error) {
            console.error("Error fetching data:", error.message);
        } finally {
            setUiState((prev) => ({ ...prev, loading: false }));
        }
    };

    useEffect(() => {
        fetchAllData();
    }, [playlistId]);

    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value);
    };

    const filteredMembers = data.members.filter((member) =>
        member.username.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleOpenDialogBulk = (group) => {
        setUiState((prev) => ({ ...prev, dialogOpenBulk: true, selectedGroup: group, anchorEl: null }));
    };

    const handleCloseDialogBulk = () => {
        setUiState((prev) => ({ ...prev, dialogOpenBulk: false, selectedGroup: "" }));
    };

    const handleOpenDialog = (user, action) => {
        setUiState((prev) => ({
            ...prev,
            dialogOpen: true,
            selectedUser: user,
            selectedGroup: action,
        }));
    }

    const handleCloseDialog = () => {
        setUiState((prev) => ({ ...prev, dialogOpen: false, selectedUser: null }));
    }

    const handleBannedDialogOpen = () => {
        setUiState((prev) => ({ ...prev, bannedDialogOpen: true }));
    };

    const handleBannedDialogClose = () => {
        setUiState((prev) => ({ ...prev, bannedDialogOpen: false }));
    };

    const handleBulkAction = async (group, action) => {
        try {
            if (data.playlist?.host !== data.currentUser?.id) {
                console.error("Only the host can perform bulk actions.");
                throw new Error("Only the host can perform bulk actions.");
            }

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
            handleCloseDialogBulk();
        }
    };

    const handleAction = async (action, userId) => {
        try {
            if (action === "ban") {
                await banPlaylistUser(playlistId, userId);
            } else if (action === "unban") {
                await unbanPlaylistUser(playlistId, userId);
            } else if (action === "leave") {
                await leavePlaylist(playlistId, userId);
            }
            await fetchAllData();
        } catch (error) {
            console.error(`Error performing ${action} action:`, error.message);
        } finally {
            handleCloseDialog();
        }
    }

    if (uiState.loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
                <CircularProgress />
            </Box>
        );
    }

    const isHost = data.playlist?.host === data.currentUser?.id;

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Typography variant="h5" component="h2" sx={{color: 'white', fontWeight: 500}}>
                    Members Management
                </Typography>

                <Button
                    variant="contained"
                    onClick={handleBannedDialogOpen}
                >
                    View Banned Users
                </Button>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Box sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
                gap: 2,
            }}>
                <FormField
                    label="Search Users"
                    variant="outlined"
                    size="small"
                    value={searchQuery}
                    onChange={handleSearchChange}
                />

                {isHost && (
                    <Button
                        color="error"
                        variant="contained"
                        onClick={(e) => setUiState((prev) => ({ ...prev, anchorEl: e.currentTarget }))}
                    >
                        Bulk Actions
                    </Button>
                )}
            </Box>
            <List
                component="div"
                sx={{
                    maxHeight: 400, // Set the maximum height for the scrollable area
                    overflowY: "auto",
                    borderRadius: 2,
                    padding: 1,
                }}
            >
                {filteredMembers.map((member) => (
                    <ListItem key={member.id}>
                        <Link href={`/user/${member.username}`} style={{
                            display: "flex",
                            alignItems: "center",
                            textDecoration: "none",
                            color: "inherit",
                            width: "100%",
                        }}>
                            <Avatar src={member.avatar} alt={member.username}  sx={{ mr: 1.5 }} />
                            <Typography component="div" sx={{
                                display: "flex",
                                alignItems: "center",
                                textDecoration: "none",
                                color: "inherit",
                            }}>
                                {data.playlist.host === member.id && (
                                    <HostIcon sx={{ mr: 0.5 }} fontSize="small" />
                                )}

                                {Object.keys(data.moderators).includes(member.id) && (
                                    <ModIcon sx={{ mr: 0.5 }} fontSize="small" />
                                )}

                                {member.username}
                            </Typography>
                        </Link>
                        <IconButton onClick={() => handleOpenDialog(member, "leave")}>
                            <KickIcon color="warning" />
                        </IconButton>
                        <IconButton onClick={() => handleOpenDialog(member, "ban")}>
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
                <MenuItem onClick={() => handleOpenDialogBulk("kick regular users")}>Kick Regular Users</MenuItem>
                <MenuItem onClick={() => handleOpenDialogBulk("kick moderators")}>Kick Moderators</MenuItem>
                <MenuItem onClick={() => handleOpenDialogBulk("kick everyone")}>Kick Everyone</MenuItem>
                <Divider />
                <MenuItem onClick={() => handleOpenDialogBulk("ban regular users")}>Ban Regular Users</MenuItem>
                <MenuItem onClick={() => handleOpenDialogBulk("ban moderators")}>Ban Moderators</MenuItem>
                <MenuItem onClick={() => handleOpenDialogBulk("ban everyone")}>Ban Everyone</MenuItem>
            </Menu>

            {isHost && (
                <ConfirmationBulkDialog
                    open={uiState.dialogOpenBulk}
                    group={uiState.selectedGroup}
                    onClose={handleCloseDialogBulk}
                    onConfirm={(action) => handleBulkAction(uiState.selectedGroup, action)}
                />
            )}


            <ConfirmationDialog
                open={uiState.dialogOpen}
                user={uiState.selectedUser}
                action={uiState.selectedGroup.includes("ban") ? "ban" : "kick"}
                onClose={handleCloseDialog}
                onConfirm={() => handleAction(uiState.selectedGroup.includes("ban") ? "ban" : "leave", uiState.selectedUser.id)}
            />

            <BannedUsersDialog
                open={uiState.bannedDialogOpen}
                bannedUsers={data.bannedUsers}
                onClose={handleBannedDialogClose}
                onConfirm={(action, userId) => handleAction(action, userId)}
            />
        </Box>
    );
}
PlaylistMembers.propTypes = {
    playlistId: PropTypes.number.isRequired,
}

function ConfirmationBulkDialog({ open, group, onClose, onConfirm }) {
    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Confirm Action</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Are you sure you want to {group.includes("kick") ? "kick" : "ban"}
                    {group.includes("regular users") ? " all regular users "
                        : group.includes("moderators") ? " all moderators " : " everyone "}
                    from this playlist?
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
ConfirmationBulkDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    group: PropTypes.string.isRequired,
    onClose: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired,
}

function ConfirmationDialog({ open, user, action, onClose, onConfirm }) {
    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Confirm Action</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Are you sure you want to {action} {user?.username}?
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="primary">
                    Cancel
                </Button>
                <Button onClick={onConfirm} color="error">
                    Confirm
                </Button>
            </DialogActions>
        </Dialog>
    );
}
ConfirmationDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    user: PropTypes.object,
    action: PropTypes.string.isRequired,
    onClose: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired,
}

function BannedUsersDialog({ open, bannedUsers, onClose, onConfirm }) {
    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Banned Users</DialogTitle>
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
                    {bannedUsers.map((user) => (
                        <ListItem key={user.id} sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: 3,
                        }}>
                            <Box sx={{
                                display: "flex",
                                alignItems: "center",
                            }}>
                                <Avatar src={user.avatar} alt={user.username} sx={{ mr: 1.5 }} />
                                <Typography component="div" sx={{ flexGrow: 1 }}>
                                    {user.username}
                                </Typography>
                            </Box>
                            <IconButton onClick={() => onConfirm("unban", user.id)}>
                                <UnbanIcon color="primary" />
                            </IconButton>
                        </ListItem>
                    ))}
                </List>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="primary">
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
}
BannedUsersDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    bannedUsers: PropTypes.arrayOf(PropTypes.object).isRequired,
    onClose: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired,
}
