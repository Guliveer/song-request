import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/lib/supabase";
import { Button, TextField, Typography, Box, CircularProgress } from "@mui/material";

export default function ResetPasswordPage() {
    const [password, setPassword] = useState("");
    const [repeatPassword, setRepeatPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(true); // sprawdzanie sesji
    const [canShowForm, setCanShowForm] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (typeof window !== "undefined") {
            const hash = window.location.hash;
            if (hash && hash.includes("access_token") && hash.includes("type=recovery")) {
                const params = new URLSearchParams(hash.substring(1));
                const access_token = params.get("access_token");
                const refresh_token = params.get("refresh_token");
                if (access_token && refresh_token) {
                    supabase.auth.setSession({
                        access_token,
                        refresh_token,
                    }).then(({ error }) => {
                        if (!error) {
                            window.location.hash = "";
                            // Ustaw flagę recovery, aby zablokować przekierowania w loginie
                            localStorage.setItem('isRecovery', 'true');
                            setCanShowForm(true);
                            setLoading(false);
                        } else {
                            setCanShowForm(false);
                            setLoading(false);
                        }
                    });
                    return; // Zatrzymaj dalsze sprawdzanie sesji w tym momencie
                }
            }
        }
        // Jeśli nie ma tokenów w URL, sprawdź sesję normalnie
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (
                session &&
                session.user &&
                session.user.aud === "authenticated"
            ) {
                setCanShowForm(true);
            } else {
                setCanShowForm(false);
                router.replace("/login");
            }
            setLoading(false);
        });
    }, [router]);

    const handleReset = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!password || !repeatPassword) {
            setError("Please fill in both password fields.");
            return;
        }
        if (password !== repeatPassword) {
            setError("Passwords do not match.");
            return;
        }
        if (password.length < 8) {
            setError("The password must be at least 8 characters long.");
            return;
        }

        const { error } = await supabase.auth.updateUser({ password });
        if (error) {
            if (
                error.message &&
                error.message.includes(
                    "Password should contain at least one character of each"
                )
            ) {
                setError(
                    "The password must contain at least one lowercase letter, one uppercase letter, and one digit."
                );
            } else {
                setError("An error occurred while changing your password. Please try again.");
            }
        } else {
            // Po udanej zmianie hasła:
            setSuccess("Your password has been changed successfully! Redirecting to homepage...");
            localStorage.removeItem('isRecovery');
            setTimeout(() => {
                router.replace("/");
            }, 1800);

        }
    };

    // Nie renderuj nic, dopóki nie sprawdzisz sesji recovery
    if (loading) {
        return (
            <Box
                sx={{
                    width: 400,
                    mx: "auto",
                    my: 8,
                    p: 4,
                    borderRadius: 2,
                    background: "#222",
                    boxShadow: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: 180,
                }}
            >
                <CircularProgress color="inherit" />
                <Typography sx={{ ml: 2 }}>Checking authorization...</Typography>
            </Box>
        );
    }

    if (!canShowForm) {
        // Nie renderuj formularza, jeśli nie masz uprawnień
        return null;
    }

    return (
        <Box
            sx={{
                width: 400,
                mx: "auto",
                my: 8,
                p: 4,
                borderRadius: 2,
                background: "#222",
                boxShadow: 2,
            }}
        >
            <Typography variant="h5" color="white" mb={2}>
                Reset your password
            </Typography>
            <form onSubmit={handleReset}>
                <TextField
                    label="New password"
                    type="password"
                    fullWidth
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    sx={{ mt: 2 }}
                />
                <TextField
                    label="Repeat new password"
                    type="password"
                    fullWidth
                    value={repeatPassword}
                    onChange={e => setRepeatPassword(e.target.value)}
                    sx={{ mt: 2 }}
                />
                {error && (
                    <Typography color="error" sx={{ mt: 2 }}>
                        {error}
                    </Typography>
                )}
                {success && (
                    <Typography color="success.main" sx={{ mt: 2 }}>
                        {success}
                    </Typography>
                )}
                <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                    sx={{ mt: 3 }}
                >
                    Set new password
                </Button>
            </form>
        </Box>
    );
}
