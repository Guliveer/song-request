"use server"
import {Alert, TextField} from "@mui/material";
import React from "react";
import PropTypes from "prop-types";

export function FormField({ slotProps, sx, ...rest }) {
    return (
        <TextField
            {...rest}
            variant="filled"
            slotProps={{ input: { disableUnderline: true } }}
            sx={{
                '& .MuiFilledInput-root': {
                    borderRadius: 1,
                },
                ...sx
            }}
        />
    );
}

FormField.propTypes = {
    slotProps: PropTypes.object,
    sx: PropTypes.object
};

export function ErrorAlert({ children, ...rest }) {
    return (
        <Alert
            {...rest}
            severity="error"
            variant="outlined"
        >
            {children}
        </Alert>
    );
}

ErrorAlert.propTypes = {
    children: PropTypes.node
};

export function SuccessAlert({ children, ...rest }) {
    return (
        <Alert
            {...rest}
            severity="success"
            variant="outlined"
        >
            {children}
        </Alert>
    );
}

SuccessAlert.propTypes = {
    children: PropTypes.node
};

export function InfoAlert({ children, ...rest }) {
    return (
        <Alert
            {...rest}
            severity="info"
            variant="outlined"
        >
            {children}
        </Alert>
    );
}

InfoAlert.propTypes = {
    children: PropTypes.node
};

export function WarningAlert({ children, ...rest }) {
    return (
        <Alert
            {...rest}
            severity="warning"
            variant="outlined"
        >
            {children}
        </Alert>
    );
}

WarningAlert.propTypes = {
    children: PropTypes.node
};
