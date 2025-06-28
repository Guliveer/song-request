import { useState, useEffect, useRef } from "react";
import { Plus, ListMusic, Send, Ban, Check, Loader2, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useRouter } from "next/router";
import { getJoinedPlaylists, playSound } from "@/lib/actions";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/context/UserContext";
import { extractVideoId, fetchYouTubeMetadata } from "@/lib/youtube";
import { extractSpotifyTrackId, fetchSpotifyMetadata } from "@/lib/spotify";
import { whitelistedUrls } from "@/lib/whitelistedUrls";
import PropTypes from "prop-types";

export default function AddSongForm({ playlist }) {
    const router = useRouter();
    const { isLoggedIn } = useUser();
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({ url: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [user, setUser] = useState(null);
    const [existingSong, setExistingSong] = useState(null);
    const [fabBottom, setFabBottom] = useState(24);
    const fabRef = useRef();

    useEffect(() => {
        function updateFab() {
            const footer = document.getElementById("site-footer");
            const fab = fabRef.current;
            if (!footer || !fab) return;
            const idealBottom = 24;
            const footerRect = footer.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            let newFabBottom = idealBottom;
            if (footerRect.top < windowHeight - idealBottom) {
                const overlap = windowHeight - footerRect.top;
                newFabBottom = overlap + idealBottom;
            }
            setFabBottom(newFabBottom);
        }
        updateFab();
        window.addEventListener("scroll", updateFab, { passive: true });
        window.addEventListener("resize", updateFab);
        return () => {
            window.removeEventListener("scroll", updateFab);
            window.removeEventListener("resize", updateFab);
        };
    }, []);

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        fetchUser();
        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user || null);
        });
        return () => {
            listener.subscription.unsubscribe();
        };
    }, []);

    const handleChange = (event) => {
        const { id, value } = event.target;
        setFormData((prev) => ({
            ...prev,
            [id]: value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        let passedUrl;
        try {
            passedUrl = new URL(formData.url);
        } catch (error) {
            return;
        }
        if (!user) return;
        const hasJoinedPlaylist = await getJoinedPlaylists(user.id);
        if (!hasJoinedPlaylist.includes(playlist)) return;
        const { data: userData, error: userError } = await supabase
            .from("users")
            .select("ban_status")
            .eq("id", user.id)
            .single();
        if (userError || userData.ban_status > 0) return;
        passedUrl.searchParams.forEach((_, key) => {
            if (key !== "v") passedUrl.searchParams.delete(key);
        });
        const { data: bannedGlobalUrl } = await supabase
            .from("banned_url")
            .select("id, banned_url")
            .eq("url", passedUrl)
            .maybeSingle();
        const urlPattern = new RegExp(`^(https?://)?(www\\.)?(${whitelistedUrls.join("|")})[a-zA-Z0-9-_$]+\\??$`);
        if (!urlPattern.test(passedUrl.href)) {
            alert("Invalid URL. Please enter a valid YouTube or Spotify link.");
            return;
        }
        const { data: bannedUrl } = await supabase
            .from("playlists")
            .select("id, banned_songs")
            .eq("id", playlist)
            .maybeSingle();
        if (bannedUrl.banned_songs?.includes(passedUrl.href)) {
            alert("This URL is banned and cannot be added to the queue.");
            return;
        }
        const { data: existing, error: existingError } = await supabase
            .from("queue")
            .select("id, title, author")
            .eq("url", passedUrl.href)
            .eq("playlist", playlist)
            .maybeSingle();
        if (existingError) return;
        if (existing) {
            setExistingSong(existing);
            return;
        }
        setIsSubmitting(true);
        let title = "";
        let author = "";
        const url = passedUrl.href;
        if (url.includes("youtube")) {
            const videoId = extractVideoId(url);
            if (videoId) {
                const metadata = await fetchYouTubeMetadata(videoId);
                if (metadata) {
                    title = metadata.title;
                    author = metadata.author;
                }
            }
        }
        if (url.includes("spotify")) {
            const trackId = extractSpotifyTrackId(url);
            if (trackId) {
                const metadata = await fetchSpotifyMetadata(trackId);
                if (metadata) {
                    title = metadata.title;
                    author = metadata.author;
                }
            }
        }
        const { error } = await supabase
            .from("queue")
            .insert([{ title, author, url: passedUrl.href, user_id: user.id, playlist }]);
        if (error) {
            alert("Error while adding the song: " + error.message);
        } else {
            setSuccess(true);
            setFormData({ url: "" });
            await playSound("success", 0.8);
            setOpen(false);
        }
        setIsSubmitting(false);
        setTimeout(() => setSuccess(false), 1000);
    };

    return (
        <>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            ref={fabRef}
                            size="icon"
                            className="fixed z-50 right-6 md:right-10 rounded-full shadow-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                            style={{ bottom: fabBottom, width: 56, height: 56, minWidth: 56, minHeight: 56 }}
                            onClick={() => setOpen(true)}
                        >
                            <Plus className="w-7 h-7" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Add song</TooltipContent>
                </Tooltip>
            </TooltipProvider>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-sm w-full rounded-2xl p-0 shadow-2xl bg-card border border-border">
                    <DialogHeader className="px-6 pt-6 pb-2">
                        <DialogTitle className="flex items-center gap-2 text-primary text-xl font-bold">
                            <ListMusic className="w-6 h-6" />
                            Add Song to Queue
                        </DialogTitle>
                    </DialogHeader>
                    <form className="flex flex-col gap-4 px-6 pb-6 pt-2" onSubmit={handleSubmit}>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="url" className="font-semibold flex items-center gap-2">
                                <Link2 className="w-4 h-4" />
                                Spotify or YouTube URL
                            </Label>
                            <Input
                                required
                                id="url"
                                type="url"
                                placeholder="Paste link here"
                                value={formData.url}
                                onChange={handleChange}
                                disabled={!isLoggedIn}
                                className="w-full"
                            />
                        </div>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        type="submit"
                                        disabled={!isLoggedIn || isSubmitting}
                                        className="min-w-[50%] py-2 px-4 font-semibold shadow-md text-base rounded-lg flex items-center gap-2 justify-center bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                                    >
                                        {success ? (
                                            <>
                                                <Check className="w-5 h-5" />
                                                Done!
                                            </>
                                        ) : !isLoggedIn ? (
                                            <>
                                                <Ban className="w-5 h-5" />
                                                Login Required
                                            </>
                                        ) : isSubmitting ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <>
                                                <Send className="w-5 h-5" />
                                                Add to Queue
                                            </>
                                        )}
                                    </Button>
                                </TooltipTrigger>
                                {!isLoggedIn && (
                                    <TooltipContent>
                                        You must be logged in to add a song
                                    </TooltipContent>
                                )}
                            </Tooltip>
                        </TooltipProvider>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Dialog for existing song */}
            <Dialog open={!!existingSong} onOpenChange={() => setExistingSong(null)}>
                <DialogContent className="max-w-sm w-full rounded-2xl p-6 shadow-2xl bg-card border border-border">
                    <DialogHeader>
                        <DialogTitle>Song Already Exists</DialogTitle>
                    </DialogHeader>
                    <div className="mb-4">
                        <span>
                            &quot;{existingSong?.title}&quot; is already in the queue
                        </span>
                    </div>
                    <Button
                        onClick={() => {
                            setExistingSong(null);
                            router.push(`/song/${existingSong.id}`);
                        }}
                        className="w-full"
                    >
                        Go to Song
                    </Button>
                </DialogContent>
            </Dialog>
        </>
    );
}

AddSongForm.propTypes = {
    playlist: PropTypes.number.isRequired,
};