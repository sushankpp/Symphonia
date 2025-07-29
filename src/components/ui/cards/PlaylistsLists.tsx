import React, { useState } from "react";

type Song = {
  id: number;
  title: string;
  song_cover_path: string;
};

type Playlist = {
  id: number;
  playlist_name: string;
  user_id: number;
  created_at: string;
  updated_at: string;
  songs: Song[];
};

type CreatePlaylistBoxProps = {
  playlists: Playlist[];
  onAddToPlaylist: (playlistId: number) => void;
  onCreatePlaylist: (playlistName: string) => void;
  className?: string;
  showAddToPlaylist?: boolean;
};

export const PlaylistLists: React.FC<CreatePlaylistBoxProps> = ({
  playlists,
  onAddToPlaylist,
  onCreatePlaylist,
  className = "dialog",
  showAddToPlaylist = true,
}) => {
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<number | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleAddToPlaylist = async () => {
    if (!selectedPlaylistId) {
      setMessage("Please select a playlist");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      await onAddToPlaylist(selectedPlaylistId);
      setMessage("Song added to playlist successfully!");
      setSelectedPlaylistId(null);
    } catch (error) {
      setMessage("Failed to add song to playlist");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) {
      setMessage("Please enter a playlist name");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      await onCreatePlaylist(newPlaylistName.trim());
      setMessage("Playlist created successfully!");
      setNewPlaylistName("");
    } catch (error) {
      setMessage("Failed to create playlist");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlaylistSelect = (playlistId: number) => {
    setSelectedPlaylistId(playlistId);
    setMessage("");
  };

  return (
    <div className={className}>
      <h3>Playlist Management</h3>

      {message && (
        <div
          className={`message ${
            message.includes("successfully") ? "success" : "error"
          }`}
        >
          {message}
        </div>
      )}

      {showAddToPlaylist && (
        <div className="playlist-section">
          <h4>Add to Existing Playlist</h4>
          <select
            onChange={(e) => handlePlaylistSelect(Number(e.target.value))}
            value={selectedPlaylistId || ""}
            disabled={isLoading}
          >
            <option value="" disabled>
              Select a playlist
            </option>
            {playlists.map((playlist) => (
              <option key={playlist.id} value={playlist.id}>
                {playlist.playlist_name} ({playlist.songs.length} songs)
              </option>
            ))}
          </select>
          <button
            onClick={handleAddToPlaylist}
            disabled={!selectedPlaylistId || isLoading}
          >
            {isLoading ? "Adding..." : "Add to Playlist"}
          </button>
        </div>
      )}

      <div className="playlist-section">
        <h4>Create New Playlist</h4>
        <input
          type="text"
          placeholder="Enter playlist name"
          value={newPlaylistName}
          onChange={(e) => setNewPlaylistName(e.target.value)}
          disabled={isLoading}
        />
        <button
          onClick={handleCreatePlaylist}
          disabled={!newPlaylistName.trim() || isLoading}
        >
          {isLoading ? "Creating..." : "Create Playlist"}
        </button>
      </div>
    </div>
  );
};
