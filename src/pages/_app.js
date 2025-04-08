import { UserProvider } from "@/context/UserContext";
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from '@/styles/theme';
import '@/styles/globals.css';
import NavMenu from '@/components/NavMenu';
import PropTypes from "prop-types";

export default function App({ Component, pageProps }) {
    return (
        <ThemeProvider theme={theme}>
            <UserProvider>
                <CssBaseline />
                <NavMenu />
                <Component {...pageProps} />
            </UserProvider>
        </ThemeProvider>
    );
}

App.propTypes = {
    Component: PropTypes.elementType.isRequired,
    pageProps: PropTypes.object.isRequired,
}
