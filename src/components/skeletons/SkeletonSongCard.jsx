'use server'
import { Card, CardContent } from "shadcn/card";
import { Skeleton } from "shadcn/skeleton";

export default function SkeletonSongCard() {
    return (
        <Card
            className="px-2 w-max h-fit cursor-default border rounded-2xl"
        >
            <CardContent className="py-2 space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <Skeleton className="w-8 h-6" />
                    <Skeleton className="w-6 h-6" />
                </div>

                {/* Main content */}
                <div className="flex gap-3 w-[425px] items-center">
                    {/* Cover */}
                    <Skeleton className="w-12 h-12 rounded-md" />

                    {/* Texts */}
                    <div className="flex-1 min-w-0 space-y-2">
                        <Skeleton className="w-[200px] h-4" />
                        <Skeleton className="w-[125px] h-3" />
                        <div className="flex gap-2 flex-wrap">
                            <Skeleton className="w-20 h-3" />
                            <Skeleton className="w-36 h-3" />
                        </div>
                    </div>

                    {/* Voting */}
                    <div className="flex flex-col items-center gap-2">
                        <Skeleton className="w-8 h-8 rounded-full" />
                        <Skeleton className="w-8 h-4" />
                        <Skeleton className="w-8 h-8 rounded-full" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}