import { Link, useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import SidebarHeader from "../components/ui/headers/SidebarHeader.tsx";
import TopHeader from "../components/ui/headers/TopHeader.tsx";
import OptionsMenu from "../components/ui/menus/OptionsMenu.tsx";
import AddToPlaylistModal from "../utils/addToPlaylist";
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
  const [showModal, setShowModal] = useState(false);
  const [currentSongId, setCurrentSongId] = useState<number | null>(null);
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

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement;
      if (!target.closest(".song-options")) {
        setActiveMenuId(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleMenu = (e: React.MouseEvent, songId: number) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveMenuId(activeMenuId === songId ? null : songId);
  };

  const playAudio = (songId: number) => {
    if (artist) {
      navigate(`/player/${artist.id}/${songId}`);
    }
  };

  const handleAddToPlaylistClick = (songId: number) => {
    setCurrentSongId(songId);
    setShowModal(true);
  };

  const handleAddToPlaylist = async (playlistId: number, songId: number) => {
    try {
      const response = await fetch(
        `${apiURL}/api/playlists/${playlistId}/songs`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ song_id: songId }),
        }
      );

      if (!response.ok) throw new Error("Failed to add song to playlist");
      console.log("Song added to playlist");
    } catch (err) {
      console.error("Error adding song to playlist:", err);
    } finally {
      setShowModal(false);
    }
  };

  const handleCreatePlaylist = async (playlistName: string, songId: number) => {
    try {
      const response = await fetch(`${apiURL}/api/playlists`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ playlist_name: playlistName }),
      });

      if (!response.ok) throw new Error("Failed to create playlist");
      const newPlaylist = await response.json();
      await handleAddToPlaylist(newPlaylist.id, songId);
    } catch (err) {
      console.error("Error creating playlist:", err);
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
            <div className="songs-listings">
              <div className="songs-listings__header">
                <h2 className="songs-listings__title">
                  Songs by {artist?.artist_name}
                </h2>
                <Link to="/artists" className="return-link">
                  Go to Artist List
                </Link>
              </div>
              <div className="songs-listings__wrapper">
                <div className="songs-list">
                  {songs.length === 0 ? (
                    <p>No songs found for this artist.</p>
                  ) : (
                    songs.map((song) => (
                      <div className="song-items" key={song.id}>
                        <figure className="song-cover">
                          <img
                            src={song.song_cover ? convertStorageUrl(song.song_cover, apiURL) : "/images/default-cover.jpg"}
                            alt={`${song.title} cover`}
                          />
                        </figure>
                        <h3 className="song-title">
                          <Link
                            to={`/player/${artistId}/${song.id}`}
                            onClick={() => playAudio(song.id)}
                          >
                            {song.title}
                          </Link>
                        </h3>
                        <div className="song-add-fav">
                          <a
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              handleAddToPlaylistClick(song.id);
                            }}
                          >
                            <img
                              src="/images/add-plus.svg"
                              alt="add-to-fav"
                              title="add to playlist"
                            />
                          </a>
                        </div>
                        <p className="song-duration">
                          {song.duration || "--:--"}
                        </p>
                        <div className="song-options" title="more options">
                          <a href="#" onClick={(e) => toggleMenu(e, song.id)}>
                            <img src="/images/options-icon.svg" alt="options" />
                          </a>

                          {activeMenuId === song.id && (
                            <OptionsMenu
                              onAddToPlaylist={() =>
                                handleAddToPlaylistClick(song.id)
                              }
                              onGoToArtist={() =>
                                navigate(`/artists/${artistId}`)
                              }
                              onGoToAlbum={() => console.log("Go to Album")}
                              onShare={() => console.log("Share")}
                            />
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      {showModal && currentSongId && (
        <AddToPlaylistModal
          songId={currentSongId}
          onClose={() => setShowModal(false)}
          onAddToPlaylist={handleAddToPlaylist}
          onCreatePlaylist={handleCreatePlaylist}
        />
      )}
    </>
  );
}

export default SongListings;
