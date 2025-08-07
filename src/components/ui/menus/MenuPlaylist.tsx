import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Plus, Music, ListMusic, Play } from "lucide-react";
import { useAuthHeaders } from "../../../hooks/useAuthHeaders";
import { useAuth } from "../../../contexts/AuthContext";

type Playlist = {
  id: number;
  playlist_name: string;
};

const MenuPlaylist = () => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const { makeAuthenticatedRequest } = useAuthHeaders();
  const { isAuthenticated } = useAuth();
  const apiURL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchPlaylists = async () => {
      // Only fetch if user is authenticated
      if (!isAuthenticated) {
        return;
      }

      try {
        const response = await makeAuthenticatedRequest(`${apiURL}/api/playlists`);
        if (!response.ok) throw new Error("Failed to fetch playlists");
        const data = await response.json();
        setPlaylists(data);
      } catch (err) {
        console.error("Error fetching playlists:", err);
      }
    };

    fetchPlaylists();
  }, [makeAuthenticatedRequest, apiURL, isAuthenticated]);

  return (
    <div className="header-navigation__items">
      <h2 className="header-navigation__title">Playlists</h2>
      <ul className="header-navigation__item">
        <li>
          <Link to="/create-playlist">
            <Plus size={20} />
            Create New Playlist
          </Link>
        </li>
        {!isAuthenticated ? (
          <li>
            <span style={{ color: '#6b7280', fontSize: '14px' }}>
              Please log in to view playlists
            </span>
          </li>
        ) : (
          playlists.slice(0, 2).map((playlist) => (
            <li key={playlist.id}>
              <Link to={`/playlist/${playlist.id}`}>
                <ListMusic size={20} />
                {playlist.playlist_name}
              </Link>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default MenuPlaylist;
