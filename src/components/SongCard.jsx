import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import Link from "next/link";
import { Box, Card, Typography, IconButton } from "@mui/material";
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import SkeletonSongCard from "@/components/skeletons/SkeletonSongCard";
import {getUserInfo, getSongData} from "@/utils/actions"

export default function SongCard({ id }) {
    const [songData, setSongData] = useState(null);
    const [loading, setLoading] = useState(true);

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
        }

        fetchData();
    }, [id]);

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
                <Typography variant="body2" sx={{ fontSize: '0.75rem', fontWeight: 'normal' }}>
                    Added by: {username}
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.75rem', fontWeight: 'normal' }}>
                    {new Date(added_at).toLocaleString()}
                </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '1rem', width: '25%', justifyContent: 'center' }}>
                <IconButton color="primary" aria-label="vote up">
                    <ThumbUpIcon />
                </IconButton>
                <Typography variant="h6">{score}</Typography>
                <IconButton color="primary" aria-label="vote down">
                    <ThumbDownIcon />
                </IconButton>
            </Box>
        </Card>
    );
}

SongCard.propTypes = {
    id: PropTypes.number.isRequired,
};
