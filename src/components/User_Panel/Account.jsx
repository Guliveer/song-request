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
import {availableProviders}  from "@/components/AuthProvidersList";
import EmojiPicker from "emoji-picker-react";
import EditIcon from '@mui/icons-material/Edit';
import PersonIcon from '@mui/icons-material/Person';
import PaletteIcon from '@mui/icons-material/Palette';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';

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
        };

        fetchProfile();
    }, []);

    const handleUpdateColor = async () => {
        const { data: user } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase
            .from("users")
            .update({ color: avatarColor })
            .eq("id", user.user.id);

        if (error) {
            console.error("Error updating color:", error);
        }

        setColorDialogOpen(false);
    };

    const handleUpdateProfile = async () => {
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

        const { data: user } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase
            .from("users")
            .update({ username: tempUsername })
            .eq("id", user.user.id);

        if (error) {
            console.error("Error updating username:", error);
            return;
        }

        setProfile((prev) => ({ ...prev, username: tempUsername }));
        setOpenDialog(false);
    };

    const handleEmojiSelect = async (clear = false) => {
        const { data: user } = await supabase.auth.getUser();
        if (!user) return;

        if (clear === true) {
            const { error } = await supabase
                .from("users")
                .update({ emoji: null })
                .eq("id", user.user.id);

            if (error) {
                console.error("Error updating emoji:", error);
            }
        } else {
            const {error} = await supabase
                .from("users")
                .update({emoji: avatarEmoji})
                .eq("id", user.user.id);

            if (error) {
                console.error("Error updating emoji:", error);
            }
        }

        setEmojiDialogOpen(false);
        window.location.reload();
    };

    return (
        <>
            <Typography variant="h5" component="h2" sx={{ color: 'white', mb: 3, fontWeight: 500 }}>
                Account Settings
            </Typography>
            <Divider sx={{ mb: 3, backgroundColor: '#333' }} />

            {/* Account settings list */}
            <Box>
                {/* Username setting */}
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    py: 3,
                    borderBottom: '1px solid #333'
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <PersonIcon sx={{ color: '#8FE6D5', mr: 2 }} />
                        <Box>
                            <Typography variant="body1" sx={{ color: 'white', fontWeight: 500 }}>
                                Username
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#aaa', mt: 0.5 }}>
                                {profile?.username}
                            </Typography>
                        </Box>
                    </Box>
                    <IconButton
                        onClick={() => {
                            setTempUsername("");
                            setUsernameTaken(false);
                            setOpenDialog(true);
                        }}
                        sx={{ color: '#8FE6D5' }}
                    >
                        <EditIcon />
                    </IconButton>
                </Box>

                {/* Avatar color setting */}
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    py: 3,
                    borderBottom: '1px solid #333'
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <PaletteIcon sx={{ color: '#8FE6D5', mr: 2 }} />
                        <Box>
                            <Typography variant="body1" sx={{ color: 'white', fontWeight: 500 }}>
                                Avatar Color
                            </Typography>
                            <Box sx={{
                                width: 24,
                                height: 24,
                                borderRadius: '50%',
                                backgroundColor: avatarColor,
                                border: '1px solid #555',
                                mt: 0.5
                            }} />
                        </Box>
                    </Box>
                    <IconButton
                        onClick={() => setColorDialogOpen(true)}
                        sx={{ color: '#8FE6D5' }}
                    >
                        <EditIcon />
                    </IconButton>
                </Box>

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
                            {avatarEmoji ? (
                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    mt: 0.5
                                }}>
                                    <Typography component="span" sx={{ fontSize: '24px' }}>
                                        {avatarEmoji}
                                    </Typography>
                                </Box>
                            ) : (
                                <Typography variant="body2" sx={{ color: '#aaa', mt: 0.5 }}>
                                    None
                                </Typography>
                            )}
                        </Box>
                    </Box>
                    <IconButton
                        onClick={() => setEmojiDialogOpen(true)}
                        sx={{ color: '#8FE6D5' }}
                    >
                        <EditIcon />
                    </IconButton>
                </Box>
            </Box>

            {/* Color picker dialog */}
            <Dialog
                open={colorDialogOpen}
                onClose={() => setColorDialogOpen(false)}
                PaperProps={{
                    sx: {
                        borderRadius: "16px",
                        backgroundColor: '#2a2a2a',
                        color: 'white'
                    },
                }}
            >
                <DialogTitle sx={{ color: 'white' }}>Choose Avatar Color</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, justifyContent: 'center', alignItems: 'center' }}>
                        <SketchPicker
                            color={avatarColor}
                            onChangeComplete={(color) => setAvatarColor(color.hex)}
                        />
                        <Box
                            sx={{
                                width: 100,
                                height: 100,
                                borderRadius: "50%",
                                backgroundColor: avatarColor,
                                border: "1px solid #555",
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            {avatarEmoji && (
                                <Typography component="span" sx={{ fontSize: '40px' }}>
                                    {avatarEmoji}
                                </Typography>
                            )}
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setColorDialogOpen(false)}
                        sx={{ color: '#aaa' }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleUpdateColor}
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
                        backgroundColor: '#2a2a2a',
                        color: 'white'
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
                        sx={{ color: '#aaa' }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleUpdateProfile}
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
                        backgroundColor: '#2a2a2a',
                        color: 'white'
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
                            backgroundColor: avatarColor,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1px solid #555',
                            mb: 2
                        }}>
                            {avatarEmoji ? (
                                <Typography component="span" sx={{ fontSize: '2.5rem' }}>
                                    {avatarEmoji}
                                </Typography>
                            ) : (
                                <Typography sx={{ color: '#aaa' }}>None</Typography>
                            )}
                        </Box>
                    </Box>
                    <EmojiPicker
                        lazyLoadEmojis={true}
                        theme="dark"
                        onEmojiClick={(emojiObject) => {
                            setAvatarEmoji(emojiObject.emoji);
                        }}
                        width="100%"
                        suggestedEmojisMode="recent"
                    />
                </DialogContent>
                <DialogActions>
                    <Button
                        color="error"
                        onClick={() => handleEmojiSelect(true)}
                        disabled={!avatarEmoji}
                    >
                        Remove
                    </Button>
                    <Button
                        onClick={() => setEmojiDialogOpen(false)}
                        sx={{ color: '#aaa' }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleEmojiSelect}
                        disabled={!avatarEmoji}
                        sx={{
                            color: avatarEmoji ? '#8FE6D5' : '#aaa',
                            '&:hover': {
                                backgroundColor: avatarEmoji ? 'rgba(143, 230, 213, 0.08)' : 'transparent'
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