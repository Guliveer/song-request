import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { getJoinedPlaylists, playSound } from "@/lib/actions";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/context/UserContext";
import { FormField } from "@/components/Items";
import { extractVideoId, fetchYouTubeMetadata } from "@/lib/youtube";
import { extractSpotifyTrackId, fetchSpotifyMetadata } from "@/lib/spotify";
import { whitelistedUrls } from "@/lib/whitelistedUrls";
import PropTypes from "prop-types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Typography } from "@/components/ui/typography";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { Plus as AddIcon, ListMusic as FormIcon, Send as SendIcon, Ban as BlockIcon, Check as SuccessIcon } from "lucide-react";

export default function AddSongForm({ playlist }) {
  const router = useRouter();
  const { isLoggedIn } = useUser();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ url: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [user, setUser] = useState(null);
  const [existingSong, setExistingSong] = useState(null);
  const [fabBottom, setFabBottom] = useState(24); // default MUI
  const fabRef = useRef();

  useEffect(() => {
    function updateFab() {
      const footer = document.getElementById("site-footer");
      const fab = fabRef.current;
      if (!footer || !fab) return;

      const idealBottom = 24; // MUI default

      // Footer relative to viewport
      const footerRect = footer.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // If footer is not visible, position FAB at ideal bottom
      let newFabBottom = idealBottom;
      if (footerRect.top < windowHeight - idealBottom) {
        // Odległość od dołu okna do górnej krawędzi footer
        const overlap = windowHeight - footerRect.top;
        // FAB przesuwamy tylko tyle, by był tuż nad footer + margines
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
      const {
        data: { user },
      } = await supabase.auth.getUser();
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
    let passedUrl;
    try {
      passedUrl = new URL(formData.url);
    } catch (error) {
      console.error("Invalid URL provided:", error.message);
      return;
    }

    event.preventDefault();
    if (!user) {
      console.error("You must be logged in to add a song.");
      return;
    }

    // Check if user has joined that playlist
    const hasJoinedPlaylist = await getJoinedPlaylists(user.id);
    if (!hasJoinedPlaylist.includes(playlist)) {
      console.error("You must join the playlist before adding songs.");
      return;
    }

    // Check ban status
    const { data: userData, error: userError } = await supabase.from("users").select("ban_status").eq("id", user.id).single();

    if (userError) {
      console.error("Error checking account status.");
      return;
    }

    if (userData.ban_status > 0) {
      console.error("You cannot add songs because your account is banned.");
      return;
    }

    // Remove excessive GET data (except for YouTube's: ?v=)
    passedUrl.searchParams.forEach((_, key) => {
      if (key !== "v") {
        passedUrl.searchParams.delete(key);
      }
    });

    // Banowanie dla głównej tabeli banned_url
    const { data: bannedGlobalUrl } = await supabase.from("banned_url").select("id, banned_url").eq("url", passedUrl).maybeSingle();

    // Validate URL based on whitelisted URLs,
    // if formData.url doesn't start with (optional)
    // http(s)://(www.) and then one of the whitelisted URLs,
    // after which there are only alphanumeric characters, hyphens, or underscores
    const urlPattern = new RegExp(`^(https?://)?(www\\.)?(${whitelistedUrls.join("|")})[a-zA-Z0-9-_$]+\\??$`);
    if (!urlPattern.test(passedUrl.href)) {
      alert("Invalid URL. Please enter a valid YouTube or Spotify link.");
      alert(passedUrl.href);
      return;
    }

    // Check if URL is banned
    const { data: bannedUrl } = await supabase.from("playlists").select("id, banned_songs").eq("id", playlist).maybeSingle();

    // Check if the provided URL is in the returned array (bannedUrl -> banned_songs[])
    if (bannedUrl.banned_songs?.includes(passedUrl.href)) {
      alert("This URL is banned and cannot be added to the queue.");
      return;
    }

    // Check if the song already exists
    const { data: existing, error: existingError } = await supabase.from("queue").select("id, title, author").eq("url", passedUrl.href).eq("playlist", playlist).maybeSingle();

    if (existingError) {
      console.error("Error checking for existing song.");
      return;
    }

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

    const { error } = await supabase.from("queue").insert([{ title, author, url: passedUrl.href, user_id: user.id, playlist }]);

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
              className={cn("fixed z-[1300] w-14 h-14 rounded-full shadow-lg transition-all duration-300 ease-out", "hover:shadow-xl hover:scale-105")}
              style={{
                bottom: `${fabBottom}px`,
                right: window.innerWidth < 640 ? "20px" : "36px",
              }}
              onClick={() => setOpen(true)}>
              <AddIcon className="w-6 h-6" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">Add song</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md backdrop-blur-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-primary">
              <FormIcon className="w-5 h-5" />
              Add Song to Queue
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
            <FormField required id="url" placeholder="Spotify or YouTube URL" disabled={!isLoggedIn} value={formData.url} onChange={handleChange} />

            <div className="flex justify-center mt-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="w-full flex justify-center">
                      <Button type="submit" disabled={!isLoggedIn || isSubmitting} className="min-w-[50%] font-semibold shadow-lg">
                        {success ? (
                          <>
                            <SuccessIcon className="w-4 h-4 mr-2" />
                            Done!
                          </>
                        ) : isSubmitting ? (
                          <Spinner className="w-4 h-4" />
                        ) : !isLoggedIn ? (
                          <>
                            <BlockIcon className="w-4 h-4 mr-2" />
                            Login Required
                          </>
                        ) : (
                          <>
                            <SendIcon className="w-4 h-4 mr-2" />
                            Add to Queue
                          </>
                        )}
                      </Button>
                    </div>
                  </TooltipTrigger>
                  {!isLoggedIn && <TooltipContent>You must be logged in to add a song.</TooltipContent>}
                </Tooltip>
              </TooltipProvider>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog for existing song */}
      {existingSong && (
        <Dialog open={!!existingSong} onOpenChange={() => setExistingSong(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Song Already Exists</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Typography>"{existingSong.title}" is already in the queue</Typography>
              <Button
                onClick={() => {
                  setExistingSong(null);
                  router.push(`/song/${existingSong.id}`);
                }}
                className="w-full">
                Go to Song
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

AddSongForm.propTypes = {
  playlist: PropTypes.number.isRequired, // Ensure playlist is a string
};
