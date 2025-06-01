import {UserProvider} from "@/context/UserContext";
import {ThemeProvider} from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from '@/styles/theme';
import '@/styles/globals.css';
import NavMenu from '@/components/NavMenu';
import Footer from '@/components/Footer';
import AddSongForm from '@/components/AddSongForm';
import PropTypes from "prop-types";
import {useRouter} from "next/router";
import Box from "@mui/material/Box"; // DODAJ TEN IMPORT

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
                    overflowX: "hidden", // zapobiega przewijaniu w poziomie
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