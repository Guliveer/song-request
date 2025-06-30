import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/lib/supabase";
import SetTitle from "@/components/SetTitle";
import Account from "@/components/User_Panel/Account";
import Followers from "@/components/User_Panel/Followers";
import Providers from "@/components/User_Panel/Providers";
import Playlists from "@/components/User_Panel/Playlists";

// shadcn/ui
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

// Lucide Icons
import { User as PersonIcon, Users as PeopleIcon, Link as LinkIcon, Music as PlaylistsIcon } from "lucide-react";

import { genUserAvatar } from "@/lib/actions";

export default function UserPanel() {
    const [isLoading, setIsLoading] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [activeTab, setActiveTab] = useState(0);
    const [userProfile, setUserProfile] = useState(null);
    const [followersCount, setFollowersCount] = useState(0);
    const [followingCount, setFollowingCount] = useState(0);
    const [joinedPlaylistsCount, setJoinedPlaylistsCount] = useState(0);
    const router = useRouter();
    const [userId, setUserId] = useState(null);
    const [avatarUrl, setAvatarUrl] = useState(null);

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                await router.replace("/login");
                return;
            }

            setUserId(user.id);

            const { data, error } = await supabase
                .from("users")
                .select("username, color, emoji")
                .eq("id", user.id)
                .single();

            if (!error) setUserProfile(data);

            const url = await genUserAvatar(user.id);

            setAvatarUrl(url);
            setIsLoggedIn(true);
            setIsLoading(false);
        };
        checkUser();
    }, [router]);

    useEffect(() => {
        const fetchData = async () => {
            if (userId) {
                await getFollowersCount();
                await getFollowingCount();
                const { data, error } = await supabase
                    .from("users")
                    .select("playlists")
                    .eq("id", userId)
                    .single();

                // 'playlists' is an array of playlist IDs
                if (!error && data && Array.isArray(data.playlists)) {
                    setJoinedPlaylistsCount(data.playlists.length);
                }
            }
        }
        fetchData();
    }, [userId, activeTab]);

    const getFollowersCount = async () => {
        if (!userId) return;
        const { count, error } = await supabase
            .from("users")
            .select("id", { count: "exact", head: true })
            .contains("followed_users", [userId]);
        if (!error) setFollowersCount(count || 0);
        else setFollowersCount(0);
    };

    const getFollowingCount = async () => {
        if (!userId) return;
        const { data, error } = await supabase
            .from("users")
            .select("followed_users")
            .eq("id", userId)
            .single();

        if (!error && data) {
            setFollowingCount(Array.isArray(data.followed_users) ? data.followed_users.length : 0);
        } else {
            setFollowingCount(0);
        }
    };

    const handleTabChange = (newValue) => setActiveTab(newValue);

    if (!isLoggedIn) return null;

    return (
        <>
            <SetTitle text={`User Panel`} />

            {/* Container z 8px grid margins - Mobile first */}
            <div className="w-full px-4 py-6 sm:px-6 md:px-8 lg:px-12 xl:px-16">

                {/* Sekcja profilowa - 8px grid system */}
                <div className="w-full max-w-sm mx-auto mb-8 sm:max-w-md md:max-w-2xl lg:max-w-4xl">
                    <div className="bg-card rounded-2xl p-6 sm:p-8 md:p-12 lg:p-16 shadow-sm flex flex-col items-center">

                        {/* Avatar - 8px multiples */}
                        <Avatar className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mb-4 sm:mb-6 shadow-md">
                            <AvatarImage src={avatarUrl} alt="Avatar" />
                            <AvatarFallback className="text-lg sm:text-xl md:text-2xl font-bold bg-primary text-primary-foreground">
                                {userProfile?.emoji || userProfile?.username?.[0]?.toUpperCase() || "U"}
                            </AvatarFallback>
                        </Avatar>

                        {/* Username - responsive typography */}
                        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6 md:mb-8 text-center text-foreground">
                            {userProfile?.username || ""}
                        </h1>

                        {/* Statystyki - 8px grid spacing */}
                        <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg">
                            <div className="flex items-center justify-between">

                                {/* Following */}
                                <div className="flex-1 text-center">
                                    <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-foreground">
                                        {followingCount}
                                    </div>
                                    <div className="text-xs sm:text-sm md:text-base font-medium text-muted-foreground mt-1">
                                        Following
                                    </div>
                                </div>

                                {/* Separator */}
                                <Separator
                                    orientation="vertical"
                                    className="mx-2 sm:mx-3 md:mx-4 h-8 sm:h-10 md:h-12"
                                />

                                {/* Followers */}
                                <div className="flex-1 text-center">
                                    <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-foreground">
                                        {followersCount}
                                    </div>
                                    <div className="text-xs sm:text-sm md:text-base font-medium text-muted-foreground mt-1">
                                        Followers
                                    </div>
                                </div>

                                {/* Separator */}
                                <Separator
                                    orientation="vertical"
                                    className="mx-2 sm:mx-3 md:mx-4 h-8 sm:h-10 md:h-12"
                                />

                                {/* Playlists */}
                                <div className="flex-1 text-center">
                                    <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-foreground">
                                        {joinedPlaylistsCount}
                                    </div>
                                    <div className="text-xs sm:text-sm md:text-base font-medium text-muted-foreground mt-1">
                                        Playlists Joined
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Zakładki - 8px grid spacing, responsive */}
                <div className="w-full max-w-sm mx-auto sm:max-w-md md:max-w-2xl lg:max-w-4xl">
                    <div className="bg-card rounded-2xl overflow-hidden shadow-sm">
                        <Tabs value={activeTab.toString()} onValueChange={(value) => handleTabChange(parseInt(value))}>

                            {/* Responsive tab list */}
                            <TabsList className="w-full grid grid-cols-2 sm:grid-cols-4 bg-card border-b border-border h-auto p-0">
                                <TabsTrigger
                                    value="0"
                                    className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-3 sm:py-4 px-2 sm:px-4 font-bold text-xs sm:text-sm md:text-base data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
                                >
                                    <PersonIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                                    <span className="hidden sm:inline">Account</span>
                                    <span className="sm:hidden">Account</span>
                                </TabsTrigger>

                                <TabsTrigger
                                    value="1"
                                    className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-3 sm:py-4 px-2 sm:px-4 font-bold text-xs sm:text-sm md:text-base data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
                                >
                                    <PeopleIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                                    <span className="hidden sm:inline">Friends</span>
                                    <span className="sm:hidden">Friends</span>
                                </TabsTrigger>

                                <TabsTrigger
                                    value="2"
                                    className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-3 sm:py-4 px-2 sm:px-4 font-bold text-xs sm:text-sm md:text-base data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
                                >
                                    <LinkIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                                    <span className="hidden sm:inline">Providers</span>
                                    <span className="sm:hidden">Providers</span>
                                </TabsTrigger>

                                <TabsTrigger
                                    value="3"
                                    className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-3 sm:py-4 px-2 sm:px-4 font-bold text-xs sm:text-sm md:text-base data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
                                >
                                    <PlaylistsIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                                    <span className="hidden sm:inline">Playlists</span>
                                    <span className="sm:hidden">Playlists</span>
                                </TabsTrigger>
                            </TabsList>

                            {/* Tab content - 8px grid padding */}
                            <div className="p-4 sm:p-6 md:p-8 lg:p-12 w-full">
                                <TabsContent value="0" className="m-0">
                                    <Account />
                                </TabsContent>
                                <TabsContent value="1" className="m-0">
                                    <Followers
                                        userId={userId}
                                        onFollowAction={() => {
                                            getFollowersCount();
                                            getFollowingCount();
                                        }}
                                    />
                                </TabsContent>
                                <TabsContent value="2" className="m-0">
                                    <Providers />
                                </TabsContent>
                                <TabsContent value="3" className="m-0">
                                    <Playlists />
                                </TabsContent>
                            </div>
                        </Tabs>
                    </div>
                </div>
            </div>
        </>
    );
}
