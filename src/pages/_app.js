import { UserProvider } from "@/context/UserContext";
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from '@/styles/theme';
import '@/styles/globals.css';
import NavMenu from '@/components/NavMenu';
import Footer from '@/components/Footer';
import AddSongForm from '@/components/AddSongForm'; // FAB to add song
import PropTypes from "prop-types";
import { useRouter } from "next/router";

export default function App({ Component, pageProps }) {
    const router = useRouter();

    // FAB tylko na stronie głównej ("/" lub "/index")
    const showFab = router.pathname === "/" || router.pathname === "/index";

    return (
        <ThemeProvider theme={theme}>
            <UserProvider>
                <CssBaseline />
                <NavMenu />
                <Component {...pageProps} />
                {showFab && <AddSongForm />}
                <Footer />
            </UserProvider>
        </ThemeProvider>
    );
}

App.propTypes = {
    Component: PropTypes.elementType.isRequired,
    pageProps: PropTypes.object.isRequired,
}