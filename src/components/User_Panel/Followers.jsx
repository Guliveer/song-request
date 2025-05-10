import React, { useState, useEffect } from 'react';
import {
    Button, Dialog, DialogTitle, DialogContent, DialogActions,
    List, ListItem, ListItemText, Paper, Stack, TextField,
    Typography, Box, IconButton, InputAdornment
} from "@mui/material";
import { FormField } from "@/components/Items";
import { DeleteIcon, PersonIcon } from "@mui/icons-material";
import { supabase } from "@/utils/supabase";
import Autocomplete from '@mui/material/Autocomplete';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

export default function Followers() {
    const [userId, setUserId] = useState(null);
    const [friendUsername, setFriendUsername] = useState("");
    const [friendSearchResults, setFriendSearchResults] = useState([]);
    const [alreadyFollowing, setAlreadyFollowing] = useState(false);
    const [followedUsersData, setFollowedUsersData] = useState([]);
    const [followersData, setFollowersData] = useState([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogType, setDialogType] = useState(null); // 'following' lub 'followers'

    const [visibleFollowing, setVisibleFollowing] = useState(1);
    const [visibleFollowers, setVisibleFollowers] = useState(1);

    const [followingSearch, setFollowingSearch] = useState('');


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

    useEffect(() => {
        if (dialogOpen && dialogType === "following") setVisibleFollowing(5);
        if (dialogOpen && dialogType === "followers") setVisibleFollowers(5);
    }, [dialogOpen, dialogType]);

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

    const handleSearchChange = async (e) => {
        const val = e.target.value;
        setFriendUsername(val);
        setAlreadyFollowing(false); // RESETUJ komunikat za każdym razem, gdy zmieniasz pole

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


    const handleOpenDialog = (type) => {
        setDialogType(type);
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setDialogType(null);
    };

    // Usuwanie obserwowanego użytkownika
    const handleUnfollow = async (idToRemove) => {
        const updated = followedUsersData.filter((u) => u.id !== idToRemove).map((u) => u.id);
        const { error } = await supabase
            .from("users")
            .update({ followed_users: updated })
            .eq("id", userId);
        if (!error) {
            setFollowedUsersData((prev) => prev.filter((u) => u.id !== idToRemove));
        }
    };

    return (
        <Paper sx={{ p: 3, borderRadius: 4, width:'40%', mx: 'auto' }}>
            <Typography variant="h6" fontWeight="bold" mb={2}>
                Add friend
            </Typography>
            <Box sx={{ maxWidth: 500, mb: 3, mx: "auto" }}>
                <Stack direction="row" spacing={2} alignItems="center" justifyContent="center">
                    {/* Stack pionowy dla TextField + komunikat */}
                    <Box sx={{ position: "relative", minWidth: 250, height: 56, display: 'flex', alignItems: 'center' }}>
                        <Autocomplete
                            sx={{ width: '250px' }}
                            freeSolo
                            options={friendSearchResults}
                            getOptionLabel={(option) =>
                                typeof option === 'string' ? option : option.username
                            }
                            onInputChange={(event, newInputValue) =>
                                handleSearchChange({ target: { value: newInputValue } })
                            }
                            onChange={(event, value) => {
                                if (value && typeof value !== 'string') {
                                    setFriendUsername(value.username);
                                } else if (typeof value === 'string') {
                                    setFriendUsername(value);
                                }
                            }}
                            inputValue={friendUsername}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Username"
                                    InputProps={{
                                        ...params.InputProps,
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <PersonIcon sx={{ color: 'primary.main' }} />
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={{
                                        bgcolor: 'background.paper',
                                        borderRadius: 2,
                                        input: { color: 'text.primary', fontWeight: 500 },
                                        width: '250px'
                                    }}
                                />
                            )}
                        />
                        {/* Komunikat absolutnie pod polem */}
                        {alreadyFollowing && friendUsername && (
                            <Box sx={{
                                position: 'absolute',
                                left: 0,
                                top: '100%',
                                width: '100%',
                                mt: 0.5,
                                display: 'flex',
                                alignItems: 'center'
                            }}>
                                <Typography
                                    variant="body2"
                                    color="error"
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1,
                                        ml: '2px'
                                    }}
                                >
                                    <ErrorOutlineIcon fontSize="small" />
                                    You are already following this user.
                                </Typography>
                            </Box>
                        )}
                    </Box>

                    <Button
                        variant="contained"
                        sx={{
                            px: 3,
                            fontWeight: 'bold',
                            textTransform: 'none',
                            borderRadius: 2,
                            bgcolor: '#8FE6D5',
                            color: '#111',
                            '&:hover': { bgcolor: '#6fc3b2' },
                        }}
                        onClick={handleAddFriend}
                        startIcon={<PersonAddIcon />}
                    >
                        ADD
                    </Button>

                    <Box
                        sx={{
                            px: 3,
                            py: 2,
                            borderRadius: 2,
                            bgcolor: '#8FE6D5',
                            color: '#111',
                            cursor: 'pointer',
                            minWidth: 100,
                            fontWeight: 'bold',
                            boxShadow: 2,
                            transition: 'background 0.2s',
                            '&:hover': {
                                bgcolor: '#6fc3b2',
                            },
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            textAlign: 'center',
                        }}
                        onClick={() => handleOpenDialog('following')}
                    >
                        <Typography variant="h5" fontWeight="bold">{followedUsersData.length}</Typography>
                        <Typography variant="body2" fontWeight="bold">Following</Typography>
                    </Box>
                    <Box
                        sx={{
                            px: 3,
                            py: 2,
                            borderRadius: 2,
                            bgcolor: '#8FE6D5',
                            color: '#111',
                            cursor: 'pointer',
                            minWidth: 100,
                            fontWeight: 'bold',
                            boxShadow: 2,
                            transition: 'background 0.2s',
                            '&:hover': {
                                bgcolor: '#6fc3b2',
                            },
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            textAlign: 'center',
                        }}
                        onClick={() => handleOpenDialog('followers')}
                    >
                        <Typography variant="h5" fontWeight="bold">{followersData.length}</Typography>
                        <Typography variant="body2" fontWeight="bold">Followers</Typography>
                    </Box>
                </Stack>

            </Box>


            {/* Dialog */}
            <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="xs" fullWidth>
                <DialogTitle>
                    {dialogType === 'following' ? 'Following' : dialogType === 'followers' ? 'Followers' : ''}
                </DialogTitle>
                <DialogContent dividers>
                    {dialogType === 'following' && (
                        followedUsersData.length === 0 ? (
                            <Typography color="text.secondary">You are not following any users.</Typography>
                        ) : (
                            <>
                                <TextField
                                    fullWidth
                                    size="small"
                                    placeholder="Search following..."
                                    value={followingSearch}
                                    onChange={e => setFollowingSearch(e.target.value)}
                                    sx={{ mb: 2 }}
                                />
                                <List>
                                    {followedUsersData
                                        .filter(u => u.username.toLowerCase().includes(followingSearch.toLowerCase()))
                                        .slice(0, visibleFollowing)
                                        .map((u) => (
                                            <ListItem
                                                key={u.id}
                                                secondaryAction={
                                                    <IconButton edge="end" color="error" onClick={() => handleUnfollow(u.id)}>
                                                        <DeleteIcon />
                                                    </IconButton>
                                                }
                                            >
                                                <ListItemText primary={u.username} />
                                            </ListItem>
                                        ))}
                                </List>
                                {visibleFollowing < followedUsersData.filter(u => u.username.toLowerCase().includes(followingSearch.toLowerCase())).length && (
                                    <Button
                                        variant="outlined"
                                        fullWidth
                                        sx={{ mt: 2 }}
                                        onClick={() => setVisibleFollowing((prev) => prev + 5)}
                                    >
                                        Show more
                                    </Button>
                                )}
                            </>
                        )
                    )}
                    {dialogType === 'followers' && (
                        followersData.length === 0 ? (
                            <Typography color="text.secondary">No one is following you yet.</Typography>
                        ) : (
                            <>
                                <List>
                                    {followersData.slice(0, visibleFollowers).map((f) => (
                                        <ListItem key={f.id}>
                                            <ListItemText primary={f.username} />
                                        </ListItem>
                                    ))}
                                </List>
                                {visibleFollowers < followersData.length && (
                                    <Button
                                        variant="outlined"
                                        fullWidth
                                        sx={{ mt: 2 }}
                                        onClick={() => setVisibleFollowers((prev) => prev + 5)}
                                    >
                                        Pokaż więcej
                                    </Button>
                                )}
                            </>
                        )
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Close</Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
}
