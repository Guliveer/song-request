"use server";
import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { supabase } from "@/lib/supabase";
import { genUserAvatar } from "@/lib/actions";
import { Input } from "shadcn/input";
import { Button } from "shadcn/button";
import { Alert, AlertDescription } from "shadcn/alert";
import { Avatar, AvatarFallback, AvatarImage } from "shadcn/avatar";
import { Spinner } from "shadcn/spinner";
import { cn } from "@/lib/utils";

export function FormField({className, ...rest}) {
    return <Input {...rest}
                  className={cn("bg-muted/50 border-0 rounded-md focus-visible:ring-1 focus-visible:ring-ring", className)}/>;
}

FormField.propTypes = {
    className: PropTypes.string,
};

export function ErrorAlert({children, className, ...rest}) {
    return (
        <Alert {...rest} className={cn("border-destructive/50 text-destructive", className)}>
            <AlertDescription>{children}</AlertDescription>
        </Alert>
    );
}

ErrorAlert.propTypes = {
    children: PropTypes.node,
    className: PropTypes.string,
};

export function SuccessAlert({children, className, ...rest}) {
    return (
        <Alert {...rest} className={cn("border-green-500/50 text-green-700 dark:text-green-400", className)}>
            <AlertDescription>{children}</AlertDescription>
        </Alert>
    );
}

SuccessAlert.propTypes = {
    children: PropTypes.node,
    className: PropTypes.string,
};

export function InfoAlert({children, className, ...rest}) {
    return (
        <Alert {...rest} className={cn("border-blue-500/50 text-blue-700 dark:text-blue-400", className)}>
            <AlertDescription>{children}</AlertDescription>
        </Alert>
    );
}

InfoAlert.propTypes = {
    children: PropTypes.node,
    className: PropTypes.string,
};

export function WarningAlert({children, className, ...rest}) {
    return (
        <Alert {...rest} className={cn("border-yellow-500/50 text-yellow-700 dark:text-yellow-400", className)}>
            <AlertDescription>{children}</AlertDescription>
        </Alert>
    );
}

WarningAlert.propTypes = {
    children: PropTypes.node,
    className: PropTypes.string,
};

export function AuthProviderButton({providerName, displayName, icon, prompt = ""}) {
    const [isPressed, setIsPressed] = React.useState(false);

    async function handleProviderLogin() {
        setIsPressed(true);
        const {error} = await supabase.auth.signInWithOAuth({
            provider: providerName,
            options: {
                redirectTo: process.env.NEXT_PUBLIC_REDIRECT_URL || window.location.origin,
                scopes: providerName === "spotify" ? "streaming user-read-email user-read-private user-modify-playback-state app-remote-control" : "",
            },
        });
        if (error) {
            console.error("Error logging in with provider:", error.message);
        }
    }

    return (
        <Button variant="default" className="w-full text-base normal-case" onClick={handleProviderLogin}
                disabled={isPressed}>
            {isPressed ? (
                <Spinner className="w-6 h-6"/>
            ) : (
                <>
                    {!isPressed && icon}
                    {`${prompt} ${displayName}`}
                </>
            )}
        </Button>
    );
}

AuthProviderButton.propTypes = {
    providerName: PropTypes.string.isRequired,
    displayName: PropTypes.string.isRequired,
    icon: PropTypes.element.isRequired,
    prompt: PropTypes.string,
};

export default function UserAvatar({uuid}) {
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
        <Avatar>
            <AvatarImage src={avatarUrl} alt="User Avatar"/>
            <AvatarFallback>U</AvatarFallback>
        </Avatar>
    );
}

UserAvatar.propTypes = {
    uuid: PropTypes.string.isRequired,
};
