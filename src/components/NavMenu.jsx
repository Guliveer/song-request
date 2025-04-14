import { useUser } from "@/context/UserContext";
import { useRouter } from "next/router";
import { useState } from "react";
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
    Link
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { logOut } from "@/utils/actions";

export default function NavMenu() {
    const { isLoggedIn, isAdmin } = useUser();
    const router = useRouter();

    const pages = {
        public: [{ name: "Home", href: "/" }],
        admin: [{ name: "Admin Panel", href: "/admin" }]
    };

    const userMenu = {
        loggedIn: [
            { name: "User Panel", href: "/user" },
            { name: "Log out", action: "logout" }
        ],
        loggedOut: [
            { name: "Log in", href: "/login" },
            { name: "Register", href: "/register" }
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
                                    textTransform: "uppercase"
                                }}
                            >
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
                                        textTransform: "uppercase"
                                    }}
                                >
                                    {page.name}
                                </Link>
                            ))}
                    </Box>

                    {/* Logowanie / Rejestracja */}
                    <Box sx={{ flexGrow: 0, display: "flex", alignItems: "center", gap: 2 }}>
                        <Tooltip title="Open settings">
                            <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                                <Avatar alt="User" src={undefined} />
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