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

    // Sprawdzanie, czy użytkownik jest administratorem
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

    // Pobieranie piosenek
    useEffect(() => {
        async function fetchSongs() {
            const {data, error} = await supabase
                .from("queue")
                .select("id, title, author, url")
                .order("added_at", {ascending: false});

            if (!error) setSongs(data);
        }

        if (isAdmin) fetchSongs();
    }, [isAdmin]);

    // Pobieranie użytkowników
    useEffect(() => {
        async function fetchUsers() {
            const {data, error} = await supabase
                .from("users")
                .select("id, username, ban_status");

            if (!error) setUsers(data);
        }

        if (isAdmin) fetchUsers();
    }, [isAdmin]);

    // Funkcja resetowania głosów
    const handleResetVotesForUser = async (userId) => {
        const {error} = await supabase
            .from("votes")
            .delete()
            .eq("user_id", userId);

        if (error) {
            alert(`Błąd resetowania głosów dla użytkownika: ${error.message}`);
        } else {
            alert("Głosy użytkownika zostały zresetowane.");
        }
    };

    // Funkcja usuwania piosenek użytkownika
    const handleDeleteUserSongs = async (userId) => {
        const {error} = await supabase
            .from("queue")
            .delete()
            .eq("user_id", userId);

        if (error) {
            alert(`Błąd usuwania piosenek użytkownika: ${error.message}`);
        } else {
            alert("Piosenki użytkownika zostały usunięte.");

            const {data, error: fetchError} = await supabase
                .from("queue")
                .select("id")
                .order("added_at", {ascending: false});
            if (!fetchError) setSongs(data);
        }
    };

    // Funkcja nakładania bana
    const handleBanChange = async (userId, days) => {
        console.log("Ban request → userId:", userId, "| Days:", days);
        const {data: updateData, error} = await supabase
            .from("users")
            .update({ban_status: days})
            .eq("id", userId)
            .select("id, username, ban_status");

        if (error) {
            console.error("Błąd przy update:", error);
            alert(`Błąd ustawiania bana: ${error.message}`);
        } else {
            console.log("Update result:", updateData);
            alert(`Ban ustawiony na ${days === 0 ? "brak" : days + " dni"}.`);

            const {data: usersData, error: usersError} = await supabase
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
        <div
            style={{
                display: "grid",
                gridTemplateColumns: "45% 45%",
                gap: "2rem",
                maxWidth: "1200px",
                margin: "0 auto",
                padding: "2rem",
                alignItems: "start" // start → wyrównanie do góry
            }}
        >
            {/* Lewa kolumna - Piosenki */}
            <div>
                <Typography variant="h5" gutterBottom textAlign={"center"}>Piosenki w kolejce</Typography>
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    {songs.map((song) => (
                        <SongCard key={song.id} id={song.id} />
                    ))}
                </div>
            </div>

            {/* Prawa kolumna - Użytkownicy */}
            <div>
                <Typography variant="h5" gutterBottom textAlign={"center"}>Użytkownicy</Typography>
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    {users.map((user) => (
                        <Card
                            key={user.id}
                            variant="outlined"
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                width: "100%",
                                maxWidth: 500,
                                px: 3,
                                py: 3,
                                borderRadius: "1em",
                                backgroundColor: "background.paper",
                                gap: 2,
                                marginTop: "1rem",
                                alignItems: "flex-start"
                            }}
                        >
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', marginBottom: "0.5rem" }}>
                                {user.username}
                            </Typography>

                            <Box sx={{ display: "flex", gap: 1, marginBottom: "0.75rem" }}>
                                <IconButton
                                    onClick={() => handleResetVotesForUser(user.id)}
                                    title="Resetuj wszystkie głosy użytkownika"
                                >
                                    <RestartAltIcon />
                                </IconButton>
                                <IconButton
                                    onClick={() => handleDeleteUserSongs(user.id)}
                                    title="Usuń wszystkie piosenki użytkownika"
                                >
                                    <DeleteIcon />
                                </IconButton>
                            </Box>

                            <FormControl size="small" fullWidth>
                                <InputLabel id={`ban-select-label-${user.id}`}>Ban</InputLabel>
                                <Select
                                    labelId={`ban-select-label-${user.id}`}
                                    value={user.ban_status || 0}
                                    label="Ban"
                                    onChange={(e) => handleBanChange(user.id, e.target.value)}
                                >
                                    <MenuItem value={0}>Brak</MenuItem>
                                    <MenuItem value={7}>7 dni</MenuItem>
                                    <MenuItem value={30}>30 dni</MenuItem>
                                    <MenuItem value={90}>90 dni</MenuItem>
                                    <MenuItem value={180}>180 dni</MenuItem>
                                    <MenuItem value={365}>365 dni</MenuItem>
                                    <MenuItem value={9999}>Perm</MenuItem>
                                </Select>
                            </FormControl>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
