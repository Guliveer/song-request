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
                    } else if (sortCriteria === 'added_at') { // New sorting logic
                        comparison = new Date(a.added_at) - new Date(b.added_at);
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
        <div style={{display: "flex", flexDirection: "column", gap: "1rem"}}>
            {/* Sort options */}
            <Box style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                <div></div>
                {/* Empty div to push icons to the right */}
                <div style={{display: "flex", alignItems: "center", gap: "1rem"}}>
                    <IconButton onClick={handleSortClick}>
                        <SortIcon/>
                    </IconButton>
                    <IconButton onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}>
                        {sortOrder === 'asc' ? <ArrowUpwardIcon/> : <ArrowDownwardIcon/>}
                    </IconButton>
                </div>
            </Box>
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleSortClose}
            >
                <MenuItem onClick={() => handleSortChange('score')}>Score</MenuItem>
                <MenuItem onClick={() => handleSortChange('author')}>Author</MenuItem>
                <MenuItem onClick={() => handleSortChange('title')}>Title</MenuItem>
                <MenuItem onClick={() => handleSortChange('added_at')}>Added Time</MenuItem> {/* New option */}
            </Menu>

            {/* Render sorted queue */}
            {songs.map((song) => (
                <SongCard key={song.id} id={song.id}/>
            ))}
        </div>
    );
}