import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { supabase } from "@/lib/supabase";
import { getCurrentUser, getPlaylistData, leavePlaylist } from "@/lib/actions";
import {
  Users,
  Star,
  Trash2,
  LogOut,
  MoreVertical,
  Eye,
  Info,
  Settings,
  Loader2,
} from "lucide-react";

export default function Playlists() {
  const router = useRouter();
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(null);
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
        const { data, error } = await supabase
          .from("users")
          .select("playlists")
          .eq("id", currentUser.id)
          .single();

        if (error) {
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
      } catch {
        setPlaylists([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaylists();
  }, [router.isReady, currentUser]);

  const handleMenuOpen = (event, playlist) => {
    setSelectedPlaylist(playlist);
    setMenuAnchor(event.currentTarget);
    setMenuOpen(true);
  };

  const handleMenuClose = () => {
    setMenuOpen(false);
    setMenuAnchor(null);
    setSelectedPlaylist(null);
  };

  const handleLeavePlaylist = async () => {
    if (!currentUser || !selectedPlaylist) return;
    try {
      await leavePlaylist(selectedPlaylist.id);
      setPlaylists((prev) => prev.filter((playlist) => playlist.id !== selectedPlaylist.id));
    } catch {}
    setConfirmDialogOpen(false);
    handleMenuClose();
  };

  const handleDeletePlaylist = async () => {
    if (!currentUser || !selectedPlaylist) return;
    try {
      await handleDeletePlaylist(selectedPlaylist.id);
      setPlaylists((prev) => prev.filter((playlist) => playlist.id !== selectedPlaylist.id));
    } catch {}
    setDeleteDialogOpen(false);
    handleMenuClose();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[90vh]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (playlists.length === 0) {
    return (
      <>
        <h2 className="text-2xl font-semibold text-foreground mb-6">Joined Playlists</h2>
        <div className="border-b border-border mb-6" />
        <span className="text-muted-foreground">You have not joined any playlists yet.</span>
      </>
    );
  }

  return (
    <>
      <h2 className="text-2xl font-semibold text-foreground mb-4">Joined Playlists</h2>
      <div className="border-b border-border my-4" />
      <ul className="divide-y divide-border bg-card rounded-xl shadow-sm">
        {playlists.map((playlist) => (
          <li key={playlist.id} className="flex justify-between items-center py-4 px-4">
            <div>
              <Link href={`/playlist/${playlist.url}`} className="font-bold text-primary underline hover:text-accent flex items-center gap-1">
                {currentUser?.id === playlist.host && (
                  <Star className="w-4 h-4 text-yellow-400" title="You are the host" />
                )}
                {playlist.name}
              </Link>
              <div className="text-sm text-muted-foreground">
                {playlist.description || "No description available"}
              </div>
              <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                <Users className="w-4 h-4" />
                {playlist.userCount} members
              </div>
            </div>
            <button
              className="rounded-full p-2 hover:bg-muted transition-colors"
              onClick={(e) => handleMenuOpen(e, playlist)}
              aria-label="Open playlist menu"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
          </li>
        ))}
      </ul>

      {/* Menu */}
      {menuOpen && selectedPlaylist && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-card text-foreground rounded-xl shadow-lg w-64 p-4 flex flex-col gap-2">
            <Link
              href={`/playlist/${selectedPlaylist.url}`}
              className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted transition-colors"
              onClick={handleMenuClose}
            >
              <Eye className="w-4 h-4" />
              Open Playlist
            </Link>
            <Link
              href={`/playlist/${selectedPlaylist.url}/info`}
              className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted transition-colors"
              onClick={handleMenuClose}
            >
              <Info className="w-4 h-4" />
              Playlist Info
            </Link>
            {(currentUser?.id === selectedPlaylist.host ||
              selectedPlaylist.moderators?.includes(currentUser?.id)) && (
              <Link
                href={`/playlist/${selectedPlaylist.url}/manage`}
                className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted transition-colors"
                onClick={handleMenuClose}
              >
                <Settings className="w-4 h-4" />
                Manage Playlist
              </Link>
            )}
            {currentUser?.id !== selectedPlaylist.host && (
              <button
                className="flex items-center gap-2 px-3 py-2 rounded-md text-destructive hover:bg-destructive/10 transition-colors"
                onClick={() => {
                  setConfirmDialogOpen(true);
                  setMenuOpen(false);
                }}
              >
                <LogOut className="w-4 h-4" />
                Leave Playlist
              </button>
            )}
            {currentUser?.id === selectedPlaylist.host && (
              <button
                className="flex items-center gap-2 px-3 py-2 rounded-md text-destructive hover:bg-destructive/10 transition-colors"
                onClick={() => {
                  setDeleteDialogOpen(true);
                  setMenuOpen(false);
                }}
              >
                <Trash2 className="w-4 h-4" />
                Delete Playlist
              </button>
            )}
            <button
              className="mt-2 text-xs text-muted-foreground hover:underline"
              onClick={handleMenuClose}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Leave Confirmation Dialog */}
      {confirmDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-card text-foreground rounded-2xl shadow-lg max-w-sm w-full p-6">
            <div className="text-lg font-semibold mb-4">Confirm: Leave Playlist</div>
            <div className="mb-6 text-muted-foreground">
              Are you sure you want to leave this playlist?
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirmDialogOpen(false)}
                className="px-4 py-2 rounded-md text-muted-foreground hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLeavePlaylist}
                className="px-4 py-2 rounded-md text-destructive hover:bg-destructive/10 transition-colors"
              >
                Leave
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-card text-foreground rounded-2xl shadow-lg max-w-sm w-full p-6">
            <div className="text-lg font-semibold mb-4">Confirm: Delete Playlist</div>
            <div className="mb-6 text-muted-foreground">
              Are you sure you want to delete this playlist? This action cannot be undone.
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteDialogOpen(false)}
                className="px-4 py-2 rounded-md text-muted-foreground hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeletePlaylist}
                className="px-4 py-2 rounded-md text-destructive hover:bg-destructive/10 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}