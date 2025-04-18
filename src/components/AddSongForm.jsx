import { useState } from 'react';
import {
    Box, Button, Dialog, DialogTitle, DialogContent,
    Fab, Tooltip, Stack, useTheme, CircularProgress
} from '@mui/material';
import {
    AddRounded as AddIcon,
    PlaylistAddRounded as FormIcon,
    SendRounded as SendIcon,
    BlockRounded as BlockIcon,
    DoneRounded as SuccessIcon,
} from '@mui/icons-material';
import { playSound } from '@/utils/actions'
import { keyframes } from '@mui/system';
import { supabase } from '@/utils/supabase';
import { useUser } from "@/context/UserContext";
import { FormField } from "@/components/Items";

export default function AddSongForm() {
    const theme = useTheme();
    const { isLoggedIn } = useUser(); // Use the global user state
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({ title: '', author: '', url: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleChange = (event) => {
        const { id, value } = event.target;
        setFormData((prev) => ({
            ...prev,
            [id]: value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!isLoggedIn) return;
        setIsSubmitting(true);

        const { data, error } = await supabase
            .from('queue')
            .insert([{ ...formData }]);

        if (error) {
            console.error('Error:', error.message);
        } else {
            setSuccess(true);
            setIsSubmitting(false);
            setFormData({ title: '', author: '', url: '' });
            await playSound('success', 0.8);
            setOpen(false);
        }

        setIsSubmitting(false);
        setSuccess(false);
    };

    const fadeInBackground = keyframes`
        from {
            opacity: 0;
            background-color: rgba(0, 0, 0, 0);
        }
        to {
            opacity: 1;
            background-color: rgba(0, 0, 0, 0.2);
        }
    `;

    const fadeOutBackground = keyframes`
        from {
            opacity: 1;
            background-color: rgba(0, 0, 0, 0.2);
        }
        to {
            opacity: 0;
            background-color: rgba(0, 0, 0, 0);
        }
    `;

    return (
        <>
            <Tooltip title="Add song" placement="left">
                <Fab
                    color="primary"
                    onClick={() => setOpen(true)}
                    sx={{
                        position: 'fixed',
                        bottom: 24,
                        right: 24,
                        zIndex: 1300,
                        boxShadow: 6,
                        '&:hover': {
                            backgroundColor: theme.palette.primary.dark,
                        },
                    }}
                >
                    <AddIcon />
                </Fab>
            </Tooltip>

            <Dialog
                open={open}
                onClose={() => setOpen(false)}
                fullWidth
                maxWidth="sm"
                sx={{
                    backdropFilter: 'blur(6px)',
                    animation: `${open ? fadeInBackground : fadeOutBackground} 0.3s ease-in-out`,
                    backgroundColor: 'rgba(0,0,0,0.2)',
                    '& .MuiDialog-paper': {
                        borderRadius: 4,
                        p: 2,
                        position: 'relative',
                        boxShadow: theme.shadows[12],
                        backdropFilter: 'blur(16px)',
                    },
                }}
            >
                <DialogTitle
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        color: theme.palette.primary.main,
                        fontWeight: 'bold',
                    }}
                >
                    <FormIcon color="primary" />
                    Add Song to Queue
                </DialogTitle>

                <DialogContent>
                    <Box
                        component="form"
                        onSubmit={handleSubmit}
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 2,
                            mt: 1,
                        }}
                    >
                        <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                            <FormField
                                required
                                id="title"
                                label="Title"
                                fullWidth
                                disabled={!isLoggedIn}
                                value={formData.title}
                                onChange={handleChange}
                            />
                            <FormField
                                required
                                id="author"
                                label="Author"
                                fullWidth
                                disabled={!isLoggedIn}
                                value={formData.author}
                                onChange={handleChange}
                            />
                        </Box>

                        <FormField
                            required
                            id="url"
                            label="URL"
                            fullWidth
                            disabled={!isLoggedIn}
                            value={formData.url}
                            onChange={handleChange}
                        />

                        <Stack direction="row" justifyContent="center" mt={1}>
                            <Tooltip
                                title={!isLoggedIn ? "You must be logged in to add a song." : ""}
                                arrow
                                placement="top"
                            >
                                {/* Box is required for tooltip to work */}
                                <Box sx={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    width: '100%',
                                }}>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        color="primary"
                                        disabled={!isLoggedIn || isSubmitting}
                                        startIcon={
                                            success ? <SuccessIcon /> :
                                            (!isLoggedIn ? <BlockIcon /> :
                                            (!isSubmitting ? <SendIcon /> : null))
                                        }
                                        sx={{
                                            minWidth: '50%',
                                            py: 1,
                                            px: 2,
                                            fontWeight: 600,
                                            boxShadow: 4,
                                            textTransform: 'none',
                                        }}
                                    >
                                        {success ? "Done!" :
                                        (isSubmitting ? <CircularProgress size={24} /> :
                                        (isLoggedIn ? "Add to Queue" : "Login Required"))}
                                    </Button>
                                </Box>
                            </Tooltip>
                        </Stack>
                    </Box>
                </DialogContent>
            </Dialog>
        </>
    );
}