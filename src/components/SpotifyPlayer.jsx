import { useEffect, useRef, useState } from "react";
import { getSpotifyUserAccessToken } from "@/lib/spotify";

export default function SpotifyPlayer({ trackId }) {
    const [deviceId, setDeviceId] = useState(null);
    const [accessToken, setAccessToken] = useState(null);
    const [isReady, setIsReady] = useState(false);
    const playerRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        const loadSpotifySDK = () => {
            const script = document.createElement("script");
            script.src = "https://sdk.scdn.co/spotify-player.js";
            script.async = true;
            document.body.appendChild(script);
        };

        loadSpotifySDK();

        window.onSpotifyWebPlaybackSDKReady = async () => {
            const token = await getSpotifyUserAccessToken();
            setAccessToken(token);

            const player = new Spotify.Player({
                name: "Web Player",
                getOAuthToken: cb => cb(token),
                volume: 0.5,
            });

            playerRef.current = player;

            player.addListener("ready", ({ device_id }) => {
                setDeviceId(device_id);
                setIsReady(true);
            });

            player.addListener("not_ready", ({ device_id }) => {
                console.warn("Device ID has gone offline", device_id);
            });

            player.connect();
        };
    }, []);

    useEffect(() => {
        if (isReady && deviceId && accessToken) {
            fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    uris: [`spotify:track:${trackId}`],
                }),
            });
        }
    }, [isReady, deviceId, accessToken, trackId]);

    const togglePlayback = async () => {
        const player = playerRef.current;
        if (!player) return;

        const state = await player.getCurrentState();
        if (!state) return;

        if (state.paused) {
            await player.resume();
        } else {
            await player.pause();
        }
    };

    window.toggleSpotifyPlayback = togglePlayback;

    useEffect(() => {
        const player = playerRef.current;
        if (!player) return;

        player.addListener("player_state_changed", state => {
            if (!state) return;
            setIsPlaying(!state.paused);
        });
    }, []);

    return null;
}
