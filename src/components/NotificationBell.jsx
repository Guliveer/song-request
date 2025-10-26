import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Typography } from "@/components/ui/typography";
import { Spinner } from "@/components/ui/spinner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Bell as NotificationsIcon, Mail as MarkEmailReadIcon, CheckCheck as DoneAllIcon, Music as MusicNoteIcon, UserPlus as PersonAddIcon } from "lucide-react";

export default function NotificationBell({ userId }) {
  const [notifications, setNotifications] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0); // 0: Friends, 1: Songs

  useEffect(() => {
    if (!userId) return;

    const fetchNotifications = async () => {
      setLoading(true);
      const { data, error } = await supabase.from("notifications").select("*").eq("user_id", userId).order("created_at", { ascending: false });
      if (!error) setNotifications(data || []);
      setLoading(false);
    };
    fetchNotifications();

    const channel = supabase
      .channel("notifications")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications" }, (payload) => {
        if (payload.new.user_id === userId) {
          setNotifications((prev) => [payload.new, ...prev]);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  // Open/Close menu
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => setAnchorEl(null);

  // Mark single notification as read
  const handleNotificationClick = async (notif) => {
    if (!notif.read) {
      await supabase.from("notifications").update({ read: true }).eq("id", notif.id);
      setNotifications((prev) => prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n)));
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    const unread = notifications.filter((n) => !n.read);
    if (unread.length > 0) {
      await supabase.from("notifications").update({ read: true }).eq("user_id", userId).eq("read", false);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Rozdziel powiadomienia wg typu
  const friendNotifications = notifications.filter((n) => n.type === "new_follower");
  const songNotifications = notifications.filter((n) => n.type === "song_like" || n.type === "song_comment");

  // Tabs logic
  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };

  // Wybór powiadomień do wyświetlenia
  const displayedNotifications = tab === 0 ? friendNotifications : songNotifications;

  return (
    <div>
      <Popover>
        <PopoverTrigger asChild>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <NotificationsIcon className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs">
                      {unreadCount}
                    </Badge>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Notifications</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </PopoverTrigger>
        <PopoverContent className="w-96 max-h-[500px] overflow-hidden p-0">
          <div className="flex items-center justify-between p-4 border-b">
            <Typography variant="h6">Notifications</Typography>
            <Button size="sm" variant="ghost" onClick={handleMarkAllAsRead} disabled={unreadCount === 0} className="h-8">
              <DoneAllIcon className="w-4 h-4 mr-1" />
              Mark all as read
            </Button>
          </div>

          <Tabs value={tab.toString()} onValueChange={(value) => setTab(parseInt(value))}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="0" className="flex items-center gap-2">
                <PersonAddIcon className="w-4 h-4" />
                Friends
              </TabsTrigger>
              <TabsTrigger value="1" className="flex items-center gap-2">
                <MusicNoteIcon className="w-4 h-4" />
                Songs
              </TabsTrigger>
            </TabsList>

            <div className="max-h-80 overflow-y-auto">
              {loading ? (
                <div className="flex justify-center p-4">
                  <Spinner className="w-6 h-6" />
                </div>
              ) : displayedNotifications.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">{tab === 0 ? "No friend notifications" : "No song notifications"}</div>
              ) : (
                displayedNotifications.map((notif) => (
                  <div key={notif.id} className={`flex items-start gap-3 p-4 cursor-pointer hover:bg-muted/50 border-b last:border-b-0 ${!notif.read ? "bg-muted/30" : ""}`} onClick={() => handleNotificationClick(notif)}>
                    <Avatar className="w-8 h-8">
                      <AvatarFallback>
                        <MarkEmailReadIcon className={`w-4 h-4 ${notif.read ? "text-muted-foreground" : "text-primary"}`} />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <Typography variant="sm" className="break-words whitespace-normal">
                        {notif.message}
                      </Typography>
                      <Typography variant="xs" className="text-muted-foreground mt-1">
                        {new Date(notif.created_at).toLocaleString()}
                      </Typography>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Tabs>
        </PopoverContent>
      </Popover>
    </div>
  );
}
