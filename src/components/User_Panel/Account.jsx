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

    //zmiana hasla
    const [showPasswordDialog, setShowPasswordDialog] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [repeatPassword, setRepeatPassword] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [passwordSuccess, setPasswordSuccess] = useState("");


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
    // Obsługa zmiany hasła
    const handleChangePassword = async () => {
        setPasswordError("");
        setPasswordSuccess("");

        if (!newPassword || !repeatPassword) {
            setPasswordError("Please fill in both password fields.");
            return;
        }
        if (newPassword !== repeatPassword) {
            setPasswordError("Passwords do not match.");
            return;
        }
        if (newPassword.length < 8) {
            setPasswordError("The password must be at least 8 characters long.");
            return;
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            setPasswordError("You are not logged in. Please log in again.");
            return;
        }

        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) {
            if (
                error.message &&
                error.message.includes(
                    "Password should contain at least one character of each"
                )
            ) {
                setPasswordError(
                    "The password must contain at least one lowercase letter, one uppercase letter, and one digit."
                );
            } else {
                setPasswordError("An error occurred while changing your password. Please try again, or make sure you are not using your current password.");
            }
        } else {
            setPasswordSuccess("Your password has been changed successfully.");
            setNewPassword("");
            setRepeatPassword("");
            setTimeout(handleClosePasswordDialog, 1500);
        }
    };

    const handleClosePasswordDialog = () => {
        setShowPasswordDialog(false);
        setNewPassword("");
        setRepeatPassword("");
        setPasswordError("");
        setPasswordSuccess("");
    };


    const [mfaDialogOpen, setMfaDialogOpen] = useState(false);
    const [qrCode, setQrCode] = useState('');
    const [factorId, setFactorId] = useState('');
    const [verifyCode, setVerifyCode] = useState('');
    const [mfaError, setMfaError] = useState('');
    const [mfaSuccess, setMfaSuccess] = useState('');

    const removeUnverifiedFactors = async () => {
        const { data } = await supabase.auth.mfa.listFactors();
        if (data?.all?.length) {
            await Promise.all(
                data.all
                    .filter(factor => factor.status === "unverified")
                    .map(factor => supabase.auth.mfa.unenroll({ factorId: factor.id }))
            );
        }
    };


    // Funkcja do rozpoczęcia enrollowania MFA
    const handleEnableMfa = async () => {
        setMfaError('');
        setMfaSuccess('');
        setVerifyCode('');
        setQrCode('');
        setFactorId('');
        setTotpSecret('');
        setMfaDialogOpen(true);

        await removeUnverifiedFactors();

        const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp' });

        if (error) {
            setMfaError(error.message);
            return;
        }
        if (!data.totp?.qr_code) {
            setMfaError("QR code not received from Supabase. Try again in a few seconds.");
            return;
        }
        setQrCode(data.totp.qr_code);
        setFactorId(data.id);
        setTotpSecret(data.totp.secret); // <-- dodaj to!
    };
    // Funkcja do weryfikacji kodu z aplikacji Authenticator
    const handleVerifyMfa = async () => {
        setMfaError('');
        const challenge = await supabase.auth.mfa.challenge({ factorId });
        if (challenge.error) {
            setMfaError(challenge.error.message);
            return;
        }
        const challengeId = challenge.data.id;
        const verify = await supabase.auth.mfa.verify({
            factorId,
            challengeId,
            code: verifyCode.trim(),
        });
        if (verify.error) {
            setMfaError(verify.error.message);
        } else {
            setMfaSuccess('Two-Factor Authentication enabled successfully!');
            setTimeout(() => setMfaDialogOpen(false), 1500);
        }
    };

    const [has2faEnabled, setHas2faEnabled] = useState(false);
    const [totpFactorId, setTotpFactorId] = useState('');

    // Sprawdź status 2FA po załadowaniu komponentu
    useEffect(() => {
        const check2fa = async () => {
            const { data, error } = await supabase.auth.mfa.listFactors();
            if (error) return;
            const totp = data?.all?.find(f => (f.factor_type === 'totp' || f.factorType === 'totp') && f.status === 'verified');
            if (totp) {
                setHas2faEnabled(true);
                setTotpFactorId(totp.id);
            } else {
                setHas2faEnabled(false);
                setTotpFactorId('');
            }
        };
        check2fa();
    }, [mfaDialogOpen, mfaSuccess]);

    const handleDisable2fa = async () => {
        if (!totpFactorId) return;
        const { error } = await supabase.auth.mfa.unenroll({ factorId: totpFactorId });
        if (error) {
            setMfaError(error.message);
        } else {
            setHas2faEnabled(false);
            setTotpFactorId('');
            setMfaSuccess('Two-Factor Authentication disabled!');
            setTimeout(() => setMfaSuccess(''), 1500);
        }
    };

    const [disable2faDialogOpen, setDisable2faDialogOpen] = useState(false);
    const [disable2faCode, setDisable2faCode] = useState('');
    const [disable2faError, setDisable2faError] = useState('');

    const handleDisable2faWithCode = async () => {
        setDisable2faError('');
        // 1. Challenge MFA
        const challenge = await supabase.auth.mfa.challenge({ factorId: totpFactorId });
        if (challenge.error) {
            setDisable2faError(challenge.error.message);
            return;
        }
        // 2. Verify MFA
        const verify = await supabase.auth.mfa.verify({
            factorId: totpFactorId,
            challengeId: challenge.data.id,
            code: disable2faCode.trim(),
        });
        if (verify.error) {
            setDisable2faError(verify.error.message);
            return;
        }
        // 3. Unenroll MFA
        const { error } = await supabase.auth.mfa.unenroll({ factorId: totpFactorId });
        if (error) {
            setDisable2faError(error.message);
        } else {
            setHas2faEnabled(false);
            setTotpFactorId('');
            setMfaSuccess('Two-Factor Authentication disabled!');
            setDisable2faDialogOpen(false);
            setTimeout(() => setMfaSuccess(''), 1500);
        }
    };


    const [totpSecret, setTotpSecret] = useState('');
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

            <Button
                variant="outlined"
                sx={{ color: '#8FE6D5', mt: 2 }}
                onClick={() => setShowPasswordDialog(true)}
            >
                Change password
            </Button>

            <Box sx={{ mt: 4 }}>
                {has2faEnabled ? (
                    <Button
                        variant="outlined"
                        color="error"
                        onClick={() => setDisable2faDialogOpen(true)}
                    >
                        Disable Two-Factor Authentication (2FA)
                    </Button>

                ) : (
                    <Button
                        variant="outlined"
                        color="secondary"
                        onClick={handleEnableMfa}
                    >
                        Enable Two-Factor Authentication (2FA)
                    </Button>
                )}
                {mfaError && (
                    <Typography color="error" sx={{ mt: 2 }}>
                        {mfaError}
                    </Typography>
                )}
                {mfaSuccess && (
                    <Typography color="success.main" sx={{ mt: 2 }}>
                        {mfaSuccess}
                    </Typography>
                )}
            </Box>
            <Dialog
                open={disable2faDialogOpen}
                onClose={() => setDisable2faDialogOpen(false)}
                fullWidth
                maxWidth="xs"
            >
                <DialogTitle>Disable Two-Factor Authentication</DialogTitle>
                <DialogContent>
                    <Typography sx={{ mb: 2 }}>
                        To disable 2FA, enter the current code from your Authenticator app.
                    </Typography>
                    <TextField
                        label="6-digit code"
                        value={disable2faCode}
                        onChange={e => setDisable2faCode(e.target.value)}
                        fullWidth
                        inputProps={{ maxLength: 6, pattern: '[0-9]*', inputMode: 'numeric' }}
                    />
                    {disable2faError && (
                        <Typography color="error" sx={{ mt: 2 }}>
                            {disable2faError}
                        </Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDisable2faDialogOpen(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleDisable2faWithCode}
                        disabled={!disable2faCode}
                        variant="contained"
                        color="error"
                    >
                        Disable 2FA
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={mfaDialogOpen}
                onClose={() => setMfaDialogOpen(false)}
                fullWidth
                maxWidth="xs"
                PaperProps={{
                    sx: {
                        borderRadius: 4,
                        background: theme.palette.background.paper,
                        boxShadow: 24,
                    },
                }}
            >
                <DialogTitle sx={{ color: 'white', fontWeight: 600, pb: 0 }}>
                    Enable Two-Factor Authentication
                </DialogTitle>
                <DialogContent sx={{ pt: 1 }}>
                    {/* Krok 1: Instrukcja */}
                    <Typography variant="body1" sx={{ color: '#8FE6D5', mb: 2 }}>
                        Step 1: Scan the QR code below with your Authenticator app
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#bbb', mb: 2 }}>
                        Use apps like <strong>Google Authenticator</strong>, <strong>Authy</strong> or <strong>Microsoft Authenticator</strong>.
                        If you can’t scan, you can manually enter the code shown below.
                    </Typography>
                    {/* QR code */}
                    {qrCode && (
                        <>
                            <Typography variant="body2" sx={{ mb: 2 }}>
                                Scan this QR code with your Authenticator app (Google Authenticator, Authy, etc.), then enter the 6-digit code below.
                            </Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'center'}}>
                                <img src={qrCode} alt="QR code" width={220} height={220} style={{ background: '#fff', padding: 8 }} />

                            </Box>
                            {/* ... */}
                        </>
                    )}
                    {totpSecret && (
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'center',
                                width: '100%',
                            }}
                        >
                            <Box
                                sx={{
                                    mt: 2,
                                    mb: 1,
                                    px: 3,
                                    py: 2,
                                    background: '#23272a',
                                    borderRadius: 3,
                                    border: '1px solid #333',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    boxShadow: '0 2px 16px #0004',
                                    maxWidth: 340,
                                    mx: 'auto', // automatyczne marginesy boczne
                                    textAlign: 'center', // wyśrodkowanie tekstu w środku boxa
                                }}
                            >
                                <Typography
                                    variant="subtitle2"
                                    sx={{
                                        color: '#8FE6D5',
                                        fontWeight: 700,
                                        letterSpacing: 1,
                                        mb: 1,
                                    }}
                                >
                                    Manual setup code
                                </Typography>
                                <Typography
                                    variant="body1"
                                    sx={{
                                        color: '#fff',
                                        fontFamily: 'monospace',
                                        fontSize: '1.25rem',
                                        letterSpacing: 2,
                                        wordBreak: 'break-all',
                                        mb: 1,
                                        textAlign: 'center',
                                        background: '#181a1b',
                                        px: 2,
                                        py: 1,
                                        borderRadius: 2,
                                        boxShadow: '0 1px 4px #0002'
                                    }}
                                    title={totpSecret}
                                >
                                    {totpSecret}
                                </Typography>
                                <Typography
                                    variant="caption"
                                    sx={{ color: '#bbb', textAlign: 'center' }}
                                >
                                    If you can't scan the QR code, copy and enter this code manually in your authenticator app.
                                </Typography>
                            </Box>
                        </Box>
                    )}
                    {/* Krok 2: Kod z aplikacji */}
                    <Divider sx={{ my: 3, borderColor: '#222' }}>Step 2</Divider>
                    <Typography variant="body1" sx={{ color: '#8FE6D5', mb: 1 }}>
                        Enter the 6-digit code from your app
                    </Typography>
                    <TextField
                        label="6-digit code"
                        value={verifyCode}
                        onChange={e => setVerifyCode(e.target.value)}
                        fullWidth
                        sx={{
                            input: { color: 'white', letterSpacing: 2, fontWeight: 600, fontSize: '1.2rem' },
                            mb: 2,
                            mt: 1
                        }}
                        autoFocus
                        inputProps={{ maxLength: 6, pattern: '[0-9]*', inputMode: 'numeric' }}
                    />

                    {/* Komunikaty */}
                    {mfaError && (
                        <Typography color="error" sx={{ mt: 2 }}>
                            {mfaError}
                        </Typography>
                    )}
                    {mfaSuccess && (
                        <Typography color="success.main" sx={{ mt: 2 }}>
                            {mfaSuccess}
                        </Typography>
                    )}
                </DialogContent>
                <DialogActions sx={{ pr: 3, pb: 2 }}>
                    <Button onClick={() => setMfaDialogOpen(false)} sx={{ color: '#aaa' }}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleVerifyMfa}
                        disabled={!verifyCode || !factorId}
                        variant="contained"
                        sx={{
                            bgcolor: '#8FE6D5',
                            color: '#222',
                            fontWeight: 700,
                            '&:hover': { bgcolor: '#6fd1b5' }
                        }}
                    >
                        Enable 2FA
                    </Button>
                </DialogActions>
            </Dialog>
          
            <Dialog open={showPasswordDialog} onClose={handleClosePasswordDialog} fullWidth maxWidth="sm">
                <DialogTitle>Change password</DialogTitle>
                <DialogContent>
                    <TextField
                        label="New password"
                        type="password"
                        fullWidth
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        sx={{ mt: 2 }}
                    />
                    <TextField
                        label="Repeat new password"
                        type="password"
                        fullWidth
                        value={repeatPassword}
                        onChange={e => setRepeatPassword(e.target.value)}
                        sx={{ mt: 2 }}
                    />
                    {passwordError && (
                        <Typography color="error" sx={{ mt: 1 }}>{passwordError}</Typography>
                    )}
                    {passwordSuccess && (
                        <Typography color="success.main" sx={{ mt: 1 }}>{passwordSuccess}</Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClosePasswordDialog}>Cancel</Button>
                    <Button onClick={handleChangePassword} variant="contained">Change password</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
