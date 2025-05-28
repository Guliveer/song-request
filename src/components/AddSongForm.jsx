import { useState, useEffect, useRef } from 'react';
import {
    Box, Button, Dialog, DialogTitle, DialogContent,
    Fab, Tooltip, Stack, useTheme, CircularProgress, Typography
} from '@mui/material';
import {
    AddRounded as AddIcon,
    PlaylistAddRounded as FormIcon,
    SendRounded as SendIcon,
    BlockRounded as BlockIcon,
    DoneRounded as SuccessIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/router';
import { playSound } from '@/utils/actions';
import { keyframes } from '@mui/system';
import { supabase } from '@/utils/supabase';
import { useUser } from "@/context/UserContext";
import { FormField } from "@/components/Items";
import { extractVideoId, fetchYouTubeMetadata } from "@/utils/youtube";
import {extractSpotifyTrackId, fetchSpotifyMetadata} from "@/utils/spotify";

export default function AddSongForm() {
    const theme = useTheme();
    const router = useRouter();
    const { isLoggedIn } = useUser();
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({ url: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [user, setUser] = useState(null);
    const [existingSong, setExistingSong] = useState(null);
    const [fabBottom, setFabBottom] = useState(24); // default MUI
    const fabRef = useRef();

    // FAB "przykleja się" do rogu, a jak footer wchodzi w dolny obszar, zatrzymuje się nad nim
    useEffect(() => {
        function updateFab() {
            const footer = document.getElementById('site-footer');
            const fab = fabRef.current;
            if (!footer || !fab) return;

            const idealBottom = 24; // MUI default
            const fabHeight = fab.offsetHeight || 56; // fallback for default size

            // Footer pozycja względem viewport
            const footerRect = footer.getBoundingClientRect();
            const windowHeight = window.innerHeight;

            // Gdy footer "wchodzi" w dolny margines (FAB zachodziłby na footer), to...
            let newFabBottom = idealBottom;
            if (footerRect.top < windowHeight - idealBottom) {
                // Odległość od dołu okna do górnej krawędzi footer
                const overlap = windowHeight - footerRect.top;
                // FAB przesuwamy tylko tyle, by był tuż nad footer + margines
                newFabBottom = overlap + idealBottom;
            }
            setFabBottom(newFabBottom);
        }

        updateFab();
        window.addEventListener('scroll', updateFab, { passive: true });
        window.addEventListener('resize', updateFab);
        return () => {
            window.removeEventListener('scroll', updateFab);
            window.removeEventListener('resize', updateFab);
        };
    }, []);

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };

        fetchUser();

        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user || null);
        });

        return () => {
            listener.subscription.unsubscribe();
        };
    }, []);

    const handleChange = (event) => {
        const { id, value } = event.target;
        setFormData((prev) => ({
            ...prev,
            [id]: value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!user) {
            alert("You must be logged in to add a song.");
            return;
        }

        // Check ban status
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('ban_status')
            .eq('id', user.id)
            .single();

        if (userError) {
            alert('Error checking account status.');
            return;
        }

        if (userData.ban_status > 0) {
            alert('You cannot add songs because your account is banned.');
            return;
        }

        // Check if URL is banned
        const { data: bannedUrl } = await supabase
            .from('banned_url')
            .select('id')
            .eq('url', formData.url)
            .maybeSingle();

        if (bannedUrl) {
            alert("This link is banned and cannot be added to the queue.");
            return;
        }

        // Check if the song already exists
        const { data: existing, error: existingError } = await supabase
            .from('queue')
            .select('id, title, author')
            .eq('url', formData.url)
            .maybeSingle();

        if (existingError) {
            alert('Error checking for existing song.');
            return;
        }

        if (existing) {
            setExistingSong(existing);
            return;
        }

        setIsSubmitting(true);

        let title = '';
        let author = '';
        const url = formData.url;

        if (url.includes("youtube")) {
            const videoId = extractVideoId(url);
            if (videoId) {
                const metadata = await fetchYouTubeMetadata(videoId);
                if (metadata) {
                    title = metadata.title;
                    author = metadata.author;
                }
            }
        }

        if (url.includes("spotify")) {
            const trackId = extractSpotifyTrackId(url);
            if (trackId) {
                const metadata = await fetchSpotifyMetadata(trackId);
                if (metadata) {
                    title = metadata.title;
                    author = metadata.author;
                }
            }
        }

        const { data, error } = await supabase
            .from('queue')
            .insert([{ title, author, url, user_id: user.id }]);

        if (error) {
            alert('Error while adding the song: ' + error.message);
        } else {
            setSuccess(true);
            setFormData({ url: '' });
            await playSound('success', 0.8);
            setOpen(false);
        }

        setIsSubmitting(false);
        setTimeout(() => setSuccess(false), 1000);
    };

    const fadeInBackground = keyframes`
        from { opacity: 0; background-color: rgba(0, 0, 0, 0);}
        to { opacity: 1; background-color: rgba(0, 0, 0, 0.2);}
    `;

    const fadeOutBackground = keyframes`
        from { opacity: 1; background-color: rgba(0, 0, 0, 0.2);}
        to { opacity: 0; background-color: rgba(0, 0, 0, 0);}
    `;

    return (
        <>
            <Tooltip title="Add song" placement="left">
                <Fab
                    ref={fabRef}
                    color="primary"
                    onClick={() => setOpen(true)}
                    sx={{
                        position: 'fixed',
                        bottom: { xs: fabBottom, sm: fabBottom },
                        right: { xs: 20, sm: 36 },
                        zIndex: 1300,
                        boxShadow: 4,
                        transition: 'bottom 0.3s cubic-bezier(.4,2,.4,1)', // płynne
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
                        borderRadius: 1,
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
                        <FormField
                            required
                            id="url"
                            label="Spotify or YouTube URL"
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
                                <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
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

            {/* Dialog for existing song */}
            {existingSong && (
                <Dialog
                    open={!!existingSong}
                    onClose={() => setExistingSong(null)}
                    fullWidth
                    maxWidth="sm"
                >
                    <DialogTitle>Song Already Exists</DialogTitle>
                    <DialogContent>
                        <Typography>
                            "{existingSong.title}" is already in the queue
                        </Typography>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => {
                                setExistingSong(null);
                                router.push(`/song/${existingSong.id}`);
                            }}
                            sx={{ mt: 2 }}
                        >
                            Go to Song
                        </Button>
                    </DialogContent>
                </Dialog>
            )}
        </>
    );
}