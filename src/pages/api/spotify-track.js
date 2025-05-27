import { getSpotifyAccessToken } from "@/pages/api/spotify-preview";

export default async function handler(req, res) {
    const { trackId } = req.query;

    if (!trackId) {
        return res.status(400).json({ error: "Missing trackId" });
    }

    try {
        const token = await getSpotifyAccessToken();

        const trackRes = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!trackRes.ok) {
            throw new Error("Spotify API error");
        }

        const data = await trackRes.json();

        const title = data.name;
        const author = data.artists.map(a => a.name).join(", ");

        return res.status(200).json({ title, author });
    } catch (err) {
        return res.status(500).json({ error: err.message || "Unknown error" });
    }
}
