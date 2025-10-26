import { useEffect, useState } from "react";
import Link from "next/link";
import {
    banPlaylistUser,
    getCurrentUser,
    getPlaylistBannedUsers,
    getPlaylistData,
    getPlaylistMembers,
    getPlaylistModerators,
    leavePlaylist,
    unbanPlaylistUser
} from "@/lib/actions";
import { Button } from "shadcn/button";
import { Avatar, AvatarFallback, AvatarImage } from "shadcn/avatar";
import { Spinner } from "shadcn/spinner";
import { Separator } from "shadcn/separator";
import { Typography } from "shadcn/typography";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "shadcn/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "shadcn/dropdown-menu";
import { Ban as BanIcon, Shield as ModIcon, Star as HostIcon, Undo as UnbanIcon, X as KickIcon } from "lucide-react";
import { FormField } from "@/components/Items";
import PropTypes from "prop-types";

export default function PlaylistMembers({playlistId}) {
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
            setUiState((prev) => ({...prev, loading: true}));
            const [playlist, moderators, members, bannedUsers, currentUser] = await Promise.all([getPlaylistData(playlistId), getPlaylistModerators(playlistId), getPlaylistMembers(playlistId), getPlaylistBannedUsers(playlistId), getCurrentUser()]);
            setData({playlist, moderators, members, bannedUsers, currentUser});
        } catch (error) {
            console.error("Error fetching data:", error.message);
        } finally {
            setUiState((prev) => ({...prev, loading: false}));
        }
    };

    useEffect(() => {
        fetchAllData();
    }, [playlistId]);

    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value);
    };

    const filteredMembers = data.members.filter((member) => member.username.toLowerCase().includes(searchQuery.toLowerCase()));

    const handleOpenDialogBulk = (group) => {
        setUiState((prev) => ({...prev, dialogOpenBulk: true, selectedGroup: group, anchorEl: null}));
    };

    const handleCloseDialogBulk = () => {
        setUiState((prev) => ({...prev, dialogOpenBulk: false, selectedGroup: ""}));
    };

    const handleOpenDialog = (user, action) => {
        setUiState((prev) => ({
            ...prev,
            dialogOpen: true,
            selectedUser: user,
            selectedGroup: action,
        }));
    };

    const handleCloseDialog = () => {
        setUiState((prev) => ({...prev, dialogOpen: false, selectedUser: null}));
    };

    const handleBannedDialogOpen = () => {
        setUiState((prev) => ({...prev, bannedDialogOpen: true}));
    };

    const handleBannedDialogClose = () => {
        setUiState((prev) => ({...prev, bannedDialogOpen: false}));
    };

    const handleBulkAction = async (group, action) => {
        try {
            if (data.playlist?.host !== data.currentUser?.id) {
                console.error("Only the host can perform bulk actions.");
                throw new Error("Only the host can perform bulk actions.");
            }

            const users = group === "everyone" ? data.members.map((user) => user.id) : group === "moderators" ? data.moderators.map((user) => user.id) : data.members.filter((user) => !data.moderators.includes(user.id)).map((user) => user.id);

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
    };

    if (uiState.loading) {
        return (
            <div className="flex justify-center items-center h-full">
                <Spinner/>
            </div>
        );
    }

    const isHost = data.playlist?.host === data.currentUser?.id;

    return (
        <div className="p-6">
            <div className="flex items-center justify-between">
                <Typography variant="h5" className="text-white font-medium">
                    Members Management
                </Typography>

                <Button variant="default" onClick={handleBannedDialogOpen}>
                    View Banned Users
                </Button>
            </div>

            <Separator className="my-6"/>

            <div className="flex justify-between items-center mb-4 gap-4">
                <FormField label="Search Users" variant="outlined" size="small" value={searchQuery}
                           onChange={handleSearchChange}/>

                {isHost && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="destructive">Bulk Actions</Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleOpenDialogBulk("kick regular users")}>Kick Regular
                                Users</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleOpenDialogBulk("kick moderators")}>Kick
                                Moderators</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleOpenDialogBulk("kick everyone")}>Kick
                                Everyone</DropdownMenuItem>
                            <DropdownMenuSeparator/>
                            <DropdownMenuItem onClick={() => handleOpenDialogBulk("ban regular users")}>Ban Regular
                                Users</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleOpenDialogBulk("ban moderators")}>Ban
                                Moderators</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleOpenDialogBulk("ban everyone")}>Ban
                                Everyone</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>

            <div className="max-h-96 overflow-y-auto rounded-lg p-2">
                {filteredMembers.map((member) => (
                    <div key={member.id}
                         className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg">
                        <Link href={`/user/${member.username}`}
                              className="flex items-center text-inherit no-underline flex-1">
                            <Avatar className="mr-3">
                                <AvatarImage src={member.avatar} alt={member.username}/>
                                <AvatarFallback>{member.username.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="flex items-center">
                                {data.playlist.host === member.id && <HostIcon className="mr-1 h-4 w-4"/>}

                                {Object.keys(data.moderators).includes(member.id) &&
                                    <ModIcon className="mr-1 h-4 w-4"/>}

                                <Typography>{member.username}</Typography>
                            </div>
                        </Link>
                        <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(member, "leave")}
                                    className="text-orange-500 hover:text-orange-600">
                                <KickIcon className="h-4 w-4"/>
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(member, "ban")}
                                    className="text-red-500 hover:text-red-600">
                                <BanIcon className="h-4 w-4"/>
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            {isHost && <ConfirmationBulkDialog open={uiState.dialogOpenBulk} group={uiState.selectedGroup}
                                               onClose={handleCloseDialogBulk}
                                               onConfirm={(action) => handleBulkAction(uiState.selectedGroup, action)}/>}

            <ConfirmationDialog open={uiState.dialogOpen} user={uiState.selectedUser}
                                action={uiState.selectedGroup.includes("ban") ? "ban" : "kick"}
                                onClose={handleCloseDialog}
                                onConfirm={() => handleAction(uiState.selectedGroup.includes("ban") ? "ban" : "leave", uiState.selectedUser.id)}/>

            <BannedUsersDialog open={uiState.bannedDialogOpen} bannedUsers={data.bannedUsers}
                               onClose={handleBannedDialogClose}
                               onConfirm={(action, userId) => handleAction(action, userId)}/>
        </div>
    );
}
PlaylistMembers.propTypes = {
    playlistId: PropTypes.number.isRequired,
};

function ConfirmationBulkDialog({open, group, onClose, onConfirm}) {
    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Confirm Action</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to {group.includes("kick") ? "kick" : "ban"}
                        {group.includes("regular users") ? " all regular users " : group.includes("moderators") ? " all moderators " : " everyone "}
                        from this playlist?
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button onClick={onClose} variant="outline">
                        Cancel
                    </Button>
                    <Button onClick={() => onConfirm(group.includes("kick") ? "kick" : "ban")} variant="destructive">
                        Confirm
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

ConfirmationBulkDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    group: PropTypes.string.isRequired,
    onClose: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired,
};

function ConfirmationDialog({open, user, action, onClose, onConfirm}) {
    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Confirm Action</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to {action} {user?.username}?
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button onClick={onClose} variant="outline">
                        Cancel
                    </Button>
                    <Button onClick={onConfirm} variant="destructive">
                        Confirm
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

ConfirmationDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    user: PropTypes.object,
    action: PropTypes.string.isRequired,
    onClose: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired,
};

function BannedUsersDialog({open, bannedUsers, onClose, onConfirm}) {
    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Banned Users</DialogTitle>
                </DialogHeader>
                <div className="max-h-96 overflow-y-auto rounded-lg p-2">
                    {bannedUsers.map((user) => (
                        <div key={user.id} className="flex items-center justify-between p-3 gap-6">
                            <div className="flex items-center">
                                <Avatar className="mr-3">
                                    <AvatarImage src={user.avatar} alt={user.username}/>
                                    <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <Typography className="flex-1">{user.username}</Typography>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => onConfirm("unban", user.id)}
                                    className="text-blue-500 hover:text-blue-600">
                                <UnbanIcon className="h-4 w-4"/>
                            </Button>
                        </div>
                    ))}
                </div>
                <DialogFooter>
                    <Button onClick={onClose} variant="outline">
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

BannedUsersDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    bannedUsers: PropTypes.arrayOf(PropTypes.object).isRequired,
    onClose: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired,
};
