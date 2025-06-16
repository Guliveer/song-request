import { useUser } from "@/context/UserContext";
import {useEffect, useState} from "react";
import {
    AppBar,
    Toolbar,
    Box,
    MenuItem,
    Tooltip,
    IconButton,
    Menu,
    Container,
    Avatar,
    Link, ButtonGroup, Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
} from "@mui/material";
import {
    MenuRounded as MenuIcon,
    HowToRegRounded as RegisterIcon,
    LoginRounded as LoginIcon,
    LogoutRounded as LogoutIcon,
    MiscellaneousServicesRounded as UserPanelIcon,
    AdminPanelSettingsRounded as AdminPanelIcon,
    HomeRounded as HomeIcon,
    PublicRounded as PlaylistIcon,
    PlaylistAddRounded as NewPlaylistIcon
} from '@mui/icons-material';
import {genUserAvatar, logOut, createPlaylist} from "@/utils/actions";
import NotificationBell from "@/components/NotificationBell";
import {FormField} from "@/components/Items";

export default function NavMenu() {
    const { isLoggedIn, isAdmin, uuid } = useUser();
    const [avatarUrl, setAvatarUrl] = useState(undefined);
    const [openDialog, setOpenDialog] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        url: "",
    });

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
            { name: "Home", href: "/", icon: <HomeIcon /> },
            { name: "Public Playlists", href: "/playlist", icon: <PlaylistIcon /> },
        ],
        admin: [
            { name: "Admin Panel", href: "/admin", icon: <AdminPanelIcon /> },
        ],
    };


    const userMenu = {
        loggedIn: [
            { name: "User Panel", href: "/user", icon: <UserPanelIcon /> },
            { name: "Create Playlist", action: "createPlaylist", icon: <NewPlaylistIcon /> },
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
        }

        if (item.action === "createPlaylist") {
            handleOpenDialog();
        }
    };

    const handleOpenDialog = () => setOpenDialog(true);
    const handleCloseDialog = () => setOpenDialog(false);
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };
    const handleSubmit = async () => {
        try {
            await createPlaylist(formData.name, formData.description, formData.url);
            handleCloseDialog();
            setFormData({ name: "", description: "", url: "" }); // Reset form data
        } catch (error) {
            console.error("Error creating playlist:", error.message);
        }
    };

    return (
        <>
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
                                    <Link key={page.name} sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1,
                                        textTransform: "uppercase"
                                    }} href={page.href} underline={"none"}>
                                        <MenuItem onClick={handleCloseNavMenu}>
                                            {page.name}
                                        </MenuItem>
                                    </Link>
                                ))}
                                {isAdmin &&
                                    pages.admin.map((page) => (
                                        <Link sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 1,
                                            textTransform: "uppercase"
                                        }} href={page.href} underline={"none"}>
                                            <MenuItem key={page.name} onClick={handleCloseNavMenu}>
                                                {page.name}
                                            </MenuItem>
                                        </Link>
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
                                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                    <NotificationBell userId={uuid} />
                                    <Tooltip title="Open settings">
                                        <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                                            <Avatar alt="Avatar" src={avatarUrl} />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
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
                                        <Link key={item.name} sx={{
                                            display: "flex",
                                            justifyContent: "flex-start",
                                            alignItems: "center",
                                            gap: 1.5,
                                        }} href={item.href} underline="none">
                                        <MenuItem onClick={() => handleUserMenuClick(item)} sx={{
                                            width: "100%",
                                        }}>
                                            {item.icon}
                                            {item.name}
                                        </MenuItem>
                                    </Link>
                                ))}
                            </Menu>
                        </Box>
                    </Toolbar>
                </Container>
            </AppBar>

            {/* Dialog for creating new playlist */}
            <Dialog open={openDialog} onClose={handleCloseDialog}>
                <DialogTitle>Create New Playlist</DialogTitle>
                <DialogContent>
                    <FormField
                        margin="dense"
                        label="Name"
                        name="name"
                        fullWidth
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                    />
                    <FormField
                        margin="dense"
                        label="Description"
                        name="description"
                        fullWidth
                        required
                        value={formData.description}
                        onChange={handleInputChange}
                    />
                    <FormField
                        margin="dense"
                        label="Accessible URL"
                        name="url"
                        fullWidth
                        required
                        value={formData.url}
                        onChange={handleInputChange}
                        inputProps={{ pattern: "^[a-zA-Z-]+$" }}
                        error={!/^[a-zA-Z-]*$/.test(formData.url)}
                        helperText={
                            !/^[a-zA-Z-]*$/.test(formData.url)
                                ? "Invalid format. Only letters and dashes are allowed."
                                : "Defines the accessible URL for this playlist."
                        }
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained">Create</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}