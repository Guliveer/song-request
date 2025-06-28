"use client"
import PropTypes from "prop-types"
import { useState } from "react"
import { Button } from "shadcn/button"
import { Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { authProviders } from "@/lib/authProviders"

export default function AuthProvidersList({ prompt }) {
    return (
        <div className="flex flex-col gap-4 w-full">
            {authProviders.map((provider) => (
                <AuthProviderButton
                    key={provider.providerName}
                    providerName={provider.providerName}
                    displayName={provider.displayName}
                    icon={provider.icon}
                    prompt={prompt}
                />
            ))}
        </div>
    )
}

export function AuthProviderButton({ providerName, displayName, icon, prompt = "" }) {
    const [isPressed, setIsPressed] = useState(false)

    async function handleProviderLogin() {
        setIsPressed(true)
        const { error } = await supabase.auth.signInWithOAuth({
            provider: providerName,
            options: {
                redirectTo: process.env.NEXT_PUBLIC_REDIRECT_URL || window.location.origin,
                scopes:
                    providerName === "spotify" && "streaming user-read-email user-read-private user-modify-playback-state app-remote-control",
            },
        })
        if (error) {
            console.error("Error logging in with provider:", error.message)
            setIsPressed(false)
        }
    }

    return (
        <Button
            onClick={handleProviderLogin}
            disabled={isPressed}
            variant="outline"
            className="w-full inline-flex align-center gap-3"
        >
            {isPressed ? (
                <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
                <>
                    {icon}
                    {`${prompt} ${displayName}`}
                </>
            )}
        </Button>
    )
}

AuthProvidersList.propTypes = {
    prompt: PropTypes.string,
}

AuthProviderButton.propTypes = {
    providerName: PropTypes.string.isRequired,
    displayName: PropTypes.string.isRequired,
    icon: PropTypes.node.isRequired,
    prompt: PropTypes.string,
}
