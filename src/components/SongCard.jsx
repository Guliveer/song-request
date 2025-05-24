import PropTypes from 'prop-types';
import React, {useState, useEffect, useCallback} from 'react';
import Link from "next/link";
import {supabase} from '@/utils/supabase';
import {useRouter} from 'next/router';
import {
    Box, Card, CardContent, Typography, IconButton, Snackbar, Tooltip,
    Avatar, AvatarGroup, Chip, Divider
} from "@mui/material";
import SkeletonSongCard from "@/components/skeletons/SkeletonSongCard";
import {
    getUserInfo, getSongData, getCurrentUser, removeUserVote,
    updateUserVote, playSound, genUserAvatar
} from "@/utils/actions";
import debounce from 'lodash.debounce';
import {
    KeyboardArrowUpRounded as UpvoteIcon,
    KeyboardArrowDownRounded as DownvoteIcon,
    AccountCircleRounded as WhoAddedIcon,
    CalendarTodayRounded as DateAddedIcon,
    MusicNoteRounded as MusicIcon,
    NumbersRounded as RankIcon,
    PersonAddRounded as FollowIcon,
    OpenInNewRounded as ExternalLinkIcon,
    PlayArrow as PlayIcon,
    Delete as DeleteIcon,
    RestartAlt as RestartAltIcon,
    Block as BlockIcon
} from '@mui/icons-material';
import {useTheme} from "@mui/material/styles";

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
            <UpvoteIcon color={userVote === 1 ? "primary" : "disabled"} sx={{fontSize: 30}}/>
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
            <DownvoteIcon color={userVote === -1 ? "primary" : "disabled"} sx={{fontSize: 30}}/>
        </IconButton>
    </Box>
));

function SongCard({id}) {
    const theme = useTheme();
    const [songData, setSongData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [userVote, setUserVote] = useState(null);
    const [error, setError] = useState(null);
    const [isFollowing, setIsFollowing] = useState(false);
    const [followedUsersVotes, setFollowedUsersVotes] = useState([]);
    const router = useRouter();
    const [isBanned, setIsBanned] = useState(false);
    const [hovered, setHovered] = useState(false);

    const isAdminPanel = router.pathname.startsWith("/admin");

    const fetchData = useCallback(async () => {
        try {
            const [song, currentUser] = await Promise.all([getSongData(id), getCurrentUser()]);

            if (currentUser) {
                setUser(currentUser);

                const {data: banData, error: banError} = await supabase
                    .from('users')
                    .select('ban_status')
                    .eq('id', currentUser.id)
                    .single();

                if (!banError && banData?.ban_status > 0) {
                    setIsBanned(true);
                }

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

                const {data: userData, error: userError} = await supabase
                    .from('users')
                    .select('followed_users')
                    .eq('id', currentUser.id)
                    .single();

                if (!userError && userData.followed_users) {
                    setIsFollowing(userData.followed_users.includes(song.user_id));
                    if (userData.followed_users.length > 0) {
                        const {data: followedVotes, error: followedVotesError} = await supabase
                            .from('votes')
                            .select('user_id, vote')
                            .eq('song_id', id)
                            .in('user_id', userData.followed_users);

                        if (!followedVotesError && followedVotes) {
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

            await playSound('click', 0.75);
        } catch (error) {
            console.error("Error while placing a vote:", error);
            setError(`Something went wrong: ${error.message}`);
        } finally {
            await fetchData();
            setUserVote(resultVoteVal);
        }
    }, 300), [user, userVote, id, fetchData]);

    // Admin actions
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
            const updatedFollowed = [...currentFollowed, songData.rawUserId];

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

    const {title, author, url, added_at, score, rank, username, genre, duration} = songData;

    // Score coloring like v0
    const getScoreColor = () => {
        if (score > 30) return theme.palette.primary.main;
        if (score > 10) return theme.palette.secondary.main;
        return theme.palette.text.secondary;
    };

    // AvatarGroup tooltip for +N
    function additionalAvatarsTooltip(props) {
        const hiddenVotes = followedUsersVotes.slice(3).map(vote => (
            <div key={vote.user_id}>
                {vote.username} {vote.vote === 1 ? 'upvoted' : 'downvoted'}
            </div>
        ));
        return (
            <Tooltip
                title={<React.Fragment>{hiddenVotes}</React.Fragment>}
                arrow
                placement="bottom"
            >
                <Avatar {...props} />
            </Tooltip>
        );
    }

    return (
        <Card
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            sx={{
                background: hovered
                    ? `linear-gradient(135deg, rgba(135, 229, 221, 0.08) 0%, rgba(161, 113, 248, 0.08) 100%), ${theme.palette.background.paper}`
                    : theme.palette.background.paper,
                border: `1px solid ${hovered ? theme.palette.primary.main + "40" : "rgba(255, 255, 255, 0.08)"}`,
                borderRadius: 3,
                overflow: "hidden",
                position: "relative",
                transition: "all 0.2s ease-in-out",
                cursor: "pointer",
                "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: `0 8px 32px rgba(0, 0, 0, 0.3), 0 0 0 1px ${theme.palette.primary.main}20`,
                },
                maxWidth: 500,
                width: '100%',
                minWidth: 'fit-content'
            }}
        >
            <CardContent sx={{p: 2.5}}>
                {/* Header Row: Rank + ExternalLink */}
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        mb: 2,
                        width: "100%",
                        position: "relative",
                    }}
                >
                    <Typography
                        variant="h6"
                        sx={{
                            color: theme.palette.text.disabled,
                            fontWeight: 400,
                            fontSize: "1.1rem",
                            fontFamily: "monospace",
                            minWidth: "32px",
                        }}
                    >
                        #{rank}
                    </Typography>
                    <IconButton
                        onClick={() => router.push(`/song/${id}`)}
                        size="small"
                        sx={{
                            color: "text.secondary",
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            zIndex: 1,
                        }}
                    >
                        <Tooltip title="Open song page" arrow>
                            <ExternalLinkIcon/>
                        </Tooltip>
                    </IconButton>
                </Box>

                {/* Main Content Row: Cover + Info + Votes */}
                <Box sx={{display: "flex", gap: 2, alignItems: "center"}}>
                    {/* Album Art & Play Button */}
                    <Box
                        sx={{
                            position: "relative",
                            flexShrink: 0,
                            width: 56,
                            height: 56,
                        }}
                    >
                        <Box
                            sx={{
                                width: "100%",
                                height: "100%",
                                borderRadius: 3, // 8px
                                background: `linear-gradient(135deg, ${theme.palette.primary.main}25, ${theme.palette.secondary.main}25)`,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                position: "relative",
                                overflow: "hidden",
                            }}
                        >
                            <MusicIcon
                                sx={{
                                    fontSize: 24,
                                    color: theme.palette.primary.main,
                                    opacity: 0.8,
                                }}
                            />
                            {/* Play Button Overlay */}
                            <Box
                                sx={{
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    backgroundColor: "rgba(0, 0, 0, 0.7)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    opacity: hovered ? 1 : 0,
                                    transition: "opacity 0.2s ease",
                                    borderRadius: 1,
                                }}
                            >
                                <IconButton
                                    sx={{
                                        color: "white",
                                        backgroundColor: theme.palette.primary.main,
                                        width: 32,
                                        height: 32,
                                        "&:hover": {
                                            backgroundColor: theme.palette.primary.light,
                                            transform: "scale(1.05)",
                                        },
                                    }}
                                    disabled
                                >
                                    <PlayIcon sx={{fontSize: 18}}/>
                                </IconButton>
                            </Box>
                        </Box>
                    </Box>

                    {/* Song Info */}
                    <Box sx={{flex: 1, minWidth: 0, mr: 1}}>
                        <Typography
                            variant="body1"
                            sx={{
                                fontWeight: 600,
                                fontSize: "1rem",
                                color: theme.palette.text.primary,
                                mb: 0.25,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                lineHeight: 1.3,
                            }}
                            component="div"
                        >
                            <Link href={url} target="_blank" style={{textDecoration: 'none', color: 'inherit'}}>
                                {title}
                            </Link>
                        </Typography>

                        <Typography
                            variant="body2"
                            sx={{
                                color: theme.palette.text.secondary,
                                fontSize: "0.875rem",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                mb: 1,
                            }}
                        >
                            {author}
                        </Typography>

                        {/* Metadata Row */}
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1.5,
                                flexWrap: "wrap",
                            }}
                        >
                            <Box sx={{display: "flex", alignItems: "center", gap: 0.5}}>
                                <WhoAddedIcon sx={{fontSize: 14, color: theme.palette.text.disabled}}/>
                                <Typography variant="caption" color="text.disabled"
                                            sx={{fontSize: "0.75rem", display: 'flex', alignItems: 'center', gap: 0.5}}>
                                    <Link href={`/user/${songData.rawUserId}`}>
                                        {username}
                                    </Link>
                                    <Tooltip title="Open user profile" arrow>
                                        <ExternalLinkIcon sx={{
                                            color: 'text.secondary',
                                            fontSize: '0.9rem',
                                        }}/>
                                    </Tooltip>
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

                            {duration && (
                                <Box sx={{display: "flex", alignItems: "center", gap: 0.5}}>
                                    <CalendarTodayRounded sx={{fontSize: 14, color: theme.palette.text.disabled}}/>
                                    <Typography variant="caption" color="text.disabled" sx={{fontSize: "0.75rem"}}>
                                        {duration}
                                    </Typography>
                                </Box>
                            )}

                            <Box sx={{display: 'flex', alignItems: 'center', gap: 0.5}}>
                                <DateAddedIcon sx={{fontSize: 14, color: theme.palette.text.disabled}}/>
                                <Typography variant="caption" color="text.disabled" sx={{fontSize: "0.75rem"}}>
                                    {new Date(added_at).toLocaleString()}
                                </Typography>
                            </Box>
                        </Box>
                    </Box>

                    {/* Voting Section */}
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 0.5,
                            minWidth: 48,
                            py: 0.5,
                        }}
                    >
                        <IconButton
                            size="small"
                            onClick={() => handleVote(1)}
                            sx={{
                                color: userVote === 1 ? theme.palette.primary.main : theme.palette.text.disabled,
                                backgroundColor: userVote === 1 ? `${theme.palette.primary.main}20` : "transparent",
                                width: 32,
                                height: 32,
                                "&:hover": {
                                    backgroundColor: `${theme.palette.primary.main}20`,
                                    color: theme.palette.primary.main,
                                },
                            }}
                            disabled={isBanned}
                        >
                            <UpvoteIcon sx={{fontSize: 20}}/>
                        </IconButton>

                        <Typography
                            variant="body2"
                            sx={{
                                fontWeight: 700,
                                color: getScoreColor(),
                                fontSize: "0.875rem",
                                textAlign: "center",
                                minWidth: "24px",
                            }}
                        >
                            {score}
                        </Typography>

                        <IconButton
                            size="small"
                            onClick={() => handleVote(-1)}
                            sx={{
                                color: userVote === -1 ? theme.palette.error.main : theme.palette.text.disabled,
                                backgroundColor: userVote === -1 ? `${theme.palette.error.main}20` : "transparent",
                                width: 32,
                                height: 32,
                                "&:hover": {
                                    backgroundColor: `${theme.palette.error.main}20`,
                                    color: theme.palette.error.main,
                                },
                            }}
                            disabled={isBanned}
                        >
                            <DownvoteIcon sx={{fontSize: 20}}/>
                        </IconButton>
                    </Box>
                </Box>

                {/* Bottom Row - Tags and Voters */}
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        mt: 2,
                        pt: 1.5,
                        borderTop: `1px solid rgba(255, 255, 255, 0.06)`,
                    }}
                >
                    {/* Tags */}
                    <Box sx={{display: "flex", gap: 1, alignItems: "center"}}>
                        {genre && (
                            <Chip
                                label={genre}
                                size="small"
                                sx={{
                                    height: 24,
                                    backgroundColor: `${theme.palette.secondary.main}15`,
                                    color: theme.palette.secondary.main,
                                    border: `1px solid ${theme.palette.secondary.main}30`,
                                    fontSize: "0.7rem",
                                    fontWeight: 500,
                                    "& .MuiChip-label": {
                                        px: 1,
                                    },
                                }}
                            />
                        )}
                    </Box>

                    {/* Voters */}
                    {followedUsersVotes.length > 0 && (
                        <Box sx={{display: "flex", alignItems: "center", gap: 1}}>
                            <AvatarGroup
                                max={3}
                                sx={{
                                    "& .MuiAvatar-root": {
                                        width: 20,
                                        height: 20,
                                        fontSize: "0.65rem",
                                        border: `1px solid ${theme.palette.background.paper}`,
                                    },
                                }}
                                slotProps={{
                                    additionalAvatar: {
                                        component: additionalAvatarsTooltip
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
                            <Typography variant="caption" color="text.disabled" sx={{fontSize: "0.7rem", ml: 0.5}}>
                                voted
                            </Typography>
                        </Box>
                    )}
                </Box>

                {/* Admin Panel Buttons */}
                {isAdminPanel && (
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        width: '100%',
                        alignItems: 'center',
                        mt: 2,
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
            </CardContent>
        </Card>
    );
}

SongCard.propTypes = {
    id: PropTypes.number.isRequired,
};

export default React.memo(SongCard);