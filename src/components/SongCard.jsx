import React, { useState, useEffect } from 'react';
import Link from "next/link";
import { supabase } from '@/utils/supabase';
import { Box, Card, Typography, Skeleton, IconButton } from "@mui/material";
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import PropTypes from 'prop-types';

export default function SongCard({ id }) {
    const [songData, setSongData] = useState(null);

    useEffect(() => {
        async function fetchData() {
            const { data, error } = await supabase
                .from('queue')
                .select('title, author, url, added_at, user_id, score, rank')
                .eq('id', id)
                .single();

            if (error) {
                console.error('Error fetching data:', error);
                return;
            }

            setSongData(data);
        }

        fetchData();
    }, [id]);

    if (!songData) {
        return (
            <Card variant="outlined" sx={{
                display: 'flex',
                flexDirection: 'row',
                width: '100%',
                maxWidth: '800px',
                padding: '1rem',
                borderRadius: '10px',
                alignItems: 'center'
            }}>
                <Box sx={{ width: '10%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <Skeleton variant="text" width={40} height={30} />
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
        <Card variant="outlined" sx={{
            display: 'flex',
            flexDirection: 'row',
            width: '100%',
            maxWidth: '800px',
            padding: '1rem',
            borderRadius: '10px',
            alignItems: 'center'
        }}>
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
                <Typography variant="body2" sx={{ fontSize: '0.75rem', fontWeight: 'normal', color: 'text.secondary' }}>
                    Added by: {user_id}
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.75rem', fontWeight: 'normal', color: 'text.secondary' }}>
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
