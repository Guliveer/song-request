'use client'
import React from 'react';
import {Box, Card, Divider, Skeleton} from "@mui/material";

export default function SkeletonSongCard() {
    return (
        <Card variant="outlined" sx={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            minWidth: 'fit-content',
            maxWidth: 500,
            overflow: 'none',
            px: 3,
            py: 3,
            borderRadius: '1em',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
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
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.5em' }}>
                    <Skeleton animation="wave" variant="text" width={42} height={40} />
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
                    gap: 1,
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
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.5em' }}>
                            {/* Title */}
                            <Skeleton animation="wave" variant="text" width={28} height={36} />
                            <Skeleton animation="wave" variant="text" width={130} height={36} />
                        </Box>
                        {/* Author */}
                        <Skeleton animation="wave" variant="text" width={80} height={30} />
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
                            {/* Username */}
                            <Skeleton animation="wave" variant="text" width={28} height={32} />
                            <Skeleton animation="wave" variant="text" width={80} height={32} />
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.4em' }}>
                            {/* Date */}
                            <Skeleton animation="wave" variant="text" width={28} height={32} />
                            <Skeleton animation="wave" variant="text" width={140} height={32} />
                        </Box>
                    </Box>
                </Box>

                {/* Vote Buttons */}
                <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minWidth: '3em',
                    }}
                >
                    <Skeleton animation="wave" variant="rectangular" width={30} height={30} sx={{ borderRadius: 2.5 }} />
                    <Skeleton animation="wave" variant="text" width={24} height={20} sx={{ my: 0.5 }} />
                    <Skeleton animation="wave" variant="rectangular" width={30} height={30} sx={{ borderRadius: 2.5 }} />
                </Box>
            </Box>
        </Card>
    );
}
