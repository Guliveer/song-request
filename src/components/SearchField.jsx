import { useState, useEffect } from 'react';
import {
    Box, IconButton, InputBase, Paper, Menu, MenuItem
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

const FILTERS = [
    { value: 'title', label: 'Song title' },
    { value: 'author', label: 'Author' },
    { value: 'user', label: 'User' },
];

function SearchField({ onSearchChange }) {
    const [query, setQuery] = useState('');
    const [filter, setFilter] = useState('title');
    const [anchorEl, setAnchorEl] = useState(null);

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            onSearchChange(query, filter);
        }, 300);
        return () => clearTimeout(delayDebounce);
    }, [query, filter, onSearchChange]);

    const handleInputChange = (e) => setQuery(e.target.value);

    const handleFilterClick = (event) => setAnchorEl(event.currentTarget);
    const handleFilterClose = () => setAnchorEl(null);

    const handleFilterSelect = (f) => {
        setFilter(f);
        setAnchorEl(null);
    };

    const placeholder = `Search by ${FILTERS.find(f => f.value === filter).label.toLowerCase()}...`;

    return (
        <Paper
            component="form"
            sx={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                borderRadius: 3,
                background: "none",
                border: "1px solid #6beaf733",
                height: 54,
                pl: 2,
                pr: 1,
                boxShadow: "none",
                minWidth: 100,
                maxWidth: 'none',
            }}
            onSubmit={e => e.preventDefault()}
        >
            <SearchIcon sx={{ color: "#6beaf7", mr: 1, fontSize: 24 }} />
            <InputBase
                sx={{
                    flex: 1,
                    color: "#dff7ff",
                    fontSize: 19,
                    fontWeight: 500,
                }}
                placeholder={placeholder}
                value={query}
                onChange={handleInputChange}
                inputProps={{ 'aria-label': 'search' }}
            />
            <Box>
                <IconButton
                    size="small"
                    onClick={handleFilterClick}
                    sx={{
                        ml: 0.5,
                        p: 0.5,
                        borderRadius: "24px",
                        color: "#bff6ff",
                        background: "none",
                        '&:hover': { background: "none" }
                    }}
                    aria-label="Select search filter"
                >
                    <ArrowDropDownIcon sx={{ fontSize: 28 }} />
                </IconButton>
                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleFilterClose}
                    // BRAK PaperProps = domyślny wygląd jak w Queue
                    anchorOrigin={{
                        vertical: "bottom",
                        horizontal: "right"
                    }}
                    transformOrigin={{
                        vertical: "top",
                        horizontal: "right"
                    }}
                >
                    {FILTERS.map((f) => (
                        <MenuItem
                            key={f.value}
                            onClick={() => handleFilterSelect(f.value)}
                            selected={filter === f.value}
                            // BRAK sx = domyślny wygląd jak w Queue
                        >
                            {f.label}
                        </MenuItem>
                    ))}
                </Menu>
            </Box>
        </Paper>
    );
}

export default SearchField;
