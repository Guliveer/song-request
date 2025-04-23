import { supabase } from "@/utils/supabase";
import { useEffect, useState } from "react";
import {
    Button, Dialog, DialogActions, DialogTitle,
    Divider,
    List,
    ListItem,
    ListItemSecondaryAction,
    ListItemText,
    Paper,
    Stack,
    Typography
} from "@mui/material";
import EmailIcon from '@mui/icons-material/Email';
import GoogleIcon from '@mui/icons-material/Google';
import FacebookIcon from '@mui/icons-material/Facebook';
import GitHubIcon from '@mui/icons-material/GitHub';
import MusicNoteIcon from '@mui/icons-material/MusicNote';

export default function Providers() {
    // Definiowanie stanów
    const [identities, setIdentities] = useState([]);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [identityToUnlink, setIdentityToUnlink] = useState(null);

    // Ikony dostawców
    const providerIcons = {
        email: <EmailIcon fontSize="small" sx={{ mr: 1 }} />,
        google: <GoogleIcon fontSize="small" sx={{ mr: 1 }} />,
        facebook: <FacebookIcon fontSize="small" sx={{ mr: 1 }} />,
        github: <GitHubIcon fontSize="small" sx={{ mr: 1 }} />,
        spotify: <MusicNoteIcon fontSize="small" sx={{ mr: 1 }} />,
    };

    // Pobieranie identyfikatorów użytkownika z Supabase
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
            <Paper sx={{ p: 2, mb: 3, width: "40%", borderRadius: 4}}>
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
                                                    {providerIcons[id.provider] || <span>Unknown Provider</span>} {/* Default text for unknown provider */}
                                                    {id.provider}
                                                </Stack>
                                            }
                                            secondary={id.provider === "email" ? `Confirmed: ${isEmailVerified ? "yes" : "no"}` : undefined}
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

                {/* Potwierdzenie unlinkingu */}
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
                            color="primary"
                            autoFocus
                        >
                            Confirm
                        </Button>
                    </DialogActions>
                </Dialog>
            </Paper>
        </>
    );
}
