"use server"
import {Alert, Avatar, Button, CircularProgress, TextField} from "@mui/material";
import React, {useEffect, useState} from "react";
import PropTypes from "prop-types";
import {supabase} from "@/utils/supabase";
import {genUserAvatar} from "@/utils/actions";

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

export function AuthProvider({ providerName, displayName, icon, prompt = '' }) {
    const [isPressed, setIsPressed] = React.useState(false);
    async function handleProviderLogin() {
        setIsPressed(true);
        const { error } = await supabase.auth.signInWithOAuth({
            provider: providerName,
            options: {
                // redirectTo: process.env.NEXT_PUBLIC_REDIRECT_URL,
            },
        });
        if (error) {
            console.error('Error logging in with provider:', error.message);
        }
    }

    return (
        <Button
            variant="contained"
            color="primary"
            fullWidth
            startIcon={!isPressed && icon}
            onClick={handleProviderLogin}
            disabled={isPressed}
            sx={{
                fontSize: 16,
                textTransform: 'none',
            }}
        >
            {isPressed ? <CircularProgress size={27} /> : `${prompt} ${displayName}`}
        </Button>
    );
}

AuthProvider.propTypes = {
    providerName: PropTypes.string.isRequired,
    displayName: PropTypes.string.isRequired,
    icon: PropTypes.element.isRequired,
    prompt: PropTypes.string,
}

export default function UserAvatar({ uuid }) {
    const [avatarUrl, setAvatarUrl] = useState(null);

    useEffect(() => {
        let isMounted = true;

        async function fetchAvatar() {
            const url = await genUserAvatar(uuid);
            if (isMounted) {
                setAvatarUrl(url);
            }
        }

        fetchAvatar();

        return () => {
            isMounted = false; // Cleanup to prevent state updates on unmounted components
        };
    }, [uuid]);

    return (
        <Avatar alt="User Avatar" src={avatarUrl} />
    );
}

UserAvatar.propTypes = {
    uuid: PropTypes.string.isRequired,
};
