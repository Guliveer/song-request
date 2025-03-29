import PropTypes from 'prop-types';
import React, { useState, useEffect, useCallback } from 'react';
import Link from "next/link";
import { supabase } from '@/utils/supabase';
import { Box, Card, Typography, IconButton, Snackbar } from "@mui/material";
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import SkeletonSongCard from "@/components/skeletons/SkeletonSongCard";
import { getUserInfo, getSongData, getCurrentUser, removeUserVote, updateUserVote } from "@/utils/actions";
import debounce from 'lodash.debounce';

const VoteButtons = React.memo(({ userVote, handleVote, score }) => (
    // Lets you skip re-rendering a component when its props are unchanged.

    <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '1rem', width: '25%', justifyContent: 'center' }}>
        <IconButton
            color={userVote === 1 ? "secondary" : "default"}
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
));

function SongCard({ id }) {
    const [songData, setSongData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [userVote, setUserVote] = useState(null); // 1 = upvote; -1 = downvote; null = no vote
    const [error, setError] = useState(null); // Error state

    const fetchData = useCallback(async () => {
        try {
            const [song, currentUser] = await Promise.all([getSongData(id), getCurrentUser()]);

            if (currentUser) {
                setUser(currentUser);
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
        // debounce prevents multiple votes in a short time
        if (!user) {
            setError("You have to be logged in to vote.");
            return;
        }

        let resultVoteVal = null; // variable to sync data update

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
            await fetchData().then(() => setUserVote(resultVoteVal));
        }
    }, 300), [user, userVote, id, fetchData]);

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
            <VoteButtons userVote={userVote} handleVote={handleVote} score={songData.score} />
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
