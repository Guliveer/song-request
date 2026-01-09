import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { genUserAvatar, isUserAdmin, isUserLoggedIn } from "@/lib/actions";
import { supabase } from "@/lib/supabase";
import { Container } from "shadcn/container";
import { Typography } from "shadcn/typography";
import { Avatar, AvatarFallback, AvatarImage } from "shadcn/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "shadcn/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "shadcn/table";
import { Button } from "shadcn/button";
import { Input } from "shadcn/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "shadcn/select";
import { Badge } from "shadcn/badge";
import { Separator } from "shadcn/separator";
import { Card, CardContent } from "shadcn/card";
import {
    Ban as BlockIcon,
    Music as LibraryMusicIcon,
    RotateCcw as RestoreIcon,
    Search as SearchIcon,
    ShieldCheck as AdminPanelSettingsIcon,
    Trash2 as DeleteIcon,
    User as PersonIcon
} from "lucide-react";

export default function AdminPanel() {
    const [isLoading, setIsLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [songs, setSongs] = useState([]);
    const [users, setUsers] = useState([]);
    const [activeTab, setActiveTab] = useState("0");
    const [searchSong, setSearchSong] = useState("");
    const [searchUser, setSearchUser] = useState("");
    const [avatars, setAvatars] = useState({});

    const router = useRouter();

    useEffect(() => {
        async function checkAdmin() {
            const checkLoggedIn = await isUserLoggedIn();
            if (!checkLoggedIn) return router.replace("/404");
            const checkAdmin = await isUserAdmin();
            if (!checkAdmin) return router.replace("/404");
            setIsAdmin(true);
            setIsLoading(false);
        }

        checkAdmin();
    }, [router]);

    useEffect(() => {
        async function fetchSongs() {
            const {
                data,
                error
            } = await supabase.from("queue").select("id, title, author, url, user_id").order("added_at", {ascending: false});
            if (!error) setSongs(data);
        }

        if (isAdmin) fetchSongs();
    }, [isAdmin]);

    useEffect(() => {
        async function fetchUsers() {
            const {data, error} = await supabase.from("users").select("id, username, ban_status, emoji, color");
            if (!error) setUsers(data);
        }

        if (isAdmin) fetchUsers();
    }, [isAdmin]);

    // Generate user avatars for the users list
    useEffect(() => {
        if (users.length === 0) return;
        let cancelled = false;

        async function generateAvatars() {
            const newAvatars = {};
            await Promise.all(
                users.map(async (user) => {
                    try {
                        // Use the avatar generator function for real user avatars
                        const avatarDataUrl = await genUserAvatar(user.id);
                        newAvatars[user.id] = avatarDataUrl;
                    } catch {
                        newAvatars[user.id] = null;
                    }
                })
            );
            if (!cancelled) setAvatars(newAvatars);
        }

        generateAvatars();
        return () => {
            cancelled = true;
        };
    }, [users]);

    // --- User actions ---
    const handleResetVotesForUser = async (userId) => {
        const {error} = await supabase.from("votes").delete().eq("user_id", userId);
        if (error) {
            alert(`Error resetting votes for user: ${error.message}`);
        } else {
            alert("User votes have been reset.");
        }
    };

    const handleDeleteUserSongs = async (userId) => {
        const {error} = await supabase.from("queue").delete().eq("user_id", userId);
        if (error) {
            alert(`Error deleting user songs: ${error.message}`);
        } else {
            alert("User songs have been deleted.");
            // Refresh songs:
            const {
                data,
                error: fetchError
            } = await supabase.from("queue").select("id, title, author, url, user_id").order("added_at", {ascending: false});
            if (!fetchError) setSongs(data);
        }
    };

    const handleBanChange = async (userId, days) => {
        const {error} = await supabase.from("users").update({ban_status: days}).eq("id", userId);
        if (error) {
            alert(`Error setting ban: ${error.message}`);
        } else {
            alert(`Ban set to ${days === 0 ? "none" : days + " days"}.`);
            // Refresh users:
            const {
                data,
                error: usersError
            } = await supabase.from("users").select("id, username, ban_status, emoji, color");
            if (!usersError) setUsers(data);
        }
    };

    // --- Song actions ---
    const handleDeleteSong = async (songId) => {
        const {error} = await supabase.from("queue").delete().eq("id", songId);
        if (error) {
            alert(`Error deleting song: ${error.message}`);
        } else {
            alert("Song has been deleted.");
            const {
                data,
                error: fetchError
            } = await supabase.from("queue").select("id, title, author, url, user_id").order("added_at", {ascending: false});
            if (!fetchError) setSongs(data);
        }
    };

    const handleResetVotesForSong = async (songId) => {
        const {error} = await supabase.from("votes").delete().eq("song_id", songId);
        if (error) {
            alert(`Error resetting votes for song: ${error.message}`);
        } else {
            alert("Song votes have been reset.");
        }
    };

    const handleBanAndDelete = async (targetUrl) => {
        const {error: insertError} = await supabase.from("banned_url").insert([{url: targetUrl}]);

        if (insertError) {
            console.log("Ban and delete error");
            return;
        }

        const {error: deleteError} = await supabase.from("queue").delete().eq("url", targetUrl);

        if (deleteError) {
            console.log("Ban and delete error");
        } else {
            router.reload();
        }
    };

    // --- Filters ---
    const filteredSongs = songs.filter((s) => s.title?.toLowerCase().includes(searchSong.toLowerCase()) || s.author?.toLowerCase().includes(searchSong.toLowerCase()) || s.url?.toLowerCase().includes(searchSong.toLowerCase()));
    const filteredUsers = users.filter((u) => u.username?.toLowerCase().includes(searchUser.toLowerCase()));

    // Ban count (users with ban_status > 0)
    const bansCount = users.filter((u) => u.ban_status && u.ban_status > 0).length;

    if (!isAdmin || isLoading) return null;

    return (
        <Container className="mt-6 mb-10">
            {/* Admin Profile & Stats Section */}
            <div
                className="max-w-6xl mx-auto mt-12 mb-8 px-2 md:px-8 py-4 md:py-10 rounded-2xl bg-card flex flex-col items-center shadow-lg">
                <Avatar className="w-24 h-24 mb-4 shadow-lg bg-red-500">
                    <AvatarFallback className="bg-red-500 text-white">
                        <AdminPanelSettingsIcon className="w-14 h-14"/>
                    </AvatarFallback>
                </Avatar>
                <Typography variant="h4" className="font-bold text-white mb-4 text-center">
                    Admin Panel
                </Typography>
                <div className="flex justify-center items-center w-full max-w-lg mt-2 mb-4">
                    {/* Stats */}
                    <div className="flex-1 text-center">
                        <Typography variant="h5" className="font-bold text-white">
                            {users.length}
                        </Typography>
                        <Typography className="text-gray-400 mt-1 text-sm">Users</Typography>
                    </div>
                    <Separator orientation="vertical" className="mx-0 bg-white/20 w-0.5 h-10 rounded-full"/>
                    <div className="flex-1 text-center">
                        <Typography variant="h5" className="font-bold text-white">
                            {songs.length}
                        </Typography>
                        <Typography className="text-gray-400 mt-1 text-sm">Songs</Typography>
                    </div>
                    <Separator orientation="vertical" className="mx-0 bg-white/20 w-0.5 h-10 rounded-full"/>
                    <div className="flex-1 text-center">
                        <Typography variant="h5" className="font-bold text-white">
                            {bansCount}
                        </Typography>
                        <Typography className="text-gray-400 mt-1 text-sm">Bans</Typography>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="max-w-4xl mx-auto bg-card rounded-xl overflow-hidden shadow-lg">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-2 h-auto p-1 bg-[#191c2a]">
                        <TabsTrigger value="0"
                                     className="flex items-center gap-2 py-3 font-bold text-base text-white data-[state=active]:text-[#8FE6D5] data-[state=active]:bg-transparent">
                            <PersonIcon className="w-4 h-4"/>
                            Users
                        </TabsTrigger>
                        <TabsTrigger value="1"
                                     className="flex items-center gap-2 py-3 font-bold text-base text-white data-[state=active]:text-[#8FE6D5] data-[state=active]:bg-transparent">
                            <LibraryMusicIcon className="w-4 h-4"/>
                            Songs
                        </TabsTrigger>
                    </TabsList>

                    <div className="p-6 w-full">
                        {/* Users Tab */}
                        <TabsContent value="0" className="space-y-4">
                            <div className="flex justify-between items-center">
                                <Typography variant="h6" className="font-bold text-red-500">
                                    User List
                                </Typography>
                                <div className="relative">
                                    <SearchIcon
                                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-red-500 w-4 h-4"/>
                                    <Input placeholder="Search user..." value={searchUser}
                                           onChange={(e) => setSearchUser(e.target.value)}
                                           className="pl-10 bg-[#23273a] border-gray-600 text-white placeholder:text-gray-400 focus:border-red-500"/>
                                </div>
                            </div>
                            <Card className="bg-[#23273a] border-0">
                                <CardContent className="p-0">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="border-gray-700 hover:bg-transparent">
                                                <TableHead className="font-bold text-red-500 pl-6">Name</TableHead>
                                                <TableHead className="font-bold text-red-500 pr-6">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredUsers.map((user) => (
                                                <TableRow key={user.id}
                                                          className="border-gray-700 hover:bg-gray-800/50">
                                                    <TableCell className="text-white pl-6">
                                                        <div className="flex items-center gap-2">
                                                            <Avatar className="w-8 h-8">
                                                                <AvatarImage src={avatars[user.id]}/>
                                                                <AvatarFallback className="font-bold text-sm"
                                                                                style={{backgroundColor: user.color || "#ff4646"}}>
                                                                    {user.emoji || user.username?.[0]?.toUpperCase() || "U"}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <Typography
                                                                className="font-bold">{user.username}</Typography>
                                                            {user.ban_status > 0 && (
                                                                <Badge variant="destructive" className="ml-2">
                                                                    {user.ban_status === 9999 ? "PermBan" : `Ban ${user.ban_status}d`}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-white pr-6">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <Button size="sm" variant="outline"
                                                                    onClick={() => handleResetVotesForUser(user.id)}
                                                                    className="bg-[#23273a] border-gray-600 text-[#8FE6D5] hover:bg-[#31364a]">
                                                                <RestoreIcon className="w-4 h-4"/>
                                                            </Button>
                                                            <Button size="sm" variant="destructive"
                                                                    onClick={() => handleDeleteUserSongs(user.id)}
                                                                    className="bg-red-500 hover:bg-red-600">
                                                                <DeleteIcon className="w-4 h-4"/>
                                                            </Button>
                                                            <Button size="sm" variant="outline"
                                                                    onClick={() => handleBanChange(user.id, 9999)}
                                                                    className="bg-[#23273a] border-gray-600 text-red-500 hover:bg-[#31364a]">
                                                                <BlockIcon className="w-4 h-4"/>
                                                            </Button>
                                                            <Select value={user.ban_status?.toString() || "0"}
                                                                    onValueChange={(value) => handleBanChange(user.id, parseInt(value))}>
                                                                <SelectTrigger
                                                                    className="w-32 bg-[#23273a] border-gray-600 text-white">
                                                                    <SelectValue placeholder="Ban period"/>
                                                                </SelectTrigger>
                                                                <SelectContent className="bg-[#23273a] border-gray-600">
                                                                    <SelectItem value="0" className="text-white">
                                                                        None
                                                                    </SelectItem>
                                                                    <SelectItem value="7" className="text-white">
                                                                        7 days
                                                                    </SelectItem>
                                                                    <SelectItem value="30" className="text-white">
                                                                        30 days
                                                                    </SelectItem>
                                                                    <SelectItem value="90" className="text-white">
                                                                        90 days
                                                                    </SelectItem>
                                                                    <SelectItem value="180" className="text-white">
                                                                        180 days
                                                                    </SelectItem>
                                                                    <SelectItem value="365" className="text-white">
                                                                        365 days
                                                                    </SelectItem>
                                                                    <SelectItem value="9999" className="text-white">
                                                                        Perm
                                                                    </SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Songs Tab */}
                        <TabsContent value="1" className="space-y-4">
                            <div className="flex justify-between items-center">
                                <Typography variant="h6" className="font-bold text-red-500">
                                    Song Queue
                                </Typography>
                                <div className="relative">
                                    <SearchIcon
                                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-red-500 w-4 h-4"/>
                                    <Input placeholder="Search song..." value={searchSong}
                                           onChange={(e) => setSearchSong(e.target.value)}
                                           className="pl-10 bg-[#23273a] border-gray-600 text-white placeholder:text-gray-400 focus:border-red-500"/>
                                </div>
                            </div>
                            <Card className="bg-[#23273a] border-0">
                                <CardContent className="p-0">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="border-gray-700 hover:bg-transparent">
                                                <TableHead className="font-bold text-red-500 pl-6">Title</TableHead>
                                                <TableHead className="font-bold text-red-500">Artist</TableHead>
                                                <TableHead className="font-bold text-red-500">URL</TableHead>
                                                <TableHead className="font-bold text-red-500 pr-6">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredSongs.map((song) => (
                                                <TableRow key={song.id}
                                                          className="border-gray-700 hover:bg-gray-800/50">
                                                    <TableCell
                                                        className="text-white font-bold pl-6">{song.title}</TableCell>
                                                    <TableCell className="text-white">{song.author}</TableCell>
                                                    <TableCell className="text-white">
                                                        <a href={song.url} target="_blank" rel="noopener noreferrer"
                                                           className="text-red-500 underline text-sm break-all hover:text-red-400">
                                                            {song.url}
                                                        </a>
                                                    </TableCell>
                                                    <TableCell className="text-white pr-6">
                                                        <div className="flex items-center gap-2">
                                                            <Button size="sm" variant="outline"
                                                                    onClick={() => handleResetVotesForSong(song.id)}
                                                                    className="bg-[#23273a] border-gray-600 text-[#8FE6D5] hover:bg-[#31364a]">
                                                                <RestoreIcon className="w-4 h-4"/>
                                                            </Button>
                                                            <Button size="sm" variant="destructive"
                                                                    onClick={() => handleDeleteSong(song.id)}
                                                                    className="bg-red-500 hover:bg-red-600">
                                                                <DeleteIcon className="w-4 h-4"/>
                                                            </Button>
                                                            <Button size="sm" variant="outline"
                                                                    onClick={() => handleBanAndDelete(song.url)}
                                                                    className="bg-[#23273a] border-gray-600 text-red-500 hover:bg-[#31364a]">
                                                                <BlockIcon className="w-4 h-4"/>
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </div>
                </Tabs>
            </div>
        </Container>
    );
}
