import SidebarHeader from "../components/ui/headers/SidebarHeader.tsx";
import TopHeader from "../components/ui/headers/TopHeader.tsx";
import SongsList from "../components/ui/layouts/SongsList.tsx";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAudioDuration, formatTime, convertStorageUrl } from "../utils/audioDuration.tsx";

type Artist = {
  id: number;
  artist_name: string;
  artist_image: string;
  song_count: number;
};

type Song = {
  id: number;
  title: string;
  file_path: string;
  song_cover?: string;
  artist_name?: string;
  artist_id?: number;
};

function Music() {
  const navigate = useNavigate();
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);
  const [songDurations, setSongDurations] = useState<{ [key: number]: string }>(
    {}
  );

  const apiURL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    setLoading(true);

    // First fetch all artists
    fetch(`${apiURL}/api/artists`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch artists");
        return res.json();
      })
      .then((artists: Artist[]) => {
        // Then fetch songs for each artist
        const promises = artists.map((artist) =>
          fetch(`${apiURL}/api/artists/${artist.id}/songs`)
            .then((res) => res.json())
            .then((data) => {
              const artistSongs = (data.songs || []).map((song: any) => ({
                ...song,
                artist_name: artist.artist_name,
                artist_id: artist.id,
              }));
              return artistSongs;
            })
            .catch((error) => {
              console.error(`Error fetching songs for artist ${artist.id}:`, error);
              return [];
            })
        );

        return Promise.all(promises);
      })
      .then((allSongsArrays) => {
        // Flatten all songs into a single array
        const allSongs = allSongsArrays.flat();
        setSongs(allSongs);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching songs:", error);
        setError("Failed to load music data");
        setLoading(false);
      });
  }, [apiURL]);

  const handleSongClick = (songId: number) => {
    const song = songs.find(s => s.id === songId);
    if (song && song.artist_id) {
      navigate(`/player/${song.artist_id}/${songId}`);
    }
  };

  useEffect(() => {
    if (songs.length > 0) {
      songs.forEach((song) => {
        const convertedUrl = convertStorageUrl(song.file_path, import.meta.env.VITE_API_URL);
        getAudioDuration(convertedUrl)
          .then((duration) => {
            const formattedDuration = formatTime(duration);
            setSongDurations((prev) => ({
              ...prev,
              [song.id]: formattedDuration,
            }));
          })
          .catch((error) => {
            console.error(
              `Error fetching duration for song ${song.id}:`,
              error
            );
          });
      });
    }
  }, [songs]);

  return (
    <>
      <SidebarHeader />
      <main className="page__home" id="primary">
        <div className="container">
          <TopHeader />
          {loading ? (
            <p className="loading">
              Music Data are being loaded. Please wait....
            </p>
          ) : error ? (
            <p className="error-message">{error}</p>
          ) : (
            <div className="music-list__container">
              {songs.length > 0 ? (
                <SongsList
                  songs={songs.map((song) => ({
                    id: song.id,
                    title: song.title,
                    duration: songDurations[song.id] || "--:--",
                    song_cover: song.song_cover ? convertStorageUrl(song.song_cover, import.meta.env.VITE_API_URL) : "",
                    artist_name: song.artist_name || "Unknown Artist",
                  }))}
                  activeMenuId={activeMenuId}
                  onSongClick={handleSongClick}
                />
              ) : (
                <p className="info">No songs available</p>
              )}
            </div>
          )}
        </div>
      </main>
    </>
  );
}

export default Music;
