import * as React from 'react';
import { Box, TextField, Stack, Button } from '@mui/material';
import { supabase } from '@/utils/supabase';

export default function AddSongForm() {
    const [formData, setFormData] = React.useState({
        title: '',
        author: '',
        url: '',
    });
    const [user, setUser] = React.useState(null);
    const [loading, setLoading] = React.useState(true);

    // Sprawdzanie, czy użytkownik jest zalogowany
    React.useEffect(() => {
        async function checkUser() {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                setUser(session.user); // Jeśli użytkownik jest zalogowany, ustawiamy go w stanie
            }
            setLoading(false); // Kończymy ładowanie
        }
        checkUser();
    }, []);

    const handleChange = (event) => {
        const { id, value } = event.target;
        setFormData((prev) => ({
            ...prev,
            [id]: value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!user) {
            console.error('User not authenticated');
            return; // Jeśli użytkownik nie jest zalogowany, nie wysyłamy formularza
        }

        console.log('Submitting form with data:', formData);

        // Wysyłanie do bazy danych
        const { data, error } = await supabase
            .from('queue')
            .insert([{ ...formData, user_id: user.id }]);

        if (error) {
            console.error('Error adding song to queue:', error.message);
        } else {
            console.log('Song added to queue:', data);
            setFormData({ title: '', author: '', url: '' }); // Czyszczenie formularza po dodaniu
        }
    };

    if (loading) return <div>Loading...</div>; // Jeśli użytkownik jest ładowany, wyświetl "Loading..."

    return (
        <Box
            sx={{
                border: "2px solid green",
                borderRadius: "8px",
                padding: 2,
                maxWidth: "600px",
                margin: "auto",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
            }}
        >
            <h1>Add Song to Queue</h1>
            {!user ? (
                <div>You must be logged in to add a song.</div> // Jeśli użytkownik nie jest zalogowany, pokazujemy ten komunikat
            ) : (
                <Box
                    component="form"
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        width: "100%",
                        gap: 2,
                        padding: 1,
                    }}
                    onSubmit={handleSubmit}
                >
                    <Box sx={{ display: "flex", gap: 2, width: "100%" }}>
                        <TextField
                            id="title"
                            label="Title"
                            variant="outlined"
                            fullWidth
                            value={formData.title}
                            onChange={handleChange}
                            sx={{
                                flex: 2,
                                '& label.Mui-focused': { color: 'green' },
                                '& .MuiOutlinedInput-root': {
                                    '&.Mui-focused fieldset': { borderColor: 'green', borderRadius: "20px" },
                                },
                            }}
                        />
                        <TextField
                            id="author"
                            label="Author"
                            variant="outlined"
                            fullWidth
                            value={formData.author}
                            onChange={handleChange}
                            sx={{
                                flex: 1,
                                '& label.Mui-focused': { color: 'green' },
                                '& .MuiOutlinedInput-root': {
                                    '&.Mui-focused fieldset': { borderColor: 'green', borderRadius: "20px" },
                                },
                            }}
                        />
                    </Box>

                    <TextField
                        id="url"
                        label="URL"
                        variant="outlined"
                        fullWidth
                        value={formData.url}
                        onChange={handleChange}
                        sx={{
                            '& label.Mui-focused': { color: 'green' },
                            '& .MuiOutlinedInput-root': {
                                '&.Mui-focused fieldset': { borderColor: 'green', borderRadius: "20px" },
                            },
                        }}
                    />

                    <Stack direction="row" justifyContent="center" sx={{ width: "100%", marginTop: 2 }}>
                        <Button
                            type="submit"
                            variant="contained"
                            sx={{
                                backgroundColor: "green", color: "white", "&:hover": { backgroundColor: "darkgreen" }, borderRadius: "20px"
                            }}
                        >
                            Add to Queue
                        </Button>
                    </Stack>
                </Box>
            )}
        </Box>
    );
}
