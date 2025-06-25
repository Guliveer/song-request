import { supabase } from "@/lib/supabase";

export function extractSpotifyTrackId(url) {
    // Regex to match Spotify track URLs
    const regex = new RegExp(`^https?://(open\\.spotify\\.com/track/|spotify\\.link/)([a-zA-Z0-9]+)`);
    return url.match(regex)?.[2] || null;
}

export async function fetchSpotifyMetadata(trackId) {
    const res = await fetch(`/api/spotify-track?trackId=${trackId}`);
    if (!res.ok) throw new Error("Failed to fetch Spotify metadata");
    return res.json(); // { title, author }
}

export async function getSpotifyUserAccessToken() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session?.provider_token || null;
}