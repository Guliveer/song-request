import { supabase } from "@/utils/supabase";
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
import EmailIcon from '@mui/icons-material/Email';
import GoogleIcon from '@mui/icons-material/Google';
import FacebookIcon from '@mui/icons-material/Facebook';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import VerifiedIcon from '@mui/icons-material/Verified';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import LinkRoundedIcon from '@mui/icons-material/LinkRounded';
import { Spotify } from '@/components/AuthProvidersList';



export default function Providers() {
    const [identities, setIdentities] = useState([]);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [identityToUnlink, setIdentityToUnlink] = useState(null);
    const [loadingProvider, setLoadingProvider] = useState(null);

    const providerIcons = {
        email: <EmailIcon fontSize="medium" sx={{ mr: 2, color: '#8FE6D5' }} />,
        google: <GoogleIcon fontSize="medium" sx={{ mr: 2, color: '#8FE6D5' }} />,
        facebook: <FacebookIcon fontSize="medium" sx={{ mr: 2, color: '#8FE6D5' }} />,
        github: <GitHubIcon fontSize="medium" sx={{ mr: 2, color: '#8FE6D5' }} />,
            spotify: <Box sx={{ mr: 2, color: '#8FE6D5'}}><Spotify /></Box>,
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
            const { error } = await supabase.auth.linkIdentity({ provider });
            if (error) throw error;
        } catch (error) {
            console.error("Connection error:", error);
            setErrorMessage(`Error connecting ${provider}: ${error.message}`);
            setSnackbarOpen(true);
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
                                <Box sx={{ flex: 1 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography variant="body1" sx={{ color: 'white', fontWeight: 500, textTransform: 'capitalize' }}>
                                            {provider}
                                        </Typography>
                                        {isConnected && (
                                            <VerifiedIcon fontSize="small" sx={{ color: '#4caf50' }} />
                                        )}
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
