import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/utils/supabase";
import SetTitle from "@/components/SetTitle";
import Account from "@/components/User_Panel/Account";
import Followers from "@/components/User_Panel/Followers";
import Providers from "@/components/User_Panel/Providers";
import { Box, Tabs, Tab, Container, Typography, Avatar, Divider } from "@mui/material";
import PersonIcon from '@mui/icons-material/Person';
import PeopleIcon from '@mui/icons-material/People';
import LinkIcon from '@mui/icons-material/Link';

export default function UserPanel() {
    const [isLoading, setIsLoading] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [activeTab, setActiveTab] = useState(0);
    const [userProfile, setUserProfile] = useState(null);
    const router = useRouter();

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                await router.replace("/login");
                return;
            }

            // Fetch user profile data
            const { data, error } = await supabase
                .from("users")
                .select("username, color, emoji, followed_users")
                .eq("id", user.id)
                .single();

            if (!error) {
                setUserProfile(data);
            }

            setIsLoggedIn(true);
            setIsLoading(false);
        };

        checkUser();
    }, [router]);

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    // Count followers
    const [followersCount, setFollowersCount] = useState(0);

    useEffect(() => {
        const getFollowersCount = async () => {
            if (!isLoggedIn) return;

            const { data: { user } } = await supabase.auth.getUser();
            const { data } = await supabase
                .from("users")
                .select("followed_users");

            const followers = data?.filter(u => u.followed_users?.includes(user.id)) || [];
            setFollowersCount(followers.length);
        };

        getFollowersCount();
    }, [isLoggedIn]);

    if (!isLoggedIn) return null;

    return (
        <>
            <SetTitle text={"User Panel"} />
            <Container maxWidth="md" sx={{ mt: 3, mb: 5 }}>
                <Box sx={{
                    bgcolor: '#1e1e1e',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.25)'
                }}>
                    {/* Profile Header */}
                    <Box sx={{
                        p: 4,
                        textAlign: 'center',
                        borderBottom: '1px solid #333'
                    }}>
                        {/* Improved Avatar with better emoji positioning */}
                        <Box
                            sx={{
                                position: 'relative',
                                width: 80,
                                height: 80,
                                mx: 'auto',
                                mb: 1,
                                borderRadius: '50%',
                                bgcolor: userProfile?.color || '#f44336',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            {userProfile?.emoji && (
                                <Typography
                                    component="span"
                                    sx={{
                                        fontSize: '2.5rem',
                                        lineHeight: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: '100%',
                                        height: '100%',
                                    }}
                                >
                                    {userProfile.emoji}
                                </Typography>
                            )}
                        </Box>

                        <Typography variant="h5" sx={{ color: 'white', mt: 1, fontWeight: 500 }}>
                            {userProfile?.username || ''}
                        </Typography>

                        <Box sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            mt: 2,
                            mb: 2
                        }}>
                            <Box sx={{
                                textAlign: 'center',
                                px: 3
                            }}>
                                <Typography variant="h6" sx={{ color: 'white' }}>
                                    {userProfile?.followed_users?.length || 0}
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#aaa' }}>
                                    Following
                                </Typography>
                            </Box>

                            {/* Divider line */}
                            <Divider orientation="vertical" sx={{ height: 40, my: 'auto', backgroundColor: '#333' }} />

                            <Box sx={{
                                textAlign: 'center',
                                px: 3
                            }}>
                                <Typography variant="h6" sx={{ color: 'white' }}>
                                    {followersCount}
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#aaa' }}>
                                    Followers
                                </Typography>
                            </Box>

                            {/* Divider line */}
                            <Divider orientation="vertical" sx={{ height: 40, my: 'auto', backgroundColor: '#333' }} />

                            <Box sx={{
                                textAlign: 'center',
                                px: 3
                            }}>
                                <Typography variant="h6" sx={{ color: 'white' }}>
                                    {1}
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#aaa' }}>
                                    Providers
                                </Typography>
                            </Box>
                        </Box>
                    </Box>

                    {/* Tabs */}
                    <Tabs
                        value={activeTab}
                        onChange={handleTabChange}
                        variant="fullWidth"
                        sx={{
                            borderBottom: '1px solid #333',
                            '& .MuiTab-root': {
                                color: '#aaa',
                                '&.Mui-selected': {
                                    color: '#8FE6D5'
                                }
                            },
                            '& .MuiTabs-indicator': {
                                backgroundColor: '#8FE6D5'
                            }
                        }}
                    >
                        <Tab icon={<PersonIcon />} label="Account" iconPosition="start" />
                        <Tab icon={<PeopleIcon />} label="Friends" iconPosition="start" />
                        <Tab icon={<LinkIcon />} label="Providers" iconPosition="start" />
                    </Tabs>

                    {/* Tab Content */}
                    <Box sx={{ p: 3 }}>
                        {activeTab === 0 && <Account />}
                        {activeTab === 1 && <Followers />}
                        {activeTab === 2 && <Providers />}
                    </Box>
                </Box>
            </Container>
        </>
    );
}