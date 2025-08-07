import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import OptionsMenu from "../menus/OptionsMenu";
import RatingPopup from "../menus/RatingPopup";
import AddToPlaylist from "../../../utils/addToPlaylist";
import { sendRating } from "../../../utils/sendRating";
import { getRating } from "../../../utils/getRating";
import { authService } from "../../../services/authService";

type Song = {
  id: number;
  title: string;
  duration: string;
  song_cover?: string;
  artist_name?: string;
  artist_id?: number;
  album_id?: number;
  genre?: string;
  description?: string;
  views?: number;
  released_date?: string;
};

type SongsListProps = {
  songs: Song[];
  onSongClick: (songId: number) => void;
  activeMenuId: number | null;
  artistName?: string;
  artistImage?: string;
};

const SongsList: React.FC<SongsListProps> = ({
  songs,
  activeMenuId,
  onSongClick,
  artistName,
  artistImage,
}) => {
  const handleSongClick = async (songId: number) => {
    // Just call the original onSongClick handler
    // The playSong API will be called in MusicPlayer when audio starts
    onSongClick(songId);
  };
  const navigate = useNavigate();
  const [showRatingPopup, setShowRatingPopup] = useState(false);
  const [ratingType, setRatingType] = useState<"artist" | "song">("song");
  const [songRatings, setSongRatings] = useState<Record<number, number>>({});
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [showAddToPlaylistModal, setShowAddToPlaylistModal] = useState(false);
  const [selectedSongForPlaylist, setSelectedSongForPlaylist] =
    useState<Song | null>(null);
  const [localActiveMenuId, setLocalActiveMenuId] = useState<number | null>(
    null
  );

  const toggleMenu = (e: React.MouseEvent, songId: number) => {
    e.preventDefault();
    e.stopPropagation();
    setLocalActiveMenuId(localActiveMenuId === songId ? null : songId);
  };

  // Use local state if no activeMenuId is passed from parent
  const currentActiveMenuId =
    activeMenuId !== null ? activeMenuId : localActiveMenuId;

  // Handle clicking outside to close menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement;
      if (!target.closest(".song-card__options")) {
        setLocalActiveMenuId(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleRate = async (song: Song) => {
    setSelectedSong(song);
    setRatingType("song");
    
    // Fetch current rating for this song if not already loaded
    if (!songRatings[song.id]) {
      try {
        const rating = await getRating({
          rateableId: song.id,
          rateableType: "song",
        });
        setSongRatings(prev => ({
          ...prev,
          [song.id]: rating
        }));
      } catch (error) {
        console.error("Error fetching song rating:", error);
        setSongRatings(prev => ({
          ...prev,
          [song.id]: 0
        }));
      }
    }
    
    setShowRatingPopup(true);
  };

  const handleRatingSubmit = async (rating: number) => {
    if (!selectedSong) return;

    try {
      await sendRating({
        rateableId: selectedSong.id,
        rateableType: ratingType,
        rating: rating,
      });

      console.log("Song rated successfully:", rating);
      if (selectedSong) {
        setSongRatings(prev => ({
          ...prev,
          [selectedSong.id]: rating
        }));
      }
    } catch (error) {
      console.error("Error submitting rating:", error);
    }
  };

  const handleAddToPlaylist = (song: Song) => {
    setSelectedSongForPlaylist(song);
    setShowAddToPlaylistModal(true);
  };

  const handleAddToPlaylistSubmit = async (
    playlistId: number,
    songId: number
  ) => {
    try {
      const apiURL = import.meta.env.VITE_API_URL;
      // Get authentication headers
      const authHeaders = authService.getAuthHeaders();
      
      const response = await fetch(
        `${apiURL}/api/playlists/${playlistId}/songs`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...authHeaders,
          },
          body: JSON.stringify({ song_id: songId }),
        }
      );

      if (response.ok) {
        console.log("Song added to playlist successfully");
        setShowAddToPlaylistModal(false);
      } else {
        console.error("Failed to add song to playlist");
      }
    } catch (error) {
      console.error("Error adding song to playlist:", error);
    }
  };

  const handleCreatePlaylist = async (playlistName: string, songId: number) => {
    try {
      const apiURL = import.meta.env.VITE_API_URL;
      // Get authentication headers
      const authHeaders = authService.getAuthHeaders();
      
      const response = await fetch(`${apiURL}/api/playlists`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
        body: JSON.stringify({
          playlist_name: playlistName,
          song_id: songId,
        }),
      });

      if (response.ok) {
        console.log("Playlist created and song added successfully");
        setShowAddToPlaylistModal(false);
      } else {
        console.error("Failed to create playlist");
      }
    } catch (error) {
      console.error("Error creating playlist:", error);
    }
  };

  const handleGoToArtist = (song: Song) => {
    if (song.artist_id) {
      navigate(`/artists/${song.artist_id}`);
    }
  };

  const handleGoToAlbum = (song: Song) => {
    if (song.album_id) {
      navigate(`/album/${song.album_id}`);
    }
  };

  const handleShare = (song: Song) => {
    // Share functionality - you can implement this based on your needs
    console.log("Share song:", song.title);
  };

  return (
    <div className="songs-list">
      <div className="songs-list__header">
        <h2 className="songs-list__title">Songs</h2>
        <p className="songs-list__count">{songs.length} Songs</p>
        {artistName && (
          <div className="songs-list__artist-info">
            <div className="artist-info__image">
              <img src={artistImage} alt={artistName} />
            </div>
            <span className="artist-info__name">{artistName}</span>
          </div>
        )}
      </div>

      <div className="songs-list__container">
        {songs.length > 0 ? (
          songs.map((song) => (
            <div className="song-card" key={song.id}>
              <div className="song-card__media">
                <img
                  src={
                    song.song_cover ||
                    artistImage ||
                    "/images/default-cover.jpg"
                  }
                  alt={`${song.title} cover`}
                  className="song-card__cover"
                />
                <button
                  className="song-card__play-btn"
                  onClick={() => handleSongClick(song.id)}
                  title="Play song"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </button>
              </div>

              <div className="song-card__content">
                <div className="song-card__info">
                  <h3
                    className="song-card__title"
                    onClick={() => handleSongClick(song.id)}
                  >
                    {song.title}
                  </h3>
                  {song.artist_name && (
                    <p className="song-card__artist">
                      {typeof song.artist_name === 'string' 
                        ? song.artist_name 
                        : JSON.stringify(song.artist_name)}
                    </p>
                  )}
                  <div className="song-card__meta">
                    <span className="song-card__duration">{song.duration}</span>
                    {song.views !== undefined && (
                      <span className="song-card__views">
                        {song.views} views
                      </span>
                    )}
                    {song.genre && (
                      <span className="song-card__genre">{song.genre}</span>
                    )}
                    {song.released_date && (
                      <span className="song-card__released">
                        Released:{" "}
                        {new Date(song.released_date).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  {song.description && (
                    <p className="song-card__description">{song.description}</p>
                  )}
                </div>

                <div className="song-card__actions">
                  <button
                    className="song-card__action-btn song-card__add-btn"
                    title="Add to playlist"
                    onClick={() => handleAddToPlaylist(song)}
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                    </svg>
                  </button>

                  <button
                    className="song-card__action-btn song-card__rate-btn"
                    onClick={() => handleRate(song)}
                    title="Rate song"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  </button>

                  <div className="song-card__options">
                    <button
                      className="song-card__action-btn song-card__menu-btn"
                      onClick={(e) => toggleMenu(e, song.id)}
                      title="More options"
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                      </svg>
                    </button>

                    {currentActiveMenuId === song.id && (
                      <OptionsMenu
                        onAddToPlaylist={() => handleAddToPlaylist(song)}
                        onGoToArtist={() => handleGoToArtist(song)}
                        onGoToAlbum={() => handleGoToAlbum(song)}
                        onShare={() => handleShare(song)}
                        onRate={() => handleRate(song)}
                        showRateOption={true}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="songs-list__empty">
            <div className="empty-state">
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="empty-state__icon"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
              <p className="empty-state__text">No songs available</p>
            </div>
          </div>
        )}
      </div>

      <RatingPopup
        isOpen={showRatingPopup}
        onClose={() => setShowRatingPopup(false)}
        onRate={handleRatingSubmit}
        title={selectedSong?.title || ""}
                    currentRating={selectedSong ? songRatings[selectedSong.id] || 0 : 0}
        type={ratingType}
        rateableId={selectedSong?.id || 0}
      />

      {showAddToPlaylistModal && selectedSongForPlaylist && (
        <AddToPlaylist
          songId={selectedSongForPlaylist.id}
          onClose={() => setShowAddToPlaylistModal(false)}
          onAddToPlaylist={handleAddToPlaylistSubmit}
          onCreatePlaylist={handleCreatePlaylist}
        />
      )}
    </div>
  );
};

export default SongsList;
