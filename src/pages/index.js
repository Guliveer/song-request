import React from "react"
import {Container, Typography, Button, Grid, Box, Avatar, Stack, Card, CardContent} from "@mui/material"
import HowToVoteIcon from "@mui/icons-material/HowToVoteRounded"
import GroupAddIcon from "@mui/icons-material/GroupAddRounded"
import PlaylistAddCheckIcon from "@mui/icons-material/PlaylistAddCheckRounded"
import EmojiEventsIcon from "@mui/icons-material/EmojiEventsRounded"
import PeopleAltIcon from "@mui/icons-material/PeopleRounded"
import AnimatedBackground from "@/components/AnimatedBackground"
import FadeInSection from "@/components/FadeInSection"

export default function Home() {
    return (
        <>
            <AnimatedBackground/>
            <Box sx={{minHeight: "100vh", position: "relative", zIndex: 1}}>
                {/* HERO */}
                <FadeInSection>
                    <Container maxWidth="md" sx={{textAlign: "center", py: 10}}>
                        <Typography
                            variant="h1"
                            sx={{
                                fontWeight: 900,
                                letterSpacing: "-0.04em",
                                background: "linear-gradient(90deg, #87e5dd 20%, #a171f8 80%)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                mb: 2,
                                fontSize: {xs: "2.5rem", md: "4.2rem"},
                            }}
                        >
                            Track Drop
                        </Typography>
                        <Typography
                            variant="h5"
                            sx={{
                                color: "#e2f2fa",
                                mb: 4,
                                fontWeight: 600,
                                textShadow: "0 2px 8px #181c2a",
                            }}
                        >
                            Vote, discover and share music with friends.<br/>
                            A professional social platform for music fans.
                        </Typography>
                        <Button
                            variant="contained"
                            color="secondary"
                            size="large"
                            href="/register"
                            sx={{
                                px: 6,
                                py: 2,
                                fontWeight: 800,
                                fontSize: "1.2rem",
                                borderRadius: 99,
                                boxShadow: "0 4px 24px #a171f855",
                                color: "#181c2a",
                                "&:hover": {
                                    background: "linear-gradient(90deg, #a171f8 0%, #87e5dd 100%)",
                                    color: "#181c2a",
                                },
                            }}
                        >
                            Get Started
                        </Button>
                    </Container>
                </FadeInSection>

                {/* FEATURES */}
                <Container maxWidth="lg" sx={{mb: 10}}>
                    <FadeInSection>
                        <Grid container spacing={4} justifyContent="center">
                            <Grid item xs={12} md={4}>
                                <Card sx={{
                                    backdropFilter: 'blur(12px)',
                                    background: 'rgba(32,36,58,0.92)',
                                    borderRadius: 6,
                                    boxShadow: '0 8px 32px 0 #87e5dd33',
                                    border: '2px solid #87e5dd',
                                    color: '#e2f2fa'
                                }}>
                                    <CardContent sx={{textAlign: 'center', p: 4}}>
                                        <HowToVoteIcon sx={{fontSize: 54, color: 'primary.main', mb: 1}}/>
                                        <Typography variant="h6" gutterBottom fontWeight={800}>Vote for
                                            Songs</Typography>
                                        <Typography color="text.secondary" sx={{color: '#bdf6f2'}}>
                                            Choose your favorite tracks and help them reach the top of the list.
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Card sx={{
                                    backdropFilter: 'blur(12px)',
                                    background: 'rgba(32,36,58,0.92)',
                                    borderRadius: 6,
                                    boxShadow: '0 8px 32px 0 #a171f833',
                                    border: '2px solid #a171f8',
                                    color: '#e2f2fa'
                                }}>
                                    <CardContent sx={{textAlign: 'center', p: 4}}>
                                        <GroupAddIcon sx={{fontSize: 54, color: 'secondary.main', mb: 1}}/>
                                        <Typography variant="h6" gutterBottom fontWeight={800}>Follow Users</Typography>
                                        <Typography color="text.secondary" sx={{color: '#e2cffa'}}>
                                            Follow your friends and discover what they listen to and vote for.
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Card sx={{
                                    backdropFilter: 'blur(12px)',
                                    background: 'rgba(32,36,58,0.92)',
                                    borderRadius: 6,
                                    boxShadow: '0 8px 32px 0 #87e5dd33',
                                    border: '2px solid #87e5dd',
                                    color: '#e2f2fa'
                                }}>
                                    <CardContent sx={{textAlign: 'center', p: 4}}>
                                        <PlaylistAddCheckIcon sx={{fontSize: 54, color: 'primary.main', mb: 1}}/>
                                        <Typography variant="h6" gutterBottom fontWeight={800}>Private & Public
                                            Playlists</Typography>
                                        <Typography color="text.secondary" sx={{color: '#bdf6f2'}}>
                                            Share playlists publicly or keep them just for yourself.
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                    </FadeInSection>
                </Container>

                {/* TOP SONGS */}
                <FadeInSection>
                    <Container maxWidth="md" sx={{mb: 10}}>
                        <Card sx={{
                            p: 4,
                            borderRadius: 6,
                            background: 'rgba(32,36,58,0.98)',
                            boxShadow: '0 8px 32px 0 #a171f822',
                            mb: 2,
                            border: '2px solid #a171f8'
                        }}>
                            <Stack direction="row" spacing={2} alignItems="center" mb={3} justifyContent="center">
                                <EmojiEventsIcon sx={{fontSize: 44, color: 'warning.main'}}/>
                                <Typography variant="h4" fontWeight={900} sx={{color: '#fff'}}>Top 3 Songs</Typography>
                            </Stack>
                            <Grid container spacing={3} justifyContent="center" alignItems="stretch">
                                {[
                                    {title: 'Blinding Lights', artist: 'The Weeknd', votes: 124},
                                    {title: 'Levitating', artist: 'Dua Lipa', votes: 98},
                                    {title: 'Shape of You', artist: 'Ed Sheeran', votes: 87}
                                ].map((song, idx) => (
                                    <Grid item xs={12} sm={4} key={song.title}>
                                        <Card sx={{
                                            background: 'rgba(135,229,221,0.10)',
                                            borderRadius: 4,
                                            textAlign: 'center',
                                            height: '100%',
                                            border: '2px solid #232526',
                                            color: '#e2f2fa',
                                            boxShadow: 'none'
                                        }}>
                                            <CardContent>
                                                <Typography variant="h6"
                                                            fontWeight={900}>{idx + 1}. {song.title}</Typography>
                                                <Typography color="text.secondary"
                                                            sx={{color: '#bdf6f2'}}>{song.artist}</Typography>
                                                <Typography color="secondary" fontWeight={800}
                                                            sx={{color: '#a171f8'}}>{song.votes} votes</Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        </Card>
                    </Container>
                </FadeInSection>

                {/* FRIENDS ACTIVITY */}
                <FadeInSection>
                    <Container maxWidth="md" sx={{pb: 10}}>
                        <Card sx={{
                            p: 4,
                            borderRadius: 6,
                            background: 'rgba(32,36,58,0.98)',
                            boxShadow: '0 8px 32px 0 #87e5dd22',
                            border: '2px solid #87e5dd'
                        }}>
                            <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                                <PeopleAltIcon sx={{fontSize: 40, color: 'primary.main'}}/>
                                <Typography variant="h5" fontWeight={900} sx={{color: '#fff'}}>Friends
                                    Activity</Typography>
                            </Stack>
                            <Stack spacing={2}>
                                {[
                                    {name: 'Anna', song: 'Blinding Lights', avatar: '/avatars/user1.png'},
                                    {name: 'Mike', song: 'Levitating', avatar: '/avatars/user2.png'},
                                    {name: 'Sara', song: 'Shape of You', avatar: '/avatars/user3.png'}
                                ].map(user => (
                                    <Stack direction="row" spacing={2} alignItems="center" key={user.name}>
                                        <Avatar src={user.avatar}
                                                sx={{width: 48, height: 48, border: '2px solid #a171f8'}}/>
                                        <Box>
                                            <Typography fontWeight={800}
                                                        sx={{color: '#e2f2fa'}}>{user.name}</Typography>
                                            <Typography color="text.secondary" fontSize="1rem" sx={{color: '#bdf6f2'}}>
                                                Voted for: <b style={{color: '#a171f8'}}>{user.song}</b>
                                            </Typography>
                                        </Box>
                                    </Stack>
                                ))}
                            </Stack>
                        </Card>
                    </Container>
                </FadeInSection>
            </Box>
        </>
    )
}