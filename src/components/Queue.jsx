'use server'
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";
import SongCard from "@/components/SongCard";

export default function Queue() {
    const [songs, setSongs] = useState([]);
    // const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchQueue() {
            try {
                const { data, error } = await supabase
                    .from("queue")
                    .select("id, score, added_at")
                    .order("score", { ascending: false })
                    .order("added_at", { ascending: true });
                if (error) throw error;

                // Sort songs by score (highest to lowest) and then by added_at (oldest to newest)
                const sortedSongs = data.sort((a, b) => {
                    if (a.score === b.score) {
                        return new Date(a.added_at) - new Date(b.added_at);
                    }
                    return b.score - a.score;
                });

                // Assign rank based on sorted order
                sortedSongs.forEach((song, index) => {
                    song.rank = index;
                });

                setSongs(sortedSongs);
            } catch (error) {
                console.error("Error fetching queue:", error.message);
            // } finally {
            //     setLoading(false);
            }
        }

        fetchQueue();
    }, []);

    // if (loading) return (<div>Loading...</div>); // placeholder
    // if (!songs.length) console.log("No songs in queue"); // placeholder;

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {songs.map((song) => (
                <SongCard key={song.id} id={song.id} />
            ))}
        </div>
    );
}
