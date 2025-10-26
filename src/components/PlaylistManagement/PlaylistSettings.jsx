import { useState, useEffect } from "react";
import { setPlaylistName, setPlaylistVisibility, setPlaylistUrl, setPlaylistDescription, setPlaylistHost, addPlaylistModerator, removePlaylistModerator, deletePlaylist, getPlaylistMembers, getPlaylistModerators, getPlaylistData } from "@/lib/actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Typography } from "@/components/ui/typography";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User as ProfileIcon, Trash2 as DeleteIcon } from "lucide-react";
import { supabase } from "@/lib/supabase";
import PropTypes from "prop-types";

export default function PlaylistSettings({ playlistId }) {
  const [playlistData, setPlaylistData] = useState(null);
  const [name, setName] = useState("");
  const [tempName, setTempName] = useState("");
  const [isPublic, setIsPublic] = useState(null);
  const [tempIsPublic, setTempIsPublic] = useState(null);
  const [url, setUrl] = useState("");
  const [tempUrl, setTempUrl] = useState("");
  const [description, setDescription] = useState("");
  const [tempDescription, setTempDescription] = useState("");
  const [selectedHost, setSelectedHost] = useState("");
  const [tempSelectedHost, setTempSelectedHost] = useState("");
  const [username, setUsername] = useState("");
  const [moderatorList, setModeratorList] = useState([]);
  const [members, setMembers] = useState([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const fetchPlaylistData = async () => {
    try {
      const data = await getPlaylistData(playlistId);
      if (data) {
        setPlaylistData(data);

        setName(data.name);
        setTempName(data.name);

        setIsPublic(data.is_public);
        setTempIsPublic(data.is_public);

        setUrl(data.url);
        setTempUrl(data.url);

        setDescription(data.description);
        setTempDescription(data.description);
      }
    } catch (error) {
      console.error("Error fetching playlist data:", error.message);
    }
  };

  const fetchPlaylistModerators = async () => {
    try {
      const moderators = await getPlaylistModerators(playlistId);
      if (moderators && typeof moderators === "object") {
        const formattedModerators = Object.entries(moderators).map(([id, username]) => ({
          id,
          username,
        }));
        setModeratorList(formattedModerators);
      } else {
        console.warn("Unexpected format:", moderators);
      }
    } catch (error) {
      console.error("Error fetching moderators:", error.message);
    }
  };

  const fetchPlaylistMembers = async () => {
    try {
      const membersData = await getPlaylistMembers(playlistId);
      setMembers(membersData);
    } catch (error) {
      console.error("Error fetching playlist members:", error.message);
    }
  };

  useEffect(() => {
    fetchPlaylistData();
    fetchPlaylistModerators();
    fetchPlaylistMembers();
  }, [playlistId]);

  useEffect(() => {
    setHasChanges(tempName !== name || tempIsPublic !== isPublic || tempUrl !== url || tempDescription !== description || tempSelectedHost !== selectedHost);
  }, [tempName, tempIsPublic, tempUrl, tempDescription, tempSelectedHost, name, isPublic, url, description, selectedHost]);

  const handleSave = async () => {
    try {
      if (tempName !== name) await setPlaylistName(playlistId, tempName);
      if (tempIsPublic !== isPublic) await setPlaylistVisibility(playlistId, tempIsPublic);
      if (tempUrl !== url) await setPlaylistUrl(playlistId, tempUrl);
      if (tempDescription !== description) await setPlaylistDescription(playlistId, tempDescription);
      if (tempSelectedHost !== selectedHost) await setPlaylistHost(playlistId, tempSelectedHost);
      alert("Settings updated successfully.");
    } catch (error) {
      console.error("Error saving settings:", error.message);
    } finally {
      setHasChanges(false);
      await fetchPlaylistData();
      setTempName(name);
      setTempIsPublic(isPublic);
      setTempUrl(url);
      setTempDescription(description);
      setTempSelectedHost(selectedHost);
    }
  };

  const handleCancel = async () => {
    await fetchPlaylistData();
  };

  const handleDeletePlaylist = async () => {
    try {
      await deletePlaylist(playlistId);
      alert("Playlist deleted successfully.");
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting playlist:", error.message);
    }
  };

  const handleAddModerator = async () => {
    try {
      const { data: userInfo, error: userError } = await supabase.from("users").select("id, username").eq("username", username).single();

      if (!userInfo || userError) {
        alert("User not found.");
        return;
      }
      await addPlaylistModerator(playlistId, userInfo.id);
      alert("Moderator added successfully.");
      setModeratorList([...moderatorList, userInfo]);
      setUsername("");
    } catch (error) {
      console.error("Error adding moderator:", error.message);
    }
  };

  const handleRemoveModerator = async (userId) => {
    try {
      await removePlaylistModerator(playlistId, userId);
      alert("Moderator removed successfully.");
      setModeratorList(moderatorList.filter((moderator) => moderator.id !== userId));
    } catch (error) {
      console.error("Error removing moderator:", error.message);
    }
  };

  if (!playlistData) {
    return (
      <div className="flex justify-center items-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="p-6">
      <Typography variant="h5" className="text-white font-medium">
        Playlist Management
      </Typography>

      <Separator className="my-6" />

      <div className="flex flex-col gap-6">
        {/* Change Visibility */}
        <div className="flex items-center space-x-4">
          <Label htmlFor="visibility-switch">Change Visibility:</Label>
          <Switch id="visibility-switch" checked={tempIsPublic} onCheckedChange={setTempIsPublic} />
          <Typography className="ml-2">{tempIsPublic ? "Public" : "Private"}</Typography>
        </div>

        {/* Change Name */}
        <div className="space-y-2">
          <Label htmlFor="playlist-name">Change Name</Label>
          <Input id="playlist-name" value={tempName} onChange={(e) => setTempName(e.target.value)} />
        </div>

        {/* Change URL */}
        <div className="space-y-2">
          <Label htmlFor="playlist-url">Change Access URL</Label>
          <Input id="playlist-url" value={tempUrl} onChange={(e) => setTempUrl(e.target.value)} />
        </div>

        {/* Change Description */}
        <div className="space-y-2">
          <Label htmlFor="playlist-description">Change Description</Label>
          <Textarea id="playlist-description" rows={4} value={tempDescription} onChange={(e) => setTempDescription(e.target.value)} />
        </div>

        {/* Change Host */}
        <div className="flex flex-col gap-3">
          <Typography variant="h6" className="text-white font-medium">
            Change Playlist Host
          </Typography>
          <Select value={tempSelectedHost} onValueChange={setTempSelectedHost}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select a new host" />
            </SelectTrigger>
            <SelectContent>
              {members.map((member) => (
                <SelectItem key={member.id} value={member.id}>
                  {member.username}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Save and Cancel Buttons */}
        <div className="flex justify-between gap-4">
          <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
            Delete Playlist
          </Button>

          <div className="flex gap-4">
            <Button variant="outline" onClick={handleCancel} disabled={!hasChanges}>
              Cancel
            </Button>
            <Button variant="default" onClick={handleSave} disabled={!hasChanges}>
              Save
            </Button>
          </div>
        </div>
      </div>

      <Separator className="my-6" />

      <Typography variant="h5" className="text-white font-medium">
        Playlist Moderators
      </Typography>

      <div className="flex flex-col gap-6 mt-6">
        {/* Add Moderator */}
        <div className="space-y-2">
          <Label htmlFor="moderator-username">Add Moderator by Username</Label>
          <div className="flex gap-2">
            <Input id="moderator-username" value={username} onChange={(e) => setUsername(e.target.value)} className="flex-1" />
            <Button onClick={handleAddModerator}>Add</Button>
          </div>
        </div>

        {/* Moderator List */}
        {moderatorList.length > 0 && (
          <div className="max-h-48 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg bg-background p-2">
            {moderatorList.map((mod) => (
              <div key={mod.id} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg">
                <div className="flex-1">
                  <div className="font-medium">{mod.username || mod.id}</div>
                  <div className="text-sm text-gray-600">ID: {mod.id}</div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" asChild className="text-blue-500 hover:text-blue-600">
                    <a href={`/user/${mod.username || mod.id}`}>
                      <ProfileIcon className="h-4 w-4" />
                    </a>
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleRemoveModerator(mod.id)} className="text-red-500 hover:text-red-600">
                    <DeleteIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>Are you sure you want to delete this playlist? This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setDeleteDialogOpen(false)} variant="outline">
              Cancel
            </Button>
            <Button onClick={handleDeletePlaylist} variant="destructive">
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
PlaylistSettings.propTypes = {
  playlistId: PropTypes.number.isRequired,
};
