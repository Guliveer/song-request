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
    Paper,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import { SketchPicker } from "react-color";
import { supabase } from "@/utils/supabase";
import {availableProviders}  from "@/components/AuthProvidersList";
import {AuthProvider} from "@/components/Items";
import EmojiPicker, { Emoji } from "emoji-picker-react";

export default function Account() {
    const theme = useTheme();

    const [profile, setProfile] = useState(null);
    const [tempUsername, setTempUsername] = useState("");
    const [usernameTaken, setUsernameTaken] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [colorDialogOpen, setColorDialogOpen] = useState(false);
    const [emojiDialogOpen, setEmojiDialogOpen] = useState(false);
    const [avatarColor, setAvatarColor] = useState("");
    const [avatarEmoji, setAvatarEmoji] = useState("");

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

    const handleEmojiSelect = async () => {
        const { data: user } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase
            .from("users")
            .update({ emoji: avatarEmoji })
            .eq("id", user.user.id);

        if (error) {
            console.error("Error updating emoji:", error);
        }

        setEmojiDialogOpen(false);

        window.location.reload();
    }

    return (
        <>
            <Paper sx={{
                p: 2,
                width: "40%",
                maxWidth: "50em",
                borderRadius: 4,
                display: "flex",
                flexDirection: "column",
                gap: 1,
            }}>
                <Typography variant="h6">Account</Typography>
                {/* Username */}
                <Stack spacing={2} mt={1}>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Typography variant="body1">
                            Username: <strong>{profile?.username}</strong>
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
                            Edit
                        </Button>
                    </Stack>
                </Stack>

                {/* Color */}
                <Stack direction="row" spacing={2} alignItems="center">
                    <Typography>Avatar color:</Typography>
                    <Box
                        sx={{
                            width: 32,
                            height: 32,
                            borderRadius: "50%",
                            backgroundColor: avatarColor,
                            border: "1px solid #ccc",
                        }}
                    />
                    <Button
                        variant="outlined"
                        size="small"
                        onClick={() => setColorDialogOpen(true)
                    }>
                        Edit
                    </Button>
                </Stack>

                {/* Emoji */}
                <Stack direction="row" spacing={2} alignItems="center">
                    <Typography>Avatar emoji:</Typography>
                    {avatarEmoji ? (
                        <Box
                            sx={{
                                width: 32,
                                height: 32,
                                borderRadius: "50%",
                                border: "1px solid #777",
                                display: "flex",
                                placeContent: "center",
                                placeItems: "center",
                            }}
                        >
                            <span>{avatarEmoji}</span>
                        </Box>
                    ) : (
                        <span>none</span>
                    )}
                    <Button
                        variant="outlined"
                        size="small"
                        onClick={() => setEmojiDialogOpen(true)}
                    >
                        Edit
                    </Button>
                </Stack>

                <Box
                    display="flex"
                    flexDirection="row"
                    gap={2}
                    sx={{ mt: 2, mb: 2 }} // Adds top and bottom margins
                >
                    {availableProviders.map((provider) => (
                        <AuthProvider
                            key={provider.providerName}
                            providerName={provider.providerName}
                            displayName={provider.displayName}
                            icon={provider.icon}
                        />
                    ))}
                </Box>
            </Paper>

            {/* Dialog zmiany koloru */}
            <Dialog
                open={colorDialogOpen}
                onClose={() => setColorDialogOpen(false)}
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: "16px",
                        backdropFilter: "blur(5px)",
                    },
                }}
            >
                <DialogTitle sx={{ textAlign: "center" }}>Wybierz kolor awatara</DialogTitle>
                <DialogContent>
                    <Stack direction="row" spacing={2} justifyContent="center" alignItems="center">
                        <SketchPicker
                            color={avatarColor}
                            onChangeComplete={(color) => setAvatarColor(color.hex)}
                        />
                        <Box
                            sx={{
                                width: 150,
                                height: 150,
                                borderRadius: "50%",
                                backgroundColor: avatarColor,
                                border: "1px solid #000",
                            }}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setColorDialogOpen(false)}>Anuluj</Button>
                    <Button onClick={handleUpdateColor}>Zapisz</Button>
                </DialogActions>
            </Dialog>

            {/* Dialog zmiany nazwy użytkownika */}
            <Dialog
                open={openDialog}
                onClose={() => setOpenDialog(false)}
                fullWidth
                maxWidth="sm"
                PaperProps={{
                    sx: {
                        borderRadius: 4,
                        p: 2,
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

            {/* Dialog zmiany emoji */}
            <Dialog
                open={emojiDialogOpen}
                onClose={() => setEmojiDialogOpen(false)}
                fullWidth
                maxWidth="sm"
                PaperProps={{
                    sx: {
                        borderRadius: 4,
                        p: 2,
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
                    Choose your avatar emoji
                </DialogTitle>
                <DialogContent>
                    <Typography variant="h6" sx={{
                        my: 2,
                        textAlign: "center",
                        display: "flex",
                        flexDirection: "row",
                        gap: 1,
                    }}>
                        <span>Selected:</span>
                        <span>{avatarEmoji}</span>
                    </Typography>
                    <EmojiPicker
                        lazyLoadEmojis={true}
                        theme="dark"
                        onEmojiClick={(emojiObject, event) => {
                            setAvatarEmoji(emojiObject.emoji);
                        }}
                        width="100%"
                        suggestedEmojisMode="recent"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEmojiDialogOpen(false)} color="primary">
                        Cancel
                    </Button>
                    <Button
                        onClick={handleEmojiSelect}
                        color="primary"
                        disabled={!avatarEmoji} // Disable save if no emoji is selected
                    >
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
