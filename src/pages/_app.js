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
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function App({Component, pageProps}) {
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
                <Analytics />
                <SpeedInsights />
            </UserProvider>
        </ThemeProvider>
    );
}

App.propTypes = {
    Component: PropTypes.elementType.isRequired,
    pageProps: PropTypes.object.isRequired,
}
