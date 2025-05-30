import { supabase } from "@/utils/supabase";
import { useEffect, useState } from "react";
import {
    Button, Dialog, DialogActions, DialogTitle,
    Divider,
    List,
    ListItem,
    ListItemSecondaryAction,
    ListItemText,
    Box,
    Typography,
    IconButton
} from "@mui/material";
import EmailIcon from '@mui/icons-material/Email';
import GoogleIcon from '@mui/icons-material/Google';
import FacebookIcon from '@mui/icons-material/Facebook';
import GitHubIcon from '@mui/icons-material/GitHub';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import VerifiedIcon from '@mui/icons-material/Verified';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

export default function Providers() {
    const [identities, setIdentities] = useState([]);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [identityToUnlink, setIdentityToUnlink] = useState(null);

    const providerIcons = {
        email: <EmailIcon fontSize="medium" sx={{ mr: 2, color: '#8FE6D5' }} />,
        google: <GoogleIcon fontSize="medium" sx={{ mr: 2, color: '#8FE6D5' }} />,
        facebook: <FacebookIcon fontSize="medium" sx={{ mr: 2, color: '#8FE6D5' }} />,
        github: <GitHubIcon fontSize="medium" sx={{ mr: 2, color: '#8FE6D5' }} />,
        spotify: <MusicNoteIcon fontSize="medium" sx={{ mr: 2, color: '#8FE6D5' }} />,
    };

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

    return (
        <>
            <Typography variant="h5" component="h2" sx={{ color: 'white', fontWeight: 500 }}>
                Linked Providers
            </Typography>
            <Divider sx={{ my: 2 }} />

            {identities.length === 0 ? (
                <Typography variant="body1" sx={{ color: '#aaa', textAlign: 'center', py: 4 }}>
                    No external providers linked.
                </Typography>
            ) : (
                <List sx={{ p: 0 }}>
                    {identities.map((id, index) => {
                        const isEmailVerified = id.identity_data?.email_verified;

                        return (
                            <Box key={id.id}>
                                <ListItem
                                    sx={{
                                        py: 2,
                                        borderRadius: 1,
                                        '&:hover': {
                                            backgroundColor: 'rgba(255, 255, 255, 0.03)'
                                        }
                                    }}
                                >
                                    {providerIcons[id.provider] || (
                                        <Box sx={{ mr: 2, color: '#8FE6D5' }}>?</Box>
                                    )}

                                    <Box sx={{ flex: 1 }}>
                                        <Box sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1
                                        }}>
                                            <Typography variant="body1" sx={{ color: 'white', fontWeight: 500, textTransform: 'capitalize' }}>
                                                {id.provider}
                                            </Typography>
                                            {id.provider === "email" && (
                                                isEmailVerified ? (
                                                    <VerifiedIcon fontSize="small" sx={{ color: '#4caf50' }} />
                                                ) : (
                                                    <ErrorOutlineIcon fontSize="small" sx={{ color: '#ff9800' }} />
                                                )
                                            )}
                                        </Box>

                                        {id.provider === "email" && (
                                            <Typography variant="body2" sx={{ color: '#aaa', mt: 0.5 }}>
                                                {isEmailVerified ? "Email verified" : "Email not verified"}
                                            </Typography>
                                        )}

                                        {id.identity_data?.email && id.provider !== "email" && (
                                            <Typography variant="body2" sx={{ color: '#aaa', mt: 0.5 }}>
                                                {id.identity_data.email}
                                            </Typography>
                                        )}
                                    </Box>

                                    <ListItemSecondaryAction>
                                        <IconButton
                                            onClick={() => {
                                                if (id.provider !== "email") {
                                                    setIdentityToUnlink(id);
                                                    setConfirmDialogOpen(true);
                                                }
                                            }}
                                            disabled={id.provider === "email"}
                                            title={id.provider === "email" ? "You can't unlink your email login." : "Unlink this provider"}
                                            sx={{
                                                color: id.provider === "email" ? '#666' : '#f44336',
                                                '&:hover': {
                                                    backgroundColor: id.provider === "email" ? 'transparent' : 'rgba(244, 67, 54, 0.08)'
                                                }
                                            }}
                                        >
                                            <LinkOffIcon />
                                        </IconButton>
                                    </ListItemSecondaryAction>
                                </ListItem>
                                {index < identities.length - 1 && (
                                    <Divider />
                                )}
                            </Box>
                        );
                    })}
                </List>
            )}

            {/* Confirmation Dialog */}
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