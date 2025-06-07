import { createTheme } from '@mui/material/styles';

export const themeOptions = {
    palette: {
        mode: 'dark',
        primary: {
            main: '#87e5dd',
            contrastText: '#0a0e1a',
        },
        secondary: {
            main: '#a171f8',
            contrastText: '#0a0e1a',
        },
        background: {
            default: '#0a0e1a',
            paper: '#1a1f2e',
        },
        divider: 'rgba(135, 229, 221, 0.2)',
        text: {
            primary: '#ffffff',
            secondary: 'rgba(255, 255, 255, 0.7)',
            disabled: 'rgba(255, 255, 255, 0.38)',
        },
        warning: {
            main: '#ff9800'
        },
        error: {
            main: '#f44336'
        }
    },
    spacing: 8,
    typography: {
        fontFamily: [
            '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', '"Roboto"',
            '"Oxygen"', '"Ubuntu"', '"Cantarell"', '"Fira Sans"', '"Droid Sans"',
            '"Helvetica Neue"', 'sans-serif'
        ].join(','),
        h1: {
            fontWeight: 900,
            fontSize: '4rem',
            lineHeight: 1,
            letterSpacing: '-0.04em',
        },
        h2: {
            fontWeight: 800,
            fontSize: '3rem',
        },
        h3: {
            fontWeight: 800,
            fontSize: '2.5rem',
        },
        h4: {
            fontWeight: 700,
            fontSize: '2rem',
        },
        h5: {
            fontWeight: 600,
            fontSize: '1.5rem',
        },
        h6: {
            fontWeight: 600,
            fontSize: '1.25rem',
        },
        body1: {
            fontSize: '1rem',
            lineHeight: 1.6,
        },
        body2: {
            fontSize: '0.875rem',
            lineHeight: 1.5,
        },
        button: {
            textTransform: 'none',
            fontWeight: 700,
        }
    },
    components: {
        MuiCard: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                    background: 'rgba(26, 31, 46, 0.8)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(135, 229, 221, 0.2)',
                    borderRadius: 16,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                        borderColor: 'rgba(135, 229, 221, 0.4)',
                        transform: 'translateY(-4px)',
                        boxShadow: '0 20px 40px rgba(135, 229, 221, 0.15)',
                    }
                }
            }
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    borderRadius: 12,
                    fontWeight: 700,
                    transition: 'all 0.3s ease',
                },
                contained: {
                    boxShadow: '0 4px 24px rgba(135, 229, 221, 0.3)',
                    '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 32px rgba(135, 229, 221, 0.4)',
                    }
                },
                outlined: {
                    borderWidth: 2,
                    '&:hover': {
                        borderWidth: 2,
                        transform: 'translateY(-1px)',
                    }
                }
            }
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                    background: 'rgba(26, 31, 46, 0.8)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(135, 229, 221, 0.1)',
                }
            }
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    background: 'rgba(10, 14, 26, 0.95)',
                    backdropFilter: 'blur(20px)',
                    borderBottom: '1px solid rgba(135, 229, 221, 0.1)',
                }
            }
        }
    }
};

export default createTheme(themeOptions);
