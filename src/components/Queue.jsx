'use server'
import {useEffect, useState} from "react";
import {supabase} from "@/utils/supabase";
import SongCard from "@/components/SongCard";
import {IconButton, Menu, MenuItem, Box} from '@mui/material';
import SortIcon from '@mui/icons-material/Sort';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

export default function Queue() {
    const [songs, setSongs] = useState([]);
    const [sortCriteria, setSortCriteria] = useState('score');
    const [sortOrder, setSortOrder] = useState('desc');
    const [anchorEl, setAnchorEl] = useState(null);

    useEffect(() => {
        async function fetchQueue() {
            try {
                const {data, error} = await supabase
                    .from("queue")
                    .select("id, score, author, title, added_at");
                if (error) throw error;

                // Sort songs based on selected criteria and order
                const sortedSongs = data.sort((a, b) => {
                    let comparison = 0;
                    if (sortCriteria === 'score') {
                        comparison = b.score - a.score;
                    } else if (sortCriteria === 'author') {
                        comparison = a.author.localeCompare(b.author);
                    } else if (sortCriteria === 'title') {
                        comparison = a.title.localeCompare(b.title);
                    }
                    return sortOrder === 'asc' ? comparison : -comparison;
                });

                // Assign rank based on sorted order
                sortedSongs.forEach((song, index) => {
                    song.rank = index;
                });

                setSongs(sortedSongs);
            } catch (error) {
                console.error("Error fetching queue:", error.message);
            }
        }

        fetchQueue();
    }, [sortCriteria, sortOrder]);

    const handleSortClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleSortClose = () => {
        setAnchorEl(null);
    };

    const handleSortChange = (criteria) => {
        setSortCriteria(criteria);
        handleSortClose();
    };

    return (
        <Box sx={{
            display: "flex",
            flexDirection: "column",
            flexWrap: 'nowrap',
            alignItems: 'flex-start',
            justifyContent: 'center',
            gap: 5,
            minWidth: '100px',
            width: '100vw',
            p: '1rem 2rem',
        }}>

            {/* Sort options */}
            <Box style={{
                width: '100%',
                display: "flex",
                flexDirection: 'row',
                flexWrap: 'nowrap',
                alignItems: "center",
                justifyContent: 'flex-end',
                gap: "1rem",
            }}>
                <IconButton onClick={handleSortClick}>
                    <SortIcon/>
                </IconButton>
                <IconButton onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}>
                    {sortOrder === 'asc' ? <ArrowUpwardIcon/> : <ArrowDownwardIcon/>}
                </IconButton>
            </Box>
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleSortClose}
            >
                <MenuItem onClick={() => handleSortChange('score')}>Score</MenuItem>
                <MenuItem onClick={() => handleSortChange('author')}>Author</MenuItem>
                <MenuItem onClick={() => handleSortChange('title')}>Title</MenuItem>
            </Menu>

            <Box sx={{
                display: 'flex',
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: 5,
                justifyContent: 'center',
                alignItems: 'flex-start',
                width: '100%',
            }}>
                {/* Render sorted queue */}
                {songs.map((song) => (
                    <SongCard key={song.id} id={song.id}/>
                ))}
            </Box>
        </Box>
    );
}