import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import {
    Box,
    Typography,
    Card,
    CardContent,
    Avatar,
    Chip,
    CircularProgress,
    Tooltip,
    Stack,
    Divider,
    Button,
} from "@mui/material";
import {
    InfoOutlined as InfoIcon,
    QueueMusicRounded as SongsIcon,
    GroupRounded as UsersIcon,
    StarRounded as HostIcon,
    Person as PersonIcon,
    ArrowBack as BackIcon,
} from "@mui/icons-material";
import {
    getPlaylistData,
    getUserInfo,
    getCurrentUser,
    getFriendsOnPlaylist,
    genUserAvatar,
    getJoinedPlaylists
} from "@/utils/actions";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import SetTitle from "@/components/SetTitle";
import PlaylistMenu from "@/components/PlaylistManagement/PlaylistMenu";

export default function PlaylistInfo() {
    const router = useRouter();
    const { playlist } = router.query;
    const [playlistData, setPlaylistData] = useState(null);
    const [hostData, setHostData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [friends, setFriends] = useState([]);
    const [hostAvatarUrl, setHostAvatarUrl] = useState(null);
    const [friendAvatars, setFriendAvatars] = useState({});
    const [currentUser, setCurrentUser] = useState(null);
    const [joinStatus, setJoinStatus] = useState(null);
    const [isAllowed, setIsAllowed] = useState(false);

    useEffect(() => {
        const fetchCurrentUser = async () => {
            const user = await getCurrentUser();
            setCurrentUser(user);
        };

        fetchCurrentUser();
    }, []);

    // Funkcje nawigacji
    const navigateToPlaylist = () => {
        if (playlistData?.id) {
            router.push(`/playlist/${playlist}`);
        }
    };

    const goBack = () => {
        if (playlistData?.id) {
            router.push(`/playlist/${playlist}`);
        }
    };

    useEffect(() => {
        const fetchAll = async () => {
            if (!router.isReady || !playlist) return;
            setLoading(true);

            try {
                // Pobierz dane playlisty
                const data = await getPlaylistData(playlist);
                setPlaylistData(data);

                // Sprawdź czy użytkownik dołączył
                if (data?.id && currentUser) {
                    const joinedPlaylists = await getJoinedPlaylists(currentUser.id);
                    const joinStatus = joinedPlaylists.includes(data.id);
                    setJoinStatus(joinStatus);
                } else {
                    setJoinStatus(false);
                }

                // Pobierz dane hosta i avatar
                if (data?.host) {
                    const hostInfo = await getUserInfo(data.host);
                    setHostData(hostInfo);
                    // Generuj avatar hosta
                    if (hostInfo?.avatar_url) {
                        setHostAvatarUrl(hostInfo.avatar_url);
                    } else {
                        const avatarUrl = await genUserAvatar(data.host);
                        setHostAvatarUrl(avatarUrl);
                    }
                }

                setIsAllowed(data?.host || joinStatus || data.is_public);

                // Pobierz znajomych, którzy mają tę playlistę
                const user = await getCurrentUser();
                if (user && data?.id) {
                    const friendsOnPlaylist = await getFriendsOnPlaylist(user.id, data.id);
                    const friendsOnPlaylistFiltered = friendsOnPlaylist.filter(friend => friend.id !== user.id);
                    setFriends(friendsOnPlaylistFiltered);

                    // Generuj awatary dla znajomych
                    const avatars = {};
                    for (const friend of friendsOnPlaylist) {
                        if (friend.avatar_url) {
                            avatars[friend.id] = friend.avatar_url;
                        } else {
                            avatars[friend.id] = await genUserAvatar(friend.id);
                        }
                    }
                    setFriendAvatars(avatars);
                } else {
                    setFriends([]);
                }
            } catch (error) {
                console.error("Error fetching playlist data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, [router.isReady, playlist]);

    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!isAllowed || !playlistData) {
        return (
            <Typography color="error" sx={{ mt: 6, textAlign: "center" }}>
                Playlist not found.
            </Typography>
        );
    }

    const createdAt = playlistData.created_at
        ? format(new Date(playlistData.created_at), "MMMM d, yyyy, HH:mm", { locale: enUS })
        : "unknown";

    return (
        <>
            <SetTitle>{playlistData.name}</SetTitle>

            {/* Menu */}
            <Box sx={{
                display: 'flex',
                width: "100%",
                alignItems: 'center',
                justifyContent: 'flex-end',
                padding: '1rem 2rem',
            }}>
                <PlaylistMenu playlistId={playlistData.id} />
            </Box>

            <Box sx={{ py: 6, display: "flex", justifyContent: "center" }}>
                <Card sx={{
                    width: "100%",
                    maxWidth: 400,
                    mx: "auto",
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: 2,
                    boxShadow: 4,
                    bgcolor: "background.paper",
                }}>
                    <CardContent sx={{ pb: 2 }}>
                        {/* Przycisk powrotu */}
                        <Box sx={{ mb: 2 }}>
                            <Button
                                startIcon={<BackIcon />}
                                onClick={goBack}
                                variant="text"
                                size="small"
                                sx={{ textTransform: 'none' }}
                            >
                                Back
                            </Button>
                        </Box>

                        <Box display="flex" alignItems="center" mb={2}>
                            <Avatar sx={{ bgcolor: "primary.main", mr: 2 }}>
                                <InfoIcon />
                            </Avatar>
                            <Box sx={{ cursor: 'pointer' }} onClick={navigateToPlaylist}>
                                <Typography variant="h6" component="h2" sx={{
                                    fontWeight: "bold",
                                    '&:hover': { color: 'primary.main' }
                                }} noWrap>
                                    {playlistData.name}
                                </Typography>
                                {playlistData.description && (
                                    <Typography variant="body2" color="text.secondary">
                                        {playlistData.description}
                                    </Typography>
                                )}
                            </Box>
                        </Box>

                        <Box display="flex" alignItems="center" mb={1}>
                            {hostData && (
                                <>
                                    <Avatar
                                        src={hostAvatarUrl}
                                        sx={{
                                            width: 24,
                                            height: 24,
                                            mr: 1,
                                            bgcolor: hostData.color || "primary.main",
                                            fontSize: 14,
                                        }}
                                    >
                                        {hostData.emoji || hostData.username[0]?.toUpperCase()}
                                    </Avatar>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: "bold", mr: 1 }}>
                                        @{hostData.username}
                                    </Typography>
                                </>
                            )}
                            <Chip
                                icon={<HostIcon sx={{ fontSize: 18, color: "text.secondary" }} />}
                                label="Host"
                                color="secondary"
                                size="small"
                                sx={{ fontWeight: 700, height: 24, fontSize: 13 }}
                            />
                        </Box>

                        <Box display="flex" alignItems="center" mb={1}>
                            <Typography variant="caption" color="text.secondary">
                                Created: {createdAt}
                            </Typography>
                        </Box>

                        <Box display="flex" gap={1.5} mb={2}>
                            <Chip
                                icon={<SongsIcon />}
                                label={`Songs: ${playlistData.songCount ?? 0}`}
                                color="primary"
                                variant="outlined"
                                sx={{
                                    fontWeight: 600,
                                    fontSize: "0.98rem",
                                    px: 1.5,
                                    height: 30,
                                    "& .MuiChip-icon": { fontSize: 20 },
                                }}
                            />
                            <Chip
                                icon={<UsersIcon />}
                                label={`Members: ${playlistData.userCount ?? 0}`}
                                color="secondary"
                                variant="outlined"
                                sx={{
                                    fontWeight: 600,
                                    fontSize: "0.98rem",
                                    px: 1.5,
                                    height: 30,
                                    "& .MuiChip-icon": { fontSize: 20 },
                                }}
                            />
                        </Box>

                        <Divider sx={{ my: 2 }} />

                        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700, color: "text.primary" }}>
                            Friends who joined this playlist
                        </Typography>
                        {friends.length > 0 ? (
                            <Stack direction="row" spacing={1}>
                                {friends.map(friend => (
                                    <Tooltip key={friend.id} title={`@${friend.username}`}>
                                        <Avatar
                                            src={friendAvatars[friend.id]}
                                            sx={{
                                                bgcolor: friend.color || "primary.main",
                                                fontSize: 16,
                                                width: 28,
                                                height: 28,
                                                border: "2px solid #87e5dd",
                                                boxShadow: "0 2px 8px 0 rgba(135,229,221,0.12)",
                                                transition: "transform 0.2s",
                                                "&:hover": { transform: "scale(1.13)" }
                                            }}
                                        >
                                            {friend.emoji || friend.username[0]?.toUpperCase() || <PersonIcon />}
                                        </Avatar>
                                    </Tooltip>
                                ))}
                            </Stack>
                        ) : (
                            <Typography variant="body2" color="text.secondary">
                                None of your friends have joined this playlist yet.
                            </Typography>
                        )}

                        {/* Przycisk do playlisty */}
                        <Box sx={{ mt: 3 }}>
                            <Button
                                variant="contained"
                                fullWidth
                                onClick={navigateToPlaylist}
                                sx={{ textTransform: 'none' }}
                            >
                                View Playlist
                            </Button>
                        </Box>
                    </CardContent>
                </Card>
            </Box>
        </>
    );
}
