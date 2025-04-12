'use server'
import {useEffect, useState} from "react";
import {supabase} from "@/utils/supabase";
import {sortSongs} from "@/utils/actions";
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

                // Use the utility function to sort songs
                const sortedSongs = sortSongs(data, sortCriteria, sortOrder);
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
                <MenuItem onClick={() => handleSortChange('added_at')}>Added Time</MenuItem>
            </Menu>

            {/* Render sorted queue */}
            {songs.map((song) => (
                <SongCard key={song.id} id={song.id}/>
            ))}
        </div>
    );
}