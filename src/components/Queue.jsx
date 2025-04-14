'use server'
import {useEffect, useState} from "react";
import {supabase} from "@/utils/supabase";
import {sortSongs} from "@/utils/actions";
import SongCard from "@/components/SongCard";
import {IconButton, Menu, MenuItem, Box, Button, Pagination} from '@mui/material';
import SortIcon from '@mui/icons-material/Sort';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import SearchField from '@/components/SearchField';

export default function Queue() {
    const [songs, setSongs] = useState([]);
    const [sortCriteria, setSortCriteria] = useState('score');
    const [sortOrder, setSortOrder] = useState('desc');
    const [anchorEl, setAnchorEl] = useState(null);

    // Pagination states
    const [page, setPage] = useState(1); // Aktualna strona
    const [pageSize] = useState(10); // Liczba elementów na stronę
    const [totalPages, setTotalPages] = useState(1); // Całkowita liczba stron

    useEffect(() => {
        async function fetchQueue() {
            try {
                // Fetch data from the "queue" table with pagination
                const {data, error, count} = await supabase
                    .from("queue")
                    .select("id, score, author, title, added_at", { count: 'exact' }) // Pobierz dane z liczbą rekordów
                    .order(sortCriteria, { ascending: sortOrder === 'asc' })
                    .range((page - 1) * pageSize, page * pageSize - 1); // Dodano stronicowanie
                if (error) throw error;

                // Ustaw liczbę stron na podstawie liczby rekordów
                setTotalPages(Math.ceil(count / pageSize));
                const sortedSongs = sortSongs(data, sortCriteria, sortOrder);
                setSongs(sortedSongs); // Ustaw dane w stanie
            } catch (error) {
                console.error("Error fetching queue:", error.message);
            }
        }

        fetchQueue();
    }, [sortCriteria, sortOrder, page]); // Dodano zależność od `page`

    const handleSortClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleSortClose = () => {
        setAnchorEl(null);
    };

    const handleSortChange = (criteria) => {
        setSortCriteria(criteria);
        setPage(1); // Resetuj stronę
        handleSortClose();
    };

    const handlePageChange = (event, value) => {
        setPage(value); // Zmień stronę
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
            
            {/* Search field */}
            <SearchField />

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

            {/* Sort menu */}
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

            {/* Pagination */}
            <Pagination
                count={totalPages} // Liczba stron
                page={page} // Aktualna strona
                onChange={handlePageChange} // Zmiana strony
                color="primary"
                style={{alignSelf: "center"}}
            />
        </Box>
    );
}
