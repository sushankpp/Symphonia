import SidebarHeader from "../components/ui/headers/SidebarHeader.tsx";
import TopHeader from "../components/ui/headers/TopHeader.tsx";
import ArtistDetails from "../components/ui/layouts/ArtistDetails.tsx";
import SongsList from "../components/ui/layouts/SongsList.tsx";
import { useCallback, useEffect, useState } from "react";
import { formatTime, getAudioDuration, convertStorageUrl } from "../utils/audioDuration.tsx";
import { useNavigate } from "react-router-dom";

type Song = {
  id: number;
  title: string;
  file_path: string;
  song_cover: string;
  duration?: string;
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
      console.log("Fetched albums:", data);
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
                [String(song.id)]: formattedDuration, // Ensure song.id is a string
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

  const handleSongClick = (artistId: number, songId: number) => {
    navigate(`/player/${artistId}/${songId}`);
  };

  return (
    <>
      <SidebarHeader />
      <main className="page__home">
        <TopHeader />
        <div className="container">
          {loading ? (
            <p className="loading">Loading albums...</p>
          ) : error ? (
            <p className="error">{error}</p>
          ) : (
            <div className="albums-list__container">
              {albums.map((album) => (
                <div className="album-list__wrapper" key={album.id}>
                  <ArtistDetails
                    artistImage={convertStorageUrl(album.cover_image, apiURL)}
                    albumName={album.title}
                    artistName={album.artist_name}
                    songCount={album.songs.length}
                    onPlayAllClick={() => console.log()}
                  />
                  <SongsList
                    songs={album.songs.map((song) => ({
                      id: song.id,
                      title: song.title,
                      duration: songDurations[String(song.id)] || "--:--",
                    }))}
                    onSongClick={(songId) =>
                      handleSongClick(album.artist_id, songId)
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
