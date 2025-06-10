import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Link from "next/link";
import SetTitle from "@/components/SetTitle";
import PlaylistQueue from "@/components/PlaylistManagement/PlaylistQueue";
import PlaylistMembers from "@/components/PlaylistManagement/PlaylistMembers";
import PlaylistSettings from "@/components/PlaylistManagement/PlaylistSettings";
import {
    getCurrentUser,
    getJoinedPlaylists,
    getPlaylistData,
    getPlaylistModerators,
} from "@/utils/actions";
import {
    Box,
    Container,
    Chip,
    CircularProgress,
    Tab,
    Tabs,
    Typography,
    Divider,
} from "@mui/material";
import {
    QueueMusicRounded as QueueIcon,
    PeopleRounded as MembersIcon,
    SettingsRounded as SettingsIcon,
    PlaylistPlayRounded as PlaylistIcon,
    LockRounded as PrivateIcon,
    PublicRounded as PublicIcon,
    LinkRounded as LinkIcon,
} from '@mui/icons-material';
import PlaylistMenu from "@/components/PlaylistManagement/PlaylistMenu";

export default function ManagePlaylist() {
    const router = useRouter();
    const { playlist } = router.query; // Use 'playlist' from the URL
    const playlistId = Array.isArray(playlist) ? playlist[0] : playlist;
    const [playlistData, setPlaylistData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);
    const [activeTab, setActiveTab] = useState(0);

    useEffect(() => {
        const fetchCurrentUser = async () => {
            const user = await getCurrentUser();
            setCurrentUser(user);
        };

        fetchCurrentUser();
    }, []);

    useEffect(() => {
        if (!router.isReady || !playlist) return;

        const fetchPlaylistData = async () => {
            try {
                const data = await getPlaylistData(playlistId);

                if (currentUser && data) {
                    // Check if the current user has joined the playlist
                    const joinedPlaylists = await getJoinedPlaylists(currentUser.id);
                    const joinStatus = joinedPlaylists.includes(data?.id);

                    // Check if the current user is a moderator or host
                    const moderators = await getPlaylistModerators(data?.id);
                    const allowAccess = Object.keys(moderators).includes(currentUser.id) || data.host === currentUser.id;

                    if ((data.is_public === false && data.method === 'id' && !joinStatus) || !allowAccess) {
                        console.warn("You cannot access this playlist right now.");
                        setPlaylistData(null);
                        setLoading(false);
                        return;
                    }
                }

                setPlaylistData(data);
            } catch (error) {
                console.error('Unexpected error:', error);
                setPlaylistData(null);
            } finally {
                setLoading(false);
            }
        };

        fetchPlaylistData();
    }, [currentUser, router.isReady, playlist, playlistId]);

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    if (loading) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '90vh',
                }}
            >
                <CircularProgress />
            </Box>
        );
    }

    if (playlistData === null) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '90vh',
                }}
            >
                <p>Playlist not found</p>
            </Box>
        );
    }

    const isHost = currentUser?.id === playlistData.host; //? Must be here - at the end of all loadings and checks

    return (
        <>
            <SetTitle text={`Manage Playlist - ${playlistData.name}`} />

            {/* Menu */}
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                padding: '1rem 2rem',
            }}>
                <PlaylistMenu playlistId={playlistData.id} />
            </Box>

            <Container maxWidth="md" >
                {/* Playlist Info Section */}
                <Box
                    sx={{
                        maxWidth: 1200,
                        mx: "auto",
                        mb: 4,
                        px: { xs: 1, md: 4 },
                        py: { xs: 2, md: 5 },
                        borderRadius: 4,
                        bgcolor: "background.paper",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                    }}
                >
                    <PlaylistIcon
                        sx={{
                            fontSize: 92,
                            my: 1,
                            color: "primary.main",
                        }}
                    />
                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: "bold",
                            my: 1,
                            textAlign: "center",
                        }}
                    >
                        {playlistData?.name || ""}
                    </Typography>

                    {/* Visibility Chip */}
                    <Box sx={{ my: 2 }}>
                        <Chip
                            icon={playlistData?.is_public ? <PublicIcon /> : <PrivateIcon />}
                            label={playlistData?.is_public ? "Public" : "Private"}
                            color="primary"
                            sx={{
                                fontWeight: "bold",
                                // Make icon smaller for better alignment
                                "& .MuiChip-icon": {
                                    fontSize: 20,
                                },
                                display: "flex",
                                alignItems: "center",
                            }}
                        />
                    </Box>

                    {/* Access URL */}
                    <Box sx={{
                        display: "flex",
                        alignItems: "center",
                        my: 1,
                        gap: 1,
                    }}>
                        <LinkIcon sx={{ color: "text.secondary" }} />
                        <Typography
                            href={playlistData?.url ? playlistData.url : "#"}
                            variant="body2"
                            sx={{
                                wordBreak: "none",
                                fontWeight: 500,
                            }}
                        >
                            <Link href={"/playlist/"+playlistData?.url}>/{playlistData?.url}</Link>
                        </Typography>
                    </Box>

                    {/* Description */}
                    <Typography
                        variant="body1"
                        sx={{
                            my: 1,
                            textAlign: "center",
                            maxWidth: 600,
                            color: "text.secondary",
                        }}
                    >
                        {playlistData?.description || <Typography component="span" sx={{ fontStyle: "italic" }}>No description provided.</Typography>}
                    </Typography>

                    {/* Playlist Stats */}
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            width: "100%",
                            maxWidth: 380,
                            my: 2,
                        }}
                    >
                        <Box sx={{ flex: 1, textAlign: "center" }}>
                            <Typography variant="h5" sx={{ fontWeight: 700 }}>
                                {playlistData?.userCount || 0}
                            </Typography>
                            <Typography
                                variant="body2"
                                sx={{ mt: 0.5, fontWeight: 500 }}
                            >
                                Members
                            </Typography>
                        </Box>
                        <Divider
                            orientation="vertical"
                            flexItem
                            sx={{
                                width: 10,
                            }}
                        />
                        <Box sx={{ flex: 1, textAlign: "center" }}>
                            <Typography variant="h5" sx={{ fontWeight: 700 }}>
                                {playlistData?.songCount || 0}
                            </Typography>
                            <Typography
                                variant="body2"
                                sx={{ mt: 0.5, fontWeight: 500 }}
                            >
                                Songs
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                {/* Tabs Section */}
                <Box
                    sx={{
                        maxWidth: 900,
                        mx: "auto",
                        bgcolor: "background.paper",
                        borderRadius: 3,
                        boxShadow: 2,
                        overflow: "hidden",
                    }}
                >
                    <Tabs
                        value={activeTab}
                        onChange={handleTabChange}
                        variant="fullWidth"
                        textColor="inherit"
                        TabIndicatorProps={{ style: { height: 3 } }}
                        sx={{
                            "& .MuiTab-root": {
                                fontWeight: "bold",
                                fontSize: 16,
                                textTransform: "none",
                                py: 2,
                            },
                            "& .Mui-selected": {
                                color: "primary.main",
                            },
                        }}
                    >
                        <Tab icon={<QueueIcon />} label="Queue" />
                        <Tab icon={<MembersIcon />} label="Members" />
                        {isHost && <Tab icon={<SettingsIcon />} label="Settings" />}
                    </Tabs>

                    <Box sx={{ p: 3, width: "100%" }}>
                        {activeTab === 0 && (
                            <PlaylistQueue
                                playlistId={playlistData.id}
                            />
                        )}
                        {activeTab === 1 && (
                            <PlaylistMembers
                                playlistId={playlistData.id}
                            />
                        )}
                        {activeTab === 2 && isHost && (
                            <PlaylistSettings
                                playlistId={playlistData.id}
                            />
                        )}
                    </Box>
                </Box>
            </Container>
        </>
    )
}