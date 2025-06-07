import React from "react"
import {ThemeProvider} from "@mui/material/styles"
import CssBaseline from "@mui/material/CssBaseline"
import theme from "../styles/theme"
import AnimatedBackground from "./AnimatedBackground"
import "../styles/globals.css"

export default function Layout({children}) {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline/>
            <AnimatedBackground/>
            <div style={{position: "relative", zIndex: 1}}>
                {children}
            </div>
        </ThemeProvider>
    )
}