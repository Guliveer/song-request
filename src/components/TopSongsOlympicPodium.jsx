// components/TopSongsOlympicPodium.jsx

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { sortSongs } from '@/lib/actions';
import { Trophy, Disc } from 'lucide-react';
import PropTypes from 'prop-types';

const podiumStyles = {
    1: {
        bg: "bg-primary/10",
        border: "border-primary/40",
        iconSize: "w-12 h-12 md:w-16 md:h-16",
        block: "bg-primary/20 border-t-2 border-primary/40",
        blockSize: "h-24 md:h-32 lg:h-40",
        blockNum: "w-8 h-8 md:w-10 md:h-10 text-base md:text-lg",
        badge: "bg-primary text-primary-foreground",
    },
    2: {
        bg: "bg-accent/10",
        border: "border-accent/40",
        iconSize: "w-10 h-10 md:w-14 md:h-14",
        block: "bg-accent/20 border-t-2 border-accent/40",
        blockSize: "h-16 md:h-24 lg:h-32",
        blockNum: "w-7 h-7 md:w-9 md:h-9 text-sm md:text-base",
        badge: "bg-accent text-accent-foreground",
    },
    3: {
        bg: "bg-muted/10",
        border: "border-muted/40",
        iconSize: "w-10 h-10 md:w-14 md:h-14",
        block: "bg-muted/20 border-t-2 border-muted/40",
        blockSize: "h-12 md:h-16 lg:h-24",
        blockNum: "w-7 h-7 md:w-9 md:h-9 text-sm md:text-base",
        badge: "bg-muted text-muted-foreground",
    },
};

export default function TopSongsOlympicPodium({ playlist }) {
    const [songs, setSongs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isMobile, setIsMobile] = useState(false);

    // Detekcja mobilki
    useEffect(() => {
        const onResize = () => setIsMobile(window.innerWidth < 768);
        onResize();
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    // Pobranie top 3
    useEffect(() => {
        async function fetchTop() {
            setLoading(true);
            const { data, error } = await supabase
                .from('queue')
                .select('id, title, author, score')
                .eq('playlist', playlist)
                .order('score', { ascending: false })
                .limit(3);
            if (!error) setSongs(data);
            setLoading(false);
        }
        fetchTop();
    }, [playlist]);

    // Skeleton
    if (loading) {
        return (
            <div className="w-full px-4">
                <div className="relative overflow-hidden rounded-2xl bg-card p-6 shadow border border-border">
                    <div className="text-center mb-6 flex justify-center items-center gap-3" style={{ minHeight: '64px' }}>
                        <div className="animate-pulse rounded-full bg-primary/20 w-8 h-8" />
                        <div className="animate-pulse bg-muted h-6 w-48 rounded" />
                    </div>
                    <div className="flex justify-between items-end gap-4 mt-8">
                        {[2, 1, 3].map(pos => (
                            <div key={pos} className="flex-1 flex flex-col items-center">
                                <div className={`animate-pulse rounded-full mb-4 ${podiumStyles[pos].bg} ${podiumStyles[pos].iconSize}`} />
                                <div className="animate-pulse bg-muted h-4 w-32 rounded mb-2" />
                                <div className="animate-pulse bg-muted h-3 w-24 rounded mb-2" />
                                <div className="animate-pulse bg-muted h-5 w-20 rounded mb-4" />
                                <div className={`animate-pulse mt-4 rounded-t-lg w-full ${podiumStyles[pos].block} ${podiumStyles[pos].blockSize}`} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // Widok mobilny — karty jedna pod drugą
    if (isMobile) {
        return (
            <div className="w-full px-4">
                <div className="rounded-2xl bg-card p-4 shadow border border-border space-y-4">
                    <div className="text-center flex justify-center items-center gap-2" style={{ minHeight: '56px' }}>
                        <Trophy className="text-primary w-8 h-8" />
                        <span className="font-bold text-xl">Top 3 Songs</span>
                    </div>
                    {songs.map((song, idx) => {
                        const pos = idx + 1;
                        const style = podiumStyles[pos];
                        return (
                            <div key={song.id} className={`flex gap-3 items-center rounded-lg p-3 border ${style.border} ${style.bg}`}>
                                <div className={`${style.iconSize} flex-shrink-0`}>
                                    <Disc className="w-full h-full text-accent" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-bold truncate">{song.title}</div>
                                    <div className="text-xs text-muted-foreground truncate">{song.author}</div>
                                </div>
                                <div className="text-sm text-primary font-medium">{song.score}</div>
                                <div className={`rounded-full ${style.badge} w-6 h-6 flex items-center justify-center text-xs`}>
                                    #{pos}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    // Widok desktop — podium skala 100% szerokości kontenera
    return (
        <div className="w-full px-4">
            <div className="relative overflow-hidden rounded-2xl bg-card p-8 shadow border border-border">

                {/* Nagłówek */}
                <div className="text-center mb-6 flex justify-center items-center gap-4" style={{ minHeight: '72px' }}>
                    <Trophy className="text-primary w-10 h-10" />
                    <span className="font-bold text-2xl md:text-3xl">Top 3 Songs</span>
                </div>

                {/* Elastyczne podium */}
                <div className="flex justify-between items-end gap-4">
                    {[2, 1, 3].map((pos, idx) => {
                        const song = songs[pos - 1] || {};
                        const style = podiumStyles[pos];
                        return (
                            <div key={pos} className={`flex-1 flex flex-col items-center ${idx === 1 ? 'z-10' : ''}`}>

                                {/* Ikona */}
                                <div className={`flex items-center justify-center rounded-full mb-4 ${style.iconSize} bg-background border border-border`}>
                                    <Disc className={`w-full h-full ${song.id ? 'text-accent' : 'text-muted'}`} />
                                </div>

                                {/* Teksty */}
                                <div className="font-bold text-center truncate mb-1 px-2">{song.title || '—'}</div>
                                <div className="text-sm text-muted-foreground text-center truncate mb-2 px-2">{song.author || '—'}</div>

                                {/* Wynik */}
                                <div className="mb-2 inline-block bg-muted/50 rounded px-3 py-1 text-xs font-medium text-primary">
                                    {song.score != null ? `Score: ${song.score}` : 'Score: 0'}
                                </div>

                                {/* Blok podstawa */}
                                <div className={`relative w-full rounded-t-lg ${style.block} ${style.blockSize} flex items-center justify-center`}>
                                    <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${style.badge} rounded-full flex items-center justify-center font-bold ${style.blockNum}`}>
                                        {pos}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

TopSongsOlympicPodium.propTypes = {
    playlist: PropTypes.string.isRequired,
};
