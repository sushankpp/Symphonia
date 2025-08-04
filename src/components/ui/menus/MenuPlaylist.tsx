import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Plus, Music, ListMusic, Play } from "lucide-react";

type Playlist = {
  id: number;
  playlist_name: string;
};

const MenuPlaylist = () => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const apiURL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        const response = await fetch(`${apiURL}/api/playlists`);
        if (!response.ok) throw new Error("Failed to fetch playlists");
        const data = await response.json();
        setPlaylists(data);
      } catch (err) {
        console.error("Error fetching playlists:", err);
      }
    };

    fetchPlaylists();
  }, []);

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
        {playlists.slice(0, 2).map((playlist) => (
          <li key={playlist.id}>
            <Link to={`/playlist/${playlist.id}`}>
              <ListMusic size={20} />
              {playlist.playlist_name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MenuPlaylist;
