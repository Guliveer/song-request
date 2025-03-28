import React, { useEffect, useState } from "react";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { supabase } from "@/utils/supabase";
import { useRouter } from "next/router";
import Link from "next/link";

export default function NavMenu() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false); // Stan dla sprawdzania admina
    const router = useRouter();

    // Funkcja wylogowywania
    async function signOut() {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Error signing out:', error.message);
            return;
        }
        router.push('/'); // Po wylogowaniu przekierowanie na stronę główną
    }

    // Sprawdzanie użytkownika po załadowaniu komponentu
    useEffect(() => {
        async function checkUser() {
            const { data: { user } } = await supabase.auth.getUser();
            setIsLoggedIn(!!user); // Ustawienie stanu logowania
            setIsAdmin(!!user);

            if (user) {
                // Pobierz dane użytkownika z tabeli 'users'
                const { data, error } = await supabase
                    .from('users')
                    .select('admin')
                    .eq('id', user.id)
                    .single();

                if (error) {
                    console.error("Error fetching user data", error);
                    setIsAdmin(false);
                } else {
                    setIsAdmin(data?.admin || false); // Ustawienie stanu admina
                }
            }
        }

        checkUser();

        function handleRouteChange() {
            checkUser(); // Sprawdzanie użytkownika przy każdej zmianie trasy
        }

        router.events.on('routeChangeComplete', handleRouteChange);

        return (
            router.events.off('routeChangeComplete', handleRouteChange)
        )
    }, [router]);

    return (
        <AppBar
            position="static"
            sx={{
                width: "100%",
                height: "6rem",
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                backgroundColor: "grey",
            }}
        >
            <Toolbar
                sx={{
                    width: '100%',
                    maxWidth: '110em',
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                <Typography variant="h5" sx={{ padding: "1rem" }}>
                    Logo
                </Typography>
                <Box
                    sx={{
                        display: "flex",
                        gap: "3em",
                    }}
                >
                    <Link href="/" passHref>
                        <Button color="inherit">Home</Button>
                    </Link>
                    {isAdmin && ( // Renderuj tylko, jeśli użytkownik jest adminem
                        <Link href="/admin" passHref>
                            <Button color="inherit">Admin Panel</Button>
                        </Link>
                    )}
                    {isLoggedIn ? ( // Renderuj tylko, jeśli użytkownik jest zalogowany
                        <>
                            <Link href="/user" passHref>
                                <Button color="inherit">User Panel</Button>
                            </Link>
                            <Button color="inherit" onClick={() => signOut(router)}>Sign out</Button>
                        </>
                    ) : (
                        <>
                            <Link href="/login" passHref>
                                <Button color="inherit" sx={{
                                    color: "#899ff2",
                                    fontWeight: "600",
                                    borderRadius: "24px",
                                    padding: "0.5rem 1.5rem",
                                    border: "2px solid #899ff2",
                                    transition: "all 0.3s ease",
                                    "&:hover": {
                                        backgroundColor: "rgba(137, 159, 242, 0.1)",
                                        boxShadow: "0 4px 8px rgba(137, 159, 242, 0.2)",
                                    }
                                }}>Log in</Button>
                            </Link>
                            <Link href="/register" passHref>
                                <Button color="inherit" sx={{
                                    backgroundColor: "#e83072",
                                    color: "#e7ecfc",
                                    fontWeight: "600",
                                    borderRadius: "24px",
                                    padding: "0.5rem 1.5rem",
                                    transition: "all 0.3s ease",
                                    "&:hover": {
                                        backgroundColor: "#8b0f6f",
                                        boxShadow: "0 4px 8px rgba(232, 48, 114, 0.3)",
                                    }
                                }}>Register</Button>
                            </Link>
                        </>
                    )}
                </Box>
            </Toolbar>
        </AppBar>
    );
}
