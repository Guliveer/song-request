import {useState, useEffect} from "react";
import {supabase} from "@/lib/supabase";
import {
    UserPlus,
    Search,
    Trash2,
    AlertCircle,
} from "lucide-react";

export default function Followers({userId, followingCount, followersCount, onFollowAction}) {
    const [friendUsername, setFriendUsername] = useState("");
    const [friendSearchResults, setFriendSearchResults] = useState([]);
    const [alreadyFollowing, setAlreadyFollowing] = useState(false);
    const [followedUsersData, setFollowedUsersData] = useState([]);
    const [followersData, setFollowersData] = useState([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogType, setDialogType] = useState(null);
    const [visibleFollowing, setVisibleFollowing] = useState(5);
    const [visibleFollowers, setVisibleFollowers] = useState(5);
    const [followingSearch, setFollowingSearch] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            if (!userId) return;
            const {data: currentUser} = await supabase
                .from("users")
                .select("followed_users")
                .eq("id", userId)
                .single();
            const followedIds = currentUser?.followed_users ?? [];
            let followedUsers = [];
            if (followedIds.length > 0) {
                const {data: users} = await supabase
                    .from("users")
                    .select("id, username")
                    .in("id", followedIds);
                followedUsers = users || [];
            }
            setFollowedUsersData(followedUsers);

            const {data: allUsers} = await supabase
                .from("users")
                .select("id, username, followed_users");
            const yourFollowers = (allUsers || []).filter(
                (u) => Array.isArray(u.followed_users) && u.followed_users.includes(userId)
            );
            setFollowersData(yourFollowers);
        };
        fetchData();
    }, [userId, dialogOpen]);

    useEffect(() => {
        if (dialogOpen && dialogType === "following") setVisibleFollowing(5);
        if (dialogOpen && dialogType === "followers") setVisibleFollowers(5);
    }, [dialogOpen, dialogType]);

    const handleAddFriend = async () => {
        if (!friendUsername.trim()) return;
        const {data: friendUser} = await supabase
            .from("users")
            .select("id, username")
            .eq("username", friendUsername)
            .single();
        if (!friendUser) return;
        const alreadyExists = followedUsersData.some((u) => u.id === friendUser.id);
        if (alreadyExists) {
            setAlreadyFollowing(true);
            return;
        }
        const {data: currentUser} = await supabase
            .from("users")
            .select("followed_users")
            .eq("id", userId)
            .single();
        const {data: currentUserData} = await supabase
            .from("users")
            .select("username")
            .eq("id", userId)
            .single();
        const currentFollows = currentUser?.followed_users ?? [];
        const updated = [...currentFollows, friendUser.id];
        const {error} = await supabase
            .from("users")
            .update({followed_users: updated})
            .eq("id", userId);
        if (!error) {
            await supabase.from("notifications").insert([
                {
                    user_id: friendUser.id,
                    sender_id: userId,
                    type: "new_follower",
                    message: `User ${currentUserData?.username || userId} started following you!`,
                    link: `/user/${userId}`,
                    read: false,
                },
            ]);
            setFriendUsername("");
            setFriendSearchResults([]);
            setAlreadyFollowing(false);
            setFollowedUsersData((prev) => [...prev, friendUser]);
            if (onFollowAction) onFollowAction();
        }
    };

    const handleSearchChange = async (e) => {
        const val = e.target.value;
        setFriendUsername(val);
        setAlreadyFollowing(false);
        if (val.length < 3) {
            setFriendSearchResults([]);
            return;
        }
        const {data: results} = await supabase
            .from("users")
            .select("id, username")
            .ilike("username", `%${val}%`)
            .neq("id", userId);
        setFriendSearchResults(results);
    };

    const handleOpenDialog = (type) => {
        setDialogType(type);
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setDialogType(null);
    };

    const handleUnfollow = async (idToRemove) => {
        const updated = followedUsersData.filter((u) => u.id !== idToRemove).map((u) => u.id);
        const {error} = await supabase
            .from("users")
            .update({followed_users: updated})
            .eq("id", userId);
        if (!error) {
            setFollowedUsersData((prev) => prev.filter((u) => u.id !== idToRemove));
            if (onFollowAction) onFollowAction();
        }
    };

    return (
        <>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Find Friends</h2>
            <div className="border-b border-border my-4"/>

            <div className="mb-6">
                <div className="mb-2 text-foreground">Search for users to follow:</div>
                <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
                    <div className="relative flex-1">
                        <input
                            type="text"
                            className="w-full rounded-lg border border-border bg-background px-4 py-2 pr-10 text-foreground focus:outline-none focus:border-primary transition-colors"
                            placeholder="Enter username"
                            value={friendUsername}
                            onChange={handleSearchChange}
                            autoComplete="off"
                        />
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground"/>
                        {friendSearchResults.length > 0 && (
                            <div
                                className="absolute left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow z-10 max-h-40 overflow-y-auto">
                                {friendSearchResults.map((user) => (
                                    <div
                                        key={user.id}
                                        className="px-4 py-2 hover:bg-muted cursor-pointer text-foreground"
                                        onClick={() => setFriendUsername(user.username)}
                                    >
                                        {user.username}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <button
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
                        onClick={handleAddFriend}
                    >
                        <UserPlus className="w-5 h-5"/>
                        Follow
                    </button>
                </div>
                {alreadyFollowing && (
                    <div className="flex items-center gap-2 text-destructive mt-2 text-sm">
                        <AlertCircle className="w-4 h-4"/>
                        You are already following this user.
                    </div>
                )}
            </div>

            <div className="mt-4">
                <h3 className="text-lg font-semibold text-foreground mb-2">Your Network</h3>
                <div className="flex gap-3 flex-col sm:flex-row">
                    <div
                        className="flex-1 p-4 rounded-xl bg-muted text-foreground text-center border border-border cursor-pointer hover:border-primary transition-colors"
                        onClick={() => handleOpenDialog("following")}
                    >
                        <div className="text-3xl font-bold text-primary mb-1">{followingCount}</div>
                        <div className="font-semibold text-primary">Following</div>
                    </div>
                    <div
                        className="flex-1 p-4 rounded-xl bg-muted text-foreground text-center border border-border cursor-pointer hover:border-primary transition-colors"
                        onClick={() => handleOpenDialog("followers")}
                    >
                        <div className="text-3xl font-bold text-primary mb-1">{followersCount}</div>
                        <div className="font-semibold text-primary">Followers</div>
                    </div>
                </div>
            </div>

            {/* Dialog */}
            {dialogOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
                    <div className="bg-card text-foreground rounded-2xl shadow-lg max-w-xs w-full p-0">
                        <div className="px-6 py-4 border-b border-border text-lg font-semibold">
                            {dialogType === "following" ? "People You Follow" : "Your Followers"}
                        </div>
                        <div className="p-0 max-h-80 overflow-y-auto">
                            {dialogType === "following" && (
                                followedUsersData.length === 0 ? (
                                    <div className="p-6 text-muted-foreground text-center">
                                        You are not following any users.
                                    </div>
                                ) : (
                                    <>
                                        <div className="p-4">
                                            <input
                                                type="text"
                                                className="w-full rounded-md border border-border bg-background px-3 py-2 text-foreground focus:outline-none focus:border-primary transition-colors"
                                                placeholder="Search following..."
                                                value={followingSearch}
                                                onChange={e => setFollowingSearch(e.target.value)}
                                            />
                                        </div>
                                        <ul>
                                            {followedUsersData
                                                .filter(u => u.username.toLowerCase().includes(followingSearch.toLowerCase()))
                                                .slice(0, visibleFollowing)
                                                .map((user) => (
                                                    <li key={user.id}
                                                        className="flex items-center justify-between px-6 py-2 border-b border-border last:border-b-0">
                                                        <span className="font-medium">{user.username}</span>
                                                        <button
                                                            className="p-1 rounded-full text-destructive hover:bg-destructive/10 transition-colors"
                                                            onClick={() => handleUnfollow(user.id)}
                                                            title="Unfollow"
                                                        >
                                                            <Trash2 className="w-4 h-4"/>
                                                        </button>
                                                    </li>
                                                ))}
                                        </ul>
                                        {visibleFollowing < followedUsersData.filter(u => u.username.toLowerCase().includes(followingSearch.toLowerCase())).length && (
                                            <button
                                                className="block mx-auto my-3 px-4 py-1 rounded-md border border-primary text-primary hover:bg-primary/10 transition-colors"
                                                onClick={() => setVisibleFollowing((prev) => prev + 5)}
                                            >
                                                Show more
                                            </button>
                                        )}
                                    </>
                                )
                            )}
                            {dialogType === "followers" && (
                                followersData.length === 0 ? (
                                    <div className="p-6 text-muted-foreground text-center">
                                        No one is following you yet.
                                    </div>
                                ) : (
                                    <>
                                        <ul>
                                            {followersData.slice(0, visibleFollowers).map((follower) => (
                                                <li key={follower.id}
                                                    className="px-6 py-2 border-b border-border last:border-b-0">
                                                    <span className="font-medium">{follower.username}</span>
                                                </li>
                                            ))}
                                        </ul>
                                        {visibleFollowers < followersData.length && (
                                            <button
                                                className="block mx-auto my-3 px-4 py-1 rounded-md border border-primary text-primary hover:bg-primary/10 transition-colors"
                                                onClick={() => setVisibleFollowers((prev) => prev + 5)}
                                            >
                                                Show more
                                            </button>
                                        )}
                                    </>
                                )
                            )}
                        </div>
                        <div className="flex justify-end gap-2 px-6 py-3 border-t border-border">
                            <button
                                onClick={handleCloseDialog}
                                className="px-4 py-2 rounded-md text-primary hover:bg-primary/10 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}