import {useEffect, useState} from "react";
import {useRouter} from "next/router";
import {isUserAdmin, isUserLoggedIn, genUserAvatar} from "@/lib/actions";
import {supabase} from "@/lib/supabase";
import {
    Box,
    Tabs,
    Tab,
    Typography,
    Avatar,
    Divider,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    Tooltip,
    Chip,
    Grid,
    Container
} from "@mui/material";
import PersonIcon from '@mui/icons-material/Person';
import LibraryMusicIcon from '@mui/icons-material/LibraryMusic';
import RestoreIcon from '@mui/icons-material/Restore';
import DeleteIcon from '@mui/icons-material/Delete';
import BlockIcon from '@mui/icons-material/Block';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SearchIcon from '@mui/icons-material/Search';

export default function AdminPanel() {
    const [isLoading, setIsLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [songs, setSongs] = useState([]);
    const [users, setUsers] = useState([]);
    const [activeTab, setActiveTab] = useState(0);
    const [searchSong, setSearchSong] = useState("");
    const [searchUser, setSearchUser] = useState("");
    const [avatars, setAvatars] = useState({});

    const router = useRouter();

    useEffect(() => {
        async function checkAdmin() {
            const checkLoggedIn = await isUserLoggedIn();
            if (!checkLoggedIn) return router.replace("/404");
            const checkAdmin = await isUserAdmin();
            if (!checkAdmin) return router.replace("/404");
            setIsAdmin(true);
            setIsLoading(false);
        }

        checkAdmin();
    }, [router]);

    useEffect(() => {
        async function fetchSongs() {
            const {data, error} = await supabase
                .from("queue")
                .select("id, title, author, url, user_id")
                .order("added_at", {ascending: false});
            if (!error) setSongs(data);
        }

        if (isAdmin) fetchSongs();
    }, [isAdmin]);

    useEffect(() => {
        async function fetchUsers() {
            const {data, error} = await supabase
                .from("users")
                .select("id, username, ban_status, emoji, color");
            if (!error) setUsers(data);
        }

        if (isAdmin) fetchUsers();
    }, [isAdmin]);

    // Generate user avatars for the users list
    useEffect(() => {
        if (users.length === 0) return;
        let cancelled = false;

        async function generateAvatars() {
            const newAvatars = {};
            await Promise.all(
                users.map(async (user) => {
                    try {
                        // Use the avatar generator function for real user avatars
                        const avatarDataUrl = await genUserAvatar(user.id);
                        newAvatars[user.id] = avatarDataUrl;
                    } catch {
                        newAvatars[user.id] = null;
                    }
                })
            );
            if (!cancelled) setAvatars(newAvatars);
        }

        generateAvatars();
        return () => {
            cancelled = true;
        };
    }, [users]);

    // --- User actions ---
    const handleResetVotesForUser = async (userId) => {
        const {error} = await supabase.from("votes").delete().eq("user_id", userId);
        if (error) {
            alert(`Error resetting votes for user: ${error.message}`);
        } else {
            alert("User votes have been reset.");
        }
    };

    const handleDeleteUserSongs = async (userId) => {
        const {error} = await supabase.from("queue").delete().eq("user_id", userId);
        if (error) {
            alert(`Error deleting user songs: ${error.message}`);
        } else {
            alert("User songs have been deleted.");
            // Refresh songs:
            const {data, error: fetchError} = await supabase
                .from("queue")
                .select("id, title, author, url, user_id")
                .order("added_at", {ascending: false});
            if (!fetchError) setSongs(data);
        }
    };

    const handleBanChange = async (userId, days) => {
        const {error} = await supabase
            .from("users")
            .update({ban_status: days})
            .eq("id", userId);
        if (error) {
            alert(`Error setting ban: ${error.message}`);
        } else {
            alert(`Ban set to ${days === 0 ? "none" : days + " days"}.`);
            // Refresh users:
            const {data, error: usersError} = await supabase
                .from("users")
                .select("id, username, ban_status, emoji, color");
            if (!usersError) setUsers(data);
        }
    };

    // --- Song actions ---
    const handleDeleteSong = async (songId) => {
        const {error} = await supabase.from("queue").delete().eq("id", songId);
        if (error) {
            alert(`Error deleting song: ${error.message}`);
        } else {
            alert("Song has been deleted.");
            const {data, error: fetchError} = await supabase
                .from("queue")
                .select("id, title, author, url, user_id")
                .order("added_at", {ascending: false});
            if (!fetchError) setSongs(data);
        }
    };

    const handleResetVotesForSong = async (songId) => {
        const {error} = await supabase.from("votes").delete().eq("song_id", songId);
        if (error) {
            alert(`Error resetting votes for song: ${error.message}`);
        } else {
            alert("Song votes have been reset.");
        }
    };

    const handleBanAndDelete = async (targetUrl) => {
        const { error: insertError } = await supabase
            .from('banned_url')
            .insert([{ url: targetUrl }]);

        if (insertError) {
            console.log("Ban and delete error");
            return;
        }

        const { error: deleteError } = await supabase
            .from('queue')
            .delete()
            .eq('url', targetUrl);

        if (deleteError) {
            console.log("Ban and delete error");
        } else {
            router.reload();
        }
    };

    // --- Filters ---
    const filteredSongs = songs.filter(
        (s) =>
            s.title?.toLowerCase().includes(searchSong.toLowerCase()) ||
            s.author?.toLowerCase().includes(searchSong.toLowerCase()) ||
            s.url?.toLowerCase().includes(searchSong.toLowerCase())
    );
    const filteredUsers = users.filter((u) =>
        u.username?.toLowerCase().includes(searchUser.toLowerCase())
    );

    // Ban count (users with ban_status > 0)
    const bansCount = users.filter(u => u.ban_status && u.ban_status > 0).length;

    if (!isAdmin || isLoading) return null;

    return (
        <Container maxWidth="md" sx={{mt: 3, mb: 5}}>
            {/* Admin Profile & Stats Section */}
            <Box
                sx={{
                    maxWidth: 1200,
                    mx: "auto",
                    mt: 6,
                    mb: 4,
                    px: {xs: 1, md: 4},
                    py: {xs: 2, md: 5},
                    borderRadius: 4,
                    bgcolor: "background.paper", // zmiana na taki sam jak w user panelu
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    boxShadow: 4,
                }}
            >
                <Avatar
                    sx={{
                        bgcolor: "#ff4646",
                        width: 92,
                        height: 92,
                        mb: 2,
                        fontSize: 54,
                        boxShadow: 2,
                    }}
                >
                    <AdminPanelSettingsIcon sx={{fontSize: 54}}/>
                </Avatar>
                <Typography variant="h4" sx={{fontWeight: "bold", color: "#fff", mb: 2, textAlign: "center"}}>
                    Admin Panel
                </Typography>
                <Box sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    width: "100%",
                    maxWidth: 480,
                    mt: 1,
                    mb: 2,
                }}>
                    {/* Stats */}
                    <Box sx={{flex: 1, textAlign: "center"}}>
                        <Typography variant="h5" sx={{fontWeight: 700, color: "#fff"}}>
                            {users.length}
                        </Typography>
                        <Typography variant="body2" sx={{color: "#aaa", mt: 0.5}}>
                            Users
                        </Typography>
                    </Box>
                    <Divider orientation="vertical" flexItem sx={{
                        mx: 0,
                        bgcolor: "#fff",
                        opacity: 0.11,
                        width: "2px",
                        height: 40,
                        borderRadius: 2,
                    }}/>
                    <Box sx={{flex: 1, textAlign: "center"}}>
                        <Typography variant="h5" sx={{fontWeight: 700, color: "#fff"}}>
                            {songs.length}
                        </Typography>
                        <Typography variant="body2" sx={{color: "#aaa", mt: 0.5}}>
                            Songs
                        </Typography>
                    </Box>
                    <Divider orientation="vertical" flexItem sx={{
                        mx: 0,
                        bgcolor: "#fff",
                        opacity: 0.11,
                        width: "2px",
                        height: 40,
                        borderRadius: 2,
                    }}/>
                    <Box sx={{flex: 1, textAlign: "center"}}>
                        <Typography variant="h5" sx={{fontWeight: 700, color: "#fff"}}>
                            {bansCount}
                        </Typography>
                        <Typography variant="body2" sx={{color: "#aaa", mt: 0.5}}>
                            Bans
                        </Typography>
                    </Box>
                </Box>
            </Box>

            {/* Tabs */}
            <Box
                sx={{
                    maxWidth: 900,
                    mx: "auto",
                    bgcolor: "background.paper", // zmiana na taki sam jak w user panelu
                    borderRadius: 3,
                    boxShadow: 2,
                    overflow: "hidden"
                }}
            >
                <Tabs
                    value={activeTab}
                    onChange={(_, v) => setActiveTab(v)}
                    variant="fullWidth"
                    textColor="inherit"
                    TabIndicatorProps={{style: {background: "#8FE6D5", height: 3}}} // jak w user panelu
                    sx={{
                        "& .MuiTab-root": {
                            fontWeight: "bold",
                            fontSize: 16,
                            color: "#fff",
                            textTransform: "none",
                            py: 2,
                        },
                        "& .Mui-selected": {
                            color: "#8FE6D5 !important", // jak w user panelu
                        },
                        bgcolor: "#191c2a", // jak w user panelu
                    }}
                >
                    <Tab icon={<PersonIcon/>} label="Users"/>
                    <Tab icon={<LibraryMusicIcon/>} label="Songs"/>
                </Tabs>

                <Box sx={{p: 3, width: "100%"}}>
                    {/* Users Tab */}
                    {activeTab === 0 && (
                        <>
                            <Box sx={{display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2}}>
                                <Typography variant="h6" sx={{fontWeight: "bold", color: "#ff4646"}}>
                                    User List
                                </Typography>
                                <TextField
                                    size="small"
                                    variant="outlined"
                                    placeholder="Search user..."
                                    value={searchUser}
                                    onChange={e => setSearchUser(e.target.value)}
                                    InputProps={{
                                        startAdornment: <SearchIcon sx={{color: "#ff4646", mr: 1}}/>,
                                    }}
                                    sx={{
                                        bgcolor: "#23273a", // zmiana z szarego na panelowy
                                        borderRadius: 2,
                                        '& .MuiOutlinedInput-root': {
                                            color: "#fff",
                                            '& fieldset': {
                                                borderColor: "#444",
                                            },
                                            '&:hover fieldset': {
                                                borderColor: "#ff4646",
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: "#ff4646",
                                            },
                                            bgcolor: "#23273a", // panelowy
                                        },
                                        input: {
                                            color: "#fff",
                                        },
                                    }}
                                />
                            </Box>
                            <TableContainer component={Paper} sx={{
                                bgcolor: "#23273a", // panelowy, lekko jaśniejszy
                                borderRadius: 2,
                                boxShadow: 0,
                                px: 0
                            }}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell width="60%" sx={{
                                                fontWeight: "bold",
                                                fontSize: 16,
                                                color: "#ff4646",
                                                border: 0,
                                                pl: 3
                                            }}>
                                                Name
                                            </TableCell>
                                            <TableCell width="40%" sx={{
                                                fontWeight: "bold",
                                                fontSize: 16,
                                                color: "#ff4646",
                                                border: 0,
                                                pr: 3
                                            }}>
                                                Actions
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {filteredUsers.map((user) => (
                                            <TableRow key={user.id} hover>
                                                <TableCell sx={{color: "#fff", pl: 3, borderBottom: "1px solid #333"}}>
                                                    <Box sx={{display: "flex", alignItems: "center", gap: 1}}>
                                                        <Avatar
                                                            src={avatars[user.id] || undefined}
                                                            sx={{
                                                                width: 32,
                                                                height: 32,
                                                                bgcolor: user.color || "#ff4646",
                                                                fontSize: 16,
                                                                fontWeight: "bold"
                                                            }}
                                                        >
                                                            {user.emoji ? (
                                                                <Typography component="span" sx={{fontSize: "1rem", lineHeight: 1}}>
                                                                    {user.emoji}
                                                                </Typography>
                                                            ) : (user.username?.[0]?.toUpperCase() || 'U')}
                                                        </Avatar>
                                                        <Typography
                                                            sx={{fontWeight: "bold"}}>{user.username}</Typography>
                                                        {user.ban_status > 0 && (
                                                            <Chip
                                                                label={user.ban_status === 9999 ? "PermBan" : `Ban ${user.ban_status}d`}
                                                                size="small"
                                                                color="error"
                                                                sx={{ml: 1}}
                                                            />
                                                        )}
                                                    </Box>
                                                </TableCell>
                                                <TableCell sx={{color: "#fff", pr: 3, borderBottom: "1px solid #333"}}>
                                                    <Grid container spacing={1} alignItems="center" wrap="nowrap">
                                                        <Grid item>
                                                            <Tooltip title="Reset user votes">
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => handleResetVotesForUser(user.id)}
                                                                    sx={{
                                                                        bgcolor: "#23273a", // panelowy
                                                                        color: "#8FE6D5",
                                                                        "&:hover": {bgcolor: "#31364a"}
                                                                    }}
                                                                >
                                                                    <RestoreIcon/>
                                                                </IconButton>
                                                            </Tooltip>
                                                        </Grid>
                                                        <Grid item>
                                                            <Tooltip title="Delete user songs">
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => handleDeleteUserSongs(user.id)}
                                                                    sx={{
                                                                        bgcolor: "#ff4646",
                                                                        color: "#fff",
                                                                        "&:hover": {bgcolor: "#ff6060"}
                                                                    }}
                                                                >
                                                                    <DeleteIcon/>
                                                                </IconButton>
                                                            </Tooltip>
                                                        </Grid>
                                                        <Grid item>
                                                            <Tooltip title="Block user (perm)">
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => handleBanChange(user.id, 9999)}
                                                                    sx={{
                                                                        bgcolor: "#23273a", // panelowy
                                                                        color: "#ff4646",
                                                                        "&:hover": {bgcolor: "#31364a"}
                                                                    }}
                                                                >
                                                                    <BlockIcon/>
                                                                </IconButton>
                                                            </Tooltip>
                                                        </Grid>
                                                        <Grid item sx={{minWidth: 120}}>
                                                            <FormControl
                                                                size="small"
                                                                sx={{
                                                                    minWidth: 110,
                                                                    bgcolor: "#23273a", // panelowy
                                                                    borderRadius: 1,
                                                                    '& .MuiInputLabel-root': {
                                                                        color: "#ccc",
                                                                    },
                                                                    '& .MuiSelect-icon': {
                                                                        color: "#ff4646",
                                                                    },
                                                                }}
                                                            >
                                                                <InputLabel
                                                                    id={`ban-select-label-${user.id}`}
                                                                    sx={{
                                                                        color: "#ccc",
                                                                        '&.Mui-focused': {color: "#ff4646"}
                                                                    }}
                                                                >
                                                                    Ban period
                                                                </InputLabel>
                                                                <Select
                                                                    labelId={`ban-select-label-${user.id}`}
                                                                    value={user.ban_status || 0}
                                                                    label="Ban period"
                                                                    onChange={(e) => handleBanChange(user.id, e.target.value)}
                                                                    sx={{
                                                                        color: "#fff",
                                                                        bgcolor: "#23273a", // panelowy
                                                                        '& .MuiOutlinedInput-notchedOutline': {
                                                                            borderColor: "#444",
                                                                        },
                                                                        '&:hover .MuiOutlinedInput-notchedOutline': {
                                                                            borderColor: "#ff4646",
                                                                        },
                                                                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                                            borderColor: "#ff4646",
                                                                        },
                                                                    }}
                                                                    MenuProps={{
                                                                        PaperProps: {
                                                                            sx: {
                                                                                bgcolor: "#23273a", // panelowy
                                                                                color: "#fff",
                                                                            }
                                                                        }
                                                                    }}
                                                                >
                                                                    <MenuItem value={0} sx={{
                                                                        color: "#fff",
                                                                        bgcolor: "#23273a" // panelowy
                                                                    }}>None</MenuItem>
                                                                    <MenuItem value={7}
                                                                              sx={{color: "#fff", bgcolor: "#23273a"}}>7
                                                                        days</MenuItem>
                                                                    <MenuItem value={30}
                                                                              sx={{color: "#fff", bgcolor: "#23273a"}}>30
                                                                        days</MenuItem>
                                                                    <MenuItem value={90}
                                                                              sx={{color: "#fff", bgcolor: "#23273a"}}>90
                                                                        days</MenuItem>
                                                                    <MenuItem value={180}
                                                                              sx={{color: "#fff", bgcolor: "#23273a"}}>180
                                                                        days</MenuItem>
                                                                    <MenuItem value={365}
                                                                              sx={{color: "#fff", bgcolor: "#23273a"}}>365
                                                                        days</MenuItem>
                                                                    <MenuItem value={9999} sx={{
                                                                        color: "#fff",
                                                                        bgcolor: "#23273a" // panelowy
                                                                    }}>Perm</MenuItem>
                                                                </Select>
                                                            </FormControl>
                                                        </Grid>
                                                    </Grid>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </>
                    )}

                    {/* Songs Tab */}
                    {activeTab === 1 && (
                        <>
                            <Box sx={{display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2}}>
                                <Typography variant="h6" sx={{fontWeight: "bold", color: "#ff4646"}}>
                                    Song Queue
                                </Typography>
                                <TextField
                                    size="small"
                                    variant="outlined"
                                    placeholder="Search song..."
                                    value={searchSong}
                                    onChange={e => setSearchSong(e.target.value)}
                                    InputProps={{
                                        startAdornment: <SearchIcon sx={{color: "#ff4646", mr: 1}}/>,
                                    }}
                                    sx={{
                                        bgcolor: "#23273a", // panelowy
                                        borderRadius: 2,
                                        '& .MuiOutlinedInput-root': {
                                            color: "#fff",
                                            '& fieldset': {
                                                borderColor: "#444",
                                            },
                                            '&:hover fieldset': {
                                                borderColor: "#ff4646",
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: "#ff4646",
                                            },
                                            bgcolor: "#23273a", // panelowy
                                        },
                                        input: {
                                            color: "#fff",
                                        },
                                    }}
                                />
                            </Box>
                            <TableContainer component={Paper} sx={{
                                bgcolor: "#23273a", // panelowy, lekko jaśniejszy
                                borderRadius: 2,
                                boxShadow: 0,
                                px: 0
                            }}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell width="25%" sx={{
                                                fontWeight: "bold",
                                                fontSize: 16,
                                                color: "#ff4646",
                                                border: 0,
                                                pl: 3
                                            }}>
                                                Title
                                            </TableCell>
                                            <TableCell width="20%" sx={{
                                                fontWeight: "bold",
                                                fontSize: 16,
                                                color: "#ff4646",
                                                border: 0,
                                                pl: 3
                                            }}>
                                                Artist
                                            </TableCell>
                                            <TableCell width="35%" sx={{
                                                fontWeight: "bold",
                                                fontSize: 16,
                                                color: "#ff4646",
                                                border: 0,
                                                pl: 3
                                            }}>
                                                URL
                                            </TableCell>
                                            <TableCell width="20%" sx={{
                                                fontWeight: "bold",
                                                fontSize: 16,
                                                color: "#ff4646",
                                                border: 0,
                                                pl: 3
                                            }}>
                                                Actions
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {filteredSongs.map((song) => (
                                            <TableRow key={song.id} hover>
                                                <TableCell sx={{
                                                    color: "#fff",
                                                    fontWeight: "bold",
                                                    pl: 3,
                                                    borderBottom: "1px solid #333"
                                                }}>
                                                    {song.title}
                                                </TableCell>
                                                <TableCell sx={{color: "#fff", pl: 3, borderBottom: "1px solid #333"}}>
                                                    {song.author}
                                                </TableCell>
                                                <TableCell sx={{color: "#fff", pl: 3, borderBottom: "1px solid #333"}}>
                                                    <Typography
                                                        sx={{
                                                            color: "#ff4646",
                                                            wordBreak: "break-all",
                                                            fontSize: "0.9rem"
                                                        }}
                                                    >
                                                        <a
                                                            href={song.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            style={{color: "#ff4646", textDecoration: "underline"}}
                                                        >
                                                            {song.url}
                                                        </a>
                                                    </Typography>
                                                </TableCell>
                                                <TableCell sx={{color: "#fff", pl: 3, borderBottom: "1px solid #333"}}>
                                                    <Grid container spacing={1} alignItems="center" wrap="nowrap">
                                                        <Grid item>
                                                            <Tooltip title="Reset song votes">
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => handleResetVotesForSong(song.id)}
                                                                    sx={{
                                                                        bgcolor: "#23273a", // panelowy
                                                                        color: "#8FE6D5",
                                                                        "&:hover": {bgcolor: "#31364a"}
                                                                    }}
                                                                >
                                                                    <RestoreIcon/>
                                                                </IconButton>
                                                            </Tooltip>
                                                        </Grid>
                                                        <Grid item>
                                                            <Tooltip title="Delete song">
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => handleDeleteSong(song.id)}
                                                                    sx={{
                                                                        bgcolor: "#ff4646",
                                                                        color: "#fff",
                                                                        "&:hover": {bgcolor: "#ff6060"}
                                                                    }}
                                                                >
                                                                    <DeleteIcon/>
                                                                </IconButton>
                                                            </Tooltip>
                                                        </Grid>
                                                        <Grid item>
                                                            <Tooltip title="Ban URL">
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => handleBanAndDelete(song.url)}
                                                                    sx={{
                                                                        bgcolor: "#23273a", // panelowy
                                                                        color: "#ff4646",
                                                                        "&:hover": {bgcolor: "#31364a"}
                                                                    }}
                                                                >
                                                                    <BlockIcon/>
                                                                </IconButton>
                                                            </Tooltip>
                                                        </Grid>
                                                    </Grid>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </>
                    )}
                </Box>
            </Box>
        </Container>
    );
}

