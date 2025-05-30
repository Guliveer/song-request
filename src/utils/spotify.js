export function extractSpotifyTrackId(url) {
    const regex = /spotify\.com\/track\/([a-zA-Z0-9]+)(\?|$)/;
    const match = url.match(regex);
    return match ? match[1] : null;
}

export async function fetchSpotifyMetadata(trackId) {
    const res = await fetch(`/api/spotify-track?trackId=${trackId}`);
    if (!res.ok) throw new Error("Failed to fetch Spotify metadata");
    return res.json(); // { title, author }
}

