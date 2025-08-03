import { Link, useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import SidebarHeader from "../components/ui/headers/SidebarHeader.tsx";
import TopHeader from "../components/ui/headers/TopHeader.tsx";
import SongsList from "../components/ui/layouts/SongsList.tsx";
import { convertStorageUrl } from "../utils/audioDuration.tsx";

type Song = {
  id: number;
  title: string;
  file_path: string;
  song_cover: string;
  duration?: string;
};

type Artist = {
  id: number;
  artist_name: string;
  artist_image: string;
  song_count: number;
};

function SongListings() {
  const { id: artistId } = useParams();
  const [songs, setSongs] = useState<Song[]>([]);
  const [artist, setArtist] = useState<Artist | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);
  const navigate = useNavigate();

  const apiURL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (!artistId) {
      setError("Invalid artist ID");
      setLoading(false);
      return;
    }

    fetch(`${apiURL}/api/artists/${artistId}/songs`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch data");
        return res.json();
      })
      .then((data) => {
        setArtist(data.artist);

        const songsWithDuration = data.songs || [];
        const durationPromises = songsWithDuration.map((song: Song) => {
          return new Promise<Song>((resolve) => {
            const audioUrl = convertStorageUrl(song.file_path, apiURL);
            const audio = new Audio(audioUrl);
            audio.addEventListener("loadedmetadata", () => {
              const minutes = Math.floor(audio.duration / 60);
              const seconds = Math.floor(audio.duration % 60);
              resolve({
                ...song,
                duration: `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`,
              });
            });

            audio.addEventListener("error", () => {
              resolve({
                ...song,
                duration: "--:--",
              });
            });
          });
        });

        Promise.all(durationPromises).then((songsWithDurations) => {
          setSongs(songsWithDurations);
          setLoading(false);
        });
      })
      .catch((err) => {
        console.error("Error fetching songs:", err);
        setError("Failed to load song data");
        setLoading(false);
      });
  }, [artistId, apiURL]);

  const playAudio = (songId: number) => {
    if (artist) {
      navigate(`/player/${artist.id}/${songId}`);
    }
  };

  return (
    <>
      <SidebarHeader />
      <main className="page__home" id="primary">
        <div className="container">
          <TopHeader />
          {loading ? (
            <p className="loading">Loading songs...</p>
          ) : error ? (
            <p className="error">{error}</p>
          ) : (
            <div className="artist-songs-container">
              <div className="artist-songs-header">
                <div className="artist-info">
                  <img 
                    src={artist?.artist_image ? convertStorageUrl(artist.artist_image, apiURL) : "/images/default-cover.jpg"}
                    alt={artist?.artist_name}
                    className="artist-image"
                  />
                  <div className="artist-details">
                    <h1 className="artist-name">{artist?.artist_name}</h1>
                    <p className="artist-song-count">{songs.length} songs</p>
                  </div>
                </div>
                <Link to="/artists" className="back-to-artists">
                  ← Back to Artists
                </Link>
              </div>
              
              <SongsList
                songs={songs.map((song) => ({
                  id: song.id,
                  title: song.title,
                  duration: song.duration || "--:--",
                  song_cover: song.song_cover ? convertStorageUrl(song.song_cover, apiURL) : "",
                  artist_name: artist?.artist_name,
                }))}
                activeMenuId={activeMenuId}
                onSongClick={playAudio}
                artistName={artist?.artist_name}
                artistImage={artist?.artist_image ? convertStorageUrl(artist.artist_image, apiURL) : ""}
              />
            </div>
          )}
        </div>
      </main>
    </>
  );
}

export default SongListings;
