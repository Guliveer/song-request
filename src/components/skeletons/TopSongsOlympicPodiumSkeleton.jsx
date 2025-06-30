import { Trophy, Disc } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

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

export default function TopSongsOlympicPodiumSkeleton() {
    return (
        <div className="w-full px-4 animate-pulse">
            <div className="relative overflow-hidden rounded-2xl bg-card p-8 shadow border border-border">
                {/* Nagłówek */}
                <div className="text-center mb-6 flex justify-center items-center gap-4" style={{ minHeight: '72px' }}>
                    <Trophy className="text-primary w-10 h-10" />
                    <span className="font-bold text-2xl md:text-3xl">
                        <Skeleton className="h-8 w-40 rounded" />
                    </span>
                </div>
                {/* Podium */}
                <div className="flex justify-between items-end gap-4">
                    {[2, 1, 3].map((pos, idx) => {
                        const style = podiumStyles[pos];
                        return (
                            <div key={pos} className={`flex-1 flex flex-col items-center ${idx === 1 ? 'z-10' : ''}`}>
                                {/* Ikona */}
                                <div className={`flex items-center justify-center rounded-full mb-4 ${style.iconSize} bg-background border border-border`}>
                                    <Skeleton className="w-full h-full rounded-full" />
                                </div>
                                {/* Teksty */}
                                <div className="mb-1 px-2 w-full flex justify-center">
                                    <Skeleton className="h-4 w-24 rounded" />
                                </div>
                                <div className="mb-2 px-2 w-full flex justify-center">
                                    <Skeleton className="h-3 w-16 rounded" />
                                </div>
                                {/* Wynik */}
                                <div className="mb-2 inline-block bg-muted/50 rounded px-3 py-1 text-xs font-medium text-primary">
                                    <Skeleton className="h-4 w-12 rounded" />
                                </div>
                                {/* Blok podstawa */}
                                <div className={`relative w-full rounded-t-lg ${style.block} ${style.blockSize} flex items-center justify-center`}>
                                    <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${style.badge} rounded-full flex items-center justify-center font-bold ${style.blockNum}`}>
                                        <Skeleton className="h-4 w-4 rounded-full" />
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