import {useEffect, useState} from "react";
import {useRouter} from "next/router";
import {supabase} from "@/utils/supabase";
import SetTitle from "@/components/SetTitle";
import Account from "@/components/User_Panel/Account";
import Followers from "@/components/User_Panel/Followers";
import Providers from "@/components/User_Panel/Providers";
import Playlists from "@/components/User_Panel/Playlists";
import {Box, Tabs, Tab, Container, Typography, Avatar, Divider} from "@mui/material";
import {
    PersonRounded as PersonIcon,
    PeopleRounded as PeopleIcon,
    LinkRounded as LinkIcon,
    QueueMusicRounded as PlaylistsIcon,
} from '@mui/icons-material';

import {genUserAvatar} from "@/utils/actions";

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
            const {data: {user}} = await supabase.auth.getUser();
            if (!user) {
                await router.replace("/login");
                return;
            }

            setUserId(user.id);

            const {data, error} = await supabase
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
                const {data, error} = await supabase
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
        const {count, error} = await supabase
            .from("users")
            .select("id", {count: "exact", head: true})
            .contains("followed_users", [userId]);
        if (!error) setFollowersCount(count || 0);
        else setFollowersCount(0);
    };

    const getFollowingCount = async () => {
        if (!userId) return;
        const {data, error} = await supabase
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

    const handleTabChange = (event, newValue) => setActiveTab(newValue);

    if (!isLoggedIn) return null;

    return (
        <>
            <SetTitle text={"User Panel"}/>
            <Container maxWidth="md" sx={{mt: 3, mb: 5}}>
                {/* Sekcja profilowa */}
                <Box
                    sx={{
                        maxWidth: 1200,
                        mx: "auto",
                        mt: 6,
                        mb: 4,
                        px: {xs: 1, md: 4},
                        py: {xs: 2, md: 5},
                        borderRadius: 4,
                        bgcolor: "background.paper", // theme kolor tła
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        boxShadow: 4,
                    }}
                >
                    <Avatar
                        sx={{
                            width: 92,
                            height: 92,
                            mb: 2,
                            boxShadow: 2,
                        }}
                        alt="Avatar"
                        src={avatarUrl}
                    />
                    <Typography variant="h4" sx={{
                        fontWeight: "bold",
                        color: "#fff",
                        mb: 2,
                        textAlign: "center"
                    }}>
                        {userProfile?.username || ''}
                    </Typography>

                    {/* Statystyki */}
                    <Box sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        width: "100%",
                        maxWidth: 480,
                        mt: 1,
                        mb: 2,
                    }}>
                        <Box sx={{flex: 1, textAlign: "center"}}>
                            <Typography variant="h5" sx={{fontWeight: 700, color: "#ffffff"}}>
                                {followingCount}
                            </Typography>
                            <Typography variant="body2" sx={{color: "#aaa", mt: 0.5, fontWeight: 500}}>
                                Following
                            </Typography>
                        </Box>
                        <Divider orientation="vertical" flexItem sx={{
                            mx: 0,
                            bgcolor: "#fff",
                            opacity: 0.11,
                            width: "2px",
                            height: 40,
                            borderRadius: 2,
                        }}/>
                        <Box sx={{flex: 1, textAlign: "center"}}>
                            <Typography variant="h5" sx={{fontWeight: 700, color: "#ffffff"}}>
                                {followersCount}
                            </Typography>
                            <Typography variant="body2" sx={{color: "#aaa", mt: 0.5, fontWeight: 500}}>
                                Followers
                            </Typography>
                        </Box>
                        <Divider orientation="vertical" flexItem sx={{
                            mx: 0,
                            bgcolor: "#fff",
                            opacity: 0.11,
                            width: "2px",
                            height: 40,
                            borderRadius: 2,
                        }}/>
                        <Box sx={{flex: 1, textAlign: "center"}}>
                            <Typography variant="h5" sx={{fontWeight: 700, color: "#ffffff"}}>
                                {joinedPlaylistsCount}
                            </Typography>
                            <Typography variant="body2" sx={{color: "#aaa", mt: 0.5, fontWeight: 500}}>
                                Playlists Joined
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                {/* Zakładki */}
                <Box sx={{
                    maxWidth: 900,
                    mx: "auto",
                    bgcolor: "background.paper", // theme kolor tła
                    borderRadius: 3,
                    boxShadow: 2,
                    overflow: "hidden"
                }}>
                    <Tabs
                        value={activeTab}
                        onChange={handleTabChange}
                        variant="fullWidth"
                        textColor="inherit"
                        TabIndicatorProps={{style: {background: "#8FE6D5", height: 3}}}
                        sx={{
                            "& .MuiTab-root": {
                                fontWeight: "bold",
                                fontSize: 16,
                                color: "#fff",
                                textTransform: "none",
                                py: 2,
                            },
                            "& .Mui-selected": {
                                color: "#8FE6D5 !important",
                            },
                            bgcolor: "#191c2a"
                        }}
                    >
                        <Tab icon={<PersonIcon/>} label="Account"/>
                        <Tab icon={<PeopleIcon/>} label="Friends"/>
                        <Tab icon={<LinkIcon/>} label="Providers"/>
                        <Tab icon={<PlaylistsIcon/>} label="Playlists"/>
                    </Tabs>

                    <Box sx={{p: 3, width: "100%"}}>
                        {activeTab === 0 && <Account/>}
                        {activeTab === 1 && (
                            <Followers
                                userId={userId}
                                onFollowAction={() => {
                                    getFollowersCount();
                                    getFollowingCount();
                                }}
                            />
                        )}
                        {activeTab === 2 && <Providers/>}
                        {activeTab === 3 && <Playlists/>}
                    </Box>
                </Box>
            </Container>
        </>
    );
}