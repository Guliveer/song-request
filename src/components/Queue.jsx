import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";
import SongCard from "@/components/SongCard";

export default function Queue() {
    const [songs, setSongs] = useState([]);
    // const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchQueue() {
            try {
                const { data, error } = await supabase.from("queue").select("id");
                if (error) throw error;
                setSongs(data || []);
            } catch (error) {
                console.error("Error fetching queue:", error.message);
            // } finally {
            //     setLoading(false);
            }
        }

        fetchQueue();
    }, []);

    // if (loading) return (<div>Loading...</div>); // placeholder
    if (!songs.length) console.log("No songs in queue"); // placeholder;

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {songs.map((song) => (
                <SongCard key={song.id} id={song.id} />
            ))}
        </div>
    );
}
