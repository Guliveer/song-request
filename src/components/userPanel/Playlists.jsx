import { useEffect, useState } from "react";
import { Trash2, LogOut, Users, MoreVertical, Eye, Star, Settings, Info } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { supabase } from "@/lib/supabase";
import { getCurrentUser, getPlaylistData, leavePlaylist } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Typography } from "@/components/ui/typography";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function Playlists() {
  const router = useRouter();
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const user = await getCurrentUser();
      setCurrentUser(user);
    };
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (!router.isReady || !currentUser) return;

    const fetchPlaylists = async () => {
      try {
        const { data, error } = await supabase.from("users").select("playlists").eq("id", currentUser.id).single();

        if (error) {
          console.error("Error fetching playlists:", error);
          setPlaylists([]);
          setLoading(false);
          return;
        }

        const playlistDetails = await Promise.all(
          data.playlists.map(async (playlistId) => {
            return await getPlaylistData(playlistId);
          })
        );
        setPlaylists(playlistDetails.filter(Boolean));
      } catch (error) {
        console.error("Unexpected error:", error);
        setPlaylists([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaylists();
  }, [router.isReady, currentUser]);

  const handleLeavePlaylist = async () => {
    if (!currentUser || !selectedPlaylist) return;

    try {
      await leavePlaylist(selectedPlaylist.id);
      const updatedPlaylists = playlists.filter((playlist) => playlist.id !== selectedPlaylist.id);
      setPlaylists(updatedPlaylists);
    } catch (error) {
      console.error("Error leaving playlist:", error.message);
    } finally {
      setConfirmDialogOpen(false);
      setSelectedPlaylist(null);
    }
  };

  const handleDeletePlaylist = async () => {
    if (!currentUser || !selectedPlaylist) return;

    try {
      await handleDeletePlaylist(selectedPlaylist.id);
      setPlaylists((prev) => prev.filter((playlist) => playlist.id !== selectedPlaylist.id));
    } catch (error) {
      console.error("Unexpected error:", error.message);
    } finally {
      setDeleteDialogOpen(false);
      setSelectedPlaylist(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (playlists.length === 0) {
    return (
      <>
        <Typography variant="h5" className="text-white mb-6 font-medium">
          Joined Playlists
        </Typography>
        <Separator className="mb-6" />
        <Typography variant="body1" className="text-gray-400">
          You have not joined any playlists yet.
        </Typography>
      </>
    );
  }

  return (
    <TooltipProvider>
      <Typography variant="h5" className="text-white font-medium">
        Joined Playlists
      </Typography>
      <Separator className="my-4" />

      <div className="space-y-4">
        {playlists.map((playlist, index) => (
          <div key={playlist.id} className="space-y-4">
            <div className="flex justify-between items-center py-4">
              <div className="flex-1">
                <Link href={`/playlist/${playlist.url}`} className="group">
                  <div className="flex items-center mb-2">
                    {currentUser?.id === playlist.host && (
                      <Tooltip>
                        <TooltipTrigger>
                          <Star className="h-4 w-4 text-yellow-500 mr-2" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>You are the host</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                    <Typography variant="body1" className="font-bold text-blue-400 group-hover:text-purple-400 underline cursor-pointer">
                      {playlist.name}
                    </Typography>
                  </div>
                </Link>
                <Typography variant="body2" className="text-gray-400 mb-2">
                  {playlist.description || "No description available"}
                </Typography>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1 text-gray-400" />
                  <Typography variant="body2" className="text-gray-400">
                    {playlist.userCount} members
                  </Typography>
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/playlist/${playlist.url}`} className="flex items-center">
                      <Eye className="mr-2 h-4 w-4" />
                      Open Playlist
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/playlist/${playlist.url}/info`} className="flex items-center">
                      <Info className="mr-2 h-4 w-4" />
                      Playlist Info
                    </Link>
                  </DropdownMenuItem>
                  {(currentUser?.id === playlist.host || playlist.moderators.includes(currentUser?.id)) && (
                    <DropdownMenuItem asChild>
                      <Link href={`/playlist/${playlist.url}/manage`} className="flex items-center">
                        <Settings className="mr-2 h-4 w-4" />
                        Manage Playlist
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {currentUser?.id !== playlist.host && (
                    <DropdownMenuItem
                      onClick={() => {
                        setSelectedPlaylist(playlist);
                        setConfirmDialogOpen(true);
                      }}
                      className="text-red-500 focus:text-red-500">
                      <LogOut className="mr-2 h-4 w-4" />
                      Leave Playlist
                    </DropdownMenuItem>
                  )}
                  {currentUser?.id === playlist.host && (
                    <DropdownMenuItem
                      onClick={() => {
                        setSelectedPlaylist(playlist);
                        setDeleteDialogOpen(true);
                      }}
                      className="text-red-500 focus:text-red-500">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Playlist
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            {index < playlists.length - 1 && <Separator />}
          </div>
        ))}
      </div>

      {/* Leave Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm: Leave Playlist</DialogTitle>
          </DialogHeader>
          <Typography>Are you sure you want to leave this playlist?</Typography>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleLeavePlaylist}>
              Leave
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm: Delete Playlist</DialogTitle>
          </DialogHeader>
          <Typography>Are you sure you want to delete this playlist? This action cannot be undone.</Typography>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeletePlaylist}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}
