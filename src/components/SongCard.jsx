//? USAGE:
/*
import SongCard from '@/components/SongCard'

<SongCard id={insert_id_here} />
*/

import React, { useState, useEffect } from 'react';
import Link from "next/link";
import {supabase} from '@/utils/supabase'
import {Button, Box, Card, Typography} from "@mui/material";
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
        // implement skeleton loading (MUI) here
        return <div>Loading...</div>;
    }

    const { title, author, url, added_at, user_id, score, rank } = songData;

    return (
        <Card variant="outlined" className="song-card" id={"song-"+id} sx={{
            display: 'flex',
            flexDirection: 'row',
            width: '100%',
            maxWidth: '800px',
            padding: '0.5rem 1rem',
            borderRadius: '10px'
        }}>
            <Box className="rank" sx={{
                p: 2,
                maxWidth: '150px',
                width: '10%',
                display: 'flex',
                placeContent: 'center',
                placeItems: 'center'
            }}>
                <Typography variant="h6">{rank}</Typography>
            </Box>

            <Box className="about" sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-around',
                placeItems: 'center',
                width: '100%',
            }}>
                <Box className="song" sx={{
                    display: 'flex',
                    flexDirection: 'column',
                }}>
                    <Typography variant="h6" className="title">
                        <Link href={url} target="_blank">{title}</Link>
                    </Typography>
                    <Typography variant="body1" className="artist">{author}</Typography>
                </Box>
                <Box className="details" sx={{
                    display: 'flex',
                    flexDirection: 'column',
                }}>
                    <Typography variant="body2" className="user">{user_id}</Typography>
                    <Typography variant="body2" className="add-time">{added_at}</Typography>
                </Box>
            </Box>

            <Box className="voting" sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                placeContent: 'center',
                placeItems: 'center',
                width: '20%',
                maxWidth: '150px',
                minWidth: '50px',
            }}>
                <Button variant="contained" className="vote-up">BTN_UP</Button>
                <Typography variant="h6" className="score">{score}</Typography>
                <Button variant="contained" className="vote-down">BTN_DN</Button>
            </Box>
        </Card>
    );
}

SongCard.propTypes = {
    id: PropTypes.number.isRequired,
};