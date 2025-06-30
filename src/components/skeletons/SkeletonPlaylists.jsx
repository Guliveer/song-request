"use server"

import { Skeleton } from "shadcn/skeleton"
import { Card, CardContent, CardFooter } from "shadcn/card";
import PropTypes from "prop-types"

export default function SkeletonPlaylists({ items = 5 }) {
    return (
        <div className="flex flex-wrap gap-4 justify-center">
            {[...Array(items)].map((_, index) => (
                <Card key={index} className="hover:shadow-md transition-all">
                    <CardContent className="py-2 min-w-[200px] max-w-[300px]">
                        <div className="flex items-center mb-4">
                            <Skeleton className="w-10 h-10 rounded-full mr-3" />
                            <div className="min-w-0 flex-1 space-y-2">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-3 w-3/4" />
                            </div>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                            <Skeleton className="w-3.5 h-3.5 rounded" />
                            <Skeleton className="h-3 w-20" />
                        </div>

                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Skeleton className="w-3.5 h-3.5 rounded" />
                            <Skeleton className="h-3 w-24" />
                        </div>
                    </CardContent>

                    <CardFooter>
                        <Skeleton className="h-8 w-full rounded-md" />
                    </CardFooter>
                </Card>
            ))}
        </div>
    )
}

SkeletonPlaylists.propTypes = {
    items: PropTypes.number
}
