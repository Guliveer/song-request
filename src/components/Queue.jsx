'use server';
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { sortSongs } from '@/lib/actions';
import SongCard from '@/components/SongCard';
import SkeletonQueue from '@/components/skeletons/SkeletonQueue';
import SearchField from '@/components/SearchField';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationPrevious,
    PaginationNext,
    PaginationLink,
    PaginationEllipsis,
} from "shadcn/pagination"

export default function Queue({playlist}) {
    const [songs, setSongs] = useState([])
    const [sortCriteria, setSortCriteria] = useState("score")
    const [sortOrder, setSortOrder] = useState("desc")
    const [page, setPage] = useState(1)
    const [loading, setLoading] = useState(true);
    const pageSize = 12
    const [totalPages, setTotalPages] = useState(1)
    const [searchQuery, setSearchQuery] = useState("")
    const [searchFilter, setSearchFilter] = useState("title")
    const [currentlyPreviewingSongId, setCurrentlyPreviewingSongId] = useState(null)

    const handleSearchChange = useCallback((query, filter) => {
        setSearchQuery(query)
        setSearchFilter(filter)
        setPage(1)
    }, [])

    const handleSortOrderChange = useCallback((criteria) => {
        const [field, order] = criteria.split(",");
        setSortCriteria(field);
        setSortOrder(order);
    }, []);

    useEffect(() => {
        async function fetchQueue() {
            setLoading(true)

            try {
                let queryBuilder = supabase
                    .from("queue")
                    .select("*")
                    .eq("playlist", playlist)

                if (searchQuery.trim() !== "") {
                    if (searchFilter === "title") {
                        queryBuilder = queryBuilder.ilike("title", `%${searchQuery}%`)
                    } else if (searchFilter === "author") {
                        queryBuilder = queryBuilder.ilike("author", `%${searchQuery}%`)
                    } else if (searchFilter === "user") {
                        const { data: users, error: userError } = await supabase
                            .from("users")
                            .select("id")
                            .ilike("username", `%${searchQuery}%`)

                        if (userError) throw userError
                        if (users.length === 0) {
                            setSongs([])
                            setTotalPages(1)
                            return
                        }

                        const userIds = users.map((u) => u.id)
                        queryBuilder = queryBuilder.in("user_id", userIds)
                    }
                }

                const { data, error } = await queryBuilder

                if (error) throw error

                const sorted = sortSongs(data, sortCriteria, sortOrder)
                setSongs(sorted)
                setTotalPages(Math.max(1, Math.ceil(sorted.length / pageSize)))
            } catch (err) {
                console.error("Error fetching queue:", err.message)
            } finally {
                setLoading(false)
            }
        }

        fetchQueue()
    }, [playlist, page, searchQuery, searchFilter, sortCriteria, sortOrder])

    return (
        <div className="flex flex-col items-center gap-6 w-full px-4 py-6 min-w-[100px]">
            {/* Search + Sort Bar */}
            <div className="w-full max-w-[1100px] flex items-center justify-center p-4 rounded-2xl shadow-md">
                <SearchField
                    onSearchChange={handleSearchChange}
                    onSortOrderChange={handleSortOrderChange}
                />
            </div>

            {/* Songs list */}
            {!loading ? (
                <div className="w-full flex flex-wrap justify-center gap-6">
                    {(songs.length === 0 && !loading) ? (
                        <p className="text-muted-foreground text-center w-full">Playlist is empty</p>
                    ) : (
                        songs.slice((page - 1) * pageSize, page * pageSize).map((song) => (
                            <SongCard
                                key={song.id}
                                id={song.id}
                                currentlyPreviewingSongId={currentlyPreviewingSongId}
                                setCurrentlyPreviewingSongId={setCurrentlyPreviewingSongId}
                            />
                        ))
                    )}
                </div>
            ) : (
                <SkeletonQueue />
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <Pagination className="mt-6">
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious
                                onClick={() => setPage(Math.max(1, page - 1))}
                                className={page === 1 ? "pointer-events-none opacity-50" : ""}
                            />
                        </PaginationItem>

                        {Array.from({ length: totalPages }).map((_, i) => {
                            const p = i + 1;
                            const show =
                                totalPages <= 7 ||
                                p === 1 ||
                                p === totalPages ||
                                (p >= page - 1 && p <= page + 1);

                            if (!show && (p === 2 || p === totalPages - 1)) {
                                return (
                                    <PaginationItem key={`ellipsis-${p}`}>
                                        <PaginationEllipsis />
                                    </PaginationItem>
                                );
                            }

                            if (!show) return null;

                            return (
                                <PaginationItem key={p}>
                                    <PaginationLink isActive={p === page} onClick={() => setPage(p)}>
                                        {p}
                                    </PaginationLink>
                                </PaginationItem>
                            );
                        })}

                        <PaginationItem>
                            <PaginationNext
                                onClick={() => setPage(Math.min(totalPages, page + 1))}
                                className={page === totalPages ? "pointer-events-none opacity-50" : ""}
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            )}
        </div>
    );
}