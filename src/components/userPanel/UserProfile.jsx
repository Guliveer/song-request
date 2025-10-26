"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SetTitle from "@/components/SetTitle";
import Link from "next/link";
import { UserMinus, UserPlus } from "lucide-react";
import {
    followUser,
    genUserAvatar,
    getCurrentUser,
    getJoinedPlaylists,
    getPlaylistData,
    getUserInfo,
    getUserSongs,
    getUserVotes,
    hardBanUser,
    isFollowingUser,
    isUserAdmin,
    isUserLoggedIn,
    removeSong,
    removeVotes,
    unfollowUser
} from "@/lib/actions";
import { Button } from "shadcn/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "shadcn/dialog";
import { Typography } from "shadcn/typography";
import { Avatar, AvatarFallback, AvatarImage } from "shadcn/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "shadcn/tabs";
import { Card, CardContent } from "shadcn/card";
import { Badge } from "shadcn/badge";
import { Spinner } from "shadcn/spinner";
import { Container } from "shadcn/container";
import { toast } from "sonner";

function TabPanel(props) {
    const {children, value, index, ...other} = props;

    return (
        <div role="tabpanel" hidden={value !== index} id={`user-tabpanel-${index}`}
             aria-labelledby={`user-tab-${index}`} {...other}>
            {value === index && <div className="p-6">{children}</div>}
        </div>
    );
}

export default function UserProfile({userData}) {
    const router = useRouter();
    const [tabValue, setTabValue] = useState("details");
    const [songs, setSongs] = useState([]);
    const [votes, setVotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [deleteType, setDeleteType] = useState("");
    const [banDialogOpen, setBanDialogOpen] = useState(false);
    const [userFollowed, setUserFollowed] = useState(false);
    const [followLoading, setFollowLoading] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isSameUser, setIsSameUser] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState("");
    const [commonPlaylists, setCommonPlaylists] = useState([]);

    useEffect(() => {
        async function fetchData() {
            try {
                const curUser = await getCurrentUser();
                const currentUserData = await getUserInfo(curUser?.id);
                setSongs(await getUserSongs(userData.id));
                setVotes(await getUserVotes(userData.id));
                setUserFollowed(await isFollowingUser(userData.id)); // Check if the current user is following the viewed user
                setIsAdmin(await isUserAdmin()); // Check if the current user is an admin
                setAvatarUrl(await genUserAvatar(userData.id)); // Set the avatar URL
                setIsSameUser(currentUserData?.id === userData.id); // Check if the current user is the same as the viewed user
                setIsLoggedIn(await isUserLoggedIn());
            } catch (error) {
                console.error("Error fetching data:", error);
                toast.error("Error loading user data");
            }
        }

        async function fetchCommonPlaylists() {
            try {
                const currentUser = await getCurrentUser();
                const currentUserPlaylists = await getJoinedPlaylists(currentUser.id);
                const displayedUserPlaylists = await getJoinedPlaylists(userData.id);

                // Find shared playlists
                const common = currentUserPlaylists.filter((playlist) => displayedUserPlaylists.some((p) => p.id === playlist.id));

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
                        };
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
                toast.error("Error loading user data or playlists");
            });
    }, [userData.id]);

    const handleDeleteClick = (id, type) => {
        setItemToDelete(id);
        setDeleteType(type);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            if (deleteType === "song") {
                await removeSong(itemToDelete);
                setSongs(songs.filter((song) => song.id !== itemToDelete));
            } else if (deleteType === "vote") {
                await removeVotes(itemToDelete);
                setVotes(votes.filter((vote) => vote.id !== itemToDelete));
            }

            toast.success(`${deleteType === "song" ? "Song" : "Vote"} removed successfully`);
        } catch (error) {
            console.error("Error deleting item:", error);
            toast.error(`Error removing ${deleteType}`);
        } finally {
            setDeleteDialogOpen(false);
        }
    };

    const handleBanClick = () => {
        setBanDialogOpen(true);
    };

    const handleBanConfirm = async () => {
        try {
            await hardBanUser(userData.id);
            toast.success(`User ${(userData.ban_status === 0 ? "unbanned" : "banned")} successfully`);

            // Refresh the page to get updated user data
            router.refresh();
        } catch (error) {
            console.error("Error banning user:", error);
            toast.error("Error updating user ban status");
        } finally {
            setBanDialogOpen(false);
        }
    };

    const handleFollowToggle = async () => {
        if (isSameUser) return; // Can't follow yourself

        setFollowLoading(true);
        try {
            if (userFollowed) {
                await unfollowUser(userData.id);
                toast.success(`Unfollowed ${userData.username}`);
                setUserFollowed(false);
            } else {
                await followUser(userData.id);
                toast.success(`Now following ${userData.username}`);
                setUserFollowed(true);
            }
        } catch (error) {
            console.error("Error toggling follow status:", error);
            toast.error(`Error ${userFollowed ? "unfollowing" : "following"} user`);
        } finally {
            setFollowLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center mt-8">
                <Spinner className="h-8 w-8"/>
            </div>
        );
    }

    return (
        <>
            <SetTitle text={`${userData?.username} - User Panel`}/>
            <Container maxWidth="lg" className="mt-8">
                <Card className="p-6 mb-6 rounded-xl">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-4">
                            <Avatar className="h-16 w-16">
                                <AvatarImage src={avatarUrl} alt={userData.username}/>
                                <AvatarFallback>{userData.username?.charAt(0)?.toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <Typography variant="h4" className="font-bold">
                                {userData.username}
                            </Typography>
                        </div>
                        <div className="flex gap-4">
                            {!isSameUser && isLoggedIn && (
                                <Button variant="outline" onClick={handleFollowToggle} disabled={followLoading}
                                        className="flex items-center gap-2">
                                    {userFollowed ? <UserMinus className="h-4 w-4"/> : <UserPlus className="h-4 w-4"/>}
                                    {followLoading ? "Processing..." : userFollowed ? "Unfollow" : "Follow"}
                                </Button>
                            )}
                            {isAdmin && !isSameUser && (
                                <Button variant={userData.ban_status > 0 ? "default" : "destructive"}
                                        onClick={handleBanClick}>
                                    {userData.ban_status > 0 ? "Unban Account" : "Ban Account"}
                                </Button>
                            )}
                        </div>
                    </div>

                    <Tabs value={tabValue} onValueChange={setTabValue} className="w-full">
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="details">Details</TabsTrigger>
                            <TabsTrigger value="songs">Songs</TabsTrigger>
                            <TabsTrigger value="votes">Votes</TabsTrigger>
                            <TabsTrigger value="playlists">Common Playlists</TabsTrigger>
                        </TabsList>

                        {/* User Info Tab */}
                        <TabsContent value="details">
                            <Card>
                                <CardContent className="p-6">
                                    <div className="space-y-4">
                                        <div className="flex justify-between">
                                            <Typography className="font-semibold">User ID</Typography>
                                            <Typography>{userData.id}</Typography>
                                        </div>
                                        <div className="flex justify-between">
                                            <Typography className="font-semibold">Username</Typography>
                                            <Typography>{userData.username}</Typography>
                                        </div>
                                        {isAdmin && (
                                            <div className="flex justify-between">
                                                <Typography className="font-semibold">Status</Typography>
                                                <Badge
                                                    variant={userData.ban_status > 0 ? "destructive" : "default"}>{userData.ban_status > 0 ? "Banned" : "Active"}</Badge>
                                            </div>
                                        )}
                                        <div className="flex justify-between">
                                            <Typography className="font-semibold">Songs Added</Typography>
                                            <Typography>{songs.length}</Typography>
                                        </div>
                                        <div className="flex justify-between">
                                            <Typography className="font-semibold">Votes Cast</Typography>
                                            <Typography>{votes.length}</Typography>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Songs Tab */}
                        <TabsContent value="songs">
                            {songs.length === 0 ? (
                                <Typography className="text-center py-8">No songs added by this user.</Typography>
                            ) : (
                                <Card>
                                    <CardContent className="p-0">
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead className="border-b">
                                                <tr>
                                                    <th className="text-left p-4">Title</th>
                                                    <th className="text-left p-4">Author</th>
                                                    <th className="text-left p-4">Added At</th>
                                                    <th className="text-left p-4">Score</th>
                                                    {isAdmin && <th className="text-left p-4">Actions</th>}
                                                </tr>
                                                </thead>
                                                <tbody>
                                                {songs.map((song) => (
                                                    <tr key={song.id} className="border-b">
                                                        <td className="p-4">{song.title}</td>
                                                        <td className="p-4">{song.author}</td>
                                                        <td className="p-4">{new Date(song.added_at).toLocaleString()}</td>
                                                        <td className="p-4">{song.score}</td>
                                                        {isAdmin && (
                                                            <td className="p-4">
                                                                <Button variant="outline" size="sm"
                                                                        onClick={() => handleDeleteClick(song.id, "song")}
                                                                        className="text-red-500 border-red-500 hover:bg-red-500/10">
                                                                    Remove
                                                                </Button>
                                                            </td>
                                                        )}
                                                    </tr>
                                                ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>

                        {/* Votes Tab */}
                        <TabsContent value="votes">
                            {votes.length === 0 ? (
                                <Typography className="text-center py-8">No votes cast by this user.</Typography>
                            ) : (
                                <Card>
                                    <CardContent className="p-0">
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead className="border-b">
                                                <tr>
                                                    <th className="text-left p-4">Song</th>
                                                    <th className="text-left p-4">Vote</th>
                                                    <th className="text-left p-4">Voted At</th>
                                                    {isAdmin && <th className="text-left p-4">Actions</th>}
                                                </tr>
                                                </thead>
                                                <tbody>
                                                {votes.map((vote) => (
                                                    <tr key={vote.id} className="border-b">
                                                        <td className="p-4">{vote.queue ? `${vote.queue.title} - ${vote.queue.author}` : "Unknown Song"}</td>
                                                        <td className="p-4">
                                                            <Badge
                                                                variant={vote.vote > 0 ? "default" : "destructive"}>{vote.vote > 0 ? "Upvote" : "Downvote"}</Badge>
                                                        </td>
                                                        <td className="p-4">{new Date(vote.voted_at).toLocaleString()}</td>
                                                        {isAdmin && (
                                                            <td className="p-4">
                                                                <Button variant="outline" size="sm"
                                                                        onClick={() => handleDeleteClick(vote.id, "vote")}
                                                                        className="text-red-500 border-red-500 hover:bg-red-500/10">
                                                                    Remove
                                                                </Button>
                                                            </td>
                                                        )}
                                                    </tr>
                                                ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>

                        {/* Shared Playlists Tab */}
                        <TabsContent value="playlists">
                            {commonPlaylists.length === 0 ? (
                                <Typography className="text-center py-8">No common playlists found.</Typography>
                            ) : (
                                <Card>
                                    <CardContent className="p-0">
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead className="border-b">
                                                <tr>
                                                    <th className="text-left p-4">Playlist Name</th>
                                                    <th className="text-left p-4">Description</th>
                                                    <th className="text-left p-4">Host</th>
                                                    <th className="text-left p-4">Actions</th>
                                                </tr>
                                                </thead>
                                                <tbody>
                                                {commonPlaylists.map((playlist) => (
                                                    <tr key={playlist.id} className="border-b">
                                                        <td className="p-4">{playlist.name}</td>
                                                        <td className="p-4">{playlist.description}</td>
                                                        <td className="p-4">{playlist.host}</td>
                                                        <td className="p-4">
                                                            <Link href={`/playlist/${playlist?.url}`}>
                                                                <Button variant="outline" size="sm">
                                                                    View
                                                                </Button>
                                                            </Link>
                                                        </td>
                                                    </tr>
                                                ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>
                    </Tabs>
                </Card>

                {/* Delete Confirmation Dialog */}
                <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Confirm Deletion</DialogTitle>
                        </DialogHeader>
                        <Typography>Are you sure you want to remove this {deleteType}? This action cannot be
                            undone.</Typography>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button variant="destructive" onClick={handleDeleteConfirm}>
                                Delete
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Ban Confirmation Dialog */}
                <Dialog open={banDialogOpen} onOpenChange={setBanDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Confirm {userData.ban_status > 0 ? "Unban" : "Ban"}</DialogTitle>
                        </DialogHeader>
                        <Typography>
                            Are you sure you want
                            to {userData.ban_status > 0 ? "unban" : "ban"} user {userData.username}?
                        </Typography>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setBanDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button variant={userData.ban_status > 0 ? "default" : "destructive"}
                                    onClick={handleBanConfirm}>
                                {userData.ban_status > 0 ? "Unban" : "Ban"} User
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </Container>
        </>
    );
}
