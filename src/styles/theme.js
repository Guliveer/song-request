//* https://www.realtimecolors.com/

// Theme is a subject to change

import { createTheme } from '@mui/material/styles';
import {Noto_Sans_Inscriptional_Parthian} from "next/dist/compiled/@next/font/dist/google";

export const themeOptions = {
    // Colors

    //? Yellow
    // palette: {
    //     mode: 'dark',
    //     primary: {
    //         main: '#e2d48f',
    //         contrastText: '#080703',
    //     },
    //     secondary: {
    //         main: '#8a7513',
    //         contrastText: '#080703',
    //     },
    //     divider: '#f7d636',
    //     text: {
    //         primary: 'rgb(242, 241, 233)',
    //         secondary: 'rgba(242, 241, 233, 0.6)',
    //         disabled: 'rgba(242, 241, 233, 0.38)',
    //         hint: 'rgb(247, 214, 54)',
    //     },
    //     background: {
    //         default: '#080703',
    //     },
    // },

    //? Green
    // palette: {
    //     mode: 'dark',
    //     primary: {
    //         main: '#9ce1b3',
    //         contrastText: '#0b100c',
    //     },
    //     secondary: {
    //         main: '#218943',
    //         contrastText: '#0b100c',
    //     },
    //     divider: '#4bdf7c',
    //     text: {
    //         primary: 'rgb(230, 244, 235)',
    //         secondary: 'rgba(230, 244, 235, 0.6)',
    //         disabled: 'rgba(230, 244, 235, 0.38)',
    //         hint: 'rgb(75, 223, 124)',
    //     },
    //     background: {
    //         default: '#0b100c',
    //     },
    // },

    //? Yellow & Green
    // palette: {
    //     mode: 'dark',
    //     primary: {
    //         main: '#91e49b',
    //         contrastText: '#051507',
    //     },
    //     secondary: {
    //         main: '#22885b',
    //         contrastText: '#051507',
    //     },
    //     divider: '#55d5b7',
    //     text: {
    //         primary: 'rgb(232, 249, 233)',
    //         secondary: 'rgba(232, 249, 233, 0.6)',
    //         disabled: 'rgba(232, 249, 233, 0.38)',
    //         hint: 'rgb(85, 213, 183)',
    //     },
    //     background: {
    //         default: '#051507',
    //     },
    // },

    //? Blue & Purple
    // palette: {
    //     mode: 'dark',
    //     primary: {
    //         main: '#8ac8f2',
    //         contrastText: '#020d15',
    //     },
    //     secondary: {
    //         main: '#2d1094',
    //         contrastText: '#d3ecfa',
    //     },
    //     divider: '#8311fc',
    //     text: {
    //         primary: 'rgb(211, 236, 250)',
    //         secondary: 'rgba(211, 236, 250, 0.6)',
    //         disabled: 'rgba(211, 236, 250, 0.38)',
    //         hint: 'rgb(131, 17, 252)',
    //     },
    //     background: {
    //         default: '#020d15',
    //     },
    // },

    //? Purple & Peach
    // palette: {
    //     mode: 'dark',
    //     primary: {
    //         main: '#b07def',
    //         contrastText: '#07030b',
    //     },
    //     secondary: {
    //         main: '#9f1375',
    //         contrastText: '#f0e3fc',
    //     },
    //     divider: '#eaa1c4',
    //     text: {
    //         primary: 'rgb(240, 227, 252)',
    //         secondary: 'rgba(240, 227, 252, 0.6)',
    //         disabled: 'rgba(240, 227, 252, 0.38)',
    //         hint: 'rgb(234, 161, 196)',
    //     },
    //     background: {
    //         default: '#07030b',
    //     },
    // },

    //? Pink
    // palette: {
    //     mode: 'dark',
    //     primary: {
    //         main: '#db9fcd',
    //         contrastText: '#11090f',
    //     },
    //     secondary: {
    //         main: '#701f5e',
    //         contrastText: '#eae3e8',
    //     },
    //     divider: '#fb51d4',
    //     text: {
    //         primary: 'rgb(234, 227, 232)',
    //         secondary: 'rgba(234, 227, 232, 0.6)',
    //         disabled: 'rgba(234, 227, 232, 0.38)',
    //         hint: 'rgb(251, 81, 212)',
    //     },
    //     background: {
    //         default: '#11090f',
    //     },
    // },

    //? Cyan
    palette: {
        mode: 'dark',
        primary: {
            main: '#87e5dd',
            contrastText: '#030909',
        },
        secondary: {
            main: '#11887e',
            contrastText: '#030909',
        },
        divider: '#13f3e0',
        text: {
            primary: 'rgb(220, 240, 238)',
            secondary: 'rgba(220, 240, 238, 0.6)',
            disabled: 'rgba(220, 240, 238, 0.38)',
            hint: 'rgb(19, 243, 224)',
        },
        background: {
            default: '#030909',
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
