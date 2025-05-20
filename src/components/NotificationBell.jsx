import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";
import {
    IconButton,
    Badge,
    Menu,
    MenuItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
    Typography,
    Box,
    Tooltip,
    CircularProgress,
    Button,
    Stack,
    Tabs,
    Tab,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import PersonAddIcon from "@mui/icons-material/PersonAdd";

export default function NotificationBell({ userId }) {
    const [notifications, setNotifications] = useState([]);
    const [anchorEl, setAnchorEl] = useState(null);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState(0); // 0: Friends, 1: Songs

    useEffect(() => {
        if (!userId) return;

        const fetchNotifications = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from("notifications")
                .select("*")
                .eq("user_id", userId)
                .order("created_at", { ascending: false });
            if (!error) setNotifications(data || []);
            setLoading(false);
        };
        fetchNotifications();

        const channel = supabase
            .channel("notifications")
            .on(
                "postgres_changes",
                { event: "INSERT", schema: "public", table: "notifications" },
                (payload) => {
                    if (payload.new.user_id === userId) {
                        setNotifications((prev) => [payload.new, ...prev]);
                    }
                }
            )
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
            await supabase
                .from("notifications")
                .update({ read: true })
                .eq("id", notif.id);
            setNotifications((prev) =>
                prev.map((n) =>
                    n.id === notif.id ? { ...n, read: true } : n
                )
            );
        }
    };

    // Mark all as read
    const handleMarkAllAsRead = async () => {
        const unread = notifications.filter((n) => !n.read);
        if (unread.length > 0) {
            await supabase
                .from("notifications")
                .update({ read: true })
                .eq("user_id", userId)
                .eq("read", false);
            setNotifications((prev) =>
                prev.map((n) => ({ ...n, read: true }))
            );
        }
    };

    const unreadCount = notifications.filter((n) => !n.read).length;

    // Rozdziel powiadomienia wg typu
    const friendNotifications = notifications.filter(
        (n) => n.type === "new_follower"
    );
    const songNotifications = notifications.filter(
        (n) => n.type === "song_like" || n.type === "song_comment"
    );

    // Tabs logic
    const handleTabChange = (event, newValue) => {
        setTab(newValue);
    };

    // Wybór powiadomień do wyświetlenia
    const displayedNotifications =
        tab === 0 ? friendNotifications : songNotifications;

    return (
        <Box>
            <Tooltip title="Notifications">
                <IconButton color="inherit" onClick={handleMenuOpen}>
                    <Badge badgeContent={unreadCount} color="error">
                        <NotificationsIcon />
                    </Badge>
                </IconButton>
            </Tooltip>
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                PaperProps={{ sx: { width: 370, maxHeight: 500 } }}
            >
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 2, py: 1 }}>
                    <Typography variant="h6">Notifications</Typography>
                    <Button
                        size="small"
                        color="primary"
                        startIcon={<DoneAllIcon />}
                        onClick={handleMarkAllAsRead}
                        disabled={unreadCount === 0}
                    >
                        Mark all as read
                    </Button>
                </Stack>
                <Tabs
                    value={tab}
                    onChange={handleTabChange}
                    variant="fullWidth"
                    sx={{ borderBottom: 1, borderColor: "divider" }}
                >
                    <Tab icon={<PersonAddIcon />} label="Friends" />
                    <Tab icon={<MusicNoteIcon />} label="Songs" />
                </Tabs>
                {loading ? (
                    <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
                        <CircularProgress size={24} />
                    </Box>
                ) : displayedNotifications.length === 0 ? (
                    <MenuItem disabled>
                        <ListItemText primary={tab === 0 ? "No friend notifications" : "No song notifications"} />
                    </MenuItem>
                ) : (
                    displayedNotifications.map((notif) => (
                        <MenuItem
                            key={notif.id}
                            selected={!notif.read}
                            onClick={() => handleNotificationClick(notif)}
                            sx={{
                                alignItems: "flex-start",
                                whiteSpace: "normal"
                            }}
                        >
                            <ListItemAvatar>
                                <Avatar>
                                    <MarkEmailReadIcon color={notif.read ? "action" : "primary"} />
                                </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                                primary={notif.message}
                                primaryTypographyProps={{
                                    sx: {
                                        whiteSpace: "normal",
                                        wordBreak: "break-word",
                                        overflowWrap: "break-word"
                                    }
                                }}
                                secondary={new Date(notif.created_at).toLocaleString()}
                            />
                        </MenuItem>
                    ))
                )}
            </Menu>
        </Box>
    );
}
