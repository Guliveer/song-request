import {Box, Typography, Stack, Link as MuiLink} from "@mui/material";
import GitHubIcon from "@mui/icons-material/GitHub";

const authors = [
    {name: "Guliveer", url: "https://github.com/Guliveer"},
    {name: "lifeoverthinker", url: "https://github.com/lifeoverthinker"},
    {name: "Deerion", url: "https://github.com/Deerion"},
    {name: "lukaszgrzecznik", url: "https://github.com/lukaszgrzecznik"},
];

export default function Footer() {
    return (
        <Box
            component="footer"
            id="site-footer"
            sx={{
                mt: "auto",
                px: 2,
                py: 3,
                width: "100%",
                background: "linear-gradient(90deg, #181c2a 60%, #20243a 100%)",
                borderTop: "1px solid #282c40",
                color: "text.secondary",
                display: "flex",
                flexDirection: {xs: "column", md: "row"},
                alignItems: {xs: "center", md: "center"},
                justifyContent: "space-between",
                gap: 2,
                fontSize: 15,
                position: "relative",
                zIndex: 10,
            }}
        >
            {/* Repozytorium */}
            <Stack direction="row" spacing={1.2} alignItems="center" mb={{xs: 1, md: 0}}>
                <GitHubIcon fontSize="small" sx={{color: "text.secondary"}}/>
                <MuiLink
                    href="https://github.com/Guliveer/song-request"
                    target="_blank"
                    rel="noopener"
                    color="inherit"
                    underline="hover"
                    sx={{fontWeight: 500}}
                >
                    Project repo
                </MuiLink>
            </Stack>

            {/* Autorzy */}
            <Stack direction="row" spacing={2} alignItems="center" mb={{xs: 1, md: 0}}>
                {authors.map((author) => (
                    <MuiLink
                        key={author.url}
                        href={author.url}
                        target="_blank"
                        rel="noopener"
                        color="inherit"
                        underline="hover"
                        sx={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 0.5,
                            px: 0.5,
                            py: 0.2,
                            borderRadius: 1,
                            transition: "color 0.2s",
                            "&:hover": {
                                color: "primary.main",
                                background: "none",
                            },
                        }}
                    >
                        <GitHubIcon fontSize="inherit" sx={{fontSize: 18}}/>
                        <Typography variant="body2" sx={{fontWeight: 600}}>{author.name}</Typography>
                    </MuiLink>
                ))}
            </Stack>

            {/* Copyright */}
            <Typography sx={{fontWeight: 400, letterSpacing: 0.3, fontSize: 13}}>
                © {new Date().getFullYear()} Track Drop
            </Typography>
        </Box>
    );
}