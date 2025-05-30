import React, {useState, useEffect} from 'react';
import {
    Button, Dialog, DialogTitle, DialogContent, DialogActions,
    List, ListItem, ListItemText, Divider, Stack, TextField,
    Typography, Box, IconButton, InputAdornment, Autocomplete
} from "@mui/material";
import {
    Delete as DeleteIcon,
    PersonAdd as PersonAddIcon,
    Search as SearchIcon,
    ErrorOutline as ErrorOutlineIcon,
} from "@mui/icons-material";
import {supabase} from "@/utils/supabase";

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
    const [followingSearch, setFollowingSearch] = useState('');

    // Fetch followed users and followers
    useEffect(() => {
        const fetchData = async () => {
            if (!userId) return;

            // Get list of followed user IDs
            const {data: currentUser} = await supabase
                .from("users")
                .select("followed_users")
                .eq("id", userId)
                .single();

            const followedIds = currentUser?.followed_users ?? [];

            // Get full user data for followed users
            let followedUsers = [];
            if (followedIds.length > 0) {
                const {data: users} = await supabase
                    .from("users")
                    .select("id, username")
                    .in("id", followedIds);

                followedUsers = users || [];
            }

            setFollowedUsersData(followedUsers);

            // Get all users to find who follows current user
            const {data: allUsers} = await supabase
                .from("users")
                .select("id, username, followed_users");

            const yourFollowers = (allUsers || []).filter(u =>
                Array.isArray(u.followed_users) && u.followed_users.includes(userId)
            );

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

        const {data: friendUser} = await supabase
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

        const {data: currentUser} = await supabase
            .from("users")
            .select("followed_users")
            .eq("id", userId)
            .single();

        const {data: currentUserData} = await supabase
            .from("users")
            .select("username")
            .eq("id", userId)
            .single();

        const currentFollows = currentUser?.followed_users ?? [];
        const updated = [...currentFollows, friendUser.id];

        const {error} = await supabase
            .from("users")
            .update({followed_users: updated})
            .eq("id", userId);

        if (!error) {
            // Dodaj powiadomienie do tabeli notifications
            await supabase
                .from("notifications")
                .insert([{
                    user_id: friendUser.id, // odbiorca powiadomienia
                    sender_id: userId,      // kto dodał
                    type: "new_follower",   // typ powiadomienia (zgodnie z enumem)
                    message: `User ${currentUserData?.username || userId} started following you!`,
                    link: `/user/${userId}`,
                    read: false
                }]);
            setFriendUsername("");
            setFriendSearchResults([]);
            setAlreadyFollowing(false);
            setFollowedUsersData((prev) => [...prev, friendUser]);
            if (onFollowAction) onFollowAction();
        }
        else {
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

        const {data: results} = await supabase
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

    const handleUnfollow = async (idToRemove) => {
        const updated = followedUsersData.filter((u) => u.id !== idToRemove).map((u) => u.id);
        const {error} = await supabase
            .from("users")
            .update({followed_users: updated})
            .eq("id", userId);
        if (!error) {
            setFollowedUsersData((prev) => prev.filter((u) => u.id !== idToRemove));
            if (onFollowAction) onFollowAction(); // Inform parent to refresh counts
        }
    };

    return (
        <>
            <Typography variant="h5" component="h2" sx={{color: 'white', fontWeight: 500}}>
                Find Friends
            </Typography>
            <Divider sx={{my: 2}}/>

            <Box sx={{mb: 4}}>
                <Typography variant="body1" sx={{color: 'white', mb: 2}}>
                    Search for users to follow:
                </Typography>

                <Stack direction="row" spacing={2} alignItems="center">
                    <Autocomplete
                        freeSolo
                        options={friendSearchResults}
                        getOptionLabel={(option) =>
                            typeof option === 'string' ? option : option.username
                        }
                        onInputChange={(event, newInputValue) =>
                            handleSearchChange({target: {value: newInputValue}})
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
                                placeholder="Enter username"
                                InputProps={{
                                    ...params.InputProps,
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon sx={{color: '#8FE6D5'}}/>
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    "& .MuiOutlinedInput-root": {
                                        borderRadius: "16px",
                                        color: 'white',
                                        "& fieldset": {
                                            borderColor: "#555",
                                        },
                                        "&:hover fieldset": {
                                            borderColor: "#8FE6D5",
                                        },
                                        "&.Mui-focused fieldset": {
                                            borderColor: "#8FE6D5",
                                        },
                                    },
                                }}
                            />
                        )}
                        sx={{flex: 1}}
                    />

                    <Button
                        variant="contained"
                        onClick={handleAddFriend}
                        startIcon={<PersonAddIcon/>}
                        sx={{
                            px: 3,
                            py: 1,
                            fontWeight: 'bold',
                            textTransform: 'none',
                            borderRadius: 2,
                            bgcolor: '#8FE6D5',
                            color: '#111',
                            '&:hover': {bgcolor: '#6fc3b2'},
                        }}
                    >
                        Follow
                    </Button>
                </Stack>

                {alreadyFollowing && (
                    <Typography
                        variant="body2"
                        color="error"
                        sx={{mt: 1, display: 'flex', alignItems: 'center', gap: 1}}
                    >
                        <ErrorOutlineIcon fontSize="small"/>
                        You are already following this user.
                    </Typography>
                )}
            </Box>

            <Box sx={{mt: 4}}>
                <Typography variant="h6" sx={{color: 'white', mb: 2}}>
                    Your Network
                </Typography>

                <Stack direction="row" spacing={3}>
                    <Box
                        onClick={() => handleOpenDialog('following')}
                        sx={{
                            flex: 1,
                            p: 2,
                            borderRadius: 2,
                            bgcolor: '#23293a', // CIEMNIEJSZY, spójny odcień
                            color: 'white',
                            cursor: 'pointer',
                            textAlign: 'center',
                            borderWidth: 1,
                            borderStyle: 'solid',
                            borderColor: '#444',
                            transition: 'all 0.2s',
                            '&:hover': {
                                borderColor: '#8FE6D5',
                            }
                        }}
                    >
                        <Typography
                            variant="h4"
                            color="#8FE6D5"
                            fontWeight="bold"
                            sx={{letterSpacing: 1, mb: 0.5}}
                        >
                            {followingCount}
                        </Typography>
                        <Typography
                            variant="subtitle1"
                            sx={{
                                color: '#8FE6D5',
                                fontWeight: 600,
                                letterSpacing: 0.5,
                            }}
                        >
                            Following
                        </Typography>
                    </Box>

                    <Box
                        onClick={() => handleOpenDialog('followers')}
                        sx={{
                            flex: 1,
                            p: 2,
                            borderRadius: 2,
                            bgcolor: '#23293a', // CIEMNIEJSZY, spójny odcień
                            color: 'white',
                            cursor: 'pointer',
                            textAlign: 'center',
                            borderWidth: 1,
                            borderStyle: 'solid',
                            borderColor: '#444',
                            transition: 'all 0.2s',
                            '&:hover': {
                                borderColor: '#8FE6D5',
                            }
                        }}
                    >
                        <Typography
                            variant="h4"
                            color="#8FE6D5"
                            fontWeight="bold"
                            sx={{letterSpacing: 1, mb: 0.5}}
                        >
                            {followersCount}
                        </Typography>
                        <Typography
                            variant="subtitle1"
                            sx={{
                                color: '#8FE6D5',
                                fontWeight: 600,
                                letterSpacing: 0.5,
                            }}
                        >
                            Followers
                        </Typography>
                    </Box>
                </Stack>

            </Box>

            {/* Dialog for following/followers */}
            <Dialog
                open={dialogOpen}
                onClose={handleCloseDialog}
                maxWidth="xs"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 4,
                    }
                }}
            >
                <DialogTitle sx={{color: 'white', borderBottom: '1px solid #444'}}>
                    {dialogType === 'following' ? 'People You Follow' : 'Your Followers'}
                </DialogTitle>
                <DialogContent dividers sx={{borderColor: '#444', p: 0}}>
                    {dialogType === 'following' && (
                        followedUsersData.length === 0 ? (
                            <Typography sx={{p: 3, color: '#aaa', textAlign: 'center'}}>
                                You are not following any users.
                            </Typography>
                        ) : (
                            <>
                                <TextField
                                    fullWidth
                                    size="small"
                                    placeholder="Search following..."
                                    value={followingSearch}
                                    onChange={e => setFollowingSearch(e.target.value)}
                                    sx={{
                                        m: 2,
                                        width: 'calc(100% - 32px)',
                                        "& .MuiOutlinedInput-root": {
                                            borderRadius: "8px",
                                            color: 'white',
                                            "& fieldset": {
                                                borderColor: "#555",
                                            },
                                            "&:hover fieldset": {
                                                borderColor: "#8FE6D5",
                                            },
                                            "&.Mui-focused fieldset": {
                                                borderColor: "#8FE6D5",
                                            },
                                        },
                                    }}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon sx={{color: '#8FE6D5'}}/>
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                                <List sx={{p: 0}}>
                                    {followedUsersData
                                        .filter(u => u.username.toLowerCase().includes(followingSearch.toLowerCase()))
                                        .slice(0, visibleFollowing)
                                        .map((user, index) => (
                                            <React.Fragment key={user.id}>
                                                <ListItem
                                                    secondaryAction={
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleUnfollow(user.id)}
                                                            sx={{color: '#f44336'}}
                                                        >
                                                            <DeleteIcon/>
                                                        </IconButton>
                                                    }
                                                    sx={{pl: 3}}
                                                >
                                                    <ListItemText
                                                        primary={user.username}
                                                        primaryTypographyProps={{
                                                            color: 'white',
                                                            fontWeight: 500
                                                        }}
                                                    />
                                                </ListItem>
                                                {index < followedUsersData.filter(u => u.username.toLowerCase().includes(followingSearch.toLowerCase())).slice(0, visibleFollowing).length - 1 && (
                                                    <Divider />
                                                )}
                                            </React.Fragment>
                                        ))}
                                </List>
                                {visibleFollowing < followedUsersData.filter(u => u.username.toLowerCase().includes(followingSearch.toLowerCase())).length && (
                                    <Button
                                        sx={{
                                            m: 2,
                                            color: '#8FE6D5',
                                            borderColor: '#8FE6D5',
                                            '&:hover': {
                                                borderColor: '#8FE6D5',
                                                backgroundColor: 'rgba(143, 230, 213, 0.08)'
                                            }
                                        }}
                                        variant="outlined"
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
                            <Typography sx={{p: 3, color: '#aaa', textAlign: 'center'}}>
                                No one is following you yet.
                            </Typography>
                        ) : (
                            <>
                                <List sx={{p: 0}}>
                                    {followersData.slice(0, visibleFollowers).map((follower, index) => (
                                        <React.Fragment key={follower.id}>
                                            <ListItem sx={{pl: 3}}>
                                                <ListItemText
                                                    primary={follower.username}
                                                    primaryTypographyProps={{
                                                        color: 'white',
                                                        fontWeight: 500
                                                    }}
                                                />
                                            </ListItem>
                                            {index < followersData.slice(0, visibleFollowers).length - 1 && (
                                                <Divider sx={{backgroundColor: '#444'}}/>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </List>
                                {visibleFollowers < followersData.length && (
                                    <Button
                                        sx={{
                                            m: 2,
                                            color: '#8FE6D5',
                                            borderColor: '#8FE6D5',
                                            '&:hover': {
                                                borderColor: '#8FE6D5',
                                                backgroundColor: 'rgba(143, 230, 213, 0.08)'
                                            }
                                        }}
                                        variant="outlined"
                                        fullWidth
                                        onClick={() => setVisibleFollowers((prev) => prev + 5)}
                                    >
                                        Show more
                                    </Button>
                                )}
                            </>
                        )
                    )}
                </DialogContent>
                <DialogActions sx={{borderTop: '1px solid #444'}}>
                    <Button
                        onClick={handleCloseDialog}
                        sx={{
                            color: '#8FE6D5',
                            '&:hover': {
                                backgroundColor: 'rgba(143, 230, 213, 0.08)'
                            }
                        }}
                    >
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}