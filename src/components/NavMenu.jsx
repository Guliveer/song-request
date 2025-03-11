import React from "react";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";

const NavMenu = () => {
    return (
        <AppBar
            position="fixed"
            sx={{
                width: "100vw",
                height: "6rem",
                left: 0,
                top: 0,
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1200,
                backgroundColor: "grey",
                flexWrap: "nowrap"
            }}
        >
            <Toolbar sx={{ display: "flex", alignItems: "center", flexDirection: "row", flexWrap: "nowrap", justifyContent: "space-between"}}>
                <Typography variant="h5" component="div" sx={{display: "block", padding: "1rem"}}>
                    Logo
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "row", width: "100%"}}>
                    <Button color="inherit">Home</Button>
                    <Button color="inherit">User Panel</Button>
                    <Button color="inherit">Admin Panel</Button>
                    <Button color="inherit">Log in</Button>
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default NavMenu;


