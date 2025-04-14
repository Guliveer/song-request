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
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {/* Sort and search options in one row */}
            <Box
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    width: "100%",
                }}
            >
                {/* Search field */}

                <SearchField />


                {/* Sort options */}
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <IconButton onClick={handleSortClick}>
                        <SortIcon />
                    </IconButton>
                    <IconButton onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}>
                        {sortOrder === 'asc' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />}
                    </IconButton>
                </div>
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

            {/* Render sorted queue */}
            {songs.map((song) => (
                <SongCard key={song.id} id={song.id} />
            ))}

            {/* Pagination */}
            <Pagination
                count={totalPages} // Liczba stron
                page={page} // Aktualna strona
                onChange={handlePageChange} // Zmiana strony
                color="primary"
                style={{alignSelf: "center"}}
            />
        </div>
    );
}
