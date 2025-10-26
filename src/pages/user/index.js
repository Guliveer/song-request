import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/lib/supabase";
import SetTitle from "@/components/SetTitle";
import Account from "@/components/User_Panel/Account";
import Followers from "@/components/User_Panel/Followers";
import Providers from "@/components/User_Panel/Providers";
import Playlists from "@/components/User_Panel/Playlists";
import { Container } from "@/components/ui/container";
import { Typography } from "@/components/ui/typography";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
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
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        await router.replace("/login");
        return;
      }

      setUserId(user.id);

      const { data, error } = await supabase.from("users").select("username, color, emoji").eq("id", user.id).single();

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
        const { data, error } = await supabase.from("users").select("playlists").eq("id", userId).single();

        // 'playlists' is an array of playlist IDs
        if (!error && data && Array.isArray(data.playlists)) {
          setJoinedPlaylistsCount(data.playlists.length);
        }
      }
    };
    fetchData();
  }, [userId, activeTab]);

  const getFollowersCount = async () => {
    if (!userId) return;
    const { count, error } = await supabase.from("users").select("id", { count: "exact", head: true }).contains("followed_users", [userId]);
    if (!error) setFollowersCount(count || 0);
    else setFollowersCount(0);
  };

  const getFollowingCount = async () => {
    if (!userId) return;
    const { data, error } = await supabase.from("users").select("followed_users").eq("id", userId).single();

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
      <SetTitle text={`User Panel`} />
      <Container className="mt-6 mb-10">
        {/* Sekcja profilowa */}
        <div className="max-w-6xl mx-auto mt-12 mb-8 px-2 md:px-8 py-4 md:py-10 rounded-xl bg-card flex flex-col items-center">
          <Avatar className="w-24 h-24 mb-4 shadow-lg">
            <AvatarImage src={avatarUrl} alt="Avatar" />
            <AvatarFallback className="text-2xl font-bold">{userProfile?.username?.[0]?.toUpperCase() || "U"}</AvatarFallback>
          </Avatar>
          <Typography variant="h4" className="font-bold mb-4 text-center">
            {userProfile?.username || ""}
          </Typography>

          {/* Statystyki */}
          <div className="flex justify-center items-center w-full max-w-lg mt-2 mb-4">
            <div className="flex-1 text-center">
              <Typography variant="h5" className="font-bold">
                {followingCount}
              </Typography>
              <Typography className="mt-1 font-medium text-sm">Following</Typography>
            </div>
            <Separator orientation="vertical" className="mx-0 w-0.5 h-10 rounded-full" />
            <div className="flex-1 text-center">
              <Typography variant="h5" className="font-bold">
                {followersCount}
              </Typography>
              <Typography className="mt-1 font-medium text-sm">Followers</Typography>
            </div>
            <Separator orientation="vertical" className="mx-0 w-0.5 h-10 rounded-full" />
            <div className="flex-1 text-center">
              <Typography variant="h5" className="font-bold">
                {joinedPlaylistsCount}
              </Typography>
              <Typography className="mt-1 font-medium text-sm">Playlists Joined</Typography>
            </div>
          </div>
        </div>

        {/* Zakładki */}
        <div className="max-w-4xl mx-auto bg-card rounded-xl overflow-hidden">
          <Tabs value={activeTab.toString()} onValueChange={(value) => setActiveTab(parseInt(value))}>
            <TabsList className="grid w-full grid-cols-4 h-auto p-1 bg-muted/50">
              <TabsTrigger value="0" className="flex items-center gap-2 py-3 font-bold text-base">
                <PersonIcon className="w-4 h-4" />
                Account
              </TabsTrigger>
              <TabsTrigger value="1" className="flex items-center gap-2 py-3 font-bold text-base">
                <PeopleIcon className="w-4 h-4" />
                Friends
              </TabsTrigger>
              <TabsTrigger value="2" className="flex items-center gap-2 py-3 font-bold text-base">
                <LinkIcon className="w-4 h-4" />
                Providers
              </TabsTrigger>
              <TabsTrigger value="3" className="flex items-center gap-2 py-3 font-bold text-base">
                <PlaylistsIcon className="w-4 h-4" />
                Playlists
              </TabsTrigger>
            </TabsList>

            <div className="p-6 w-full">
              <TabsContent value="0">
                <Account />
              </TabsContent>
              <TabsContent value="1">
                <Followers
                  userId={userId}
                  onFollowAction={() => {
                    getFollowersCount();
                    getFollowingCount();
                  }}
                />
              </TabsContent>
              <TabsContent value="2">
                <Providers />
              </TabsContent>
              <TabsContent value="3">
                <Playlists />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </Container>
    </>
  );
}
