import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Box, CircularProgress } from '@mui/material';
import SongCard from '@/components/SongCard';
import { getSongData } from '@/utils/actions';

export default function SongPage() {
    const router = useRouter();
    const { song } = router.query; // Extract song ID from the URL
    const [exists, setExists] = useState(null);

    useEffect(() => {
        const checkSongExists = async () => {
            if (song) {
                try {
                    const data = await getSongData(song);
                    setExists(!!data); // Set true if song exists
                } catch (error) {
                    console.error('Error checking song:', error);
                    setExists(false);
                }
            }
        };

        checkSongExists();
    }, [song]);

    if (exists === null) {
        return (
            <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '90vh',
            }}
        >
            <CircularProgress />
        </Box>
        )
    }

    if (!exists) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '90vh',
                }}
            >
                <p>Song not found</p>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '90vh',
            }}
        >
            <SongCard id={song} />
        </Box>
    );
}