import {useEffect, useState} from "react";
import {useRouter} from "next/router";
import {supabase} from "@/lib/supabase";
import {isUserAdmin, isUserLoggedIn, genUserAvatar} from "@/lib/actions";
import SetTitle from "@/components/SetTitle";
import {
    Table, TableHeader, TableBody, TableRow, TableHead, TableCell
} from "@/components/ui/table";
import {Tabs, TabsList, TabsTrigger, TabsContent} from "@/components/ui/tabs";
import {Input} from "@/components/ui/input";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {
    ShieldCheck,
    Search as SearchIcon,
    User as UserIcon,
    Library as LibraryIcon,
    Trash2 as DeleteIcon,
    RefreshCcw as ResetIcon,
    Ban as BanIcon
} from "lucide-react";

// Funkcja skracająca URL do np. 28 znaków (10 z początku, ..., 12 z końca)
function truncateUrl(url, maxLength = 28) {
    if (!url) return "";
    if (url.length <= maxLength) return url;
    const start = url.slice(0, 10);
    const end = url.slice(-12);
    return `${start}...${end}`;
}

export default function AdminPanel() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [activeTab, setActiveTab] = useState("users");
    const [users, setUsers] = useState([]);
    const [songs, setSongs] = useState([]);
    const [avatars, setAvatars] = useState({});
    const [searchUser, setSearchUser] = useState("");
    const [searchSong, setSearchSong] = useState("");

    useEffect(() => {
        (async () => {
            if (!(await isUserLoggedIn()) || !(await isUserAdmin())) {
                router.replace("/404");
                return;
            }
            setIsAdmin(true);
            setIsLoading(false);
        })();
    }, [router]);

    useEffect(() => {
        if (!isAdmin) return;
        (async () => {
            const {data: u} = await supabase.from("users").select("id, username, ban_status, emoji, color");
            const {data: q} = await supabase.from("queue").select("id, title, author, url, user_id");
            setUsers(u || []);
            setSongs(q || []);
        })();
    }, [isAdmin]);

    useEffect(() => {
        if (!users.length) return;
        (async () => {
            const map = {};
            await Promise.all(users.map(async u => {
                try {
                    map[u.id] = await genUserAvatar(u);
                } catch {
                    map[u.id] = null;
                }
            }));
            setAvatars(map);
        })();
    }, [users]);

    if (isLoading || !isAdmin) return null;

    const filteredUsers = users.filter(u => u.username.toLowerCase().includes(searchUser.toLowerCase()));
    const filteredSongs = songs.filter(s =>
        s.title?.toLowerCase().includes(searchSong.toLowerCase()) ||
        s.author?.toLowerCase().includes(searchSong.toLowerCase()) ||
        s.url?.toLowerCase().includes(searchSong.toLowerCase())
    );
    const bansCount = users.filter(u => u.ban_status > 0).length;

    const resetUserVotes = async id => {
        await supabase.from("votes").delete().eq("user_id", id);
        alert("User votes reset");
    };
    const deleteUserSongs = async id => {
        await supabase.from("queue").delete().eq("user_id", id);
        setSongs(songs.filter(s => s.user_id !== id));
        alert("User songs deleted");
    };
    const banUser = async (id, days) => {
        await supabase.from("users").update({ban_status: +days}).eq("id", id);
        setUsers(users.map(u => u.id === id ? {...u, ban_status: +days} : u));
        alert(`Ban set to ${days} days`);
    };
    const resetSongVotes = async id => {
        await supabase.from("votes").delete().eq("song_id", id);
        alert("Song votes reset");
    };
    const deleteSong = async id => {
        await supabase.from("queue").delete().eq("id", id);
        setSongs(songs.filter(s => s.id !== id));
        alert("Song deleted");
    };
    const banAndDeleteSongUrl = async url => {
        await supabase.from("banned_url").insert([{url}]);
        await supabase.from("queue").delete().eq("url", url);
        setSongs(songs.filter(s => s.url !== url));
        alert("URL banned and songs deleted");
    };

    // Minimalistyczne białe ikony z efektem hover
    const iconBtnClass = "p-1 text-white hover:scale-110 hover:brightness-125 transition-all duration-150 focus:outline-none";

    return (
        <>
            <SetTitle>Admin Panel</SetTitle>

            {/* Górna sekcja panelu admina */}
            <div className="w-full max-w-4xl mx-auto px-2 sm:px-4 mt-6 sm:mt-8 mb-8 sm:mb-10">
                <div className="bg-card rounded-2xl shadow flex flex-col items-center p-4 sm:p-8 w-full">
                    <div
                        className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-muted flex items-center justify-center mb-3 sm:mb-4">
                        <ShieldCheck className="w-10 h-10 sm:w-14 sm:h-14 text-primary"/>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-foreground">Admin Panel</h1>
                    <div className="flex flex-wrap gap-4 sm:gap-8 mt-3 sm:mt-4 w-full justify-center">
                        <div className="text-center min-w-[80px]">
                            <div className="text-xl sm:text-2xl font-bold text-primary">{users.length}</div>
                            <div className="text-muted-foreground text-xs sm:text-sm">Users</div>
                        </div>
                        <div className="text-center min-w-[80px]">
                            <div className="text-xl sm:text-2xl font-bold text-primary">{songs.length}</div>
                            <div className="text-muted-foreground text-xs sm:text-sm">Songs</div>
                        </div>
                        <div className="text-center min-w-[80px]">
                            <div className="text-xl sm:text-2xl font-bold text-primary">{bansCount}</div>
                            <div className="text-muted-foreground text-xs sm:text-sm">Bans</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Taby */}
            <div className="w-full max-w-4xl mx-auto px-2 sm:px-4 pb-8">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList
                        className="w-full grid grid-cols-2 bg-card border-b border-border h-auto p-0 rounded-none">
                        <TabsTrigger
                            value="users"
                            className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-2 sm:py-3 px-1 sm:px-4 font-bold text-xs sm:text-sm md:text-base data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
                        >
                            <UserIcon className="w-4 h-4 sm:w-5 sm:h-5"/>
                            <span className="hidden sm:inline">Users</span>
                            <span className="sm:hidden">Users</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="songs"
                            className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-2 sm:py-3 px-1 sm:px-4 font-bold text-xs sm:text-sm md:text-base data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
                        >
                            <LibraryIcon className="w-4 h-4 sm:w-5 sm:h-5"/>
                            <span className="hidden sm:inline">Songs</span>
                            <span className="sm:hidden">Songs</span>
                        </TabsTrigger>
                    </TabsList>

                    {/* Users Tab */}
                    <TabsContent value="users" className="bg-card rounded-b-2xl p-3 sm:p-6 shadow">
                        <div className="flex flex-col md:flex-row items-center mb-4 gap-3 sm:gap-4">
                            <Input
                                placeholder="Search users..."
                                value={searchUser}
                                onChange={e => setSearchUser(e.target.value)}
                                className="flex-1"
                                icon={<SearchIcon className="w-5 h-5 text-muted-foreground"/>}
                            />
                        </div>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>User</TableHead>
                                        <TableHead className="text-center">Ban</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredUsers.map(u => (
                                        <TableRow key={u.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-2 sm:gap-3">
                                                    <Avatar className="w-7 h-7 sm:w-8 sm:h-8">
                                                        <AvatarImage src={avatars[u.id]} alt={u.username}/>
                                                        <AvatarFallback>{u.emoji || u.username?.[0]?.toUpperCase() || "U"}</AvatarFallback>
                                                    </Avatar>
                                                    <a
                                                        href={`/user/${u.id}`}
                                                        className="underline text-primary hover:text-primary/80 transition-colors font-medium break-all"
                                                        target="_blank" rel="noopener noreferrer"
                                                    >
                                                        {u.username}
                                                    </a>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {u.ban_status > 0 ? (
                                                    <span
                                                        className="text-destructive font-semibold">{u.ban_status} dni</span>
                                                ) : (
                                                    <span className="text-muted-foreground">Brak</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex gap-1 sm:gap-2 justify-end">
                                                    <button className={iconBtnClass}
                                                            onClick={() => resetUserVotes(u.id)}
                                                            title="Resetuj głosy">
                                                        <ResetIcon className="w-5 h-5"/>
                                                    </button>
                                                    <button className={iconBtnClass}
                                                            onClick={() => deleteUserSongs(u.id)}
                                                            title="Usuń utwory">
                                                        <DeleteIcon className="w-5 h-5"/>
                                                    </button>
                                                    <button className={iconBtnClass} onClick={() => banUser(u.id, 7)}
                                                            title="Banuj 7 dni">
                                                        <BanIcon className="w-5 h-5"/>
                                                    </button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </TabsContent>

                    {/* Songs Tab */}
                    <TabsContent value="songs" className="bg-card rounded-b-2xl p-3 sm:p-6 shadow">
                        <div className="flex flex-col md:flex-row items-center mb-4 gap-3 sm:gap-4">
                            <Input
                                placeholder="Search songs..."
                                value={searchSong}
                                onChange={e => setSearchSong(e.target.value)}
                                className="flex-1"
                                icon={<SearchIcon className="w-5 h-5 text-muted-foreground"/>}
                            />
                        </div>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Title</TableHead>
                                        <TableHead>Author</TableHead>
                                        <TableHead className="max-w-[120px] sm:max-w-xs">URL</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredSongs.map(s => (
                                        <TableRow key={s.id}>
                                            <TableCell
                                                className="min-w-[80px] max-w-[180px] truncate">{s.title}</TableCell>
                                            <TableCell
                                                className="min-w-[80px] max-w-[140px] truncate">{s.author}</TableCell>
                                            <TableCell className="max-w-[120px] sm:max-w-xs truncate">
                                                <a
                                                    href={s.url}
                                                    className="underline text-primary hover:text-primary/80 transition-colors"
                                                    target="_blank" rel="noopener noreferrer"
                                                    title={s.url}
                                                >
                                                    {truncateUrl(s.url)}
                                                </a>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex gap-1 sm:gap-2 justify-end">
                                                    <button className={iconBtnClass}
                                                            onClick={() => resetSongVotes(s.id)}
                                                            title="Resetuj głosy">
                                                        <ResetIcon className="w-5 h-5"/>
                                                    </button>
                                                    <button className={iconBtnClass} onClick={() => deleteSong(s.id)}
                                                            title="Usuń utwór">
                                                        <DeleteIcon className="w-5 h-5"/>
                                                    </button>
                                                    <button className={iconBtnClass}
                                                            onClick={() => banAndDeleteSongUrl(s.url)}
                                                            title="Banuj URL">
                                                        <BanIcon className="w-5 h-5"/>
                                                    </button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </>
    );
}