'use server'
import React from 'react';
import { Box, Card, Skeleton } from "@mui/material";
import PropTypes from 'prop-types';

export default function SkeletonSongCard({ cardStyle }) {
    
    return (
        <Card variant="outlined" sx={cardStyle}>
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

SkeletonSongCard.propTypes = {
    cardStyle: PropTypes.object,
}