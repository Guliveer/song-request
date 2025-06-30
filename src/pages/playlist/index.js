"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import SetTitle from "@/components/SetTitle";
import Link from "next/link";
import {
    Card,
    CardContent,
    CardFooter,
} from "shadcn/card"
import { Button } from "shadcn/button"
import { Avatar } from "shadcn/avatar"
import { Alert, AlertDescription } from "shadcn/alert"
import { Globe, Users, Star, ListMusic } from "lucide-react"
import SkeletonPlaylists from "@/components/skeletons/SkeletonPlaylists"

export default function PlaylistsPage() {
    const [playlists, setPlaylists] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchPlaylists = async () => {
            try {
                setLoading(true)
                setError(null)

                const { data, error } = await supabase
                    .from("playlists")
                    .select("*, users(id, username)")
                    .eq("is_public", true)
                    .order("name", { ascending: true });

                if (error) {
                    throw error
                }

                // Add users count to each playlist (count playlist's id in users.playlists[] field)
                if (data) {
                    const playlistsWithUserCount = await Promise.all(data.map(async (playlist) => {
                        const { count } = await supabase
                            .from("users")
                            .select("id", { count: "exact" })
                            .contains("playlists", [playlist.id])
                        return {
                            ...playlist,
                            userCount: count || 0, // Default to 0 if count is null
                        }
                    }))
                    setPlaylists(playlistsWithUserCount)
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : "An error occurred while loading playlists")
            } finally {
                setLoading(false)
            }
        };

        fetchPlaylists();
    }, [])

    return (
        <>
            <SetTitle text="Public Playlists" />
            <div className="max-w-6xl mx-auto py-10 px-4">
                <div className="text-center mb-6">
                    <h1 className="text-3xl font-bold tracking-tight">Public Playlists</h1>
                    <p className="text-muted-foreground text-sm mt-2">
                        Discover the best playlists shared by our community
                    </p>
                    <div className="inline-flex items-center gap-2 mt-3 text-sm text-primary border border-primary rounded-full px-3 py-1">
                        <Globe className="w-4 h-4" />
                        Public playlists: {playlists.length}
                    </div>
                </div>

                {loading && (
                    <SkeletonPlaylists />
                )}

                {error && (
                    <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {!loading && playlists.length === 0 && (
                    <div className="text-center py-16 text-muted-foreground">
                        <ListMusic className="mx-auto w-16 h-16 mb-4" />
                        <h2 className="text-xl font-semibold">No Public Playlists</h2>
                        <p className="text-sm mt-1">No public playlists found in the database.</p>
                    </div>
                )}

                {!loading && playlists.length > 0 && (
                    <div className="flex flex-wrap gap-4 justify-center">
                        {playlists.map((playlist) => (
                            <Card key={playlist.id} className="hover:shadow-md transition-all">
                                <CardContent className="py-2 max-w-[300px]">
                                    <div className="flex items-center mb-4">
                                        <Avatar className="mr-3 bg-primary text-white flex align-center items-center justify-center">
                                            <ListMusic className="w-5 h-full" />
                                        </Avatar>
                                        <div className="min-w-0">
                                            <h3 className="text-base font-semibold truncate">{playlist.name}</h3>
                                            {playlist.description && (
                                                <p className="inline-flex text-sm text-muted-foreground truncate">
                                                    {playlist.description}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                                        <Star className="w-3.5 h-3.5" />
                                        <span className="font-medium">
                                            <Link href={`/user/${playlist.users.username}`}>@{playlist.users.username}</Link>
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <Users className="w-3.5 h-3.5" />
                                        <span>{playlist.userCount} members</span>
                                    </div>
                                </CardContent>

                                <CardFooter>
                                    <Link href={`/playlist/${playlist.url}`} className="w-full">
                                        <Button className="w-full" variant="outline">View Playlist</Button>
                                    </Link>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </>
    )
}
