import React, { useEffect, useState } from "react";
import { AlertCircle, Search, Trash2, UserPlus } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "shadcn/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "shadcn/dialog";
import { Input } from "shadcn/input";
import { Typography } from "shadcn/typography";
import { Separator } from "shadcn/separator";

export default function Followers({userId, followingCount, followersCount, onFollowAction}) {
    const [friendUsername, setFriendUsername] = useState("");
    const [friendSearchResults, setFriendSearchResults] = useState([]);
    const [alreadyFollowing, setAlreadyFollowing] = useState(false);
    const [followedUsersData, setFollowedUsersData] = useState([]);
    const [followersData, setFollowersData] = useState([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogType, setDialogType] = useState(null);
    const [visibleFollowing, setVisibleFollowing] = useState(5);
    const [visibleFollowers, setVisibleFollowers] = useState(5);
    const [followingSearch, setFollowingSearch] = useState("");

    // Fetch followed users and followers
    useEffect(() => {
        const fetchData = async () => {
            if (!userId) return;

            // Get list of followed user IDs
            const {data: currentUser} = await supabase.from("users").select("followed_users").eq("id", userId).single();

            const followedIds = currentUser?.followed_users ?? [];

            // Get full user data for followed users
            let followedUsers = [];
            if (followedIds.length > 0) {
                const {data: users} = await supabase.from("users").select("id, username").in("id", followedIds);

                followedUsers = users || [];
            }

            setFollowedUsersData(followedUsers);

            // Get all users to find who follows current user
            const {data: allUsers} = await supabase.from("users").select("id, username, followed_users");

            const yourFollowers = (allUsers || []).filter((u) => Array.isArray(u.followed_users) && u.followed_users.includes(userId));

            setFollowersData(yourFollowers);
        };

        fetchData();
    }, [userId, dialogOpen]); // re-fetch when dialog opens, or userId changes

    useEffect(() => {
        if (dialogOpen && dialogType === "following") setVisibleFollowing(5);
        if (dialogOpen && dialogType === "followers") setVisibleFollowers(5);
    }, [dialogOpen, dialogType]);

    const handleAddFriend = async () => {
        if (!friendUsername.trim()) return;

        const {data: friendUser} = await supabase.from("users").select("id, username").eq("username", friendUsername).single();

        if (!friendUser) return;

        const alreadyExists = followedUsersData.some((u) => u.id === friendUser.id);
        if (alreadyExists) {
            setAlreadyFollowing(true);
            return;
        }

        const {data: currentUser} = await supabase.from("users").select("followed_users").eq("id", userId).single();

        const {data: currentUserData} = await supabase.from("users").select("username").eq("id", userId).single();

        const currentFollows = currentUser?.followed_users ?? [];
        const updated = [...currentFollows, friendUser.id];

        const {error} = await supabase.from("users").update({followed_users: updated}).eq("id", userId);

        if (!error) {
            // Dodaj powiadomienie do tabeli notifications
            await supabase.from("notifications").insert([
                {
                    user_id: friendUser.id, // odbiorca powiadomienia
                    sender_id: userId, // kto dodał
                    type: "new_follower", // typ powiadomienia (zgodnie z enumem)
                    message: `User ${currentUserData?.username || userId} started following you!`,
                    link: `/user/${userId}`,
                    read: false,
                },
            ]);
            setFriendUsername("");
            setFriendSearchResults([]);
            setAlreadyFollowing(false);
            setFollowedUsersData((prev) => [...prev, friendUser]);
            if (onFollowAction) onFollowAction();
        } else {
            console.error("Failed to add friend:", error);
        }
    };

    const handleSearchChange = async (e) => {
        const val = e.target.value;
        setFriendUsername(val);
        setAlreadyFollowing(false);

        if (val.length < 3) {
            setFriendSearchResults([]);
            return;
        }

        const {data: results} = await supabase.from("users").select("id, username").ilike("username", `%${val}%`).neq("id", userId);

        setFriendSearchResults(results);
    };

    const handleOpenDialog = (type) => {
        setDialogType(type);
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setDialogType(null);
    };

    const handleUnfollow = async (idToRemove) => {
        const updated = followedUsersData.filter((u) => u.id !== idToRemove).map((u) => u.id);
        const {error} = await supabase.from("users").update({followed_users: updated}).eq("id", userId);
        if (!error) {
            setFollowedUsersData((prev) => prev.filter((u) => u.id !== idToRemove));
            if (onFollowAction) onFollowAction(); // Inform parent to refresh counts
        }
    };

    return (
        <>
            <Typography variant="h5" className="text-white font-medium">
                Find Friends
            </Typography>
            <Separator className="my-4"/>

            <div className="mb-6">
                <Typography variant="body1" className="text-white mb-4">
                    Search for users to follow:
                </Typography>

                <div className="flex gap-4 items-center">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8FE6D5] h-4 w-4"/>
                        <Input placeholder="Enter username" value={friendUsername} onChange={handleSearchChange}
                               className="pl-10 rounded-2xl"/>
                        {friendSearchResults.length > 0 && friendUsername.length >= 3 && (
                            <div
                                className="absolute top-full left-0 right-0 bg-gray-800 border border-gray-600 rounded-lg mt-1 max-h-40 overflow-y-auto z-10">
                                {friendSearchResults.map((user) => (
                                    <div key={user.id} className="px-4 py-2 hover:bg-gray-700 cursor-pointer text-white"
                                         onClick={() => setFriendUsername(user.username)}>
                                        {user.username}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <Button onClick={handleAddFriend}
                            className="px-6 py-2 font-bold bg-[#8FE6D5] text-black hover:bg-[#6fc3b2] rounded-lg">
                        <UserPlus className="mr-2 h-4 w-4"/>
                        Follow
                    </Button>
                </div>

                {alreadyFollowing && (
                    <div className="mt-2 flex items-center gap-2 text-red-500">
                        <AlertCircle className="h-4 w-4"/>
                        <Typography variant="body2">You are already following this user.</Typography>
                    </div>
                )}
            </div>

            <div className="mt-6">
                <Typography variant="h6" className="text-white mb-4">
                    Your Network
                </Typography>

                <div className="flex gap-6">
                    <div onClick={() => handleOpenDialog("following")}
                         className="flex-1 p-4 rounded-lg bg-[#23293a] text-white cursor-pointer text-center border border-gray-600 transition-all duration-200 hover:border-[#8FE6D5]">
                        <Typography variant="h4" className="text-[#8FE6D5] font-bold tracking-wide mb-1">
                            {followingCount}
                        </Typography>
                        <Typography variant="subtitle1" className="text-[#8FE6D5] font-semibold tracking-wide">
                            Following
                        </Typography>
                    </div>

                    <div onClick={() => handleOpenDialog("followers")}
                         className="flex-1 p-4 rounded-lg bg-[#23293a] text-white cursor-pointer text-center border border-gray-600 transition-all duration-200 hover:border-[#8FE6D5]">
                        <Typography variant="h4" className="text-[#8FE6D5] font-bold tracking-wide mb-1">
                            {followersCount}
                        </Typography>
                        <Typography variant="subtitle1" className="text-[#8FE6D5] font-semibold tracking-wide">
                            Followers
                        </Typography>
                    </div>
                </div>
            </div>

            {/* Dialog for following/followers */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle
                            className="text-white border-b border-gray-600 pb-2">{dialogType === "following" ? "People You Follow" : "Your Followers"}</DialogTitle>
                    </DialogHeader>

                    <div className="max-h-96 overflow-y-auto">
                        {dialogType === "following" &&
                            (followedUsersData.length === 0 ? (
                                <Typography className="p-6 text-gray-400 text-center">You are not following any
                                    users.</Typography>
                            ) : (
                                <div className="space-y-4">
                                    <div className="relative">
                                        <Search
                                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8FE6D5] h-4 w-4"/>
                                        <Input placeholder="Search following..." value={followingSearch}
                                               onChange={(e) => setFollowingSearch(e.target.value)}
                                               className="pl-10 rounded-lg"/>
                                    </div>

                                    <div className="space-y-2">
                                        {followedUsersData
                                            .filter((u) => u.username.toLowerCase().includes(followingSearch.toLowerCase()))
                                            .slice(0, visibleFollowing)
                                            .map((user, index) => (
                                                <div key={user.id} className="space-y-2">
                                                    <div
                                                        className="flex items-center justify-between p-3 hover:bg-gray-800 rounded-lg">
                                                        <Typography
                                                            className="text-white font-medium">{user.username}</Typography>
                                                        <Button variant="ghost" size="sm"
                                                                onClick={() => handleUnfollow(user.id)}
                                                                className="text-red-500 hover:bg-red-500/10">
                                                            <Trash2 className="h-4 w-4"/>
                                                        </Button>
                                                    </div>
                                                    {index < followedUsersData.filter((u) => u.username.toLowerCase().includes(followingSearch.toLowerCase())).slice(0, visibleFollowing).length - 1 &&
                                                        <Separator/>}
                                                </div>
                                            ))}
                                    </div>

                                    {visibleFollowing < followedUsersData.filter((u) => u.username.toLowerCase().includes(followingSearch.toLowerCase())).length && (
                                        <Button variant="outline"
                                                onClick={() => setVisibleFollowing((prev) => prev + 5)}
                                                className="w-full text-[#8FE6D5] border-[#8FE6D5] hover:bg-[#8FE6D5]/10">
                                            Show more
                                        </Button>
                                    )}
                                </div>
                            ))}

                        {dialogType === "followers" &&
                            (followersData.length === 0 ? (
                                <Typography className="p-6 text-gray-400 text-center">No one is following you
                                    yet.</Typography>
                            ) : (
                                <div className="space-y-2">
                                    {followersData.slice(0, visibleFollowers).map((follower, index) => (
                                        <div key={follower.id} className="space-y-2">
                                            <div className="p-3 hover:bg-gray-800 rounded-lg">
                                                <Typography
                                                    className="text-white font-medium">{follower.username}</Typography>
                                            </div>
                                            {index < followersData.slice(0, visibleFollowers).length - 1 &&
                                                <Separator/>}
                                        </div>
                                    ))}

                                    {visibleFollowers < followersData.length && (
                                        <Button variant="outline"
                                                onClick={() => setVisibleFollowers((prev) => prev + 5)}
                                                className="w-full text-[#8FE6D5] border-[#8FE6D5] hover:bg-[#8FE6D5]/10">
                                            Show more
                                        </Button>
                                    )}
                                </div>
                            ))}
                    </div>

                    <DialogFooter>
                        <Button onClick={handleCloseDialog} className="text-[#8FE6D5] hover:bg-[#8FE6D5]/10">
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
