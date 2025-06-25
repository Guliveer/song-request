'use client';
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { sortSongs } from '@/lib/actions';
import SongCard from '@/components/SongCard';
import {
    IconButton, Menu, MenuItem, Box, Pagination, Tooltip
} from '@mui/material';
import SortIcon from '@mui/icons-material/Sort';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import SearchField from '@/components/SearchField';

export default function Queue({playlist}) {
    const [songs, setSongs] = useState([]);
    const [sortCriteria, setSortCriteria] = useState('score');
    const [sortOrder, setSortOrder] = useState('desc');
    const [anchorEl, setAnchorEl] = useState(null);

    const [page, setPage] = useState(1);
    const [pageSize] = useState(12);
    const [totalPages, setTotalPages] = useState(1);

    const [searchQuery, setSearchQuery] = useState('');
    const [searchFilter, setSearchFilter] = useState('title');

    const [currentlyPreviewingSongId, setCurrentlyPreviewingSongId] = useState(null);

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
                    .select("id, score, author, title, added_at, user_id", { count: 'exact' })
                    .eq('playlist', playlist);

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

                // Primary sorting
                queryBuilder = queryBuilder.order(sortCriteria, { ascending: sortOrder === 'asc' });

                // Secondary sorting logic
                if (sortCriteria === 'added_at') {
                    queryBuilder = queryBuilder.order('score', { ascending: sortOrder === 'asc' });
                } else {
                    queryBuilder = queryBuilder.order('added_at', { ascending: false });
                }

                queryBuilder = queryBuilder.range((page - 1) * pageSize, page * pageSize - 1);

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
            gap: 3,
            minWidth: '100px',
            width: '100vw',
            p: 3,
        }}>
            {/* One big bar, centered and wide */}
            <Box sx={{
                width: "100%",
                maxWidth: 1100,
                mx: "auto",
                display: "flex",
                flexDirection: 'row',
                alignItems: "center",
                justifyContent: 'center',
                p: 3,
                gap: 2,
                background: "linear-gradient(90deg, #23253a 60%, #22253a 100%)",
                borderRadius: 5,
                boxShadow: "0 1.5px 12px 0 #13162c42",
            }}>
                <SearchField onSearchChange={handleSearchChange} />
                <Tooltip title="Sort by">
                    <IconButton
                        onClick={handleSortClick}
                        sx={{
                            borderRadius: 3,
                            aspectRatio: 1/1,
                            width: 48,
                            height: 48,
                            background: "none",
                            border: "1px solid #6beaf733",
                            color: "#bff6ff",
                        }}
                    >
                        <SortIcon />
                    </IconButton>
                </Tooltip>
                <Tooltip title={"Sort order"}>
                    <IconButton
                        onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                        sx={{
                            borderRadius: 3,
                            aspectRatio: 1/1,
                            width: 48,
                            height: 48,
                            background: "none",
                            border: "1px solid #6beaf733",
                            color: "#bff6ff",
                        }}
                    >
                        {sortOrder === 'asc' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />}
                    </IconButton>
                </Tooltip>
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
                gap: 3,
                justifyContent: 'center',
                alignItems: 'flex-start',
                width: '100%',
            }}>
                {songs.length === 0 ? (
                    <Box sx={{ textAlign: 'center', color: '#ccc' }}>No songs found</Box>
                ) : (
                    songs.map((song) => (
                        <SongCard
                            key={song.id}
                            id={song.id}
                            currentlyPreviewingSongId={currentlyPreviewingSongId}
                            setCurrentlyPreviewingSongId={setCurrentlyPreviewingSongId}
                        />
                    ))
                )}
            </Box>

            {(totalPages > 1) && (
                <Pagination
                    count={totalPages}
                    page={page}
                    onChange={handlePageChange}
                    color="primary"
                    sx={{ alignSelf: "center" }}
                />
            )}
        </Box>
    );
}