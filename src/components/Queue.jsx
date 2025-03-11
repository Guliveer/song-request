import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";
import SongCard from "@/components/SongCard";

export default function Queue() {
    const [songs, setSongs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchQueue = async () => {
            try {
                const { data, error } = await supabase.from("queue").select("id");
                if (error) throw error;
                setSongs(data || []);
            } catch (error) {
                console.error("Error fetching queue:", error.message);
                setError(error);
            } finally {
                setLoading(false);
            }
        };

        fetchQueue();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;
    if (!songs.length) return <div>No songs in queue</div>;

    return (
        <div style={{display: "flex", flexDirection: "column", gap: "1rem"}}>
            {songs.map((song) => (
                <SongCard id={song.id} />
            ))}
        </div>
    );
}
