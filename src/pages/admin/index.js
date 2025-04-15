import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { isUserAdmin, isUserLoggedIn } from "@/utils/actions";
import { supabase } from "@/utils/supabase";
import SongCard from "@/components/SongCard";
import { Card, Typography, Box, IconButton, Divider } from "@mui/material";
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import DeleteIcon from '@mui/icons-material/Delete';

export default function AdminPanel() {
    const [isLoading, setIsLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [songs, setSongs] = useState([]);
    const [users, setUsers] = useState([]);
    const router = useRouter();

    useEffect(() => {
        async function checkAdmin() {
            const checkLoggedIn = await isUserLoggedIn();
            if (!checkLoggedIn) return router.replace("/404");

            const checkAdmin = await isUserAdmin();
            if (!checkAdmin) return router.replace("/404");

            setIsAdmin(true);
            setIsLoading(false);
        }

        checkAdmin();
    }, [router]);

    useEffect(() => {
        async function fetchSongs() {
            const { data, error } = await supabase
                .from("queue")
                .select("id")
                .order("added_at", { ascending: false });

            if (!error) setSongs(data);
        }

        if (isAdmin) fetchSongs();
    }, [isAdmin]);

    useEffect(() => {
        async function fetchUsers() {
            const { data, error } = await supabase
                .from("users")
                .select("id, username");

            if (!error) setUsers(data);
        }

        if (isAdmin) fetchUsers();
    }, [isAdmin]);

    const handleResetVotesForUser = async (userId) => {
        const { error } = await supabase
            .from("votes")
            .delete()
            .eq("user_id", userId);

        if (error) {
            alert(`Błąd resetowania głosów dla użytkownika: ${error.message}`);
        } else {
            alert("Głosy użytkownika zostały zresetowane.");
        }
    };

    const handleDeleteUserSongs = async (userId) => {
        const { error } = await supabase
            .from("queue")
            .delete()
            .eq("user_id", userId);

        if (error) {
            alert(`Błąd usuwania piosenek użytkownika: ${error.message}`);
        } else {
            alert("Piosenki użytkownika zostały usunięte.");
            // odśwież listę piosenek po usunięciu
            const { data, error: fetchError } = await supabase
                .from("queue")
                .select("id")
                .order("added_at", { ascending: false });
            if (!fetchError) setSongs(data);
        }
    };


    if (!isAdmin || isLoading) return null;

    return (
        <div style={{ display: "flex", flexDirection: "row", gap: "2rem" }}>
            {/* Lewa kolumna - Piosenki */}
            <div style={{ flex: 3 }}>
                <h1>Admin Panel</h1>
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "2rem" }}>
                    {songs.map((song) => (
                        <SongCard key={song.id} id={song.id} />
                    ))}
                </div>
            </div>

            {/* Prawa kolumna - Użytkownicy */}
            <div style={{ flex: 1 }}>
                <Typography variant="h5" gutterBottom>Użytkownicy</Typography>
                <Divider />
                {users.map((user) => (
                    <Card
                        key={user.id}
                        sx={{
                            display: "flex",
                            flexDirection: { xs: "column", sm: "row" },
                            alignItems: { xs: "flex-start", sm: "center" },
                            justifyContent: "space-between",
                            padding: "0.75rem 1rem",
                            gap: { xs: "0.5rem", sm: "0" },
                            marginTop: "1rem"
                        }}
                    >
                        <Typography sx={{ fontWeight: 'bold' }}>{user.username}</Typography>
                        <Box sx={{ display: "flex", flexDirection: "row", gap: "0.5rem" }}>
                            <IconButton
                                onClick={() => handleResetVotesForUser(user.id)}
                                title="Resetuj wszystkie głosy użytkownika"
                                color="primary"
                            >
                                <RestartAltIcon />
                            </IconButton>
                            <IconButton
                                onClick={() => handleDeleteUserSongs(user.id)}
                                title="Usuń wszystkie piosenki użytkownika"
                                color="error"
                            >
                                <DeleteIcon />
                            </IconButton>
                        </Box>
                    </Card>


                ))}
            </div>
        </div>
    );
}