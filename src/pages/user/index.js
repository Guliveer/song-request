import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/utils/supabase";
import SetTitle from "@/components/SetTitle";
import {
    Box, Button, TextField,
    Typography,
    Paper,
    Stack,
    Divider,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    useTheme,
    InputAdornment,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
} from "@mui/material";
import { Delete, Settings } from "@mui/icons-material";
import EmailIcon from '@mui/icons-material/Email';
import GoogleIcon from '@mui/icons-material/Google';
import FacebookIcon from '@mui/icons-material/Facebook';
import GitHubIcon from '@mui/icons-material/GitHub';
import MusicNoteIcon from '@mui/icons-material/MusicNote'; // dla Spotify (symboliczna)

import { SketchPicker } from "react-color";

export default function UserPanel() {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [tempUsername, setTempUsername] = useState("");
    const [usernameTaken, setUsernameTaken] = useState(false);
    const [friendUsername, setFriendUsername] = useState("");
    const [friendSearchResults, setFriendSearchResults] = useState([]);
    const [alreadyFollowing, setAlreadyFollowing] = useState(false);
    const [followedUsers, setFollowedUsers] = useState([]);
    const [followedUsersData, setFollowedUsersData] = useState([]);
    const [editFollowMode, setEditFollowMode] = useState(false);
    const [tempFollowedUsersData, setTempFollowedUsersData] = useState([]);
    const [followersData, setFollowersData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);

    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [identityToUnlink, setIdentityToUnlink] = useState(null);

    const providerIcons = {
        email: <EmailIcon fontSize="small" sx={{ mr: 1 }} />,
        google: <GoogleIcon fontSize="small" sx={{ mr: 1 }} />,
        facebook: <FacebookIcon fontSize="small" sx={{ mr: 1 }} />,
        github: <GitHubIcon fontSize="small" sx={{ mr: 1 }} />,
        spotify: <MusicNoteIcon fontSize="small" sx={{ mr: 1 }} />, // lub użyj własnego SVG
    };


    const [colorDialogOpen, setColorDialogOpen] = useState(false);

    const [initialAvatarColor, setInitialAvatarColor] = useState("#FFFFFF"); // Początkowy kolor awatara
    const [avatarColor, setAvatarColor] = useState("#FFFFFF"); // Stan do przechowywania aktualnego koloru
    const [allUsers, setAllUsers] = useState([]);  // Zdefiniowanie stanu dla allUsers



    const router = useRouter();
    const theme = useTheme();

    const [identities, setIdentities] = useState([]);


    // Funkcja do zapisania zmiany koloru awatara
    const handleUpdateColor = async () => {
        const { error } = await supabase
            .from("users")
            .update({ color: avatarColor }) // Zaktualizowanie koloru w bazie danych
            .eq("id", user.id);

        if (!error) {
            setColorDialogOpen(false); // Zamknięcie dialogu po zapisaniu
            router.reload(); // Odświeżenie strony po zapisaniu
        }
    };


    useEffect(() => {
        const init = async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) {
                router.replace("/login");
                return;
            }

            setUser(user);

            const { data: userData } = await supabase
                .from("users")
                .select("*")
                .eq("id", user.id)
                .single();

            if (userData) {
                setProfile(userData);
                setFollowedUsers(userData.followed_users || []);
                setAvatarColor(userData.color || "#FFFFFF");
                setInitialAvatarColor(userData.color || "#FFFFFF"); // Zapisz początkowy kolor
            }

            const { data } = await supabase.auth.getUserIdentities();
            setIdentities(data.identities || []);

            const { data: users } = await supabase
                .from("users")
                .select("id, username, followed_users");


            if (users) {
                setAllUsers(users);

                const followers = users.filter((u) =>
                    u.followed_users?.includes(user.id)
                );
                setFollowersData(
                    followers.map(({ id, username }) => ({ id, username }))
                );

                const followedData = users.filter((u) =>
                    userData?.followed_users?.includes(u.id)
                );
                setFollowedUsersData(followedData);
            }

            setIsLoading(false);
        };

        init();
    }, [router]);


    const handleUnlink = async (identity) => {
        // identity to obiekt zwrócony przez getUserIdentities()
        const { error } = await supabase.auth.unlinkIdentity(identity);
        if (error) {
            console.error("Unlink error:", error);
            return;
        }
        // odśwież listę
        const { data } = await supabase.auth.getUserIdentities();
        setIdentities(data.identities || []);
    };

    const handleUpdateProfile = async () => {
        const { data: existing } = await supabase
            .from("users")
            .select("id")
            .eq("username", tempUsername)
            .single();

        if (existing && existing.id !== user.id) {
            setUsernameTaken(true);
            return;
        }

        setUsernameTaken(false);

        const { error } = await supabase
            .from("users")
            .update({ username: tempUsername })
            .eq("id", user.id);

        if (!error) {
            setOpenDialog(false);
            router.reload();
        }
    };

    const handleAddFriend = async () => {
        if (!friendUsername.trim()) return;

        const { data: friend } = await supabase
            .from("users")
            .select("id, username")
            .ilike("username", friendUsername)
            .single();

        if (friend) {
            if (followedUsers.includes(friend.id)) {
                setAlreadyFollowing(true);
            } else {
                const updated = [...followedUsers, friend.id];
                const { error: updErr } = await supabase
                    .from("users")
                    .update({ followed_users: updated })
                    .eq("id", user.id);

                if (!updErr) {
                    setFollowedUsers(updated);
                    setFollowedUsersData((prev) => [...prev, friend]);
                    setFriendUsername("");
                    setFriendSearchResults([]);
                    setAlreadyFollowing(false);
                }
            }
        }
    };

    const handleSearchChange = async (e) => {
        const value = e.target.value;
        setFriendUsername(value);
        setAlreadyFollowing(false);

        if (value.trim().length === 0) {
            setFriendSearchResults([]);
            return;
        }

        const { data } = await supabase
            .from("users")
            .select("id, username")
            .ilike("username", `${value}%`)
            .neq("id", user.id)
            .limit(10);

        setFriendSearchResults(data || []);
    };


    const toggleEditFollow = () => {
        setEditFollowMode(!editFollowMode);
        setTempFollowedUsersData(followedUsersData.map((u) => u));
    };

    const handleRemoveFollower = (idToRemove) => {
        setTempFollowedUsersData((prev) => prev.filter((u) => u.id !== idToRemove));
    };

    const handleConfirmFollowChanges = async () => {
        const updatedIds = tempFollowedUsersData.map((u) => u.id);

        const { error } = await supabase
            .from("users")
            .update({ followed_users: updatedIds })
            .eq("id", user.id);

        if (!error) {
            setFollowedUsers(updatedIds);
            setFollowedUsersData(tempFollowedUsersData);
            setEditFollowMode(false);
        }
    };

    const handleCancelFollowChanges = () => {
        setEditFollowMode(false);
        setTempFollowedUsersData(followedUsersData.map((u) => u));
    };

    if (isLoading) return null;

    return (
        <>
            <SetTitle text="User Panel" />
            <Box sx={{ maxWidth: 600, mx: "auto", p: 3 }}>
                <Typography variant="h4" gutterBottom>
                    User Panel
                </Typography>

                <Paper sx={{ p: 2, mb: 3 }}>
                    <Typography variant="h6">Account</Typography>
                    <Stack spacing={2} mt={1}>
                        {profile && (
                            <Stack direction="row" spacing={2} alignItems="center">
                                <Typography variant="body1">
                                    Username: <strong>{profile.username}</strong>
                                </Typography>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={() => {
                                        setTempUsername("");
                                        setUsernameTaken(false);
                                        setOpenDialog(true);
                                    }}
                                >
                                    Change
                                </Button>
                            </Stack>
                        )}
                    </Stack>
                    <Divider sx={{ my: 2 }} />
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Typography>Avatar color:</Typography>
                        <Box
                            sx={{
                                width: 32,
                                height: 32,
                                borderRadius: "50%",
                                backgroundColor: avatarColor, // Wyświetlenie aktualnego koloru awatara
                                border: "1px solid #ccc",
                            }}
                        />
                        <Button
                            size="small"
                            onClick={() => setColorDialogOpen(true)} // Otwiera dialog zmiany koloru
                        >
                            Change color
                        </Button>
                    </Stack>

                    <Dialog
                        open={colorDialogOpen}
                        onClose={() => setColorDialogOpen(false)}
                        fullWidth
                        sx={{
                            backdropFilter: 'blur(5px)', // Efekt rozmycia tła
                        }}
                        PaperProps={{
                            sx: {
                                borderRadius: '16px', // Zaokrąglenie rogów okna dialogowego
                            },
                        }}
                    >
                        <DialogTitle sx={{ textAlign: 'center' }}>Wybierz kolor awatara</DialogTitle> {/* Tytuł wyśrodkowany */}
                        <DialogContent>
                            <Stack direction="row" spacing={2} justifyContent="center" alignItems="center">
                                <SketchPicker
                                    color={avatarColor}
                                    onChangeComplete={(color) => setAvatarColor(color.hex)} // Zaktualizowanie koloru
                                />
                                <Box
                                    sx={{
                                        width: 150, // Większy rozmiar podglądu
                                        height: 150, // Większy rozmiar podglądu
                                        borderRadius: "50%", // Okrągły kształt
                                        backgroundColor: avatarColor, // Kolor awatara
                                        border: "1px solid primary.main", // Obrys w kolorze głównym
                                        display: 'flex', // Umożliwia wycentrowanie zawartości
                                        justifyContent: 'center', // Wyrównanie do środka
                                        alignItems: 'center', // Wyrównanie do środka
                                        marginLeft: 'auto', // Wycentrowanie na prawej stronie
                                    }}
                                />
                            </Stack>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setColorDialogOpen(false)}>Anuluj</Button>
                            <Button onClick={handleUpdateColor}>Sava</Button>
                        </DialogActions>
                    </Dialog>

                </Paper>

                <Paper sx={{ p: 2, mb: 3 }}>
                    <Typography variant="h6">Add friend</Typography>
                    <Stack spacing={1} mt={1}>
                        <TextField
                            label="Username"
                            value={friendUsername}
                            onChange={handleSearchChange}
                            fullWidth
                        />
                        {alreadyFollowing && (
                            <Typography variant="body2" color="error">
                                You are already following this user.
                            </Typography>
                        )}
                        {friendSearchResults.length > 0 && (
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
                        )}
                        <Button variant="contained" onClick={handleAddFriend}>
                            ADD
                        </Button>
                    </Stack>
                </Paper>

                <Paper sx={{ p: 2, mb: 3 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6">
                            Linked providers ({identities.length})
                        </Typography>
                    </Stack>

                    <Divider sx={{ my: 1 }} />

                    {identities.length === 0 ? (
                        <Typography variant="body2" color="text.secondary">
                            No external providers linked.
                        </Typography>
                    ) : (
                        <List>
                            {identities.map((id) => {
                                const isEmailVerified = id.identity_data?.email_verified;

                                return (
                                    <ListItem key={id.id}>
                                        <ListItemText
                                            primary={
                                                <Stack direction="row" alignItems="center">
                                                    {providerIcons[id.provider]}
                                                    {id.provider}
                                                </Stack>
                                            }
                                            secondary={id.provider === "email"
                                                ? `Confirmed: ${isEmailVerified ? "yes" : "no"}`
                                                : undefined}
                                        />

                                        <ListItemSecondaryAction>
                                            <Button
                                                size="small"
                                                onClick={() => {
                                                    setIdentityToUnlink(id);
                                                    setConfirmDialogOpen(true);
                                                }}
                                                disabled={id.provider === "email"}
                                                title={id.provider === "email" ? "You can’t unlink your email login." : undefined}
                                            >
                                                Unlink
                                            </Button>
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                );
                            })}
                        </List>
                    )}
                </Paper>








                <Paper sx={{ p: 2, mb: 3 }}>
                    <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                    >
                        <Typography variant="h6">
                            Following ({followedUsersData.length})
                        </Typography>
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
                            {(editFollowMode ? tempFollowedUsersData : followedUsersData).map(
                                (u) => (
                                    <ListItem key={u.id}>
                                        <ListItemText primary={u.username} />
                                        {editFollowMode && (
                                            <ListItemSecondaryAction>
                                                <IconButton
                                                    edge="end"
                                                    onClick={() => handleRemoveFollower(u.id)}
                                                >
                                                    <Delete />
                                                </IconButton>
                                            </ListItemSecondaryAction>
                                        )}
                                    </ListItem>
                                )
                            )}
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

                <Paper sx={{ p: 2 }}>
                    <Typography variant="h6">
                        Followers ({followersData.length})
                    </Typography>
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
            </Box>

            <Dialog
                open={openDialog}
                onClose={() => setOpenDialog(false)}
                fullWidth
                maxWidth="sm"
                sx={{
                    backdropFilter: "blur(6px)",
                    backgroundColor: "rgba(0,0,0,0.2)",
                    "& .MuiDialog-paper": {
                        borderRadius: 4,
                        p: 2,
                        boxShadow: theme.shadows[12],
                        backdropFilter: "blur(16px)",
                    },
                }}
            >
                <DialogTitle
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        color: theme.palette.primary.main,
                        fontWeight: "bold",
                    }}
                >
                    Change username
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Old username: <strong>{profile?.username}</strong>
                    </Typography>
                    <TextField
                        placeholder="New username"
                        value={tempUsername}
                        onChange={(e) => {
                            setTempUsername(e.target.value);
                            setUsernameTaken(false);
                        }}
                        fullWidth
                        sx={{
                            "& .MuiOutlinedInput-root": {
                                borderRadius: "16px",
                            },
                        }}
                    />
                    {usernameTaken && (
                        <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                            This username is already taken.
                        </Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)} color="primary">
                        Cancel
                    </Button>
                    <Button
                        onClick={handleUpdateProfile}
                        color="primary"
                        disabled={!tempUsername.trim()}
                    >
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog
                open={confirmDialogOpen}
                onClose={() => setConfirmDialogOpen(false)}
            >
                <DialogTitle>Are you sure you want to unlink {identityToUnlink?.provider}?</DialogTitle>
                <DialogActions>
                    <Button onClick={() => setConfirmDialogOpen(false)} color="primary">
                        Cancel
                    </Button>
                    <Button
                        onClick={async () => {
                            if (!identityToUnlink) return;
                            const { error } = await supabase.auth.unlinkIdentity(identityToUnlink);
                            if (error) {
                                console.error("Unlink error:", error);
                            } else {
                                const { data } = await supabase.auth.getUserIdentities();
                                setIdentities(data.identities || []);
                            }
                            setConfirmDialogOpen(false);
                            setIdentityToUnlink(null);
                        }}
                        color="primary"
                        autoFocus
                    >
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>

        </>
    );
}
