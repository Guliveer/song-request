import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { banSong, getBannedSongs, getPlaylistData, removeSong, unbanSong } from "@/lib/actions";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "shadcn/table";
import { Button } from "shadcn/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "shadcn/select";
import { Separator } from "shadcn/separator";
import { Typography } from "shadcn/typography";
import { Spinner } from "shadcn/spinner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "shadcn/dialog";
import { Ban as BanIcon, Trash2 as DeleteIcon, Undo as UndoIcon } from "lucide-react";
import PropTypes from "prop-types";

export default function PlaylistSettings({playlistId}) {
    const [playlistData, setPlaylistData] = useState(null);
    const [queue, setQueue] = useState(null);
    const [sortCriteria, setSortCriteria] = useState("rank");
    const [sortOrder, setSortOrder] = useState("asc");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogAction, setDialogAction] = useState(null);
    const [selectedSongUrl, setSelectedSongUrl] = useState(null);
    const [bannedSongs, setBannedSongs] = useState([]);
    const [bannedDialogOpen, setBannedDialogOpen] = useState(false);

    const fetchPlaylistData = async () => {
        try {
            const data = await getPlaylistData(playlistId);
            if (data) {
                setPlaylistData(data);
            }
        } catch (error) {
            console.error("Error fetching playlist data:", error.message);
        }
    };

    const fetchQueue = async () => {
        try {
            const {
                data: queueData,
                error: queueError
            } = await supabase.from("queue").select("id, title, author, score, url, user_id, added_at, users(id, username)").eq("playlist", playlistId);

            if (queueError || !queueData) {
                console.error("Error fetching queue:", queueError?.message || "No data");
                setQueue([]);
                return;
            }

            const rankedQueue = queueData
                .sort((a, b) => {
                    if (b.score !== a.score) {
                        return b.score - a.score;
                    }
                    return new Date(a.added_at) - new Date(b.added_at);
                })
                .map((song, index) => ({
                    ...song,
                    rank: index + 1,
                }));

            const sortedQueue = rankedQueue.sort((a, b) => {
                let comparison = 0;

                if (sortCriteria === "rank") {
                    comparison = a.rank - b.rank;
                } else if (sortCriteria === "title") {
                    comparison = a.title.localeCompare(b.title);
                } else if (sortCriteria === "author") {
                    comparison = a.author.localeCompare(b.author);
                } else if (sortCriteria === "user_id") {
                    comparison = a.users?.username.localeCompare(b.users?.username || "");
                } else if (sortCriteria === "added_at") {
                    comparison = new Date(a.added_at) - new Date(b.added_at);
                }

                return sortOrder === "asc" ? comparison : -comparison;
            });

            setQueue(sortedQueue);
        } catch (error) {
            console.error("Error fetching queue:", error.message);
            setQueue([]);
        }
    };

    const fetchBannedSongs = async () => {
        try {
            const songs = await getBannedSongs(playlistId);
            setBannedSongs(songs);
        } catch (error) {
            console.error("Error fetching banned songs:", error.message);
        }
    };

    const handleDialogOpen = (action, songUrl = null) => {
        setDialogAction(action);
        setSelectedSongUrl(songUrl);
        setDialogOpen(true);
    };

    const handleDialogClose = () => {
        setDialogOpen(false);
        setDialogAction(null);
        setSelectedSongUrl(null);
    };

    const handleDialogConfirm = async () => {
        if (dialogAction === "ban") {
            await banSong(playlistId, selectedSongUrl);
        } else if (dialogAction === "delete") {
            await removeSong(selectedSongUrl);
        } else if (dialogAction === "clear") {
            await supabase.from("queue").delete().eq("playlist", playlistId);
        }
        fetchQueue();
        handleDialogClose();
    };

    const handleBannedDialogOpen = async () => {
        await fetchBannedSongs();
        setBannedDialogOpen(true);
    };

    const handleBannedDialogClose = () => {
        setBannedDialogOpen(false);
    };

    const handleUnbanSong = async (songUrl) => {
        try {
            await unbanSong(playlistId, songUrl);
            await fetchBannedSongs(); // Refresh the list after unbanning
        } catch (error) {
            console.error("Error unbanning song:", error.message);
        }
    };

    useEffect(() => {
        fetchPlaylistData();
        fetchQueue();
    }, [playlistId, sortCriteria, sortOrder]);

    if (!playlistData || !queue) {
        return (
            <div className="flex justify-center items-center">
                <Spinner/>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex flex-row items-center justify-between">
                <Typography variant="h5" className="text-white font-medium">
                    Queue Management
                </Typography>

                <Button variant="default" onClick={handleBannedDialogOpen}>
                    View Banned Songs
                </Button>
            </div>

            <Separator className="my-6"/>

            <div className="flex gap-4 items-center w-full justify-between">
                <div className="flex items-center gap-4">
                    <Typography variant="subtitle1">Sort By:</Typography>
                    <Select value={sortCriteria} onValueChange={setSortCriteria}>
                        <SelectTrigger className="w-32">
                            <SelectValue/>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="rank">Rank</SelectItem>
                            <SelectItem value="title">Title</SelectItem>
                            <SelectItem value="author">Author</SelectItem>
                            <SelectItem value="user_id">User</SelectItem>
                            <SelectItem value="added_at">Added Time</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={sortOrder} onValueChange={setSortOrder}>
                        <SelectTrigger className="w-32">
                            <SelectValue/>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="asc">Ascending</SelectItem>
                            <SelectItem value="desc">Descending</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <Button variant="destructive" onClick={() => handleDialogOpen("clear")}>
                    Clear Queue
                </Button>
            </div>

            <div className="max-h-[600px] overflow-auto mt-4">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Rank</TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead>Author</TableHead>
                            <TableHead>User</TableHead>
                            <TableHead>Score</TableHead>
                            <TableHead>Added Time</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {queue.map((song) => (
                            <TableRow key={song.id}>
                                <TableCell>{song.rank}</TableCell>
                                <TableCell>{song.title}</TableCell>
                                <TableCell>{song.author}</TableCell>
                                <TableCell>{song.users?.username || "Unknown"}</TableCell>
                                <TableCell>{song.score}</TableCell>
                                <TableCell>{new Date(song.added_at).toLocaleString()}</TableCell>
                                <TableCell>
                                    <div className="flex gap-2">
                                        <Button variant="ghost" size="sm"
                                                onClick={() => handleDialogOpen("delete", song.id)}
                                                className="text-orange-500 hover:text-orange-600">
                                            <DeleteIcon className="h-4 w-4"/>
                                        </Button>
                                        <Button variant="ghost" size="sm"
                                                onClick={() => handleDialogOpen("ban", song.url)}
                                                className="text-red-500 hover:text-red-600">
                                            <BanIcon className="h-4 w-4"/>
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Action</DialogTitle>
                        <DialogDescription>
                            {(() => {
                                switch (dialogAction) {
                                    case "delete":
                                        return "Are you sure you want to delete this song?";
                                    case "ban":
                                        return "Are you sure you want to ban this song?";
                                    case "clear":
                                        return "Are you sure you want to clear the entire queue?";
                                    default:
                                        return "Are you sure you want to proceed?";
                                }
                            })()}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button onClick={handleDialogClose} variant="outline">
                            Cancel
                        </Button>
                        <Button onClick={handleDialogConfirm} variant="destructive">
                            Confirm
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={bannedDialogOpen} onOpenChange={setBannedDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Banned Songs</DialogTitle>
                    </DialogHeader>
                    <div className="max-h-96 overflow-y-auto rounded-lg p-2">
                        {bannedSongs.map((song, index) => (
                            <div key={index} className="flex justify-between items-start p-3 border-b last:border-b-0">
                                <div className="flex-1">
                                    <div className="font-medium">{song.title}</div>
                                    <div className="text-sm text-gray-600">Author: {song.author}</div>
                                    <div className="mt-2">
                                        <Link href={song.url} target="_blank" rel="noopener noreferrer"
                                              className="text-blue-500 hover:text-blue-600 text-sm break-all">
                                            {song.url}
                                        </Link>
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => handleUnbanSong(song.url)}
                                        className="text-blue-500 hover:text-blue-600 ml-4">
                                    <UndoIcon className="h-4 w-4"/>
                                </Button>
                            </div>
                        ))}
                    </div>
                    <DialogFooter>
                        <Button onClick={handleBannedDialogClose} variant="outline">
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
PlaylistSettings.propTypes = {
    playlistId: PropTypes.number.isRequired,
};
