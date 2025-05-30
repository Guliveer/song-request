import { useEffect, useState } from "react";
import { useTheme } from "@mui/material/styles";
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Typography,
    TextField,
    IconButton,
} from "@mui/material";
import { SketchPicker } from "react-color";
import { supabase } from "@/utils/supabase";
import EmojiPicker from "emoji-picker-react";
import EditIcon from '@mui/icons-material/Edit';
import PersonIcon from '@mui/icons-material/Person';
import PaletteIcon from '@mui/icons-material/Palette';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import CloseIcon from '@mui/icons-material/Close';
import {getCurrentUser} from "@/utils/actions";

export default function Account() {
    const theme = useTheme();

    const [profile, setProfile] = useState(null);
    const [tempUsername, setTempUsername] = useState("");
    const [usernameTaken, setUsernameTaken] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [colorDialogOpen, setColorDialogOpen] = useState(false);
    const [emojiDialogOpen, setEmojiDialogOpen] = useState(false);
    const [avatarColor, setAvatarColor] = useState("");
    const [avatarEmoji, setAvatarEmoji] = useState(null);
    const [tempColor, setTempColor] = useState("");
    const [tempEmoji, setTempEmoji] = useState(null);

    // Nowe: stan na oczekujące zmiany
    const [pendingChanges, setPendingChanges] = useState({
        username: null,
        color: null,
        emoji: null
    });

    useEffect(() => {
        const fetchProfile = async () => {
            const { data: user } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from("users")
                .select("username, color, emoji")
                .eq("id", user.user.id)
                .single();

            if (error) {
                console.error("Error fetching profile:", error);
            } else {
                setProfile({ username: data.username });
                setAvatarColor(data.color || "#FFFFFF");
                setAvatarEmoji(data.emoji || null);
            }

            // Wczytaj cache z localStorage
            setPendingChanges({
                username: localStorage.getItem('pendingUsername'),
                color: localStorage.getItem('pendingColor'),
                emoji: localStorage.getItem('pendingEmoji')
            });
        };

        fetchProfile();
    }, []);

    // Zmiana nazwy użytkownika – zapis do cache
    const handleSaveUsernameToCache = async () => {
        if (!tempUsername.trim()) return;

        const { data: existing } = await supabase
            .from("users")
            .select("id")
            .eq("username", tempUsername)
            .maybeSingle();

        if (existing) {
            setUsernameTaken(true);
            return;
        }

        localStorage.setItem('pendingUsername', tempUsername);
        setPendingChanges(prev => ({ ...prev, username: tempUsername }));
        setOpenDialog(false);
    };

    // Zmiana koloru – zapis do cache
    const handleSaveColorToCache = () => {
        localStorage.setItem('pendingColor', tempColor);
        setPendingChanges(prev => ({ ...prev, color: tempColor }));
        setColorDialogOpen(false);
    };

    // Zmiana emoji – zapis do cache
    const handleSaveEmojiToCache = () => {
        const emojiValue = tempEmoji || null;
        localStorage.setItem('pendingEmoji', emojiValue);
        setPendingChanges(prev => ({ ...prev, emoji: emojiValue }));
        setEmojiDialogOpen(false);
    };

    // Usuwanie emoji – zapis do cache
    const handleRemoveEmojiFromCache = () => {
        localStorage.setItem('pendingEmoji', "");
        setPendingChanges(prev => ({ ...prev, emoji: "" }));
        setEmojiDialogOpen(false);
    };

    // Globalny zapis do bazy danych
    const handleGlobalSave = async () => {
        const updates = {};
        const user = await getCurrentUser();

        if (!user) return;

        if (pendingChanges.username) updates.username = pendingChanges.username;
        if (pendingChanges.color) updates.color = pendingChanges.color;
        if (pendingChanges.emoji !== null) updates.emoji = pendingChanges.emoji === "" ? null : pendingChanges.emoji;

        if (Object.keys(updates).length === 0) return;

        const { error } = await supabase
            .from("users")
            .update(updates)
            .eq("id", user.id);

        if (!error) {
            localStorage.removeItem('pendingUsername');
            localStorage.removeItem('pendingColor');
            localStorage.removeItem('pendingEmoji');
            window.location.reload();
            setPendingChanges({ username: null, color: null, emoji: null });
        } else {
            console.error("Error saving changes:", error);
            throw new Error("Failed to save changes: " + error.message);
        }
    };

    return (
        <>
            <Typography variant="h5" component="h2" sx={{ color: 'white', fontWeight: 500 }}>
                Account Settings
            </Typography>
            <Divider sx={{ my: 2 }} />

            {/* Account settings list */}
            <Box>
                {/* Username setting */}
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    py: 3,
                }}>

                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <PersonIcon sx={{ color: '#8FE6D5', mr: 2 }} />
                        <Box>
                            <Typography variant="body1" sx={{ color: 'white', fontWeight: 500 }}>
                                Username
                            </Typography>
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                            }}>
                                <Typography variant="body2" sx={{ color: pendingChanges.username ? '#8FE6D5' : '#aaa', mt: 0.5 }}>
                                    {pendingChanges.username || profile?.username}
                                </Typography>
                                {pendingChanges.username && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                        <IconButton
                                            size="small"
                                            sx={{ ml: 0.5, color: '#8FE6D5' }}
                                            onClick={() => {
                                                localStorage.removeItem('pendingUsername');
                                                setPendingChanges(prev => ({ ...prev, username: null }));
                                            }}
                                        >
                                            <CloseIcon fontSize="small" />
                                        </IconButton>
                                    </Box>
                                )}
                            </Box>
                        </Box>

                    </Box>
                    <IconButton
                        onClick={() => {
                            setTempUsername(pendingChanges.username || profile?.username || "");
                            setUsernameTaken(false);
                            setOpenDialog(true);
                        }}
                        sx={{ color: '#8FE6D5' }}
                    >
                        <EditIcon />
                    </IconButton>
                </Box>

                <Divider />

                {/* Avatar color setting */}
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    py: 3,
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <PaletteIcon sx={{ color: '#8FE6D5', mr: 2 }} />
                        <Box>
                            <Typography variant="body1" sx={{ color: 'white', fontWeight: 500 }}>
                                Avatar Color
                            </Typography>
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                            }}>
                                <Box sx={{
                                    width: 24,
                                    height: 24,
                                    borderRadius: '50%',
                                    backgroundColor: pendingChanges.color || avatarColor,
                                    border: '1px solid #555',
                                    mt: 0.5
                                }} />
                                {pendingChanges.color && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                        <IconButton
                                            size="small"
                                            sx={{ ml: 0.5, color: '#8FE6D5' }}
                                            onClick={() => {
                                                localStorage.removeItem('pendingColor');
                                                setPendingChanges(prev => ({ ...prev, color: null }));
                                            }}
                                        >
                                            <CloseIcon fontSize="small" />
                                        </IconButton>
                                    </Box>
                                )}
                            </Box>
                        </Box>
                    </Box>
                    <IconButton
                        onClick={() => {
                            setTempColor(pendingChanges.color || avatarColor);
                            setColorDialogOpen(true);
                        }}
                        sx={{ color: '#8FE6D5' }}
                    >
                        <EditIcon />
                    </IconButton>
                </Box>

                <Divider />

                {/* Avatar emoji setting */}
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    py: 3,
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <EmojiEmotionsIcon sx={{ color: '#8FE6D5', mr: 2 }} />
                        <Box>
                            <Typography variant="body1" sx={{ color: 'white', fontWeight: 500 }}>
                                Avatar Emoji
                            </Typography>
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                            }}>
                                <Typography component="span" sx={{
                                    fontSize: '1rem',
                                    color: pendingChanges.emoji ? '#8FE6D5' : 'white',
                                }}>
                                    {(pendingChanges.emoji !== null
                                        ? (pendingChanges.emoji || "None")
                                        : (avatarEmoji || "None"))}
                                </Typography>
                                {pendingChanges.emoji && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
                                        <IconButton
                                            size="small"
                                            sx={{ ml: 0.5, color: '#8FE6D5' }}
                                            onClick={() => {
                                                localStorage.removeItem('pendingEmoji');
                                                setPendingChanges(prev => ({ ...prev, emoji: null }));
                                            }}
                                        >
                                            <CloseIcon fontSize="small" />
                                        </IconButton>
                                    </Box>
                                )}
                            </Box>
                        </Box>
                    </Box>
                    <IconButton
                        onClick={() => {
                            setTempEmoji(pendingChanges.emoji !== null ? pendingChanges.emoji : avatarEmoji);
                            setEmojiDialogOpen(true);
                        }}
                        sx={{ color: '#8FE6D5' }}
                    >
                        <EditIcon />
                    </IconButton>
                </Box>
            </Box>

            {/* Globalny przycisk Save */}
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                    variant="contained"
                    onClick={handleGlobalSave}
                    disabled={!Object.values(pendingChanges).some(val => val !== null && val !== undefined)}
                >
                    Save All Changes
                </Button>
            </Box>

            {/* Color picker dialog */}
            <Dialog
                open={colorDialogOpen}
                onClose={() => setColorDialogOpen(false)}
                PaperProps={{
                    sx: {
                        borderRadius: 4
                    },
                }}
            >
                <DialogTitle sx={{ color: 'white' }}>Choose Avatar Color</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, justifyContent: 'center', alignItems: 'center' }}>
                        <SketchPicker
                            color={tempColor}
                            onChangeComplete={(color) => setTempColor(color.hex)}
                        />
                        <Box
                            sx={{
                                width: 100,
                                height: 100,
                                borderRadius: "50%",
                                backgroundColor: tempColor,
                                border: "1px solid #555",
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            {(pendingChanges.emoji !== null ? pendingChanges.emoji : avatarEmoji) && (
                                <Typography component="span" sx={{ fontSize: '40px' }}>
                                    {pendingChanges.emoji !== null ? pendingChanges.emoji : avatarEmoji}
                                </Typography>
                            )}
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setColorDialogOpen(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSaveColorToCache}
                        sx={{
                            color: '#8FE6D5',
                            '&:hover': {
                                backgroundColor: 'rgba(143, 230, 213, 0.08)'
                            }
                        }}
                    >
                        Save
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Username change dialog */}
            <Dialog
                open={openDialog}
                onClose={() => setOpenDialog(false)}
                fullWidth
                maxWidth="sm"
                PaperProps={{
                    sx: {
                        borderRadius: 4,
                    },
                }}
            >
                <DialogTitle sx={{ color: 'white' }}>
                    Change username
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body2" sx={{ mb: 1, color: '#aaa' }}>
                        Old username: <strong style={{ color: 'white' }}>{profile?.username}</strong>
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
                    {usernameTaken && (
                        <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                            This username is already taken.
                        </Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setOpenDialog(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSaveUsernameToCache}
                        disabled={!tempUsername.trim()}
                        sx={{
                            color: tempUsername.trim() ? '#8FE6D5' : '#aaa',
                            '&:hover': {
                                backgroundColor: tempUsername.trim() ? 'rgba(143, 230, 213, 0.08)' : 'transparent'
                            }
                        }}
                    >
                        Save
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Emoji picker dialog */}
            <Dialog
                open={emojiDialogOpen}
                onClose={() => setEmojiDialogOpen(false)}
                fullWidth
                maxWidth="sm"
                PaperProps={{
                    sx: {
                        borderRadius: 4,
                    },
                }}
            >
                <DialogTitle sx={{ color: 'white' }}>
                    Choose your avatar emoji
                </DialogTitle>
                <DialogContent>
                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        my: 2,
                    }}>
                        <Typography variant="body1" sx={{ mb: 1, color: 'white' }}>
                            Selected:
                        </Typography>
                        <Box sx={{
                            width: 70,
                            height: 70,
                            borderRadius: '50%',
                            backgroundColor: pendingChanges.color || avatarColor,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1px solid #555',
                            mb: 2
                        }}>
                            {tempEmoji && (
                                <Typography component="span" sx={{ fontSize: '2.5rem' }}>
                                    {tempEmoji}
                                </Typography>
                            )}
                        </Box>
                    </Box>
                    <EmojiPicker
                        lazyLoadEmojis={true}
                        theme="dark"
                        onEmojiClick={(emojiObject) => {
                            setTempEmoji(emojiObject.emoji);
                        }}
                        width="100%"
                        suggestedEmojisMode="recent"
                    />
                </DialogContent>
                <DialogActions>
                    <Button
                        color="error"
                        onClick={handleRemoveEmojiFromCache}
                        disabled={!avatarEmoji && !pendingChanges.emoji}
                    >
                        Remove
                    </Button>
                    <Button
                        onClick={() => setEmojiDialogOpen(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSaveEmojiToCache}
                        disabled={!tempEmoji}
                        sx={{
                            '&:hover': {
                                backgroundColor: tempEmoji ? 'rgba(143, 230, 213, 0.08)' : 'transparent'
                            }
                        }}
                    >
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
