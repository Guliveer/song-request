import {useState, useEffect} from 'react';
import { Box, TextField, Stack, Button } from '@mui/material';
import { supabase } from '@/utils/supabase';
import { isUserLoggedIn } from "@/utils/actions";
import { FormField } from "@/components/Items";

export default function AddSongForm() {
    const [formData, setFormData] = useState({
        title: '',
        author: '',
        url: '',
    });
    const [user, setUser] = useState(null);

    // Sprawdzanie, czy użytkownik jest zalogowany
    useEffect(() => {
        const checkUser = async () => {
            const user = await isUserLoggedIn()
            setUser(user);
        };

        checkUser();

        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
            setUser(session?.user || null);
        });

        return () => {
            authListener.subscription.unsubscribe();
        };
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


    return (
        <Box
            sx={{
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
                        <FormField
                            required
                            id="title"
                            label="Title"
                            fullWidth
                            value={formData.title}
                            onChange={handleChange}
                            sx={{ flex: 2 }}
                        />
                        <FormField
                            required
                            id="author"
                            label="Author"
                            fullWidth
                            value={formData.author}
                            onChange={handleChange}
                            sx={{ flex: 1 }}
                        />
                    </Box>

                    <FormField
                        required
                        id="url"
                        label="URL"
                        fullWidth
                        value={formData.url}
                        onChange={handleChange}
                        sx={{ }}
                    />

                    <Stack direction="row" justifyContent="center" sx={{ width: "100%", marginTop: 2 }}>
                        <Button
                            type="submit"
                            variant="contained"
                            sx={{ }}
                        >
                            Add to Queue
                        </Button>
                    </Stack>
                </Box>
            )}
        </Box>
    );
}
