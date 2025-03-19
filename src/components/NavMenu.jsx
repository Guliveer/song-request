import React, {useEffect, useState} from "react";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import {supabase} from "@/utils/supabase";
import {router} from "next/client";
import Link from "next/link";
import {useRouter} from "next/router";

async function signOut() {
    const { error } = await supabase.auth.signOut({scope: 'local'})
    await router.push('/');
}

export default function NavMenu() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const router = useRouter();

    useEffect(() => {
        async function checkUser() {
            const { data: { user } } = await supabase.auth.getUser();
            setIsLoggedIn(!!user); // set isLoggedIn to true if user is logged in
        }

        checkUser();

        function handleRouteChange() {
            // what to do when route changes
            checkUser();
        }

        router.events.on('routeChangeComplete', handleRouteChange); // listen for route changes

        return (
            router.events.off('routeChangeComplete', handleRouteChange) // clean up event listener
        )
    }, [router]);

    return (
        <AppBar
            position="static"
            sx={{
                width: "100%",
                height: "6rem",
                left: 0,
                top: 0,
                display: "flex",
                flexDirection: "row",
                flexWrap: "nowrap",
                placeContent: "center",
                backgroundColor: "grey",
            }}
        >
            <Toolbar sx={{
                width: '100%',
                maxWidth: '110em',
                display: "flex",
                flexDirection: "row",
                flexWrap: "nowrap",
                justifyContent: "space-between",
                alignItems: "center",
            }}>
                <Typography variant="h5" component="div" sx={{display: "block", padding: "1rem"}}>
                    Logo
                </Typography>
                <Box sx={{
                    display: "flex",
                    flexDirection: "row",
                    flexWrap: "nowrap",
                    width: "fit-content",
                    gap: "3em",
                }}>
                    <Button color="inherit">Home</Button>
                    <Button color="inherit">User Panel</Button>
                    <Button color="inherit">Admin Panel</Button>
                    {isLoggedIn ? (
                        <Button color="inherit" onClick={signOut}>Sign out</Button>
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
};
