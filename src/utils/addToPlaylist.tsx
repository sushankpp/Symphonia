import React from "react";
import { PlaylistLists } from "../components/ui/cards/PlaylistsLists";
import { useFetchPlaylists } from "../hooks/useFetchPlaylists";

type AddToPlaylistProps = {
  songId: number;
  onClose: () => void;
  onAddToPlaylist: (playlistId: number, songId: number) => void;
  onCreatePlaylist: (playlistName: string, songId: number) => void;
};

const AddToPlaylist: React.FC<AddToPlaylistProps> = ({
  songId,
  onClose,
  onAddToPlaylist,
  onCreatePlaylist,
}) => {
  const { playlists, error } = useFetchPlaylists();

  return (
    <div className="dialog-overlay">
      <div className="dialog">
        <h3>Add to Playlist</h3>
        {error ? (
          <p className="error">{error}</p>
        ) : (
          <PlaylistLists
            playlists={playlists}
            onAddToPlaylist={(playlistId) =>
              onAddToPlaylist(playlistId, songId)
            }
            onCreatePlaylist={(playlistName) =>
              onCreatePlaylist(playlistName, songId)
            }
          />
        )}
        <button className="close-button" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export default AddToPlaylist;
