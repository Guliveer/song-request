import React, { useState, useEffect } from 'react';
import Link from "next/link";
import { supabase } from '@/utils/supabase';
import { Box, Card, Typography, Skeleton, IconButton, Snackbar } from "@mui/material";
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import PropTypes from 'prop-types';

export default function SongCard({ id }) {
    const [songData, setSongData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [userVote, setUserVote] = useState(null); // 1 = upvote, -1 = downvote, null = brak głosu
    const [error, setError] = useState(null); // Stan błędu
    const [isVoting, setIsVoting] = useState(false); // Blokada wielokrotnych kliknięć

    // Pobieranie danych piosenki i użytkownika z supabase
    useEffect(() => {
        async function fetchData() {
            const { data: song, error: songError } = await supabase
                .from('queue')
                .select('title, author, url, added_at, user_id, score, rank')
                .eq('id', id)
                .single();

            if (songError) {
                console.error('Error fetching song:', songError);
                return;
            }

            setSongData(song);
            setLoading(false);
        }

        async function fetchUserAndVote() {
            const { data: { user }, error } = await supabase.auth.getUser();
            if (error) {
                console.error("Błąd przy pobieraniu użytkownika:", error);
                return;
            }

            if (user) {
                setUser(user);

                // Sprawdzamy czy użytkownik już głosował
                const { data: voteData, error: voteError } = await supabase
                    .from('votes')
                    .select('vote')
                    .eq('song_id', id)
                    .eq('user_id', user.id)
                    .single();

                if (voteError) {
                    console.log("Brak głosu lub błąd:", voteError ? voteError.message : "Brak danych o głosie");
                    setUserVote(null); // Brak głosu, ustawiamy na null
                } else {
                    setUserVote(voteData.vote === null ? null : voteData.vote);
                    console.log("Znaleziono głos:", voteData);
                }
            }
        }

        fetchData();
        fetchUserAndVote();
    }, [id]);


    const handleVote = async (newVoteValue) => {
        if (!user) {
            setError("Zaloguj się, aby głosować.");
            return;
        }

        if (isVoting) return; // Zablokowanie podwójnych kliknięć
        setIsVoting(true);

        try {
            let delta = 0;

            console.log("Current userVote before vote:", userVote);

            // Cofnięcie głosu
            if (userVote === newVoteValue) {
                const { error: deleteError } = await supabase
                    .from('votes')
                    .delete()
                    .eq('user_id', user.id)
                    .eq('song_id', id);

                if (deleteError) {
                    console.error("Błąd przy usuwaniu głosu:", deleteError);
                    setError(`Błąd przy usuwaniu głosu: ${deleteError.message}`);
                    return;
                }

                delta = -newVoteValue; // Odejmowanie głosu kiedy głos jest resetowany
                setUserVote(null); // Resetowanie głosu
                console.log("Removed vote, updated userVote:", null);
            } else {
                if (userVote === 1 && newVoteValue === -1) {
                    delta = -2;
                } else if (userVote === -1 && newVoteValue === 1) {
                    delta = -2;
                } else {
                    delta = newVoteValue;
                }

                // Głosowanie lub zmiana głosu
                const { error: voteError } = await supabase
                    .from('votes')
                    .upsert({
                        user_id: user.id,
                        song_id: id,
                        vote: newVoteValue,
                        voted_at: new Date().toISOString(),
                    }, { onConflict: ['user_id', 'song_id'] });

                if (voteError) {
                    console.error("Błąd przy głosowaniu:", voteError);
                    setError(`Błąd przy głosowaniu: ${voteError.message}`);
                    return;
                }

                delta = userVote === null ? newVoteValue : newVoteValue - userVote;
                setUserVote(newVoteValue); // Update user vote
                console.log("Updated vote, new userVote:", newVoteValue);
            }

            // Zaktualizowanie stanu lokalnego
            setSongData(prev => ({
                ...prev,
                score: prev.score + delta
            }));

        } catch (error) {
            console.error("Błąd przy głosowaniu:", error);
            setError(`Coś poszło nie tak: ${error.message}`);
        } finally {
            setIsVoting(false);
        }
    };

    if (loading || !songData) {
        return (
            <Card variant="outlined" sx={{ display: 'flex', flexDirection: 'row', padding: '1rem', borderRadius: '10px', alignItems: 'center', minWidth: '40em', width: '100%', maxWidth: '50em' }}>
                <Box sx={{ width: '10%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <Skeleton variant="text" width={40} height={50} />
                </Box>
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <Skeleton variant="text" width="80%" height={30} />
                    <Skeleton variant="text" width="60%" height={20} />
                </Box>
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <Skeleton variant="text" width="50%" height={20} />
                    <Skeleton variant="text" width="40%" height={20} />
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '1rem', width: '25%', justifyContent: 'center' }}>
                    <Skeleton variant="circular" width={40} height={40} />
                    <Skeleton variant="text" width={30} height={30} />
                    <Skeleton variant="circular" width={40} height={40} />
                </Box>
            </Card>
        );
    }

    const { title, author, url, added_at, user_id, score, rank } = songData;

    return (
        <Card variant="outlined" sx={{ display: 'flex', flexDirection: 'row', padding: '1rem', borderRadius: '10px', alignItems: 'center', minWidth: '40em', width: '100%', maxWidth: '50em' }}>
            <Box sx={{ width: '10%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 'normal' }}>{rank}</Typography>
            </Box>
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1.25rem', marginBottom: '0.5rem' }}>
                    <Link href={url} target="_blank" style={{ textDecoration: 'none', color: 'inherit' }}>
                        {title}
                    </Link>
                </Typography>
                <Typography variant="body1" sx={{ fontSize: '0.875rem', fontWeight: 'normal' }}>{author}</Typography>
            </Box>
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Typography variant="body2" sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                    Added by: {user_id}
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                    {new Date(added_at).toLocaleString()}
                </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '1rem', width: '25%', justifyContent: 'center' }}>
                <IconButton
                    color={userVote === 1 ? "primary" : "default"}
                    onClick={() => handleVote(1)}
                >
                    <ThumbUpIcon />
                </IconButton>
                <Typography variant="h6">{score}</Typography>
                <IconButton
                    color={userVote === -1 ? "error" : "default"}
                    onClick={() => handleVote(-1)}
                >
                    <ThumbDownIcon />
                </IconButton>
            </Box>
            {error && (
                <Snackbar
                    open={!!error}
                    autoHideDuration={6000}
                    onClose={() => setError(null)}
                    message={error}
                />
            )}
        </Card>
    );
}
