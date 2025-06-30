import {supabase} from "@/lib/supabase";
import {useEffect, useState} from "react";
import {
    Mail,
    Github,
    Globe,
    Music,
    Link as LucideLink,
    Unlink,
    AlertCircle,
    Loader2,
    Facebook,
} from "lucide-react";

export default function Providers() {
    const [identities, setIdentities] = useState([]);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [identityToUnlink, setIdentityToUnlink] = useState(null);
    const [loadingProvider, setLoadingProvider] = useState(null);

    // Ikony tylko z Lucide
    const providerIcons = {
        email: <Mail className="w-5 h-5"/>,
        google: <Globe className="w-5 h-5"/>,      // Zamiast Google
        facebook: <Facebook className="w-5 h-5"/>, // Lucide ma Facebook
        github: <Github className="w-5 h-5"/>,
        spotify: <Music className="w-5 h-5"/>,     // Zamiast Spotify
    };

    const allProviders = Object.keys(providerIcons);

    useEffect(() => {
        async function fetchIdentities() {
            const {data, error} = await supabase.auth.getUserIdentities();
            if (error) {
                console.error("Error fetching identities:", error);
            } else {
                setIdentities(data?.identities || []);
            }
        }

        fetchIdentities();
    }, []);

    const handleConnectProvider = async (provider) => {
        setLoadingProvider(provider);
        try {
            const {error} = await supabase.auth.linkIdentity({
                provider: provider,
                options: {
                    redirectTo: window.location.origin,
                    scopes:
                        "streaming user-read-email user-read-private user-modify-playback-state user-read-playback-state",
                },
            });
            if (error) throw error;
        } catch (error) {
            console.error("Connection error:", error);
        }
        setLoadingProvider(null);
    };

    return (
        <>
            <h2 className="text-2xl font-semibold text-foreground mb-6">Providers</h2>
            <div className="border-b border-border mb-6"/>

            <ul className="p-0 m-0 divide-y divide-border bg-card rounded-xl shadow-sm">
                {allProviders.map((provider) => {
                    const isConnected = identities.some((id) => id.provider === provider);
                    const isEmail = provider === "email";
                    const isEmailVerified = identities.find((id) => id.provider === provider)
                        ?.identity_data?.email_verified;

                    return (
                        <li
                            key={provider}
                            className="flex items-center py-4 px-4 first:rounded-t-xl last:rounded-b-xl hover:bg-muted transition-colors"
                        >
                            <span className="text-xl text-foreground">{providerIcons[provider]}</span>
                            <div className="flex-1 ml-3">
                                <div className="flex items-center gap-2">
                                            <span className="font-medium text-foreground capitalize">
                                                {provider}
                                            </span>
                                    {isEmail && isConnected && !isEmailVerified && (
                                        <AlertCircle className="w-4 h-4 text-yellow-500"/>
                                    )}
                                </div>
                                {isEmail && isConnected && (
                                    <span className="block text-xs text-muted-foreground mt-1">
                                                {isEmailVerified ? "Email verified" : "Email not verified"}
                                            </span>
                                )}
                            </div>
                            <div className="ml-2 flex items-center">
                                {isConnected ? (
                                    provider !== "email" ? (
                                        <button
                                            onClick={() => {
                                                setIdentityToUnlink(
                                                    identities.find((id) => id.provider === provider)
                                                );
                                                setConfirmDialogOpen(true);
                                            }}
                                            title="Unlink this provider"
                                            className="text-destructive hover:bg-destructive/10 rounded-full p-2 transition-colors"
                                        >
                                            <Unlink className="w-5 h-5"/>
                                        </button>
                                    ) : null
                                ) : (
                                    <button
                                        disabled={loadingProvider === provider || isEmail}
                                        onClick={() => !isEmail && handleConnectProvider(provider)}
                                        className={`text-green-600 hover:bg-green-600/10 rounded-full p-2 transition-colors ${
                                            loadingProvider === provider || isEmail
                                                ? "opacity-50 cursor-not-allowed"
                                                : ""
                                        }`}
                                        title="Connect this provider"
                                    >
                                        {loadingProvider === provider ? (
                                            <Loader2 className="w-5 h-5 animate-spin"/>
                                        ) : (
                                            <LucideLink className="w-5 h-5"/>
                                        )}
                                    </button>
                                )}
                            </div>
                        </li>
                    );
                })}
            </ul>

            {/* Dialog */}
            {confirmDialogOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
                    <div className="bg-card text-foreground rounded-2xl shadow-lg max-w-sm w-full p-6">
                        <div className="text-lg font-semibold mb-4">
                            Czy na pewno chcesz odłączyć {identityToUnlink?.provider}?
                        </div>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setConfirmDialogOpen(false)}
                                className="px-4 py-2 rounded-md text-muted-foreground hover:bg-muted transition-colors"
                            >
                                Anuluj
                            </button>
                            <button
                                onClick={async () => {
                                    if (!identityToUnlink) return;
                                    try {
                                        const {error} = await supabase.auth.unlinkIdentity(
                                            identityToUnlink
                                        );
                                        if (error) {
                                            console.error("Unlink error:", error);
                                        } else {
                                            const {data} = await supabase.auth.getUserIdentities();
                                            setIdentities(data.identities || []);
                                        }
                                    } catch (error) {
                                        console.error("Error during unlinking:", error);
                                    }
                                    setConfirmDialogOpen(false);
                                    setIdentityToUnlink(null);
                                }}
                                className="px-4 py-2 rounded-md text-destructive hover:bg-destructive/10 transition-colors"
                            >
                                Odłącz
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}