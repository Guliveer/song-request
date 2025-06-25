import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import {
    Button, Dialog, DialogActions, DialogTitle,
    Divider,
    List,
    ListItem,
    ListItemSecondaryAction,
    Box,
    Typography,
    IconButton,
    CircularProgress
} from "@mui/material";
import {
    Email as EmailIcon,
    Google as GoogleIcon,
    FacebookRounded as FacebookIcon,
    GitHub as GitHubIcon,
    LinkOff as LinkOffIcon,
    Verified as VerifiedIcon,
    ErrorOutlineRounded as ErrorOutlineIcon,
    LinkRounded as LinkRoundedIcon,
}from '@mui/icons-material';
import { authProviders, Spotify } from '@/lib/authProviders';

export default function Providers() {
    const [identities, setIdentities] = useState([]);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [identityToUnlink, setIdentityToUnlink] = useState(null);
    const [loadingProvider, setLoadingProvider] = useState(null);

    const providerIcons = {
        email: <EmailIcon sx={{color: '#8FE6D5' }} />,
        google: <GoogleIcon sx={{color: '#8FE6D5' }} />,
        facebook: <FacebookIcon sx={{color: '#8FE6D5' }} />,
        github: <GitHubIcon sx={{color: '#8FE6D5' }} />,
        spotify: <Spotify color='#8FE6D5' size={26} />,
    };

    const allProviders = Object.keys(providerIcons);

    useEffect(() => {
        async function fetchIdentities() {
            const { data, error } = await supabase.auth.getUserIdentities();
            if (error) {
                console.error("Error fetching identities:", error);
            } else {
                setIdentities(data?.identities || []);
            }
        }
        fetchIdentities();
    }, []);

    const handleConnectProvider = async (provider) => {
        setLoadingProvider(provider);
        try {
            const { error } = await supabase.auth.linkIdentity({
                provider: provider,
                options: {
                    redirectTo: window.location.origin,
                    scopes: "streaming user-read-email user-read-private user-modify-playback-state user-read-playback-state"
                }
            });
            if (error) throw error;
        } catch (error) {
            console.error("Connection error:", error);
            throw new Error(`Failed to connect ${provider}: ${error.message}`);
        }
        setLoadingProvider(null);
    };

    return (
        <>
            <Typography variant="h5" component="h2" sx={{ color: 'white', mb: 3, fontWeight: 500 }}>
                Providers
            </Typography>
            <Divider sx={{ mb: 3, backgroundColor: '#333' }} />

            <List sx={{ p: 0 }}>
                {allProviders.map((provider, index) => {
                    const isConnected = identities.some(id => id.provider === provider);
                    const isEmail = provider === 'email';
                    const isEmailVerified = identities.find(id => id.provider === provider)?.identity_data?.email_verified;

                    return (
                        <Box key={provider}>
                            <ListItem
                                sx={{
                                    py: 2,
                                    borderRadius: 1,
                                    '&:hover': {
                                        backgroundColor: 'rgba(255, 255, 255, 0.03)'
                                    }
                                }}
                            >
                                {providerIcons[provider]}
                                <Box sx={{ flex: 1, ml: 1 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography variant="body1" sx={{ color: 'white', fontWeight: 500, textTransform: 'capitalize' }}>
                                            {provider}
                                        </Typography>
                                        {isEmail && isConnected && !isEmailVerified && (
                                            <ErrorOutlineIcon fontSize="small" sx={{ color: '#ff9800' }} />
                                        )}
                                    </Box>
                                    {isEmail && isConnected && (
                                        <Typography variant="body2" sx={{ color: '#aaa', mt: 0.5 }}>
                                            {isEmailVerified ? "Email verified" : "Email not verified"}
                                        </Typography>
                                    )}
                                </Box>
                                <ListItemSecondaryAction>
                                    {isConnected ? (
                                        provider !== "email" ? (
                                            <IconButton
                                                onClick={() => {
                                                    setIdentityToUnlink(identities.find(id => id.provider === provider));
                                                    setConfirmDialogOpen(true);
                                                }}
                                                title="Unlink this provider"
                                                sx={{
                                                    color: '#f44336',
                                                    marginRight: '15px',
                                                    '&:hover': {
                                                        backgroundColor: 'rgba(244, 67, 54, 0.08)'
                                                    }
                                                }}
                                            >
                                                <LinkOffIcon />
                                            </IconButton>
                                        ) : null
                                    ) : (
                                        <IconButton
                                            size="small"
                                            disabled={loadingProvider === provider || isEmail}
                                            onClick={() => !isEmail && handleConnectProvider(provider)}
                                            sx={{
                                                color: '#4caf50',
                                                marginRight: '18px',
                                                '&:hover': {
                                                    backgroundColor: 'rgba(76, 175, 80, 0.15)',
                                                },
                                            }}
                                            title="Connect this provider"
                                        >
                                            {loadingProvider === provider ? (
                                                <CircularProgress size={20} color="inherit" />
                                            ) : (
                                                <LinkRoundedIcon />
                                            )}
                                        </IconButton>


                                    )}
                                </ListItemSecondaryAction>
                            </ListItem>
                            {index < allProviders.length - 1 && <Divider sx={{ backgroundColor: '#333' }} />}
                        </Box>
                    );
                })}
            </List>

            <Dialog
                open={confirmDialogOpen}
                onClose={() => setConfirmDialogOpen(false)}
                PaperProps={{
                    sx: {
                        borderRadius: '16px',
                        backgroundColor: '#2a2a2a',
                        color: 'white'
                    }
                }}
            >
                <DialogTitle sx={{ color: 'white' }}>
                    Are you sure you want to unlink {identityToUnlink?.provider}?
                </DialogTitle>
                <DialogActions>
                    <Button
                        onClick={() => setConfirmDialogOpen(false)}
                        sx={{
                            color: '#aaa',
                            '&:hover': {
                                backgroundColor: 'rgba(255, 255, 255, 0.05)'
                            }
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={async () => {
                            if (!identityToUnlink) return;
                            try {
                                const { error } = await supabase.auth.unlinkIdentity(identityToUnlink);
                                if (error) {
                                    console.error("Unlink error:", error);
                                } else {
                                    const { data } = await supabase.auth.getUserIdentities();
                                    setIdentities(data.identities || []);
                                }
                            } catch (error) {
                                console.error("Error during unlinking:", error);
                            }
                            setConfirmDialogOpen(false);
                            setIdentityToUnlink(null);
                        }}
                        sx={{
                            color: '#f44336',
                            '&:hover': {
                                backgroundColor: 'rgba(244, 67, 54, 0.08)'
                            }
                        }}
                    >
                        Unlink
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
