import { useEffect, useState } from "react";
import Link from "next/link";
import { getPlaylistData, getCurrentUser, getJoinedPlaylists, leavePlaylist } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreVertical as MenuVertButtonIcon, LogOut as LeavePlaylistIcon, Settings as ManageIcon, Info as PlaylistInfoIcon } from "lucide-react";

export default function PlaylistMenu({ playlistId }) {
  const [playlistData, setPlaylistData] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [hasJoined, setHasJoined] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [isModerator, setIsModerator] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const user = await getCurrentUser();
      setCurrentUser(user);

      const playlist = await getPlaylistData(playlistId);
      setPlaylistData(playlist);

      if (user && playlist) {
        const joined = await getJoinedPlaylists(user.id);
        const has = joined.includes(playlist.id);
        setHasJoined(has);

        setIsHost(user.id === playlist.host);
        setIsModerator(playlist.moderators?.includes(user.id));
      }

      setLoading(false);
    };
    fetchData();
  }, [playlistId]);

  const handleConfirmLeave = () => {
    setConfirmDialogOpen(true);
  };

  const handleCancelLeave = () => setConfirmDialogOpen(false);

  const handleLeavePlaylist = async () => {
    if (!currentUser || !playlistData) return;
    try {
      await leavePlaylist(playlistData.id, currentUser.id);
      setHasJoined(false);
      window.location.reload();
    } catch (err) {
      console.error("Unexpected error:", err.message);
    } finally {
      setConfirmDialogOpen(false);
    }
  };

  if (loading || !playlistData) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MenuVertButtonIcon className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <div className="flex justify-center items-center p-4">
            <Spinner />
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MenuVertButtonIcon className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {(isHost || hasJoined) && (
            <DropdownMenuItem asChild>
              <Link href={`/playlist/${playlistId}/info`} className="flex items-center">
                <PlaylistInfoIcon className="mr-2 h-4 w-4" />
                Playlist Info
              </Link>
            </DropdownMenuItem>
          )}

          {(isHost || isModerator) && (
            <DropdownMenuItem asChild>
              <Link href={`/playlist/${playlistId}/manage`} className="flex items-center">
                <ManageIcon className="mr-2 h-4 w-4" />
                Manage Playlist
              </Link>
            </DropdownMenuItem>
          )}

          {!isHost && hasJoined && (
            <DropdownMenuItem onClick={handleConfirmLeave}>
              <LeavePlaylistIcon className="mr-2 h-4 w-4" />
              Leave Playlist
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm: Leave Playlist</DialogTitle>
            <DialogDescription>Leaving this playlist will remove all your placed votes and added songs. Are you sure you want to proceed?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={handleCancelLeave} variant="outline">
              Cancel
            </Button>
            <Button onClick={handleLeavePlaylist} variant="destructive">
              Leave
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
