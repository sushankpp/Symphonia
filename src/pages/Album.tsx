import SidebarHeader from "../components/ui/headers/SidebarHeader.tsx";
import TopHeader from "../components/ui/headers/TopHeader.tsx";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

type Song = {
  id: number;
  title: string;
  song_cover: string;
  file_path: string;
};

type Album = {
  id: number;
  title: string;
  cover_image: string;
  artist_name: string;
  artist_id: number;
  songs: Song[];
};

function Album() {
  const { albumId } = useParams();
  const [album, setAlbum] = useState<Album | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const apiURL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (!albumId) {
      setError("Invalid album ID");
      setLoading(false);
      return;
    }

    const fetchAlbum = async () => {
      try {
        const response = await fetch(`${apiURL}/api/albums`);
        if (!response.ok) throw new Error("Failed to fetch albums");

        const albums = await response.json();
        const foundAlbum = albums.find(
          (album: Album) => album.id === parseInt(albumId)
        );

        if (foundAlbum) {
          setAlbum(foundAlbum);
        } else {
          throw new Error("Album not found");
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching album:", err);
        setError("Failed to load album data");
        setLoading(false);
      }
    };

    fetchAlbum();
  }, [albumId, apiURL]);

  const handleSongClick = (songId: number) => {
    if (album) {
      navigate(`/player/${album.artist_id}/${songId}`);
    }
  };

  const handleArtistClick = () => {
    if (album) {
      navigate(`/artists/${album.artist_id}`);
    }
  };

  if (loading) {
    return (
      <>
        <SidebarHeader />
        <main className="page__home">
          <TopHeader />
          <div className="container">
            <p className="loading">Loading album data...</p>
          </div>
        </main>
      </>
    );
  }

  if (error || !album) {
    return (
      <>
        <SidebarHeader />
        <main className="page__home">
          <TopHeader />
          <div className="container">
            <p className="error">{error || "Album not found"}</p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <SidebarHeader />
      <main className="page__home">
        <TopHeader />
        <div className="container">
          <div className="album-page">
            <div className="album-header">
              <figure className="album-cover">
                <img src={album.cover_image} alt={`${album.title} cover`} />
              </figure>
              <div className="album-info">
                <h1 className="album-title">{album.title}</h1>
                <p
                  className="album-artist"
                  onClick={handleArtistClick}
                  style={{ cursor: "pointer" }}
                >
                  {album.artist_name}
                </p>
                <p className="album-songs-count">{album.songs.length} songs</p>
              </div>
            </div>

            <div className="album-songs">
              <h2>Songs</h2>
              <div className="songs-list">
                {album.songs.map((song, index) => (
                  <div
                    key={song.id}
                    className="song-item"
                    onClick={() => handleSongClick(song.id)}
                  >
                    <div className="song-number">{index + 1}</div>
                    <figure className="song-cover">
                      <img src={song.song_cover} alt={`${song.title} cover`} />
                    </figure>
                    <div className="song-info">
                      <h3 className="song-title">{song.title}</h3>
                      <p className="song-artist">{album.artist_name}</p>
                    </div>
                    <div className="song-actions">
                      <button className="play-btn">▶</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

export default Album;
