import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import Link from "next/link";
import { supabase } from '@/utils/supabase';
import { Box, Card, Typography, Skeleton, IconButton, Snackbar } from "@mui/material";
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import SkeletonSongCard from "@/components/skeletons/SkeletonSongCard";
import {getUserInfo, getSongData} from "@/utils/actions"

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
            try {
                // Fetch the song data from the 'queue' table
                const song = await getSongData(id);

                // Fetch the username from the 'users' table
                const user = await getUserInfo(song.user_id);
                song.username = user ? '@' + user.username : song.user_id;

                setSongData(song);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching data:', error);
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

    async function handleVote(newVoteValue) {
        if (!user) {
            setError("You have to be logged in to vote.");
            return;
        }

        if (isVoting) return; // Zablokowanie podwójnych kliknięć
        setIsVoting(true);

        try {
            // Cofnięcie głosu
            if (userVote === newVoteValue) {
                const { error: deleteError } = await supabase
                    .from('votes')
                    .delete()
                    .eq('user_id', user.id)
                    .eq('song_id', id);

                if (deleteError) {
                    console.error("Error while removing vote:", deleteError);
                    setError(`Błąd przy usuwaniu głosu: ${deleteError.message}`);
                    return;
                }

                setUserVote(null); // Resetowanie głosu
                console.log("Removed vote, updated userVote:", null);
            } else {
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
                    console.error("Voting error:", voteError);
                    setError(`Błąd przy głosowaniu: ${voteError.message}`);
                    return;
                }

                setUserVote(newVoteValue); // Update user vote
                console.log("Updated vote, new userVote:", newVoteValue);
            }

            // Zaktualizowanie stanu lokalnego
            setSongData(prev => ({
                ...prev,
                score: prev.score + newVoteValue
            }));

        } catch (error) {
            console.error("Error while placing a vote:", error);
            setError(`Something went wrong: ${error.message}`);
        } finally {
            setIsVoting(false);
        }
    }

    const cardStyle = {
        display: 'flex',
        flexDirection: 'row',
        minWidth: '40em',
        width: '100%',
        maxWidth: '50em',
        padding: '1rem',
        borderRadius: '10px',
        alignItems: 'center'
    }
    
    if (loading || !songData) {
        return <SkeletonSongCard cardStyle={cardStyle} />
    }

    const { title, author, url, added_at, user_id, score, rank, username } = songData;

    return (
        <Card variant="outlined" sx={cardStyle}>
            <Box sx={{ width: '10%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 'normal' }}>{rank}</Typography>
            </Box>
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1.25rem', marginBottom: '0.5rem' }}>
                    <Link href={url} target="_blank" style={{ textDecoration: 'none' }}>
                        {title}
                    </Link>
                </Typography>
                <Typography variant="body1" sx={{ fontSize: '0.875rem', fontWeight: 'normal' }}>{author}</Typography>
            </Box>
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Typography variant="body2" sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                    Added by: {username}
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

SongCard.propTypes = {
    id: PropTypes.number.isRequired,
};
