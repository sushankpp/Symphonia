import SidebarHeader from "../components/ui/headers/SidebarHeader.tsx";
import TopHeader from "../components/ui/headers/TopHeader.tsx";
import SongsList from "../components/ui/layouts/SongsList.tsx";
import { useCallback, useEffect, useState } from "react";
import {
  formatTime,
  getAudioDuration,
  convertStorageUrl,
} from "../utils/audioDuration.tsx";
import { useNavigate } from "react-router-dom";
import { playSong } from "../utils/playSong";

type Song = {
  id: number;
  title: string;
  file_path: string;
  song_cover: string;
  duration?: string;
  artist_id?: number;
  album_id?: number;
  genre?: string;
  description?: string;
  views?: number;
  released_date?: string;
};

type Album = {
  id: number;
  title: string;
  cover_image: string;
  songs: Song[];
  artist_id: number;
  artist_name: string;
};

const Albums = () => {
  const navigate = useNavigate();
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [songDurations, setSongDurations] = useState<{ [key: string]: string }>(
    {}
  );
  const apiURL = import.meta.env.VITE_API_URL;

  const fetchAlbums = useCallback(async () => {
    try {
      const res = await fetch(`${apiURL}/api/albums`);
      if (!res.ok) throw new Error(res.statusText);
      const data = await res.json();
      setAlbums(data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch albums:", error);
      setError("Failed to load album data");
      setLoading(false);
    }
  }, [apiURL]);

  useEffect(() => {
    fetchAlbums();
  }, [fetchAlbums]);

  useEffect(() => {
    if (albums.length > 0) {
      albums.forEach((album) => {
        album.songs.forEach((song) => {
          const convertedUrl = convertStorageUrl(song.file_path, apiURL);
          getAudioDuration(convertedUrl)
            .then((duration) => {
              const formattedDuration = formatTime(duration);
              setSongDurations((prev) => ({
                ...prev,
                [String(song.id)]: formattedDuration,
              }));
            })
            .catch((error) => {
              console.error(
                `Error fetching duration for song ${song.id}:`,
                error
              );
            });
        });
      });
    }
  }, [albums, apiURL]);

  const handleSongClick = async (artistId: number, songId: number) => {
    navigate(`/player/${artistId}/${songId}`);
  };

  return (
    <>
      <SidebarHeader />
      <main className="page__home" id="primary">
        <div className="container">
          <TopHeader />
          {loading ? (
            <p className="loading">Loading albums...</p>
          ) : error ? (
            <p className="error">{error}</p>
          ) : (
            <div className="albums-container">
              {albums.map((album) => (
                <div className="album-card" key={album.id}>
                  <div className="album-header">
                    <div className="album-info">
                      <img
                        src={
                          album.cover_image
                            ? convertStorageUrl(album.cover_image, apiURL)
                            : "/images/default-cover.jpg"
                        }
                        alt={album.title}
                        className="album-image"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/images/default-cover.jpg";
                        }}
                      />
                      <div className="album-details">
                        <h1 className="album-name">{album.title}</h1>
                        <p className="album-artist">{album.artist_name}</p>
                        <p className="album-song-count">
                          {album.songs.length} songs
                        </p>
                      </div>
                    </div>
                  </div>

                  <SongsList
                    songs={album.songs.map((song) => ({
                      id: song.id,
                      title: song.title,
                      duration: songDurations[String(song.id)] || "--:--",
                      song_cover: song.song_cover
                        ? convertStorageUrl(song.song_cover, apiURL)
                        : "",
                      artist_name: album.artist_name,
                      artist_id: song.artist_id,
                      album_id: song.album_id,
                      genre: song.genre,
                      description: song.description,
                      views: song.views,
                      released_date: song.released_date,
                    }))}
                    activeMenuId={null}
                    onSongClick={(songId) =>
                      handleSongClick(album.artist_id, songId)
                    }
                    artistName={album.artist_name}
                    artistImage={
                      album.cover_image
                        ? convertStorageUrl(album.cover_image, apiURL)
                        : ""
                    }
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default Albums;
