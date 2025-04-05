import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from '@/styles/theme';
import '@/styles/globals.css';
import NavMenu from '@/components/NavMenu';
import { useEffect } from 'react';

export default function App({ Component, pageProps }) {
    useEffect(() => {
        const link = document.querySelector("link[rel~='icon']") || document.createElement('link');
        link.rel = 'icon';
        link.type = 'image/png';
        link.href = '/favicon.ico';
        document.head.appendChild(link);
    }, []);

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <NavMenu />
            <Component {...pageProps} />
        </ThemeProvider>
    );
}