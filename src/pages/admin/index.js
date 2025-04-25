import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { isUserAdmin, isUserLoggedIn } from "@/utils/actions";
import { supabase } from "@/utils/supabase";
import SongCard from "@/components/SongCard";
import {
    Card,
    Typography,
    Box,
    IconButton,
    Divider,
    Select,
    MenuItem,
    FormControl,
    InputLabel
} from "@mui/material";
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
                .select("id, username, ban_status");

            if (!error) setUsers(data);
        }

        if (isAdmin) fetchUsers();
    }, [isAdmin]);

    // funkcja do resetowania głosów użytkownika
    const handleResetVotesForUser = async (userId) => {
        const { error } = await supabase // TO JUŻ BYŁO WCZEŚNIEJ, ZOSTAWIĆ
            .from("votes")
            .delete()
            .eq("user_id", userId);

        if (error) {
            alert(`Błąd resetowania głosów dla użytkownika: ${error.message}`);
        } else {
            alert("Głosy użytkownika zostały zresetowane.");
        }
    };

    // funkcja do usuwania głosów użytkownika
    const handleDeleteUserSongs = async (userId) => {
        const { error } = await supabase
            .from("queue")
            .delete()
            .eq("user_id", userId);

        if (error) {
            alert(`Błąd usuwania piosenek użytkownika: ${error.message}`);
        } else {
            alert("Piosenki użytkownika zostały usunięte.");

            const { data, error: fetchError } = await supabase
                .from("queue")
                .select("id")
                .order("added_at", { ascending: false });
            if (!fetchError) setSongs(data);
        }
    };

    // funkcja do nakładania/zmiany bana
    const handleBanChange = async (userId, days) => {
        console.log("Ban request → userId:", userId, "| Days:", days);
        const { data: updateData, error } = await supabase
            .from("users")
            .update({ ban_status: days })
            .eq("id", userId)
            .select("id, username, ban_status"); // <- potrzebne!

        if (error) {
            console.error("Błąd przy update:", error);
            alert(`Błąd ustawiania bana: ${error.message}`);
        } else {
            console.log("Update result:", updateData);
            alert(`Ban ustawiony na ${days === 0 ? "brak" : days + " dni"}.`);

            const { data: usersData, error: usersError } = await supabase
                .from("users")
                .select("id, username, ban_status");

            if (usersError) {
                console.error("Błąd przy pobieraniu użytkowników:", usersError);
            } else {
                setUsers(usersData);
            }
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
                            flexDirection: "column",
                            gap: "0.5rem",
                            padding: "0.75rem 1rem",
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

                        <FormControl size="small" sx={{ minWidth: 150 }}>
                            <InputLabel id={`ban-select-label-${user.id}`}>Ban</InputLabel>
                            <Select
                                labelId={`ban-select-label-${user.id}`}
                                value={user.ban_status || 0}
                                label="Ban"
                                onChange={(e) => handleBanChange(user.id, e.target.value)}
                            >
                                <MenuItem value={0}>Brak bana</MenuItem>
                                <MenuItem value={7}>1 tydzień</MenuItem>
                                <MenuItem value={30}>1 miesiąc</MenuItem>
                                <MenuItem value={90}>3 miesiące</MenuItem>
                                <MenuItem value={180}>6 miesięcy</MenuItem>
                                <MenuItem value={365}>1 rok</MenuItem>
                                <MenuItem value={9999}>Permanentny</MenuItem>
                            </Select>
                        </FormControl>
                    </Card>
                ))}
            </div>
        </div>
    );
}
