import { useUser } from "@/context/UserContext";
import { useRouter } from "next/router";
import {useEffect, useState} from "react";
import {
    AppBar,
    Toolbar,
    Typography,
    Box,
    MenuItem,
    Tooltip,
    IconButton,
    Menu,
    Container,
    Avatar,
    Link, ButtonGroup, Button
} from "@mui/material";
import {
    MenuRounded as MenuIcon,
    HowToRegRounded as RegisterIcon,
    LoginRounded as LoginIcon,
    LogoutRounded as LogoutIcon,
    MiscellaneousServicesRounded as UserPanelIcon,
    AdminPanelSettingsRounded as AdminPanelIcon,
    HomeRounded as HomeIcon,
} from '@mui/icons-material';
import {genUserAvatar, logOut} from "@/utils/actions";

export default function NavMenu() {
    const { isLoggedIn, isAdmin, uuid } = useUser();
    const router = useRouter();
    const [avatarUrl, setAvatarUrl] = useState(undefined);

    useEffect(() => {
        if (isLoggedIn) {
            let isMounted = true;

            async function fetchAvatar() {
                const url = await genUserAvatar(uuid);
                if (isMounted) {
                    setAvatarUrl(url);
                }
            }

            fetchAvatar();

            return () => {
                isMounted = false; // Cleanup
            };
        }
    }, [isLoggedIn, uuid]);

    const pages = {
        public: [
            { name: "Home", href: "/", icon: <HomeIcon /> }
        ],
        admin: [
            { name: "Admin Panel", href: "/admin", icon: <AdminPanelIcon /> }
        ],
    };

    const userMenu = {
        loggedIn: [
            { name: "User Panel", href: "/user", icon: <UserPanelIcon /> },
            { name: "Log out", action: "logout", icon: <LogoutIcon /> }
        ],
        loggedOut: [
            { name: "Log in", href: "/login", icon: <LoginIcon /> },
            { name: "Register", href: "/register", icon: <RegisterIcon /> }
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
            logOut();
        } else if (item.href) {
            router.push(item.href);
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
                            {pages.public.map((page) => (
                                <MenuItem key={page.name} onClick={handleCloseNavMenu}>
                                    <Typography sx={{ textAlign: "center" }}>{page.name}</Typography>
                                </MenuItem>
                            ))}
                            {isAdmin &&
                                pages.admin.map((page) => (
                                    <MenuItem key={page.name} onClick={handleCloseNavMenu}>
                                        <Typography sx={{ textAlign: "center" }}>{page.name}</Typography>
                                    </MenuItem>
                                ))}
                        </Menu>
                    </Box>

                    {/* Menu dla desktopów */}
                    <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" }, gap: 3 }}>
                        {pages.public.map((page) => (
                            <Link
                                key={page.name}
                                href={page.href}
                                underline={"none"}
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                    textTransform: "uppercase"
                                }}
                            >
                                {page.icon}
                                {page.name}
                            </Link>
                        ))}

                        {isAdmin &&
                            pages.admin.map((page) => (
                                <Link
                                    key={page.name}
                                    href={page.href}
                                    underline={"none"}
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1,
                                        textTransform: "uppercase"
                                    }}
                                >
                                    {page.icon}
                                    {page.name}
                                </Link>
                            ))}
                    </Box>

                    {/* Logowanie / Rejestracja */}
                    <Box sx={{ flexGrow: 0, display: "flex", alignItems: "center", gap: 2 }}>
                        {!isLoggedIn &&
                            <ButtonGroup>
                                {!isLoggedIn && userMenu.loggedOut.map((item) => (
                                    <Link key={item.name} href={item.href} underline="none">
                                        <Button
                                            variant={item.name === "Register" ? "contained" : "outlined"}
                                            //? (un)comment below line to show/hide icons for "Log in" and "Register"
                                            // startIcon={item.icon}
                                        >
                                            {item.name}
                                        </Button>
                                    </Link>
                                ))}
                            </ButtonGroup>
                        }

                        {isLoggedIn && (
                        <Tooltip title="Open settings">
                            <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                                <Avatar alt="Avatar" src={avatarUrl} />
                            </IconButton>
                        </Tooltip>
                        )}

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
                            {isLoggedIn && userMenu.loggedIn.map((item) => (
                                <MenuItem key={item.name} onClick={() => handleUserMenuClick(item)}>
                                    <Typography sx={{
                                        display: "flex",
                                        justifyContent: "flex-start",
                                        alignItems: "center",
                                        gap: 1.5,
                                    }}>
                                        {item.icon}
                                        {item.name}
                                    </Typography>
                                </MenuItem>
                            ))}
                        </Menu>
                    </Box>
                </Toolbar>
            </Container>
        </AppBar>
    );
}