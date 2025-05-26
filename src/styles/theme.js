import { createTheme } from '@mui/material/styles';

export const themeOptions = {
    palette: {
        mode: 'dark',
        primary: {
            main: '#87e5dd',       // Cyan
            contrastText: '#181c2a',
        },
        secondary: {
            main: '#a171f8',       // Violet
            contrastText: '#181c2a',
        },
        background: {
            default: '#181c2a',    // Spotify/MUI dark
            paper: '#20243a',      // Slightly lighter for cards
        },
        divider: '#3ee2ff',
        text: {
            primary: '#e2f2fa',
            secondary: 'rgba(226,242,250,0.65)',
            disabled: 'rgba(226,242,250,0.38)',
            hint: '#a171f8'
        }
    },
    spacing: 8, // 8pt grid
    // USUWAMY shape.borderRadius – zostawiamy jak w oryginale (czyli domyślnie 4)
    typography: {
        fontFamily: [
            'Noto Sans', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'
        ].join(','),
        h6: {
            fontWeight: 700,
            fontSize: '1.2rem',
            letterSpacing: '0.01em',
        },
        body1: {
            fontWeight: 400,
            fontSize: '1rem',
        },
        body2: {
            fontSize: '0.95rem',
            color: '#c3d0e0'
        },
        button: {
            textTransform: 'none',
            fontWeight: 600,
        }
    },
    components: {
        MuiCard: {
            styleOverrides: {
                root: {
                    background: '#20243a',
                    // NIE RUSZAMY borderRadius (nie nadpisujemy, zostanie domyślny z MUI)
                    boxShadow: '0 2px 16px 0 rgba(0,0,0,0.12)',
                    border: '1px solid #282c40'
                }
            }
        },
        MuiDivider: {
            styleOverrides: {
                root: {
                    borderColor: '#3ee2ff22'
                }
            }
        }
    }
};

export default createTheme(themeOptions);