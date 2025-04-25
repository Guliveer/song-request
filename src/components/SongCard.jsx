import PropTypes from 'prop-types';
import React, { useState, useEffect, useCallback } from 'react';
import Link from "next/link";
import { useRouter } from 'next/router';
import { supabase } from '@/utils/supabase';
import { Box, Card, Typography, IconButton, Snackbar } from "@mui/material";
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import DeleteIcon from '@mui/icons-material/Delete';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import BlockIcon from '@mui/icons-material/Block';
import SkeletonSongCard from "@/components/skeletons/SkeletonSongCard";
import { getUserInfo, getSongData, getCurrentUser, removeUserVote, updateUserVote } from "@/utils/actions";
import debounce from 'lodash.debounce';

const VoteButtons = React.memo(({ userVote, handleVote, score, isBanned }) => (
    <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '1rem', width: '25%', justifyContent: 'center' }}>
        <IconButton
            color={userVote === 1 ? "default" : "secondary"}
            onClick={() => !isBanned && handleVote(1)}
            disabled={isBanned}
        >
            <ThumbUpIcon />
        </IconButton>
        <Typography variant="h6">{score}</Typography>
        <IconButton
            color={userVote === -1 ? "error" : "secondary"}
            onClick={() => !isBanned && handleVote(-1)}
            disabled={isBanned}
        >
            <ThumbDownIcon />
        </IconButton>
    </Box>
));

function SongCard({ id }) {
    const [songData, setSongData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [userVote, setUserVote] = useState(null);
    const [isBanned, setIsBanned] = useState(false);  // Nowy stan do śledzenia stanu bana
    const [error, setError] = useState(null);
    const router = useRouter();
    const isAdminPanel = router.pathname.startsWith("/admin");

    const fetchData = useCallback(async () => {
        try {
            const [song, currentUser] = await Promise.all([
                getSongData(id),
                getCurrentUser()
            ]);

            if (currentUser) {
                setUser(currentUser);

                // Sprawdzamy stan bana użytkownika
                const { data: userData, error: userError } = await supabase
                    .from("users")
                    .select("ban_status")
                    .eq("id", currentUser.id)
                    .single();

                if (userError) {
                    console.log("Error:", userError.message);
                    setIsBanned(false);  // Jeśli nie uda się pobrać stanu bana, traktujemy użytkownika jako niezbanowanego
                } else {
                    setIsBanned(userData?.ban_status > 0);
                }

                const { data: voteData, error: voteError } = await supabase
                    .from('votes')
                    .select('vote')
                    .eq('song_id', id)
                    .eq('user_id', currentUser.id)
                    .single();

                if (voteError) {
                    console.log("Error:", voteError.message);
                    setUserVote(null);
                } else {
                    setUserVote(voteData.vote);
                }
            }

            const user = await getUserInfo(song.user_id);
            song.username = user ? '@' + user.username : song.user_id;

            setSongData(song);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleVote = useCallback(debounce(async (newVoteValue) => {
        if (!user) {
            setError("You have to be logged in to vote.");
            return;
        }

        if (isBanned) {
            setError("You are banned and cannot vote.");
            return;
        }

        let resultVoteVal = null;

        try {
            if (userVote === newVoteValue) {
                const response = await removeUserVote(id, user.id);
                if (response !== true) {
                    setError(`Error while removing vote: ${response}`);
                    resultVoteVal = null;
                }
            } else {
                const response = await updateUserVote(id, user.id, newVoteValue);
                if (response !== true) {
                    setError(`Voting error: ${response}`);
                    return;
                }
                resultVoteVal = newVoteValue;
            }
        } catch (error) {
            console.error("Error while placing a vote:", error);
            setError(`Something went wrong: ${error.message}`);
        } finally {
            await fetchData();
            setUserVote(resultVoteVal);
        }
    }, 300), [user, userVote, id, fetchData, isBanned]);

    // funkcja do usuwania piosenki
    const handleDelete = async () => {
        const { error } = await supabase
            .from('queue')
            .delete()
            .eq('id', id);

        if (error) {
            setError("Błąd podczas usuwania piosenki.");
        } else {
            router.reload();
        }
    };

    // funkcja do resetowania głosów
    const handleResetVotes = async () => {
        const { error } = await supabase
            .from('votes')
            .delete()
            .eq('song_id', id);

        if (error) {
            setError("Błąd podczas resetowania głosów.");
        } else {
            router.reload();
        }
    };

    // funkcja do banowania url
    const handleBanAndDelete = async () => {
        const { error: insertError } = await supabase
            .from('banned_url')
            .insert([{ url: songData.url }]);

        if (insertError) {
            setError("Błąd podczas banowania URL.");
            return;
        }

        const { error: deleteError } = await supabase
            .from('queue')
            .delete()
            .eq('id', id);

        if (deleteError) {
            setError("Błąd podczas usuwania piosenki.");
        } else {
            router.reload();
        }
    };

    const cardStyle = {
        display: 'flex',
        flexDirection: 'row',
        minWidth: '40em',
        width: '100%',
        maxWidth: '50em',
        padding: '1rem',
        borderRadius: '10px',
        alignItems: 'center'
    };

    if (loading || !songData) {
        return <SkeletonSongCard cardStyle={cardStyle} />
    }

    const { title, author, url, added_at, username, score, rank } = songData;

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
                <Typography variant="body2" sx={{ fontSize: '0.75rem', color: 'secondary' }}>
                    Added by: {username}
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.75rem', color: 'secondary' }}>
                    {new Date(added_at).toLocaleString()}
                </Typography>
            </Box>
            <VoteButtons userVote={userVote} handleVote={handleVote} score={score} isBanned={isBanned} />
            {isAdminPanel && (
                <Box sx={{ display: 'flex', flexDirection: 'row', gap: '0.5rem', marginLeft: '1rem' }}>
                    <IconButton
                        color="error"
                        onClick={handleDelete}
                        title="Usuń piosenkę"
                    >
                        <DeleteIcon />
                    </IconButton>
                    <IconButton
                        color="primary"
                        onClick={handleResetVotes}
                        title="Resetuj głosy"
                    >
                        <RestartAltIcon />
                    </IconButton>
                    <IconButton
                        color="warning"
                        onClick={handleBanAndDelete}
                        title="Banuj URL i usuń"
                    >
                        <BlockIcon />
                    </IconButton>
                </Box>
            )}
            {error && (
                <Snackbar
                    open={!!error}
                    autoHideDuration={10000}
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

export default React.memo(SongCard);
