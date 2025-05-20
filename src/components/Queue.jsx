'use client';
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/utils/supabase';
import { sortSongs } from '@/utils/actions';
import SongCard from '@/components/SongCard';
import {
    IconButton, Menu, MenuItem, Box, Pagination
} from '@mui/material';
import SortIcon from '@mui/icons-material/Sort';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import SearchField from '@/components/SearchField';

export default function Queue() {
    const [songs, setSongs] = useState([]);
    const [sortCriteria, setSortCriteria] = useState('score');
    const [sortOrder, setSortOrder] = useState('desc');
    const [anchorEl, setAnchorEl] = useState(null);

    const [page, setPage] = useState(1);
    const [pageSize] = useState(12);
    const [totalPages, setTotalPages] = useState(1);

    const [searchQuery, setSearchQuery] = useState('');
    const [searchFilter, setSearchFilter] = useState('title');

    const handleSearchChange = useCallback((query, filter) => {
        setSearchQuery(query);
        setSearchFilter(filter);
        setPage(1);
    }, []);

    useEffect(() => {
        async function fetchQueue() {
            try {
                let queryBuilder = supabase
                    .from("queue")
                    .select("id, score, author, title, added_at, user_id", { count: 'exact' });

                if (searchQuery.trim() !== '') {
                    if (searchFilter === 'title') {
                        queryBuilder = queryBuilder.ilike('title', `%${searchQuery}%`);
                    } else if (searchFilter === 'author') {
                        queryBuilder = queryBuilder.ilike('author', `%${searchQuery}%`);
                    } else if (searchFilter === 'user') {
                        const { data: users, error: userError } = await supabase
                            .from('users')
                            .select('id')
                            .ilike('username', `%${searchQuery}%`);

                        if (userError) {
                            console.error("Błąd użytkownika:", userError.message);
                            return;
                        }

                        if (users.length === 0) {
                            setSongs([]);
                            setTotalPages(1);
                            return;
                        }

                        const userIds = users.map((u) => u.id);
                        queryBuilder = queryBuilder.in('user_id', userIds);
                    }
                }

                queryBuilder = queryBuilder
                    .order(sortCriteria, { ascending: sortOrder === 'asc' })
                    .range((page - 1) * pageSize, page * pageSize - 1);

                const { data, error, count } = await queryBuilder;

                if (error) throw error;

                setTotalPages(Math.ceil(count / pageSize));
                setSongs(sortSongs(data, sortCriteria, sortOrder));
            } catch (error) {
                console.error("Error fetching queue:", error.message);
            }
        }

        fetchQueue();
    }, [sortCriteria, sortOrder, page, searchQuery, searchFilter]);

    const handleSortClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleSortClose = () => {
        setAnchorEl(null);
    };

    const handleSortChange = (criteria) => {
        setSortCriteria(criteria);
        setPage(1);
        handleSortClose();
    };

    const handlePageChange = (event, value) => {
        setPage(value);
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


            <Box style={{
                width: '100%',
                display: "flex",
                flexDirection: 'row',
                flexWrap: 'nowrap',
                alignItems: "center",
                justifyContent: 'center',
                gap: "1rem",
            }}>

                <SearchField onSearchChange={handleSearchChange} />

                <IconButton onClick={handleSortClick}>
                    <SortIcon />
                </IconButton>
                <IconButton onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}>
                    {sortOrder === 'asc' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />}
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
                {songs.length === 0 ? (
                    <Box sx={{ textAlign: 'center', color: '#ccc' }}>Not found...</Box>
                ) : (
                    songs.map((song) => (
                        <SongCard key={song.id} id={song.id} />
                    ))
                )}
            </Box>

            <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
                style={{ alignSelf: "center" }}
            />
        </Box>
    );
}
