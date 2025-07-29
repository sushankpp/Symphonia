import SidebarHeader from "../components/ui/headers/SidebarHeader.tsx";
import TopHeader from "../components/ui/headers/TopHeader.tsx";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import CustomAudioPlayer from "../components/ui/cards/CustomAudioPlayer.tsx";
import { addToRecentlyPlayed } from "../utils/recentlyPlayed.tsx";
import OptionsMenu from "../components/ui/menus/OptionsMenu.tsx";
import AddToPlaylistModal from "../utils/addToPlaylist.tsx";

type Song = {
  id: number;
  title: string;
  song_cover: string;
  file_path: string;
};

type Artist = {
  id: number;
  artist_name: string;
  artist_image: string;
  song_count: number;
};

type Album = {
  id: number;
  title: string;
  cover_image: string;
  artist_name: string;
  artist_id: number;
  songs: Song[];
};

function MusicPlayer() {
  const { artistId, songId } = useParams();
  const [song, setSong] = useState<Song | null>(null);
  const [artist, setArtist] = useState<Artist | null>(null);
  const [album, setAlbum] = useState<Album | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [duration, setDuration] = useState<string>("--:--");
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [currentSongId, setCurrentSongId] = useState<number | null>(null);
  const navigate = useNavigate();

  const apiURL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (!artistId || !songId) {
      setError("Invalid song or artist ID");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch artist and song data
        const artistResponse = await fetch(
          `${apiURL}/api/artists/${artistId}/songs`
        );
        if (!artistResponse.ok) throw new Error("Failed to fetch artist data");
        const artistData = await artistResponse.json();

        setArtist(artistData.artist);
        const foundSong = artistData.songs.find(
          (s: Song) => s.id === parseInt(songId)
        );

        if (foundSong) {
          setSong(foundSong);

          // Get audio duration
          const audio = new Audio(foundSong.file_path);
          audio.addEventListener("loadedmetadata", () => {
            const minutes = Math.floor(audio.duration / 60);
            const seconds = Math.floor(audio.duration % 60);
            setDuration(`${minutes}:${seconds < 10 ? "0" : ""}${seconds}`);
          });

          // Fetch albums to find the album containing this song
          const albumsResponse = await fetch(`${apiURL}/api/albums`);
          if (albumsResponse.ok) {
            const albumsData = await albumsResponse.json();
            const albumWithSong = albumsData.find((album: Album) =>
              album.songs.some((song: Song) => song.id === foundSong.id)
            );
            if (albumWithSong) {
              setAlbum(albumWithSong);
            }
          }
        } else {
          throw new Error("Song not found");
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load song data");
        setLoading(false);
      }
    };

    fetchData();
  }, [artistId, songId, apiURL]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement;
      if (
        !target.closest(".song-options") &&
        !target.closest(".sideplayer__options")
      ) {
        setActiveMenuId(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSongPlay = async () => {
    if (song?.id) {
      try {
        await addToRecentlyPlayed(song.id);
        console.log("Song added to recently played", song.title);
      } catch (error) {
        console.error("Error adding song to recently played:", error);
      }
    }
  };

  const toggleMenu = (e: React.MouseEvent, menuId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveMenuId(activeMenuId === menuId ? null : menuId);
  };

  const goToArtist = (e: React.MouseEvent) => {
    e.preventDefault();
    if (artistId) {
      navigate(`/artists/${artistId}`);
    }
  };

  const handleAddToPlaylistClick = () => {
    if (song?.id) {
      setCurrentSongId(song.id);
      setShowModal(true);
    }
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

  const handleGoToAlbum = () => {
    if (album) {
      navigate(`/album/${album.id}`);
    } else {
      console.log("No album found for this song");
    }
  };

  const handleShare = () => {
    // For now, just log. You can implement share functionality later
    console.log("Share clicked");
  };

  // Wrapper functions for OptionsMenu that don't expect parameters
  const handleAddToPlaylistWrapper = () => {
    handleAddToPlaylistClick();
  };

  const handleGoToArtistWrapper = () => {
    if (artistId) {
      navigate(`/artists/${artistId}`);
    }
  };

  const handleGoToAlbumWrapper = () => {
    handleGoToAlbum();
  };

  return (
    <>
      <SidebarHeader />
      <main className="page__home">
        <TopHeader />
        {loading ? (
          <div className="container">
            <p className="loading">Loading song data...</p>
          </div>
        ) : error || !song || !artist ? (
          <div className="container">
            <p className="error">{error || "Song or artist not found"}</p>
          </div>
        ) : (
          <div className="music-player__wrapper">
            <div className="music-player-track-page">
              <div className="music-player__header">
                <figure className="music-player__figure">
                  <img src={song.song_cover} alt={song.song_cover} />
                </figure>
                <div className="music-player__header-meta">
                  <p className="music-player__header-title">{song.title}</p>
                  <div className="music-player__header-meta-more">
                    <h2 className="music-player__header-artist">
                      {artist.artist_name}
                    </h2>
                    <div className="music-player__header-wrapper">
                      {album && (
                        <p className="music-player__album">{album.title}</p>
                      )}
                      <p className="music-player__duration">{duration}</p>.
                      <p className="music-player__released-year">2023</p>.
                      <p className="music-player__played-data">0</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="music-player__audio-container">
                <CustomAudioPlayer
                  src={song.file_path}
                  title={song.title}
                  artist={artist.artist_name}
                  autoPlay={false}
                  onPlay={handleSongPlay}
                  songId={song.id}
                />
              </div>

              <div className="music-player__music-meta">
                <div className="music-player__music-meta__header">
                  <button className="btn music-play--btn" type="button">
                    <img src="/images/play-button.svg" alt="play-button" />
                  </button>
                  <div className="music-player__add-to-fav">
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handleAddToPlaylistClick();
                      }}
                    >
                      <img
                        src="/images/add-plus.svg"
                        alt="add-to-fav"
                        title="add to playlist"
                      />
                    </a>
                  </div>
                  <div className="music-player__options" title="more options">
                    <a href="#" onClick={(e) => toggleMenu(e, "main")}>
                      <img src="/images/options-icon.svg" alt="options" />
                    </a>

                    {activeMenuId === "main" && (
                      <OptionsMenu
                        onAddToPlaylist={handleAddToPlaylistWrapper}
                        onGoToArtist={handleGoToArtistWrapper}
                        onGoToAlbum={handleGoToAlbumWrapper}
                        onShare={handleShare}
                      />
                    )}
                  </div>
                </div>
                <div className="music-player-meta__lyrics">
                  <h2 className="music-player-meta__lyrics-title">Lyrics</h2>
                  <p className="music-player-meta__lyrics-text">
                    Lyrics for '{song.title}' will be displayed here when
                    available.
                  </p>
                </div>
              </div>
            </div>

            <div className="music-player-sideplayer">
              <div className="sideplayer__music-card">
                <div className="music-card__header">
                  <h3 className="music-card__title">{song.title}</h3>
                  <div className="sideplayer__options" title="more options">
                    <a href="#" onClick={(e) => toggleMenu(e, "side")}>
                      <img src="/images/options-icon.svg" alt="options" />
                    </a>

                    {activeMenuId === "side" && (
                      <OptionsMenu
                        onAddToPlaylist={handleAddToPlaylistWrapper}
                        onGoToArtist={handleGoToArtistWrapper}
                        onGoToAlbum={handleGoToAlbumWrapper}
                        onShare={handleShare}
                      />
                    )}
                  </div>
                </div>
                <figure className="music-card__media">
                  <img src={artist.artist_image} alt={`${song.title} cover`} />
                </figure>
                <div className="music-card__meta">
                  <div className="music-card__meta-header">
                    <h2 className="music-card__meta-title">{song.title}</h2>
                    <p className="music-card__meta-artist">
                      {artist.artist_name}
                    </p>
                    {album && (
                      <p className="music-card__meta-album">{album.title}</p>
                    )}
                  </div>
                  <div className="music-player__add-to-fav">
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handleAddToPlaylistClick();
                      }}
                    >
                      <img
                        src="/images/add-plus.svg"
                        alt="add-to-fav"
                        title="add to liked songs"
                      />
                    </a>
                  </div>
                </div>
              </div>
              <div className="sideplayer__artist-card">
                <h3>More by {artist.artist_name}</h3>
                <p>{artist.song_count} songs available</p>
              </div>
            </div>
          </div>
        )}
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

export default MusicPlayer;
