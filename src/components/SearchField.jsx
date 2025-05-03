import { useState, useEffect, useRef } from 'react';
import {
    Box, IconButton, InputBase, Paper, Popper,
    Radio, RadioGroup, FormControlLabel, ClickAwayListener
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

function SearchField({ onSearchChange }) {
    const [query, setQuery] = useState('');
    const [filter, setFilter] = useState('title');
    const [showFilter, setShowFilter] = useState(false);
    const anchorRef = useRef(null);

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            onSearchChange(query, filter);
        }, 300);
        return () => clearTimeout(delayDebounce);
    }, [query, filter, onSearchChange]);

    const handleInputChange = (e) => {
        const value = e.target.value;
        setQuery(value);
        if (value.trim() !== '') {
            setShowFilter(false);
        }
    };

    return (
        <ClickAwayListener onClickAway={() => setShowFilter(false)}>
            <Box ref={anchorRef} sx={{ position: 'relative', width: 350, mt: 1 }}>
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
                    />
                    <IconButton
                        size="small"
                        onClick={() => setShowFilter((prev) => !prev)}
                        sx={{ color: '#fff', opacity: 0.7 }}
                    >
                        <ArrowDropDownIcon />
                    </IconButton>
                </Paper>

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
            </Box>
        </ClickAwayListener>
    );
}

export default SearchField;
