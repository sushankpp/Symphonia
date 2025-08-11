import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { convertStorageUrl } from "../../../utils/audioDuration.tsx";
import {
  Music,
  ChevronDown,
  ChevronUp,
  Play,
  Clock,
  Calendar,
  Users,
} from "lucide-react";

type Song = {
  id: number;
  title: string;
  song_cover_path: string;
  file_path: string;
  artist_id: number;
  album_id: number;
  created_at: string | null;
  updated_at: string | null;
  genre?: string;
  description?: string;
  views?: number;
  released_date?: string;
  pivot?: {
    playlist_id: number;
    song_id: number;
  };
};

type Playlist = {
  id: number;
  playlist_name: string;
  user_id: number;
  created_at: string;
  updated_at: string;
  songs: Song[];
};

type PlaylistDetailsProps = {
  playlists?: Playlist[];
};

export const PlaylistDetails: React.FC<PlaylistDetailsProps> = ({
  playlists,
}) => {
  const [expandedPlaylist, setExpandedPlaylist] = useState<number | null>(null);
  const [playlistSongs, setPlaylistSongs] = useState<{ [key: number]: Song[] }>(
    {}
  );
  const [loadingSongs, setLoadingSongs] = useState<{ [key: number]: boolean }>(
    {}
  );
  const navigate = useNavigate();
  const apiURL = import.meta.env.VITE_API_URL;

  const togglePlaylist = async (playlistId: number) => {
    if (expandedPlaylist === playlistId) {
      setExpandedPlaylist(null);
    } else {
      setExpandedPlaylist(playlistId);

      if (!playlistSongs[playlistId] && !loadingSongs[playlistId]) {
        await fetchPlaylistSongs(playlistId);
      }
    }
  };

  const fetchPlaylistSongs = async (playlistId: number) => {
    setLoadingSongs((prev) => ({ ...prev, [playlistId]: true }));

    try {
      const response = await fetch(
        `${apiURL}/api/playlists/${playlistId}/songs`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch playlist songs");
      }

      const songs = await response.json();
      console.log(`Playlist ${playlistId} songs:`, songs);
      setPlaylistSongs((prev) => ({ ...prev, [playlistId]: songs }));
    } catch (error) {
      console.error("Error fetching playlist songs:", error);
    } finally {
      setLoadingSongs((prev) => ({ ...prev, [playlistId]: false }));
    }
  };

  const handleSongClick = (song: Song) => {
    navigate(`/player/${song.artist_id}/${song.id}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="playlist-details">
      {playlists?.length === 0 ? (
        <div className="no-playlists">
          <p>No playlists found. Create your first playlist above!</p>
        </div>
      ) : (
        <div className="playlists-grid">
          {playlists?.map((playlist) => (
            <div key={playlist.id} className="playlist-card">
              <div
                className="playlist-header"
                onClick={() => togglePlaylist(playlist.id)}
              >
                <div className="playlist-info">
                  <div className="playlist-icon">
                    <Music size={24} />
                  </div>
                  <div className="playlist-details">
                    <h3 className="playlist-name">{playlist.playlist_name}</h3>
                    <div className="playlist-meta">
                      <span className="song-count">
                        <Play size={14} />
                        {playlist.songs.length} songs
                      </span>
                      <span className="created-date">
                        <Calendar size={14} />
                        Created: {formatDate(playlist.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="playlist-actions">
                  <button className="expand-btn">
                    {expandedPlaylist === playlist.id ? (
                      <ChevronUp size={20} />
                    ) : (
                      <ChevronDown size={20} />
                    )}
                  </button>
                </div>
              </div>

              {expandedPlaylist === playlist.id && (
                <div className="playlist-songs">
                  {loadingSongs[playlist.id] ? (
                    <div className="loading-songs">
                      <p>Loading songs...</p>
                    </div>
                  ) : playlistSongs[playlist.id]?.length === 0 ? (
                    <div className="no-songs">
                      <p>No songs in this playlist yet.</p>
                      <p>
                        Use the "Add to Playlist" feature from the music player
                        to add songs.
                      </p>
                    </div>
                  ) : (
                    <div className="songs-list">
                      {playlistSongs[playlist.id]?.map((song, index) => (
                        <div
                          key={song.id}
                          className="song-item"
                          onClick={() => handleSongClick(song)}
                          style={{ cursor: "pointer" }}
                        >
                          <div className="song-number">{index + 1}</div>
                          <figure className="song-cover">
                            <img
                              src={convertStorageUrl(
                                song.song_cover_path,
                                import.meta.env.VITE_API_URL
                              )}
                              alt={`${song.title} cover`}
                            />
                          </figure>
                          <div className="song-info">
                            <h4 className="song-title">{song.title}</h4>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
