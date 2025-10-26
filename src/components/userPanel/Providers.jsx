import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { AlertCircle, Link as LinkIcon, Link2Off } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from "shadcn/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "shadcn/dialog";
import { Typography } from "shadcn/typography";
import { Separator } from "shadcn/separator";
import { Spinner } from "shadcn/spinner";

export default function Providers() {
    const [identities, setIdentities] = useState([]);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [identityToUnlink, setIdentityToUnlink] = useState(null);
    const [loadingProvider, setLoadingProvider] = useState(null);

    const providerIcons = {
        email: <FontAwesomeIcon icon="fa-solid fa-envelope"/>,
        google: <FontAwesomeIcon icon="fa-brands fa-google"/>,
        facebook: <FontAwesomeIcon icon="fa-brands fa-facebook"/>,
        github: <FontAwesomeIcon icon="fa-brands fa-github"/>,
        spotify: <FontAwesomeIcon icon="fa-brands fa-spotify"/>,
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
                    scopes: "streaming user-read-email user-read-private user-modify-playback-state user-read-playback-state",
                },
            });
            if (error) throw error;
        } catch (error) {
            console.error("Connection error:", error);
            throw new Error(`Failed to connect ${provider}: ${error.message}`);
        }
        setLoadingProvider(null);
    };

    const handleUnlinkProvider = async () => {
        if (!identityToUnlink) return;
        try {
            const {error} = await supabase.auth.unlinkIdentity(identityToUnlink);
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
    };

    return (
        <>
            <Typography variant="h5" className="text-white mb-6 font-medium">
                Providers
            </Typography>
            <Separator className="mb-6"/>

            <div className="space-y-4">
                {allProviders.map((provider, index) => {
                    const isConnected = identities.some((id) => id.provider === provider);
                    const isEmail = provider === "email";
                    const isEmailVerified = identities.find((id) => id.provider === provider)?.identity_data?.email_verified;

                    return (
                        <div key={provider} className="space-y-4">
                            <div
                                className="flex items-center justify-between py-4 px-2 rounded-lg hover:bg-white/5 transition-colors">
                                <div className="flex items-center flex-1">
                                    <div className="text-white mr-3">{providerIcons[provider]}</div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <Typography variant="body1" className="text-white font-medium capitalize">
                                                {provider}
                                            </Typography>
                                            {isEmail && isConnected && !isEmailVerified &&
                                                <AlertCircle className="h-4 w-4 text-orange-500"/>}
                                        </div>
                                        {isEmail && isConnected && (
                                            <Typography variant="body2" className="text-gray-400 mt-1">
                                                {isEmailVerified ? "Email verified" : "Email not verified"}
                                            </Typography>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center">
                                    {isConnected ? (
                                        provider !== "email" ? (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    setIdentityToUnlink(identities.find((id) => id.provider === provider));
                                                    setConfirmDialogOpen(true);
                                                }}
                                                className="text-red-500 hover:bg-red-500/10"
                                                title="Unlink this provider">
                                                <Link2Off className="h-4 w-4"/>
                                            </Button>
                                        ) : null
                                    ) : (
                                        <Button variant="ghost" size="sm"
                                                disabled={loadingProvider === provider || isEmail}
                                                onClick={() => !isEmail && handleConnectProvider(provider)}
                                                className="text-green-500 hover:bg-green-500/10 disabled:opacity-50"
                                                title="Connect this provider">
                                            {loadingProvider === provider ? <Spinner className="h-4 w-4"/> :
                                                <LinkIcon className="h-4 w-4"/>}
                                        </Button>
                                    )}
                                </div>
                            </div>
                            {index < allProviders.length - 1 && <Separator/>}
                        </div>
                    );
                })}
            </div>

            {/* Unlink Confirmation Dialog */}
            <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
                <DialogContent className="rounded-2xl bg-gray-800 text-white">
                    <DialogHeader>
                        <DialogTitle className="text-white">Are you sure you want to
                            unlink {identityToUnlink?.provider}?</DialogTitle>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}
                                className="text-gray-400 hover:bg-white/5">
                            Cancel
                        </Button>
                        <Button onClick={handleUnlinkProvider} variant="destructive"
                                className="bg-red-600 hover:bg-red-700">
                            Unlink
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
