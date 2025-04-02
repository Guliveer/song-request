//* https://www.realtimecolors.com/

// Theme is a subject to change

import { createTheme } from '@mui/material/styles';
import {Noto_Sans_Inscriptional_Parthian} from "next/dist/compiled/@next/font/dist/google";

export const themeOptions = {
    // Colors
    palette: {
        mode: 'dark',
        primary: {
            main: '#a9bcb8',
            contrastText: '#070808',
        },
        secondary: {
            main: '#45635d',
            contrastText: '#e7e9e9',
        },
        divider: '#6da297',
        text: {
            primary: 'rgb(231, 233, 233)',
            secondary: 'rgba(231, 233, 233, 0.6)',
            disabled: 'rgba(231, 233, 233, 0.38)',
            hint: 'rgb(109, 162, 151)',
        },
        background: {
            default: '#070808',
        },
    },

    // Fonts
    typography: {
        fontFamily: [
            Noto_Sans_Inscriptional_Parthian,
            'Helvetica',
            'Roboto',
            "Helvetica Neue",
            '-apple-system',
            'Arial',
            'sans-serif',
        ]
    }
};

export default createTheme(themeOptions);
