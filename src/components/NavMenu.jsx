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
    const signOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Error signing out:', error.message);
            return;
        }
        router.push('/'); // Po wylogowaniu przekierowanie na stronę główną
    };

    // Sprawdzanie użytkownika po załadowaniu komponentu
    useEffect(() => {
        const checkUser = async () => {
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
        };

        checkUser();

        const handleRouteChange = () => {
            checkUser(); // Sprawdzanie użytkownika przy każdej zmianie trasy
        };

        router.events.on('routeChangeComplete', handleRouteChange);

        return () => {
            router.events.off('routeChangeComplete', handleRouteChange);
        };
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
                                <Button color="inherit">Log in</Button>
                            </Link>
                            <Link href="/register" passHref>
                                <Button color="inherit">Register</Button>
                            </Link>
                        </>
                    )}
                </Box>
            </Toolbar>
        </AppBar>
    );
}