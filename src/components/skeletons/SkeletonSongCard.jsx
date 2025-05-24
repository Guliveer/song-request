'use client'
import React from 'react';
import {Box, Card, CardContent, Skeleton} from "@mui/material";

export default function SkeletonSongCard() {
    return (
        <Card
            sx={{
                background: `linear-gradient(135deg, rgba(135, 229, 221, 0.08) 0%, rgba(161, 113, 248, 0.08) 100%)`,
                border: `1px solid rgba(255,255,255,0.08)`,
                borderRadius: 1,
                overflow: "hidden",
                position: "relative",
                maxWidth: 500,
                width: '100%',
                minWidth: 'fit-content',
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
                    <Skeleton variant="text" width={32} height={28} sx={{borderRadius: 1}}/>
                    <Skeleton
                        variant="circular"
                        width={28}
                        height={28}
                        sx={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            borderRadius: 1,
                        }}
                    />
                </Box>

                {/* Main Content Row: Cover + Info + Votes */}
                <Box sx={{display: "flex", gap: 2, alignItems: "center"}}>
                    {/* Album Art */}
                    <Skeleton
                        variant="rectangular"
                        width={56}
                        height={56}
                        sx={{borderRadius: 1, flexShrink: 0}}
                    />
                    {/* Song Info */}
                    <Box sx={{flex: 1, minWidth: 0, mr: 1}}>
                        <Skeleton variant="text" width="80%" height={22} sx={{borderRadius: 1, mb: 0.5}}/>
                        <Skeleton variant="text" width="60%" height={18} sx={{borderRadius: 1, mb: 1}}/>

                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1.5,
                                flexWrap: "wrap",
                            }}
                        >
                            <Skeleton variant="text" width={68} height={16} sx={{borderRadius: 1}}/>
                            <Skeleton variant="text" width={48} height={16} sx={{borderRadius: 1}}/>
                            <Skeleton variant="text" width={88} height={16} sx={{borderRadius: 1}}/>
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
                        <Skeleton variant="circular" width={32} height={32} sx={{borderRadius: 1}}/>
                        <Skeleton variant="text" width={24} height={18} sx={{borderRadius: 1, my: 0.5}}/>
                        <Skeleton variant="circular" width={32} height={32} sx={{borderRadius: 1}}/>
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
                    {/* Tag */}
                    <Skeleton variant="rectangular" width={56} height={24} sx={{borderRadius: 1}}/>
                    {/* Avatar group */}
                    <Box sx={{display: "flex", alignItems: "center", gap: 1}}>
                        {[...Array(2)].map((_, i) => (
                            <Skeleton
                                key={i}
                                variant="circular"
                                width={20}
                                height={20}
                                sx={{borderRadius: 1}}
                            />
                        ))}
                        <Skeleton
                            variant="circular"
                            width={20}
                            height={20}
                            sx={{borderRadius: 1}}
                        />
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
}