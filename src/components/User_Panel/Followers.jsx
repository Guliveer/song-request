import React, { useState, useEffect } from 'react';
import {
    Button, Divider, IconButton, List, ListItem,
    ListItemSecondaryAction, ListItemText, Paper,
    Stack, TextField, Typography, Box
} from "@mui/material";
import { FormField } from "@/components/Items";
import { Delete, Settings } from "@mui/icons-material";
import { supabase } from "@/utils/supabase";

export default function Followers() {
    const [userId, setUserId] = useState(null);
    const [friendUsername, setFriendUsername] = useState("");
    const [friendSearchResults, setFriendSearchResults] = useState([]);
    const [alreadyFollowing, setAlreadyFollowing] = useState(false);
    const [followedUsersData, setFollowedUsersData] = useState([]);
    const [followersData, setFollowersData] = useState([]);
    const [editFollowMode, setEditFollowMode] = useState(false);
    const [tempFollowedUsersData, setTempFollowedUsersData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            setUserId(user.id);

            // Get list of followed user IDs
            const { data: currentUser } = await supabase
                .from("users")
                .select("followed_users")
                .eq("id", user.id)
                .single();

            const followedIds = currentUser?.followed_users ?? [];

            // Get full user data for followed users
            let followedUsers = [];
            if (followedIds.length > 0) {
                const { data: users } = await supabase
                    .from("users")
                    .select("id, username")
                    .in("id", followedIds);

                followedUsers = users || [];
            }

            setFollowedUsersData(followedUsers);
            setTempFollowedUsersData(followedUsers);

            // Get all users to find who follows current user
            const { data: allUsers } = await supabase
                .from("users")
                .select("id, username, followed_users");

            const yourFollowers = (allUsers || []).filter(u =>
                u.followed_users?.includes(user.id)
            );

            setFollowersData(yourFollowers);
        };

        fetchData();
    }, []);

    const handleAddFriend = async () => {
        if (!friendUsername.trim()) return;

        const { data: friendUser } = await supabase
            .from("users")
            .select("id, username")
            .eq("username", friendUsername)
            .single();

        if (!friendUser) return;

        const alreadyExists = followedUsersData.some((u) => u.id === friendUser.id);
        if (alreadyExists) {
            setAlreadyFollowing(true);
            return;
        }

        const { data: currentUser } = await supabase
            .from("users")
            .select("followed_users")
            .eq("id", userId)
            .single();

        const currentFollows = currentUser?.followed_users ?? [];
        const updated = [...currentFollows, friendUser.id];

        const { error } = await supabase
            .from("users")
            .update({ followed_users: updated })
            .eq("id", userId);

        if (error) {
            console.error("Failed to add friend:", error);
            return;
        }

        setFriendUsername("");
        setFriendSearchResults([]);
        setAlreadyFollowing(false);
        setFollowedUsersData((prev) => [...prev, friendUser]);
    };

    const handleRemoveFollower = (idToRemove) => {
        setTempFollowedUsersData((prev) =>
            prev.filter((u) => u.id !== idToRemove)
        );
    };

    const handleCancelFollowChanges = () => {
        setTempFollowedUsersData([...followedUsersData]);
        setEditFollowMode(false);
    };

    const handleConfirmFollowChanges = async () => {
        const newFollowed = tempFollowedUsersData.map((u) => u.id);

        const { error } = await supabase
            .from("users")
            .update({ followed_users: newFollowed })
            .eq("id", userId);

        if (!error) {
            setFollowedUsersData([...tempFollowedUsersData]);
            setEditFollowMode(false);
        } else {
            console.error("Save failed", error);
        }
    };

    const handleSearchChange = async (e) => {
        const val = e.target.value;
        setFriendUsername(val);

        if (val.length < 3) {
            setFriendSearchResults([]);
            return;
        }

        const { data: results } = await supabase
            .from("users")
            .select("id, username")
            .ilike("username", `%${val}%`)
            .neq("id", userId);

        setFriendSearchResults(results);
    };

    const toggleEditFollow = () => {
        if (!editFollowMode) {
            setTempFollowedUsersData([...followedUsersData]);
        }
        setEditFollowMode((prev) => !prev);
    };

    return (
        <Paper sx={{ p: 2, mb: -2, width: "40%", borderRadius: 4}}>
            {/* Add friend */}
            <Paper sx={{ p: 2, mb: 3 }}>
                <Typography variant="h6">Add friend</Typography>

                <Box sx={{ position: "relative", mt: 1 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <FormField
                            label="Username"
                            value={friendUsername}
                            onChange={handleSearchChange}
                            sx={{ flexGrow: 1, maxWidth: 300 }}
                        />
                        <Button variant="contained" onClick={handleAddFriend}>
                            ADD
                        </Button>
                    </Stack>

                    {alreadyFollowing && (
                        <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                            You are already following this user.
                        </Typography>
                    )}

                    {friendSearchResults.length > 0 && (
                        <Paper
                            sx={{
                                position: "absolute",
                                zIndex: 10,
                                top: "100%",
                                left: 0,
                                right: 0,
                                backgroundColor: (theme) => theme.palette.background.paper,
                                color: (theme) => theme.palette.text.primary,
                                boxShadow: 4,
                                border: "1px solid",
                                borderColor: "divider",
                                borderRadius: 1,
                                maxHeight: 200,
                                overflowY: "auto",
                                mt: 1,
                            }}
                        >
                            <List dense>
                                {friendSearchResults.map((u) => (
                                    <ListItem
                                        key={u.id}
                                        button
                                        onClick={() => {
                                            setFriendUsername(u.username);
                                            setFriendSearchResults([]);
                                        }}
                                    >
                                        <ListItemText primary={u.username} />
                                    </ListItem>
                                ))}
                            </List>
                        </Paper>

                    )}
                </Box>
            </Paper>



            {/* Following */}
            <Paper sx={{ p: 2, mb: 3 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6">Following ({followedUsersData.length})</Typography>
                    <IconButton onClick={toggleEditFollow}>
                        <Settings />
                    </IconButton>
                </Stack>
                <Divider sx={{ my: 1 }} />
                {followedUsersData.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                        You are not following any users.
                    </Typography>
                ) : (
                    <List>
                        {(editFollowMode ? tempFollowedUsersData : followedUsersData).map((u) => (
                            <ListItem key={u.id}>
                                <ListItemText primary={u.username} />
                                {editFollowMode && (
                                    <ListItemSecondaryAction>
                                        <IconButton edge="end" onClick={() => handleRemoveFollower(u.id)}>
                                            <Delete />
                                        </IconButton>
                                    </ListItemSecondaryAction>
                                )}
                            </ListItem>
                        ))}
                    </List>
                )}
                {editFollowMode && (
                    <Stack direction="row" spacing={2} justifyContent="flex-end" mt={2}>
                        <Button onClick={handleCancelFollowChanges}>Cancel</Button>
                        <Button variant="contained" onClick={handleConfirmFollowChanges}>
                            Confirm
                        </Button>
                    </Stack>
                )}
            </Paper>

            {/* Followers */}
            <Paper sx={{ p: 2 }}>
                <Typography variant="h6">Followers ({followersData.length})</Typography>
                <Divider sx={{ my: 1 }} />
                {followersData.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                        No one is following you yet.
                    </Typography>
                ) : (
                    <ul>
                        {followersData.map((f) => (
                            <li key={f.id}>
                                <Typography variant="body1">{f.username}</Typography>
                            </li>
                        ))}
                    </ul>
                )}
            </Paper>
        </Paper>
    );
}
