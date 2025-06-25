'use client';
import {useEffect, useState} from 'react';
import {supabase} from '@/lib/supabase';
import {sortSongs} from '@/lib/actions';
import {
    Box, Typography, Paper, Grid, useMediaQuery,
    useTheme, CircularProgress, Skeleton
} from '@mui/material';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import StarIcon from '@mui/icons-material/Star';
import AlbumIcon from '@mui/icons-material/Album';
import PropTypes from "prop-types";

export default function TopSongsOlympicPodium({playlist}) {
    const [topSongs, setTopSongs] = useState([]);
    const [loading, setLoading] = useState(true);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'), { noSsr: true });
    const [mounted, setMounted] = useState(false);
    const [isHydrated, setIsHydrated] = useState(false);
    const isMobileScreen = useMediaQuery(theme.breakpoints.down('md'), { noSsr: true });

    // Dodajemy stany dla kryteriów sortowania - domyślnie score/desc
    const [sortCriteria, setSortCriteria] = useState('score');
    const [sortOrder, setSortOrder] = useState('desc');

    // Pobierz dane z Supabase
    useEffect(() => {
        async function fetchTopSongs() {
            try {
                const {data, error} = await supabase
                    .from('queue')
                    .select('id, title, author, added_at, score, user_id')
                    .eq('playlist', playlist)
                    .order(sortCriteria, {ascending: sortOrder === 'asc'})
                    .limit(3);

                if (error) throw error;

                // Używamy funkcji sortSongs do ostatecznego sortowania
                const sortedData = sortSongs(data, sortCriteria, sortOrder);

                const formattedSongs = sortedData.map((song, index) => ({
                    id: song.id,
                    position: index + 1,
                    title: song.title,
                    author: song.author,
                    date: new Date(song.added_at).toLocaleString(),
                    votes: song.score
                }));

                setTopSongs(formattedSongs);
            } catch (error) {
                console.error('Error fetching songs:', error);
                setTopSongs([]);
            } finally {
                setLoading(false);
            }
        }

        fetchTopSongs();
        setMounted(true);
    }, [sortCriteria, sortOrder]);

    const showMobileLayout = mounted ? isMobile : false; // domyślnie używamy layoutu desktopowego
    // Sort songs by position
    const sortedSongs = [...topSongs].sort((a, b) => a.position - b.position);

    if (loading) return (
        <Box sx={{
            width: '100%',
            px: {xs: 1, md: 2}
        }}>
            <Paper sx={{
                position: 'relative',
                overflow: 'hidden',
                background: 'linear-gradient(to bottom, rgba(20, 184, 166, 0.2), rgba(20, 184, 166, 0.05))',
                borderRadius: 2,
                p: 3
            }}>
                {/* Title skeleton */}
                <Box sx={{
                    position: 'relative',
                    textAlign: 'center',
                    mb: 4,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 1
                }}>
                    <Skeleton variant="circular" width={32} height={32} sx={{bgcolor: 'rgba(250, 204, 21, 0.2)'}}/>
                    <Skeleton variant="text" width={180} height={40} sx={{bgcolor: 'rgba(255, 255, 255, 0.1)'}}/>
                </Box>

                {showMobileLayout ? (
                    // Mobile skeleton
                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                        px: 1,
                        pb: 3
                    }}>
                        {[1, 2, 3].map((position) => (
                            <Box key={position} sx={{
                                p: 2,
                                borderRadius: 2,
                                bgcolor: `rgba(255, 255, 255, ${0.1 - position * 0.02})`,
                                display: 'flex',
                                gap: 1.5,
                                transform: `scale(${1 - (position - 1) * 0.05})`,
                                transformOrigin: 'center top'
                            }}>
                                <Skeleton variant="rounded" width={64} height={64}
                                          sx={{bgcolor: 'rgba(255, 255, 255, 0.05)', flexShrink: 0}}/>
                                <Box sx={{width: '100%'}}>
                                    <Box sx={{display: 'flex', alignItems: 'center', gap: 1, mb: 0.5}}>
                                        <Skeleton variant="circular" width={20} height={20}
                                                  sx={{bgcolor: 'rgba(255, 255, 255, 0.05)'}}/>
                                        <Skeleton variant="text" width="70%" height={24}
                                                  sx={{bgcolor: 'rgba(255, 255, 255, 0.05)'}}/>
                                    </Box>
                                    <Box sx={{display: 'flex', alignItems: 'center', gap: 0.5, mb: 1}}>
                                        <Skeleton variant="circular" width={14} height={14}
                                                  sx={{bgcolor: 'rgba(255, 255, 255, 0.05)'}}/>
                                        <Skeleton variant="text" width="50%" height={18}
                                                  sx={{bgcolor: 'rgba(255, 255, 255, 0.05)'}}/>
                                    </Box>
                                    <Skeleton variant="rounded" width={80} height={24}
                                              sx={{bgcolor: 'rgba(255, 255, 255, 0.05)'}}/>
                                </Box>
                            </Box>
                        ))}
                    </Box>
                ) : (
                    // Desktop skeleton - podium
                    <Box sx={{
                        position: 'relative',
                        height: 360,
                        mx: 'auto',
                        maxWidth: '3xl'
                    }}>
                        <Grid container justifyContent="center" alignItems="flex-end">
                            {/* Second Place Skeleton */}
                            <Grid item xs={4} sx={{height: 296}}>
                                <Box sx={{
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column'
                                }}>
                                    <Box sx={{
                                        flex: 1,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'flex-end',
                                        pb: 1
                                    }}>
                                        <Skeleton variant="circular" width={64} height={64}
                                                  sx={{bgcolor: 'rgba(209, 213, 219, 0.2)', mb: 1}}/>
                                        <Skeleton variant="text" width={120} height={24}
                                                  sx={{bgcolor: 'rgba(255, 255, 255, 0.1)'}}/>
                                        <Skeleton variant="text" width={100} height={16}
                                                  sx={{bgcolor: 'rgba(255, 255, 255, 0.1)', mt: 0.5}}/>
                                        <Skeleton variant="rounded" width={80} height={24}
                                                  sx={{bgcolor: 'rgba(255, 255, 255, 0.1)', mt: 1, borderRadius: 10}}/>
                                    </Box>
                                    <Skeleton variant="rectangular" height={176} sx={{
                                        bgcolor: 'rgba(107, 114, 128, 0.2)',
                                        borderRadius: '8px 8px 0 0'
                                    }}/>
                                </Box>
                            </Grid>

                            {/* First Place Skeleton */}
                            <Grid item xs={4} sx={{height: 360, zIndex: 10}}>
                                <Box sx={{
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column'
                                }}>
                                    <Box sx={{
                                        flex: 1,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'flex-end',
                                        pb: 1
                                    }}>
                                        <Skeleton variant="circular" width={80} height={80}
                                                  sx={{bgcolor: 'rgba(250, 204, 21, 0.2)', mb: 1}}/>
                                        <Skeleton variant="text" width={140} height={32}
                                                  sx={{bgcolor: 'rgba(255, 255, 255, 0.1)'}}/>
                                        <Skeleton variant="text" width={120} height={20}
                                                  sx={{bgcolor: 'rgba(255, 255, 255, 0.1)', mt: 0.5}}/>
                                        <Skeleton variant="rounded" width={100} height={30}
                                                  sx={{bgcolor: 'rgba(255, 255, 255, 0.1)', mt: 1, borderRadius: 10}}/>
                                    </Box>
                                    <Skeleton variant="rectangular" height={240} sx={{
                                        bgcolor: 'rgba(234, 179, 8, 0.2)',
                                        borderRadius: '8px 8px 0 0'
                                    }}/>
                                </Box>
                            </Grid>

                            {/* Third Place Skeleton */}
                            <Grid item xs={4} sx={{height: 240}}>
                                <Box sx={{
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column'
                                }}>
                                    <Box sx={{
                                        flex: 1,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'flex-end',
                                        pb: 1
                                    }}>
                                        <Skeleton variant="circular" width={64} height={64}
                                                  sx={{bgcolor: 'rgba(180, 83, 9, 0.2)', mb: 1}}/>
                                        <Skeleton variant="text" width={120} height={24}
                                                  sx={{bgcolor: 'rgba(255, 255, 255, 0.1)'}}/>
                                        <Skeleton variant="text" width={100} height={16}
                                                  sx={{bgcolor: 'rgba(255, 255, 255, 0.1)', mt: 0.5}}/>
                                        <Skeleton variant="rounded" width={80} height={24}
                                                  sx={{bgcolor: 'rgba(255, 255, 255, 0.1)', mt: 1, borderRadius: 10}}/>
                                    </Box>
                                    <Skeleton variant="rectangular" height={120} sx={{
                                        bgcolor: 'rgba(180, 83, 9, 0.2)',
                                        borderRadius: '8px 8px 0 0'
                                    }}/>
                                </Box>
                            </Grid>
                        </Grid>

                        {/* Spotlight Effects */}
                        <Box sx={{
                            position: 'absolute',
                            bottom: 80,
                            left: '25%',
                            width: 100,
                            height: 180,
                            bgcolor: 'rgba(20, 184, 166, 0.15)',
                            borderRadius: '50%',
                            filter: 'blur(30px)'
                        }}/>
                        <Box sx={{
                            position: 'absolute',
                            bottom: 80,
                            right: '25%',
                            width: 100,
                            height: 180,
                            bgcolor: 'rgba(20, 184, 166, 0.15)',
                            borderRadius: '50%',
                            filter: 'blur(30px)'
                        }}/>
                    </Box>
                )}
            </Paper>
        </Box>
    );

    return (
        <Box sx={{
            width: '100%',
            px: {xs: 1, md: 2}
        }}>
            <Paper sx={{
                position: 'relative',
                overflow: 'hidden',
                background: 'linear-gradient(to bottom, rgba(20, 184, 166, 0.2), rgba(20, 184, 166, 0.05))',
                borderRadius: 2
            }}>
                {/* Title */}
                <Box sx={{
                    position: 'relative',
                    textAlign: 'center',
                    mb: 4,
                    pt: 3,
                }}>
                    <Box sx={{
                        position: 'absolute',
                        left: '50%',
                        top: '50%',
                        width: '128px',
                        height: '128px',
                        bgcolor: 'rgba(20, 184, 166, 0.2)',
                        borderRadius: '50%',
                        filter: 'blur(24px)',
                        transform: 'translate(-50%, -50%)',
                        zIndex: 0
                    }}/>
                    <Typography variant="h4" sx={{
                        fontWeight: 'bold',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 1
                    }}>
                        <EmojiEventsIcon sx={{color: '#facc15'}}/>
                        Top 3 Songs
                    </Typography>
                </Box>

                {isMobile ? (
                    // Mobile Layout - Stacked cards
                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                        px: 1,
                        pb: 3
                    }}>
                        {sortedSongs.map((song) => {
                            // Style based on position
                            const positionStyles = {
                                1: {
                                    gradient: 'linear-gradient(to right, rgba(234, 179, 8, 0.2), rgba(250, 204, 21, 0.1), rgba(234, 179, 8, 0.2))',
                                    border: '1px solid rgba(250, 204, 21, 0.5)',
                                    badgeColor: '#facc15',
                                    icon: <EmojiEventsIcon sx={{color: '#facc15'}}/>,
                                    scale: 1
                                },
                                2: {
                                    gradient: 'linear-gradient(to right, rgba(156, 163, 175, 0.2), rgba(209, 213, 219, 0.1), rgba(156, 163, 175, 0.2))',
                                    border: '1px solid rgba(209, 213, 219, 0.5)',
                                    badgeColor: '#d1d5db',
                                    icon: <StarIcon sx={{color: '#d1d5db'}}/>,
                                    scale: 0.95
                                },
                                3: {
                                    gradient: 'linear-gradient(to right, rgba(180, 83, 9, 0.2), rgba(217, 119, 6, 0.1), rgba(180, 83, 9, 0.2))',
                                    border: '1px solid rgba(217, 119, 6, 0.5)',
                                    badgeColor: '#b45309',
                                    icon: <StarIcon sx={{color: '#b45309'}}/>,
                                    scale: 0.9
                                }
                            }[song.position];

                            return (
                                <Paper key={song.id} sx={{
                                    background: positionStyles.gradient,
                                    border: positionStyles.border,
                                    borderRadius: 2,
                                    p: 2,
                                    position: 'relative',
                                    overflow: 'hidden',
                                    transform: `scale(${positionStyles.scale})`,
                                    transition: 'transform 0.3s',
                                    '&:hover': {transform: 'scale(1.02)'}
                                }}>
                                    {/* Position Badge */}
                                    <Box sx={{
                                        position: 'absolute',
                                        right: -16,
                                        top: -16,
                                        width: 64,
                                        height: 64
                                    }}>
                                        <Box sx={{
                                            bgcolor: positionStyles.badgeColor,
                                            transform: 'rotate(45deg)',
                                            width: 80,
                                            height: 40,
                                            transformOrigin: 'bottom right'
                                        }}>
                                            <Typography sx={{
                                                position: 'absolute',
                                                bottom: 0,
                                                right: 20,
                                                color: 'black',
                                                fontWeight: 'bold'
                                            }}>
                                                #{song.position}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <Box sx={{display: 'flex', gap: 1.5}}>
                                        {/* Album Art */}
                                        <Box sx={{
                                            width: 64,
                                            height: 64,
                                            borderRadius: 1,
                                            bgcolor: 'rgba(0, 0, 0, 0.5)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0,
                                            border: '1px solid rgba(20, 184, 166, 0.3)'
                                        }}>
                                            <AlbumIcon sx={{color: 'rgba(45, 212, 191, 0.7)', fontSize: 32}}/>
                                        </Box>

                                        <Box sx={{flex: 1}}>
                                            <Box sx={{display: 'flex', alignItems: 'center', gap: 1, mb: 0.5}}>
                                                {positionStyles.icon}
                                                <Typography sx={{
                                                    fontWeight: 'bold',
                                                    color: 'white',
                                                    textOverflow: 'ellipsis',
                                                    overflow: 'hidden',
                                                    whiteSpace: 'nowrap'
                                                }}>
                                                    {song.title}
                                                </Typography>
                                            </Box>

                                            <Box sx={{display: 'flex', alignItems: 'center', gap: 0.5, mb: 1}}>
                                                <MusicNoteIcon sx={{color: 'rgb(45, 212, 191)', fontSize: '0.875rem'}}/>
                                                <Typography sx={{
                                                    fontSize: '0.875rem',
                                                    color: 'rgb(209, 213, 219)',
                                                    textOverflow: 'ellipsis',
                                                    overflow: 'hidden',
                                                    whiteSpace: 'nowrap'
                                                }}>
                                                    {song.author}
                                                </Typography>
                                            </Box>

                                            <Box sx={{
                                                bgcolor: 'rgba(0, 0, 0, 0.3)',
                                                borderRadius: 10,
                                                px: 1,
                                                py: 0.25,
                                                display: 'inline-block'
                                            }}>
                                                <Typography sx={{
                                                    fontSize: '0.75rem',
                                                    fontWeight: 500,
                                                    color: 'rgb(94, 234, 212)'
                                                }}>
                                                    {song.votes} votes
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Box>
                                </Paper>
                            );
                        })}
                    </Box>
                ) : (
                    // Desktop Layout - Poprawione podium
                    <Box sx={{
                        position: 'relative',
                        height: 360,
                        mx: 'auto',
                        maxWidth: '3xl'
                    }}>
                        <Box sx={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            display: 'flex',
                            alignItems: 'flex-end',
                            justifyContent: 'center',
                            height: '100%'
                        }}>
                            {/* Podiums for 2nd, 1st and 3rd place */}
                            <Grid container justifyContent="center" alignItems="flex-end">
                                {/* Second Place */}
                                <Grid item xs={4} sx={{height: 296}}>
                                    <Box sx={{
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        position: 'relative'
                                    }}>
                                        <Box sx={{
                                            flex: 1,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'flex-end',
                                            pb: 1
                                        }}>
                                            <Box sx={{
                                                width: 64,
                                                height: 64,
                                                borderRadius: '50%',
                                                bgcolor: 'rgba(0, 0, 0, 0.5)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                mb: 1,
                                                border: '2px solid rgba(209, 213, 219, 0.5)',
                                                boxShadow: '0 0 10px rgba(209, 213, 219, 0.3)'
                                            }}>
                                                <StarIcon sx={{fontSize: 32, color: '#d1d5db'}}/>
                                            </Box>
                                            <Typography sx={{
                                                fontWeight: 'bold',
                                                color: 'white',
                                                textAlign: 'center',
                                                maxWidth: 200,
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap'
                                            }}>
                                                {sortedSongs[1]?.title || "—"}
                                            </Typography>
                                            <Typography sx={{
                                                fontSize: '0.875rem',
                                                color: 'rgb(209, 213, 219)',
                                                maxWidth: 200,
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap'
                                            }}>
                                                {sortedSongs[1]?.author || "—"}
                                            </Typography>
                                            <Box sx={{
                                                mt: 0.5,
                                                bgcolor: 'rgba(0, 0, 0, 0.3)',
                                                borderRadius: 10,
                                                px: 1.5,
                                                py: 0.5,
                                            }}>
                                                <Typography sx={{
                                                    fontSize: '0.875rem',
                                                    fontWeight: 500,
                                                    color: 'rgb(94, 234, 212)'
                                                }}>
                                                    Score: {sortedSongs[1]?.votes || 0}
                                                </Typography>
                                            </Box>
                                        </Box>

                                        {/* Podium Block */}
                                        <Box sx={{
                                            height: 176,
                                            width: '100%',
                                            background: 'linear-gradient(to top, rgba(75, 85, 99, 0.5), rgba(107, 114, 128, 0.3))',
                                            borderTop: '2px solid rgba(209, 213, 219, 0.5)',
                                            position: 'relative',
                                            boxShadow: 'inset 0 5px 15px rgba(0,0,0,0.2)'
                                        }}>
                                            {/* Numer na podium */}
                                            <Box sx={{
                                                position: 'absolute',
                                                top: '50%',
                                                left: '50%',
                                                transform: 'translate(-50%, -50%)',
                                                width: 36,
                                                height: 36,
                                                bgcolor: '#d1d5db',
                                                color: 'black',
                                                fontWeight: 'bold',
                                                borderRadius: '50%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '1.25rem',
                                                boxShadow: '0 2px 4px rgba(0,0,0,0.25)',
                                                border: '2px solid rgba(255,255,255,0.7)'
                                            }}>
                                                2
                                            </Box>
                                        </Box>
                                    </Box>
                                </Grid>

                                {/* First Place */}
                                <Grid item xs={4} sx={{height: 360, zIndex: 10}}>
                                    <Box sx={{
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        position: 'relative'
                                    }}>
                                        <Box sx={{
                                            flex: 1,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'flex-end',
                                            pb: 1
                                        }}>
                                            <Box sx={{
                                                width: 80,
                                                height: 80,
                                                borderRadius: '50%',
                                                bgcolor: 'rgba(0, 0, 0, 0.5)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                mb: 1,
                                                border: '2px solid rgba(250, 204, 21, 0.5)',
                                                boxShadow: '0 0 15px rgba(250, 204, 21, 0.4)'
                                            }}>
                                                <EmojiEventsIcon sx={{fontSize: 40, color: '#facc15'}}/>
                                            </Box>
                                            <Typography variant="h6" sx={{
                                                fontWeight: 'bold',
                                                color: 'white',
                                                textAlign: 'center',
                                                maxWidth: 200,
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap'
                                            }}>
                                                {sortedSongs[0]?.title || "—"}
                                            </Typography>
                                            <Typography sx={{
                                                color: 'rgb(229, 231, 235)',
                                                maxWidth: 200,
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap'
                                            }}>
                                                {sortedSongs[0]?.author || "—"}
                                            </Typography>
                                            <Box sx={{
                                                mt: 1,
                                                bgcolor: 'rgba(0, 0, 0, 0.3)',
                                                borderRadius: 10,
                                                px: 2,
                                                py: 0.5,
                                            }}>
                                                <Typography sx={{
                                                    fontWeight: 500,
                                                    color: 'rgb(153, 246, 228)'
                                                }}>
                                                    Score: {sortedSongs[0]?.votes || 0}
                                                </Typography>
                                            </Box>
                                        </Box>

                                        {/* Podium Block */}
                                        <Box sx={{
                                            height: 240,
                                            width: '100%',
                                            background: 'linear-gradient(to top, rgba(202, 138, 4, 0.5), rgba(234, 179, 8, 0.3))',
                                            borderTop: '2px solid rgba(250, 204, 21, 0.5)',
                                            position: 'relative',
                                            boxShadow: 'inset 0 5px 15px rgba(0,0,0,0.2)'
                                        }}>
                                            {/* Numer na podium */}
                                            <Box sx={{
                                                position: 'absolute',
                                                top: '50%',
                                                left: '50%',
                                                transform: 'translate(-50%, -50%)',
                                                width: 44,
                                                height: 44,
                                                bgcolor: '#facc15',
                                                color: 'black',
                                                fontWeight: 'bold',
                                                borderRadius: '50%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '1.5rem',
                                                boxShadow: '0 2px 4px rgba(0,0,0,0.25)',
                                                border: '2px solid rgba(255,255,255,0.7)'
                                            }}>
                                                1
                                            </Box>
                                        </Box>
                                    </Box>
                                </Grid>

                                {/* Third Place */}
                                <Grid item xs={4} sx={{height: 240}}>
                                    <Box sx={{
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        position: 'relative'
                                    }}>
                                        <Box sx={{
                                            flex: 1,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'flex-end',
                                            pb: 1
                                        }}>
                                            <Box sx={{
                                                width: 64,
                                                height: 64,
                                                borderRadius: '50%',
                                                bgcolor: 'rgba(0, 0, 0, 0.5)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                mb: 1,
                                                border: '2px solid rgba(180, 83, 9, 0.5)',
                                                boxShadow: '0 0 10px rgba(180, 83, 9, 0.3)'
                                            }}>
                                                <StarIcon sx={{fontSize: 32, color: '#b45309'}}/>
                                            </Box>
                                            <Typography sx={{
                                                fontWeight: 'bold',
                                                color: 'white',
                                                textAlign: 'center',
                                                maxWidth: 200,
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap'
                                            }}>
                                                {sortedSongs[2]?.title || "—"}
                                            </Typography>
                                            <Typography sx={{
                                                fontSize: '0.875rem',
                                                color: 'rgb(209, 213, 219)',
                                                maxWidth: 200,
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap'
                                            }}>
                                                {sortedSongs[2]?.author || "—"}
                                            </Typography>
                                            <Box sx={{
                                                mt: 0.5,
                                                bgcolor: 'rgba(0, 0, 0, 0.3)',
                                                borderRadius: 10,
                                                px: 1.5,
                                                py: 0.5,
                                            }}>
                                                <Typography sx={{
                                                    fontSize: '0.875rem',
                                                    fontWeight: 500,
                                                    color: 'rgb(94, 234, 212)'
                                                }}>
                                                    Score: {sortedSongs[2]?.votes || 0}
                                                </Typography>
                                            </Box>
                                        </Box>

                                        {/* Podium Block */}
                                        <Box sx={{
                                            height: 120,
                                            width: '100%',
                                            background: 'linear-gradient(to top, rgba(146, 64, 14, 0.5), rgba(180, 83, 9, 0.3))',
                                            borderTop: '2px solid rgba(180, 83, 9, 0.5)',
                                            position: 'relative',
                                            boxShadow: 'inset 0 5px 15px rgba(0,0,0,0.2)'
                                        }}>
                                            {/* Numer na podium */}
                                            <Box sx={{
                                                position: 'absolute',
                                                top: '50%',
                                                left: '50%',
                                                transform: 'translate(-50%, -50%)',
                                                width: 36,
                                                height: 36,
                                                bgcolor: '#b45309',
                                                color: 'black',
                                                fontWeight: 'bold',
                                                borderRadius: '50%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '1.25rem',
                                                boxShadow: '0 2px 4px rgba(0,0,0,0.25)',
                                                border: '2px solid rgba(255,255,255,0.7)'
                                            }}>
                                                3
                                            </Box>
                                        </Box>
                                    </Box>
                                </Grid>
                            </Grid>
                        </Box>

                        {/* Spotlight Effects */}
                        <Box sx={{
                            position: 'absolute',
                            bottom: 80,
                            left: '25%',
                            width: 100,
                            height: 180,
                            bgcolor: 'rgba(20, 184, 166, 0.15)',
                            borderRadius: '50%',
                            filter: 'blur(30px)'
                        }}/>
                        <Box sx={{
                            position: 'absolute',
                            bottom: 80,
                            right: '25%',
                            width: 100,
                            height: 180,
                            bgcolor: 'rgba(20, 184, 166, 0.15)',
                            borderRadius: '50%',
                            filter: 'blur(30px)'
                        }}/>
                    </Box>
                )}
            </Paper>
        </Box>
    );
}

TopSongsOlympicPodium.propTypes = {
    playlist: PropTypes.number.isRequired,
}
