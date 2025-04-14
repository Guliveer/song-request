import PropTypes from 'prop-types';
import React, { useState, useEffect, useCallback } from 'react';
import Link from "next/link";
import { supabase } from '@/utils/supabase';
import {Box, Card, Typography, IconButton, Snackbar, Divider} from "@mui/material";
import SkeletonSongCard from "@/components/skeletons/SkeletonSongCard";
import { getUserInfo, getSongData, getCurrentUser, removeUserVote, updateUserVote } from "@/utils/actions";
import debounce from 'lodash.debounce';
import {
    KeyboardArrowUpRounded as VoteUpIcon,
    KeyboardArrowDownRounded as VoteDownIcon,
    AccountCircleRounded as WhoAddedIcon,
    CalendarTodayRounded as DateAddedIcon,
    MusicNoteRounded as SongIcon,
    NumbersRounded as RankIcon,
} from '@mui/icons-material';
const VoteButtons = React.memo(({ userVote, handleVote, score }) => (
    <Box
        sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: '3em',
        }}
    >
        <IconButton
            onClick={() => handleVote(1)}
            color={userVote === 1 ? "primary" : "disabled"}
            size="small"
            sx={{ borderRadius: 3 }}
        >
            <VoteUpIcon color={userVote === 1 ? "primary" : "disabled"} sx={{fontSize: 30}} />
        </IconButton>
        <Typography
            variant="body1"
            sx={{
                fontWeight: 'bold',
                fontSize: '1rem',
            }}
        >
            {score}
        </Typography>
        <IconButton
            onClick={() => handleVote(-1)}
            color={userVote === -1 ? "primary" : "disabled"}
            size="small"
            sx={{ borderRadius: 3 }}
        >
            <VoteDownIcon color={userVote === -1 ? "primary" : "disabled"} sx={{fontSize: 30}}/>
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
            await fetchData();
            setUserVote(resultVoteVal);
        }
    }, 300), [user, userVote, id, fetchData]);
    
    if (loading || !songData) {
        return <SkeletonSongCard />
    }

    const { title, author, url, added_at, user_id, score, rank, username } = songData;

    return (
        <Card variant="outlined" sx={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            minWidth: 'fit-content',
            maxWidth: 500,
            px: 3,
            py: 3,
            borderRadius: '1em',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 3,
            backgroundColor: 'background.paper',
            position: 'relative',
        }}>
            {/* Rank */}
            <Box sx={{
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <RankIcon fontSize="small" sx={{ color: 'text.disabled' }} />
                    <Typography variant="h6" color="text.secondary">
                        {rank}
                    </Typography>
                </Box>
            </Box>

            <Divider variant="fullWidth" flexItem />

            {/* Song Info */}
            <Box sx={{
                display: 'flex',
                flexDirection: 'row',
                gap: 0,
                overflow: 'none',
                width: '100%',
                minWidth: 'fit-content',
            }}>
                <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2,
                    width: '100%',
                }}>
                <Box sx={{
                    flex: 2,
                    display: 'flex',
                    flexWrap: 'nowrap',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: 0.5,
                    width: '100%',
                    minWidth: 'fit-content',
                    justifyContent: 'stretch',
                }}>
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5em',
                        width: '100%',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                        position: 'relative',
                    }}>
                        <SongIcon fontSize="small" sx={{ color: 'primary.main' }} />
                        <Box sx={{
                            display: 'inline-block',
                            position: 'relative',
                            width: 200, // Define the visible area
                            overflow: 'hidden', // Hide overflowing text
                            whiteSpace: 'nowrap',
                        }}>
                            <Typography
                                variant="h6"
                                sx={{
                                    fontWeight: 'bold',
                                    fontSize: '1.3rem',
                                    display: 'inline-block',
                                    animation: title.length > 15 ? 'scrollText 10s linear infinite' : 'none',
                                }}
                            >
                                <Link href={url} target="_blank" style={{ textDecoration: 'none' }}>
                                    {title}
                                </Link>
                            </Typography>
                        </Box>
                    </Box>
                    <Box sx={{
                        display: 'inline-block',
                        position: 'relative',
                        width: 175, // Define the visible area
                        overflow: 'hidden', // Hide overflowing text
                        whiteSpace: 'nowrap',
                    }}>
                        <Typography variant="body1" sx={{
                            fontSize: '1rem',
                            display: 'inline-block',
                            animation: title.length > 30 ? 'scrollText 10s linear infinite' : 'none',
                        }}>{author}</Typography>
                    </Box>
                </Box>

                {/* Metadata */}
                <Box sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-start',
                    alignItems: 'flex-start',
                    gap: 1,
                    width: '100%',
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.4em' }}>
                        <WhoAddedIcon fontSize="small" sx={{ color: 'text.disabled' }} />
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.9rem' }}>
                            {username}
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.4em' }}>
                        <DateAddedIcon fontSize="small" sx={{ color: 'text.disabled' }} />
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.9rem' }}>
                            {new Date(added_at).toLocaleString()}
                        </Typography>
                    </Box>
                </Box>
            </Box>

                {/* Vote Buttons */}
                <VoteButtons
                    userVote={userVote}
                    handleVote={handleVote}
                    score={score}
                />
            </Box>

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

VoteButtons.propTypes = {
    userVote: PropTypes.number,
    handleVote: PropTypes.func.isRequired,
    score: PropTypes.number.isRequired,
};

export default React.memo(SongCard);
