import {useEffect, useState}from "react";
import {useRouter} from "next/router";
import {
    AppBar,
    Toolbar,
    Typography,
    Box,
    ButtonGroup,
    Button,
    MenuItem,
    Tooltip,
    IconButton,
    Menu,
    Container,
    Avatar
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import {isUserLoggedIn, isUserAdmin, logOut} from "@/utils/actions";
import {supabase} from "@/utils/supabase";

export default function NavMenu() {
    const [isLoggedIn, setIsLoggedIn] = useState(null);
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
            const loggedIn = await isUserLoggedIn();
            setIsLoggedIn(loggedIn);
            const userAdmin = await isUserAdmin();
            setIsAdmin(userAdmin);
        }

        checkUser(); // Call checkUser on component mount

        function handleRouteChange() {
            checkUser(); // Call checkUser on route change
        }

        router.events.on('routeChangeComplete', handleRouteChange); // Listen for route changes

        return () => {
            router.events.off('routeChangeComplete', handleRouteChange); // Clean up event listener
        };
    }, [router]);

    const pages = [
        {name: "Home", href: "/"},
        {name: "Admin Panel", href: "/admin"}
    ];

    const userMenu = {
        loggedIn: [
            {name: "User Panel", href: "/user"},
            {name: "Log out", action: "logout"}
        ],
        loggedOut: [
            {name: "Log in", href: "/login"},
            {name: "Register", href: "/register"}
        ]
    };

    const [anchorElNav, setAnchorElNav] = useState(null);
    const [anchorElUser, setAnchorElUser] = useState(null);

    const handleOpenNavMenu = (event) => setAnchorElNav(event.currentTarget);
    const handleCloseNavMenu = () => setAnchorElNav(null);

    const handleOpenUserMenu = (event) => setAnchorElUser(event.currentTarget);
    const handleCloseUserMenu = () => setAnchorElUser(null);

    const handleUserMenuClick = (item) => {
        handleCloseUserMenu();
        if (item.action === "logout") {
            logOut()
        } else if (item.href) {
            router.push(item.href); // Przekierowanie na stronę
        }
    };

    return (
        <AppBar position="static">
            <Container maxWidth="xl">
                <Toolbar disableGutters>
                    {/* Menu na mobile */}
                    <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
                        <IconButton
                            size="large"
                            aria-label="menu"
                            aria-controls="menu-appbar"
                            aria-haspopup="true"
                            onClick={handleOpenNavMenu}
                        >
                            <MenuIcon />
                        </IconButton>
                        <Menu
                            id="menu-appbar"
                            anchorEl={anchorElNav}
                            anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                            keepMounted
                            transformOrigin={{ vertical: "top", horizontal: "left" }}
                            open={Boolean(anchorElNav)}
                            onClose={handleCloseNavMenu}
                            sx={{ display: { xs: "block", md: "none" } }}
                        >
                            {pages.map((page) => (
                                <MenuItem key={page.name} onClick={handleCloseNavMenu}>
                                    <Typography sx={{ textAlign: "center" }}>{page.name}</Typography>
                                </MenuItem>
                            ))}
                        </Menu>
                    </Box>

                    {/* Menu dla desktopów */}
                    <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
                        <ButtonGroup variant="text">
                            {pages.map((page) => (
                                <Button key={page.name} href={page.href} sx={{ my: 2, display: "block", padding: '0.5rem 1rem' }}>
                                    {page.name}
                                </Button>
                            ))}
                            {isAdmin && ( // Renderuj tylko, jeśli użytkownik jest adminem
                                <Button href="/admin" sx={{ my: 2, display: "block", padding: '0.5rem 1rem' }}>Admin Panel</Button>
                            )}
                        </ButtonGroup>
                    </Box>

                    {/* Logowanie / Rejestracja */}
                    <Box sx={{ flexGrow: 0, display: "flex", alignItems: "center", gap: 2 }}>
                        <Tooltip title="Open settings">
                            <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                                <Avatar alt="User" src={undefined} />                   {/* TODO: user avatar generation */}
                            </IconButton>
                        </Tooltip>

                        {/* Menu użytkownika */}
                        <Menu
                            sx={{ mt: "45px" }}
                            id="menu-appbar"
                            anchorEl={anchorElUser}
                            anchorOrigin={{ vertical: "top", horizontal: "right" }}
                            keepMounted
                            transformOrigin={{ vertical: "top", horizontal: "right" }}
                            open={Boolean(anchorElUser)}
                            onClose={handleCloseUserMenu}
                        >
                            {(isLoggedIn ? userMenu.loggedIn : userMenu.loggedOut).map((item) => (
                                <MenuItem key={item.name} onClick={() => handleUserMenuClick(item)}>
                                    <Typography sx={{ textAlign: "center" }}>{item.name}</Typography>
                                </MenuItem>
                            ))}
                        </Menu>
                    </Box>
                </Toolbar>
            </Container>
        </AppBar>
    );
}
