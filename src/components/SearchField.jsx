import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/utils/supabase';
import { IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

function SearchField() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [filter, setFilter] = useState('title'); // 'title' | 'author' | 'user'
    const [showFilter, setShowFilter] = useState(false);
    const containerRef = useRef(null);

    // Obsługuje kliknięcie poza komponentem
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setShowFilter(false); // Ukrywa filtr po kliknięciu poza pole wyszukiwania
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

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

                    const userIds = users.map(user => user.id);
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

        // Ukrywa filtr, gdy zaczynasz wpisywać
        if (value.trim() !== '') {
            setShowFilter(false);
        } else {
            setShowFilter(true); // Jeśli pole jest puste, filtr jest widoczny
        }
    };

    return (
        <div ref={containerRef} style={{ position: 'relative', width: '500px' }}>
            <input
                type="text"
                placeholder="Search"
                value={query}
                onChange={handleInputChange}
                onFocus={() => setShowFilter(false)} // Filtr chowa się po kliknięciu w pole wyszukiwania
                style={{
                    width: '100%',
                    padding: '0.75rem 2.5rem 0.75rem 2.5rem',
                    margin: '10px',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '0.9rem',
                    outline: 'none',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    color: '#fff',
                    backdropFilter: 'blur(4px)',
                }}
            />

            <SearchIcon
                style={{
                    position: 'absolute',
                    top: '50%',
                    left: '20px',
                    transform: 'translateY(-50%)',
                    opacity: 0.6,
                    color: '#fff',
                    pointerEvents: 'none',
                }}
            />

            <IconButton
                onClick={() => setShowFilter((prev) => !prev)}
                size="small"
                sx={{
                    position: 'absolute',
                    top: '50%',
                    right: '10px',
                    transform: 'translateY(-50%)',
                    color: '#fff',
                    opacity: 0.7,
                }}
            >
                <ArrowDropDownIcon />
            </IconButton>

            {/* Dropdown filtrów */}
            {showFilter && (
                <div
                    style={{
                        position: 'absolute',
                        top: '100%',
                        right: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.9)',
                        padding: '0.5rem',
                        borderRadius: '10px',
                        color: '#fff',
                        zIndex: 100,
                        fontSize: '0.9rem',
                        display: 'flex',
                        flexDirection: 'column',
                        width: '50%',
                        marginTop: '4px'
                    }}
                >
                    {['title', 'author', 'user'].map((option) => (
                        <label key={option} style={{ display: 'flex', alignItems: 'center' }}>
                            <input
                                type="radio"
                                value={option}
                                checked={filter === option}
                                onChange={() => setFilter(option)}
                                style={{ marginRight: '8px' }}
                            />
                            {option.charAt(0).toUpperCase() + option.slice(1)}
                        </label>
                    ))}
                </div>
            )}

            {/* Wyniki wyszukiwania */}
            {query.trim() !== '' && (
                <div
                    style={{
                        position: 'absolute',
                        top: '110%',
                        left: 0,
                        width: '100%',
                        maxHeight: '250px',
                        overflowY: 'auto',
                        backgroundColor: 'rgba(0, 0, 0, 1)',
                        borderRadius: '12px',
                        padding: '0.5rem',
                        zIndex: 5,
                    }}
                >
                    {results.length === 0 ? (
                        <p style={{ textAlign: 'center', color: '#ccc', margin: 0 }}>Not found...</p>
                    ) : (
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                            {results.map((item) => (
                                <li
                                    key={item.id}
                                    style={{
                                        padding: '0.75rem 1rem',
                                        borderRadius: '12px',
                                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                        marginBottom: '0.5rem',
                                        cursor: 'pointer',
                                        color: '#fff',
                                    }}
                                >
                                    <strong>{item.title}</strong> – {item.author}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
}

export default SearchField;
