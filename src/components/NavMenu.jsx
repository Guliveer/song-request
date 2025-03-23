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
                backgroundColor: "#020714",
                boxShadow: "0 4px 12px rgba(137, 159, 242, 0.15)",
                borderBottom: "1px solid rgba(137, 159, 242, 0.1)",
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
                <Typography variant="h5" component="div" sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "1rem",
                    color: "#e7ecfc",
                    fontWeight: "700",
                }}>
                    Logo
                </Typography>
                <Box sx={{
                    display: "flex",
                    flexDirection: "row",
                    flexWrap: "nowrap",
                    width: "fit-content",
                    gap: "1.5em",
                    alignItems: "center"
                }}>
                    <Button color="inherit" sx={{
                        color: "#e7ecfc",
                        fontWeight: "500",
                        borderRadius: "8px",
                        padding: "0.5rem 1rem",
                        transition: "all 0.3s ease",
                        "&:hover": {
                            backgroundColor: "rgba(137, 159, 242, 0.1)",
                            transform: "translateY(-2px)",
                        }
                    }}>Home</Button>
                    <Button color="inherit" sx={{
                        color: "#e7ecfc",
                        fontWeight: "500",
                        borderRadius: "8px",
                        padding: "0.5rem 1rem",
                        transition: "all 0.3s ease",
                        "&:hover": {
                            backgroundColor: "rgba(137, 159, 242, 0.1)",
                            transform: "translateY(-2px)",
                        }
                    }}>User Panel</Button>
                    <Button color="inherit" sx={{
                        color: "#e7ecfc",
                        fontWeight: "500",
                        borderRadius: "8px",
                        padding: "0.5rem 1rem",
                        transition: "all 0.3s ease",
                        "&:hover": {
                            backgroundColor: "rgba(137, 159, 242, 0.1)",
                            transform: "translateY(-2px)",
                        }
                    }}>Admin Panel</Button>
                    {isLoggedIn ? (
                        <Button color="inherit" onClick={signOut} sx={{
                            backgroundColor: "#e83072",
                            color: "#e7ecfc",
                            fontWeight: "600",
                            borderRadius: "24px",
                            padding: "0.5rem 1.5rem",
                            transition: "all 0.3s ease",
                            marginLeft: "1rem",
                            "&:hover": {
                                backgroundColor: "#8b0f6f",
                                boxShadow: "0 4px 8px rgba(232, 48, 114, 0.3)",
                            }
                        }}>Sign out</Button>
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
};