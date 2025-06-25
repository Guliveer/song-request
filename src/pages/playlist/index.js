"use client"

import { useState, useEffect } from "react"
import {
    Container,
    Typography,
    Grid,
    Card,
    CardContent,
    CardActions,
    Button,
    CircularProgress,
    Alert,
    Box,
    Chip,
    Avatar,
} from "@mui/material"
import {
    PlaylistPlayRounded as PlaylistIcon,
    PublicRounded as GlobeIcon,
    StarRounded as HostIcon,
    GroupRounded as MembersIcon,
} from "@mui/icons-material"
import { supabase } from "@/lib/supabase"
import SetTitle from "@/components/SetTitle";
import Link from "next/link";

export default function PlaylistsPage() {
    const [playlists, setPlaylists] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchPlaylists = async () => {
            try {
                setLoading(true)
                setError(null)

                const { data, error } = await supabase
                    .from("playlists")
                    .select("*, users(id, username)")
                    .eq("is_public", true)
                    .order("name", { ascending: true });

                if (error) {
                    throw error
                }

                // Add users count to each playlist (count playlist's id in users.playlists[] field)
                if (data) {
                    const playlistsWithUserCount = await Promise.all(data.map(async (playlist) => {
                        const { count } = await supabase
                            .from("users")
                            .select("id", { count: "exact" })
                            .contains("playlists", [playlist.id])
                        return {
                            ...playlist,
                            userCount: count || 0, // Default to 0 if count is null
                        }
                    }))
                    setPlaylists(playlistsWithUserCount)
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : "An error occurred while loading playlists")
            } finally {
                setLoading(false)
            }
        };

        fetchPlaylists();
    }, [])

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
                    <CircularProgress size={60} />
                </Box>
            </Container>
        )
    }

    if (error) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            </Container>
        )
    }

    return (
        <>
        <SetTitle text={`Public Playlists`} />
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ mb: 4, textAlign: "center" }}>
                <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: "bold" }}>
                    Public Playlists
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                    Discover the best playlists shared by our community
                </Typography>
                <Chip icon={<GlobeIcon />} label={`${playlists.length} public playlists`}
                    color="primary"
                    variant="outlined"
                    sx={{
                        // Make icon smaller for better alignment
                        "& .MuiChip-icon": {
                            fontSize: 20,
                        },
                    }}
                />
            </Box>

            {playlists.length === 0 && (
                <Box textAlign="center" py={8}>
                    <PlaylistIcon sx={{ fontSize: 80, color: "text.secondary", mb: 2 }} />
                    <Typography variant="h5" color="text.secondary" gutterBottom>
                        No Public Playlists
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        No public playlists found in the database.
                    </Typography>
                </Box>
            )}

            {playlists.length > 0 && (
                <Box
                    sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 3,
                        justifyContent: "center",
                    }}
                >
                    {playlists.map((playlist) => (
                        <Box
                            key={playlist.id}
                            sx={{
                                flex: "1 1 300px", // Minimum width of 300px, adjusts based on available space
                                maxWidth: "400px", // Optional: limit maximum width
                                display: "flex",
                                flexDirection: "column",
                                transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
                                "&:hover": {
                                    transform: "translateY(-4px)",
                                    boxShadow: 4,
                                },
                            }}
                        >
                            <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Box display="flex" alignItems="center" mb={2}>
                                        <Avatar sx={{ bgcolor: "primary.main", mr: 2 }}>
                                            <PlaylistIcon />
                                        </Avatar>
                                        <Box>
                                            {/* Name */}
                                            <Typography variant="h6" component="h2" noWrap>
                                                {playlist.name}
                                            </Typography>
                                            {/* Description */}
                                            {playlist.description && (
                                                <Typography variant="body2" color="text.secondary" noWrap>
                                                    {playlist.description}
                                                </Typography>
                                            )}
                                        </Box>
                                    </Box>

                                    <Box display="flex" alignItems="center" mb={1}>
                                        <HostIcon sx={{ fontSize: 16, mr: 0.5, color: "text.secondary" }} />
                                        <Typography variant="caption" color="text.secondary" sx={{fontWeight: "bold"}}>
                                            <Link href={`/user/${playlist.users.username}`}>
                                                @{playlist.users.username}
                                            </Link>
                                        </Typography>
                                    </Box>

                                    <Box display="flex" alignItems="center" mb={1}>
                                        <MembersIcon sx={{ fontSize: 16, mr: 0.5, color: "text.secondary" }} />
                                        <Typography variant="caption" color="text.secondary">
                                            {playlist.userCount} members
                                        </Typography>
                                    </Box>
                                </CardContent>

                                <CardActions sx={{ p: 2, pt: 0, width: "100%" }}>
                                    <Link href={`/playlist/${playlist.url}`} passHref sx={{
                                        width: "100%",
                                    }}>
                                        <Button size="small" variant="outlined" fullWidth sx={{
                                            width: "100%",
                                        }}>
                                            View Playlist
                                        </Button>
                                    </Link>
                                </CardActions>
                            </Card>
                        </Box>
                    ))}
                </Box>
            )}
        </Container>
        </>
    )
}
