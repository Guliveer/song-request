import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/utils/supabase';
import {Box, IconButton, InputBase, Paper, Popper, Radio, RadioGroup, FormControlLabel, ClickAwayListener,} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

function SearchField() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [filter, setFilter] = useState('title');
    const [showFilter, setShowFilter] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const anchorRef = useRef(null);

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            if (query.trim() === '') {
                setResults([]);
                return;
            }

            const fetchResults = async () => {
                let searchQuery = supabase.from('queue').select('*');

                if (filter === 'title') {
                    searchQuery = searchQuery.ilike('title', `%${query}%`);
                } else if (filter === 'author') {
                    searchQuery = searchQuery.ilike('author', `%${query}%`);
                } else if (filter === 'user') {
                    const { data: users, error: userError } = await supabase
                        .from('users')
                        .select('id')
                        .ilike('username', `%${query}%`);

                    if (userError) {
                        console.error('Błąd podczas pobierania użytkowników:', userError.message);
                        return;
                    }

                    if (users.length === 0) {
                        setResults([]);
                        return;
                    }

                    const userIds = users.map((user) => user.id);
                    searchQuery = searchQuery.in('user_id', userIds);
                }

                const { data, error } = await searchQuery;

                if (error) {
                    console.error('Błąd podczas pobierania danych:', error.message);
                } else {
                    setResults(data);
                }
            };

            fetchResults();
        }, 300);

        return () => clearTimeout(delayDebounce);
    }, [query, filter]);

    const handleInputChange = (e) => {
        const value = e.target.value;
        setQuery(value);

        if (value.trim() !== '') {
            setShowFilter(false);
        }
    };

    return (
        <ClickAwayListener onClickAway={() => {
            setShowFilter(false);
            setIsFocused(false);
        }}>
            <Box ref={anchorRef} sx={{ position: 'relative', width: 500, mt: 1 }}>
                <Paper
                    component="form"
                    sx={{
                        p: '6px 12px',
                        display: 'flex',
                        alignItems: 'center',
                        borderRadius: '12px',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(4px)',
                        color: '#fff',
                        mb: 1,
                        border: '1.5px solid cyan',
                    }}
                >
                    <SearchIcon sx={{ opacity: 0.6, mr: 1 }} />
                    <InputBase
                        sx={{ ml: 1, flex: 1, color: '#fff' }}
                        placeholder="Search"
                        value={query}
                        onChange={handleInputChange}
                        onFocus={() => {
                            setIsFocused(true);
                            setShowFilter(false);
                        }}
                    />
                    <IconButton
                        size="small"
                        onClick={() => setShowFilter((prev) => !prev)}
                        sx={{ color: '#fff', opacity: 0.7 }}
                    >
                        <ArrowDropDownIcon />
                    </IconButton>
                </Paper>

                {/* Dropdown filtrów */}
                <Popper
                    open={showFilter}
                    anchorEl={anchorRef.current}
                    placement="bottom-end"
                    style={{ zIndex: 9999 }}
                >
                    <Paper
                        sx={{
                            mt: 1,
                            p: 1,
                            backgroundColor: 'rgba(0, 0, 0, 0.9)',
                            color: '#fff',
                            borderRadius: '10px',
                            width: '200px',
                        }}
                    >
                        <RadioGroup
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            sx={{ color: '#fff' }}
                        >
                            {['title', 'author', 'user'].map((option) => (
                                <FormControlLabel
                                    key={option}
                                    value={option}
                                    control={<Radio sx={{ color: '#fff' }} />}
                                    label={option.charAt(0).toUpperCase() + option.slice(1)}
                                />
                            ))}
                        </RadioGroup>
                    </Paper>
                </Popper>

                {/* Lista wyników */}
                {query.trim() !== '' && isFocused && (
                    <Box
                        sx={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            width: '100%',
                            maxHeight: '250px',
                            overflowY: 'auto',
                            backgroundColor: 'rgba(0, 0, 0, 1)',
                            borderRadius: '12px',
                            mt: 1,
                            p: 1,
                            zIndex: 5,
                        }}
                    >
                        {results.length === 0 ? (
                            <Box sx={{ textAlign: 'center', color: '#ccc' }}>Not found...</Box>
                        ) : (
                            results.map((item) => (
                                <Box
                                    key={item.id}
                                    sx={{
                                        p: 1,
                                        borderRadius: '12px',
                                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                        mb: 1,
                                        cursor: 'pointer',
                                        color: '#fff',
                                    }}
                                >
                                    <strong>{item.title}</strong> – {item.author}
                                </Box>
                            ))
                        )}
                    </Box>
                )}
            </Box>
        </ClickAwayListener>
    );
}

export default SearchField;
