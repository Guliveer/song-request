import PropTypes from 'prop-types';
import React, {useState, useEffect, useCallback} from 'react';
import Link from "next/link";
import {supabase} from '@/utils/supabase';
import { useRouter } from 'next/router';
import {
    Box, Card, Typography, IconButton, Snackbar, Divider, Button, Tooltip,
    Avatar, AvatarGroup
} from "@mui/material";
import SkeletonSongCard from "@/components/skeletons/SkeletonSongCard";
import {
    getUserInfo, getSongData, getCurrentUser, removeUserVote,
    updateUserVote, playSound, genUserAvatar
} from "@/utils/actions";
import debounce from 'lodash.debounce';
import {
    KeyboardArrowUpRounded as VoteUpIcon,
    KeyboardArrowDownRounded as VoteDownIcon,
    AccountCircleRounded as WhoAddedIcon,
    CalendarTodayRounded as DateAddedIcon,
    MusicNoteRounded as SongIcon,
    NumbersRounded as RankIcon,
    PersonAddRounded as FollowIcon,
    OpenInNewRounded as ExternalLinkIcon,
} from '@mui/icons-material';
import { Delete as DeleteIcon, RestartAlt as RestartAltIcon, Block as BlockIcon } from '@mui/icons-material';

const VoteButtons = React.memo(({userVote, handleVote, score, disabled}) => (
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
            sx={{borderRadius: 3}}
            disabled={disabled}
        >
            <VoteUpIcon color={userVote === 1 ? "primary" : "disabled"} sx={{fontSize: 30}}/>
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
            sx={{borderRadius: 3}}
            disabled={disabled}
        >
            <VoteDownIcon color={userVote === -1 ? "primary" : "disabled"} sx={{fontSize: 30}}/>
        </IconButton>
    </Box>
));


function SongCard({id}) {
    const [songData, setSongData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [userVote, setUserVote] = useState(null); // 1 = upvote; -1 = downvote; null = no vote
    const [error, setError] = useState(null); // Error state
    const [isFollowing, setIsFollowing] = useState(false);
    const [followedUsersVotes, setFollowedUsersVotes] = useState([]);
    const router = useRouter();  // Zainicjowaliśmy router
    const [isBanned, setIsBanned] = useState(false);

    const isAdminPanel = router.pathname.startsWith("/admin");

    const fetchData = useCallback(async () => {
        try {
            const [song, currentUser] = await Promise.all([getSongData(id), getCurrentUser()]);

            if (currentUser) {
                setUser(currentUser);

                // Sprawdzenie czy użytkownik jest zbanowany
                const { data: banData, error: banError } = await supabase
                    .from('users')
                    .select('ban_status')
                    .eq('id', currentUser.id)
                    .single();

                if (!banError && banData?.ban_status > 0) {
                    setIsBanned(true);
                }

                // Get user vote data
                const {data: voteData, error: voteError} = await supabase
                    .from('votes')
                    .select('vote')
                    .eq('song_id', id)
                    .eq('user_id', currentUser.id)
                    .single();

                if (!voteError) {
                    setUserVote(voteData.vote);
                } else {
                    setUserVote(null);
                }

                // Get list of followed users
                const {data: userData, error: userError} = await supabase
                    .from('users')
                    .select('followed_users')
                    .eq('id', currentUser.id)
                    .single();

                if (!userError && userData.followed_users) {
                    // Check if we are following the song author
                    setIsFollowing(userData.followed_users.includes(song.user_id));

                    // Get votes of followed users for this song
                    if (userData.followed_users.length > 0) {
                        const {data: followedVotes, error: followedVotesError} = await supabase
                            .from('votes')
                            .select('user_id, vote')
                            .eq('song_id', id)
                            .in('user_id', userData.followed_users);

                        if (!followedVotesError && followedVotes) {
                            // Get usernames and avatars for votes
                            const votesWithUsernames = await Promise.all(followedVotes.map(async (vote) => {
                                const userInfo = await getUserInfo(vote.user_id);
                                const avatarUrl = await genUserAvatar(vote.user_id);
                                return {
                                    ...vote,
                                    username: userInfo ? userInfo.username : 'User',
                                    avatar: avatarUrl
                                };
                            }));

                            setFollowedUsersVotes(votesWithUsernames);
                        }
                    }
                }
            }

            const userInfo = await getUserInfo(song.user_id);
            song.username = userInfo ? '@' + userInfo.username : song.user_id;
            song.rawUsername = userInfo ? userInfo.username : '';
            song.rawUserId = song.user_id;

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

            await playSound('click', 0.75);
        } catch (error) {
            console.error("Error while placing a vote:", error);
            setError(`Something went wrong: ${error.message}`);
        } finally {
            await fetchData();
            setUserVote(resultVoteVal);
        }
    }, 300), [user, userVote, id, fetchData]);

    // funkcja do usuwania piosenki
    const handleDelete = async () => {
        const {error} = await supabase
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
        const {error} = await supabase
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
        const {error: insertError} = await supabase
            .from('banned_url')
            .insert([{url: songData.url}]);

        if (insertError) {
            setError("Błąd podczas banowania URL.");
            return;
        }

        const {error: deleteError} = await supabase
            .from('queue')
            .delete()
            .eq('id', id);

        if (deleteError) {
            setError("Błąd podczas usuwania piosenki.");
        } else {
            router.reload();
        }
    };

    const handleFollow = async () => {
        if (!user || !songData || user.id === songData.rawUserId) {
            return;
        }

        try {
            // Get current followed users list
            const {data: userData, error: userError} = await supabase
                .from('users')
                .select('followed_users')
                .eq('id', user.id)
                .single();

            if (userError) {
                setError("Cannot retrieve user data");
                return;
            }

            const currentFollowed = userData.followed_users || [];

            // Add new user to the followed users list
            const updatedFollowed = [...currentFollowed, songData.rawUserId];

            // Update the database
            const {error: updateError} = await supabase
                .from('users')
                .update({followed_users: updatedFollowed})
                .eq('id', user.id);

            if (updateError) {
                setError("Cannot update followed users list");
                return;
            }

            setIsFollowing(true);
            await playSound('click', 0.5);
        } catch (error) {
            console.error("Error following user:", error);
            setError(`Something went wrong: ${error.message}`);
        }
    };

    if (loading || !songData) {
        return <SkeletonSongCard/>
    }

    const {title, author, url, added_at, score, rank, username} = songData;

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
                <Box sx={{display: 'flex', alignItems: 'center'}}>
                    <RankIcon fontSize="small" sx={{color: 'text.disabled'}}/>
                    <Typography variant="h6" color="text.secondary">
                        {rank}
                    </Typography>
                </Box>
            </Box>

            <Divider variant="fullWidth" flexItem/>

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
                            <SongIcon fontSize="small" sx={{color: 'primary.main'}}/>
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
                                    <Link href={url} target="_blank" style={{textDecoration: 'none'}}>
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
                        <Box sx={{display: 'flex', alignItems: 'center', gap: '0.4em'}} >
                            <WhoAddedIcon fontSize="small" sx={{color: 'text.disabled'}} />
                            <Typography variant="body2" color="text.secondary" sx={{
                                fontSize: '0.9rem',
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 0.5,
                            }}>
                                <Link href={`/user/${songData.rawUserId}`}>
                                    {username}
                                </Link>
                                <ExternalLinkIcon sx={{
                                    color: 'text.secondary',
                                    fontSize: '0.9rem',
                                }} />
                            </Typography>
                            {user && (songData.rawUserId !== user.id) && !isFollowing && (
                                <Tooltip title="Follow user">
                                    <IconButton
                                        size="small"
                                        color="primary"
                                        onClick={handleFollow}
                                        sx={{ml: 1}}
                                    >
                                        <FollowIcon fontSize="small"/>
                                    </IconButton>
                                </Tooltip>
                            )}
                        </Box>
                        <Box sx={{display: 'flex', alignItems: 'center', gap: '0.4em'}}>
                            <DateAddedIcon fontSize="small" sx={{color: 'text.disabled'}}/>
                            <Typography variant="body2" color="text.secondary" sx={{fontSize: '0.9rem'}}>
                                {new Date(added_at).toLocaleString()}
                            </Typography>
                        </Box>

                        {/* Friends votes as avatar group */}
                        {followedUsersVotes.length > 0 && (
                            <Box sx={{display: 'flex', width: '100%', alignItems: 'center', gap: '0.4em', mt: 0.5}}>
                                <AvatarGroup
                                    max={4}
                                    sx={{
                                        '& .MuiAvatar-root': {
                                            width: 22,
                                            height: 22,
                                            fontSize: '0.75rem'
                                        }
                                    }}
                                    slotProps={{
                                        additionalAvatar: {
                                            component: (props) => {
                                                const hiddenUsers = followedUsersVotes.slice(2).map(vote => (
                                                    <div key={vote.user_id}>
                                                        {`${vote.username} ${vote.vote === 1 ? 'upvoted' : 'downvoted'}`}
                                                    </div>
                                                ));

                                                return (
                                                    <Tooltip
                                                        title={<React.Fragment>{hiddenUsers}</React.Fragment>}
                                                        arrow
                                                        placement="bottom"
                                                    >
                                                        <Avatar {...props} />
                                                    </Tooltip>
                                                );
                                            }
                                        }
                                    }}
                                >
                                    {followedUsersVotes.map((vote) => (
                                        <Tooltip
                                            key={vote.user_id}
                                            title={`${vote.username} ${vote.vote === 1 ? 'upvoted' : 'downvoted'}`}
                                            arrow
                                        >
                                            <Avatar
                                                src={vote.avatar}
                                                sx={{bgcolor: vote.vote === 1 ? 'primary.main' : 'error.light'}}
                                            >
                                                {vote.username.charAt(0).toUpperCase()}
                                            </Avatar>
                                        </Tooltip>
                                    ))}
                                </AvatarGroup>
                            </Box>
                        )}
                    </Box>
                </Box>

                {/* Vote Buttons */}
                <VoteButtons
                    userVote={userVote}
                    handleVote={handleVote}
                    score={score}
                    disabled={isBanned}
                />
            </Box>

            {/* Functionality Icons (Follow, Delete, Ban, etc.) */}
            {isAdminPanel && (
            <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                width: '100%',
                alignItems: 'center',
                mt: 2, // Added margin-top to separate from the previous section
            }}>
                <Box sx={{display: 'flex', gap: 2}}>
                    <Tooltip title="Ban URL">
                        <IconButton onClick={handleBanAndDelete}>
                            <BlockIcon sx={{fontSize: 28}}/>
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Remove song">
                        <IconButton onClick={handleDelete}>
                            <DeleteIcon sx={{fontSize: 28}}/>
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Reset votes">
                        <IconButton onClick={handleResetVotes}>
                            <RestartAltIcon sx={{fontSize: 28}}/>
                        </IconButton>
                    </Tooltip>
                </Box>
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