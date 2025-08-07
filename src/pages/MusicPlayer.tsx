import SidebarHeader from "../components/ui/headers/SidebarHeader.tsx";
import TopHeader from "../components/ui/headers/TopHeader.tsx";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import CustomAudioPlayer from "../components/ui/cards/CustomAudioPlayer.tsx";
import { addToRecentlyPlayed } from "../utils/recentlyPlayed.tsx";
import OptionsMenu from "../components/ui/menus/OptionsMenu.tsx";
import AddToPlaylistModal from "../utils/addToPlaylist.tsx";
import RatingPopup from "../components/ui/menus/RatingPopup.tsx";
import { convertStorageUrl } from "../utils/audioDuration.tsx";
import { sendRating } from "../utils/sendRating";
import { getRating } from "../utils/getRating";
import { playSong } from "../utils/playSong";
import { authService } from "../services/authService";

type Song = {
  id: number;
  title: string;
  song_cover: string;
  file_path: string;
  artist_id?: number;
  album_id?: number;
  genre?: string;
  description?: string;
  views?: number;
  released_date?: string;
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
  const [showRatingPopup, setShowRatingPopup] = useState(false);
  const [ratingType, setRatingType] = useState<"artist" | "song">("song");
  const [songRating, setSongRating] = useState(0);
  const [artistRating, setArtistRating] = useState(0);
  const navigate = useNavigate();

  const apiURL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (!artistId || !songId) {
      setError("Invalid song or artist ID");
      setLoading(false);
      return;
    }

    // Reset ratings when song/artist changes
    setSongRating(0);
    setArtistRating(0);

    const fetchData = async () => {
      try {
        const artistResponse = await fetch(
          `${apiURL}/api/artists/${artistId}/songs`
        );
        if (!artistResponse.ok) throw new Error("Failed to fetch artist data");
        const artistData = await artistResponse.json();

        setArtist(artistData.artist);
        const foundSong = artistData.songs.find((songData: any) => {
          const song = songData.song || songData;
          return song.id === parseInt(songId);
        });

        if (foundSong) {
          const song = foundSong.song || foundSong;
          setSong({
            ...song,
            released_date: song.release_date,
          });

          const audioUrl = convertStorageUrl(song.file_path, apiURL);
          const audio = new Audio(audioUrl);
          audio.addEventListener("loadedmetadata", () => {
            const minutes = Math.floor(audio.duration / 60);
            const seconds = Math.floor(audio.duration % 60);
            setDuration(`${minutes}:${seconds < 10 ? "0" : ""}${seconds}`);
          });

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

  // Fetch current ratings for this song and artist
  useEffect(() => {
    const fetchRatings = async () => {
      if (!artistId || !songId) return;

      try {
        // Fetch song rating
        const songRatingValue = await getRating({
          rateableId: parseInt(songId),
          rateableType: "song",
        });
        setSongRating(songRatingValue);

        // Fetch artist rating
        const artistRatingValue = await getRating({
          rateableId: parseInt(artistId),
          rateableType: "artist",
        });
        setArtistRating(artistRatingValue);
      } catch (error) {
        console.error("Error fetching ratings:", error);
      }
    };

    // Fetch ratings after a short delay to ensure data is loaded
    const timer = setTimeout(fetchRatings, 1000);
    return () => clearTimeout(timer);
  }, [artistId, songId]);

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
        // Call the play song API to increment views
        await playSong(song.id);
        console.log("Song views incremented", song.title);

        // Add to recently played
        await addToRecentlyPlayed(song.id);
        console.log("Song added to recently played", song.title);
      } catch (error) {
        console.error("Error handling song play:", error);
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
      // Get authentication headers
      const authHeaders = authService.getAuthHeaders();
      
      const response = await fetch(`${apiURL}/api/playlists`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
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

  const handleRate = (type: "artist" | "song") => {
    setRatingType(type);
    setShowRatingPopup(true);
  };

  const handleRatingSubmit = async (rating: number) => {
    try {
      const rateableId = ratingType === "artist" ? artistId : songId;

      await sendRating({
        rateableId: parseInt(rateableId || "0"),
        rateableType: ratingType,
        rating: rating,
      });

      console.log(`${ratingType} rated successfully:`, rating);
      if (ratingType === "song") {
        setSongRating(rating);
      } else {
        setArtistRating(rating);
      }
    } catch (error) {
      console.error("Error submitting rating:", error);
    }
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

  const handleRateSongWrapper = () => {
    handleRate("song");
  };

  const handleRateArtistWrapper = () => {
    handleRate("artist");
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
                  <img
                    src={convertStorageUrl(song.song_cover, apiURL)}
                    alt={song.song_cover}
                  />
                </figure>
                <div className="music-player__header-meta">
                  <p className="music-player__header-title">{song.title}</p>
                  <div className="music-player__header-meta-more">
                    <h2 className="music-player__header-artist">
                      {typeof artist.artist_name === 'string' 
                        ? artist.artist_name 
                        : JSON.stringify(artist.artist_name)}
                    </h2>
                    <div className="music-player__header-wrapper">
                      {album && (
                        <p className="music-player__album">{album.title}</p>
                      )}
                      <p className="music-player__duration">{duration}</p>
                      {song.released_date && (
                        <p className="music-player__released-year">
                          {new Date(song.released_date).getFullYear()}
                        </p>
                      )}
                      {song.views !== undefined && (
                        <p className="music-player__played-data">
                          {song.views} plays
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="music-player__audio-container">
                <CustomAudioPlayer
                  src={convertStorageUrl(song.file_path, apiURL)}
                  title={song.title}
                  artist={typeof artist.artist_name === 'string' 
                    ? artist.artist_name 
                    : JSON.stringify(artist.artist_name)}
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
                        onRate={handleRateSongWrapper}
                        showRateOption={true}
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
                        onRate={handleRateSongWrapper}
                        showRateOption={true}
                      />
                    )}
                  </div>
                </div>
                <figure className="music-card__media">
                  <img
                    src={convertStorageUrl(artist.artist_image, apiURL)}
                    alt={`${song.title} cover`}
                  />
                </figure>
                <div className="music-card__meta">
                  <div className="music-card__meta-header">
                    <h2 className="music-card__meta-title">{song.title}</h2>
                    <p className="music-card__meta-artist">
                      {typeof artist.artist_name === 'string' 
                        ? artist.artist_name 
                        : JSON.stringify(artist.artist_name)}
                    </p>
                    {album && (
                      <p className="music-card__meta-album">{album.title}</p>
                    )}
                    <div className="music-card__meta-details">
                      {song.genre && (
                        <span className="music-card__meta-genre">
                          {song.genre}
                        </span>
                      )}
                      {song.views !== undefined && (
                        <span className="music-card__meta-views">
                          {song.views} views
                        </span>
                      )}
                      {song.released_date && (
                        <span className="music-card__meta-released">
                          Released:{" "}
                          {new Date(song.released_date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
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
                <h3>More by {typeof artist.artist_name === 'string' 
                  ? artist.artist_name 
                  : JSON.stringify(artist.artist_name)}</h3>
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
      <RatingPopup
        isOpen={showRatingPopup}
        onClose={() => setShowRatingPopup(false)}
        onRate={handleRatingSubmit}
        title={
          ratingType === "artist"
            ? (typeof artist?.artist_name === 'string' 
                ? artist.artist_name 
                : JSON.stringify(artist?.artist_name)) || ""
            : song?.title || ""
        }
                    currentRating={ratingType === "song" ? songRating : artistRating}
        type={ratingType}
        rateableId={ratingType === "artist" ? parseInt(artistId || "0") : parseInt(songId || "0")}
      />
    </>
  );
}

export default MusicPlayer;
