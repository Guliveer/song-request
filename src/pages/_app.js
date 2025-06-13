import {UserProvider} from "@/context/UserContext";
import {ThemeProvider} from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from '@/styles/theme';
import '@/styles/globals.css';
import NavMenu from '@/components/NavMenu';
import Footer from '@/components/Footer';
import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import React from "react";
import {useRouter} from "next/router";

export default function App({Component, pageProps}) {
    const router = useRouter();

    return (
        <ThemeProvider theme={theme}>
            <UserProvider>
                <CssBaseline/>
                <Box
                    sx={{
                        minHeight: "100vh",
                        display: "flex",
                        flexDirection: "column",
                        maxWidth: "100vw", // limit page width to viewport width
                    }}
                >
                    <NavMenu/>
                    <Component {...pageProps} />
                    <Footer/>
                </Box>
            </UserProvider>
        </ThemeProvider>
    );
}

App.propTypes = {
    Component: PropTypes.elementType.isRequired,
    pageProps: PropTypes.object.isRequired,
}
