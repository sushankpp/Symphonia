import CustomAudioPlayer from "./CustomAudioPlayer";
import { useRecommendation } from "../../../contexts/RecommendationContext";
import { Play, Pause } from "lucide-react";
import {
  formatTime,
  getAudioDuration,
  convertStorageUrl,
  getAudioUrlFromSong,
} from "../../../utils/audioDuration";
import { useState, useEffect } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { RatingDisplay } from "../rating";

type MusicPlayerProps = {
  src: string;
};

const MusicPlayer = ({ src }: MusicPlayerProps) => {
  const { recommendations, topRecommendations, allSongs, recordPlay } = useRecommendation();
  const { isAuthenticated } = useAuth();
  

  const [durations, setDurations] = useState<Record<number, string>>({});
  const [currentSong, setCurrentSong] = useState<any>(null);
  const [currentArtist, setCurrentArtist] = useState<any>(null);
  const [playingSongId, setPlayingSongId] = useState<number | null>(null);
  const navigate = useNavigate();
  const apiURL = import.meta.env.VITE_API_URL;

  const handleSuggestedPlay = async (songId: number) => {
    await recordPlay(songId);
    // Look in recommendations, topRecommendations, and allSongs
    const recommendation = recommendations.find((r) => r.song.id === songId) || 
                          topRecommendations.find((r) => r.song.id === songId);
    const songFromAllSongs = allSongs.find((song) => song.id === songId);
    
    if (recommendation) {
      setCurrentSong(recommendation.song);
      setCurrentArtist(recommendation.song.artist);
      setPlayingSongId(songId);
      
    } else if (songFromAllSongs) {
      setCurrentSong(songFromAllSongs);
      setCurrentArtist(songFromAllSongs.artist);
      setPlayingSongId(songId);
      
    }
  };

  useEffect(() => {
    const songsToProcess = topRecommendations.length > 0 
      ? topRecommendations.slice(0, 3) 
      : allSongs.slice(0, 3).map(song => ({ song, similarity_score: 0 }));
    
    songsToProcess.forEach((recommendation) => {
      if (!durations[recommendation.song.id] && (recommendation.song.audio_url || recommendation.song.file_path)) {
        const audioUrl = getAudioUrlFromSong(recommendation.song, apiURL);
        if (audioUrl && audioUrl.trim() !== "") {
          getAudioDuration(audioUrl)
            .then((duration) => {
              if (duration > 0) {
                setDurations((prev) => ({
                  ...prev,
                  [recommendation.song.id]: formatTime(duration),
                }));
              }
            })
            .catch((error) => {
              console.error(
                `Error calculating duration for ${recommendation.song.title}:`,
                error
              );
            });
        }
      }
    });
  }, [topRecommendations, allSongs, durations, apiURL]);

  return (
    <section className="music-player">
      <h2 className="music-player__title">
        <svg className="icon icon-playlist">
          <use xlinkHref="#icon-playlist"></use>
        </svg>
        {currentSong ? "Now Playing" : "Music Player"}
      </h2>

      {currentSong ? (
        <>
          <figure className="music-player__media">
            <img
              src={convertStorageUrl((currentSong as any).song_cover_path || currentSong.cover_image || "/uploads/pig.png", apiURL)}
              alt={`${currentSong.title} cover`}
              onError={(e) => {
                e.currentTarget.src = "/uploads/pig.png";
              }}
            />
          </figure>
          <div className="music-player__meta">
            <h3 className="music-player__meta-title">{currentSong.title}</h3>
            <p className="music-player__meta-description">
              {typeof currentArtist === "string"
                ? currentArtist
                : currentArtist?.artist_name || "Unknown Artist"}
            </p>
            <div className="music-player__rating">
              <RatingDisplay 
                itemId={currentSong.id} 
                itemType="song" 
                showDistribution={false}
                compact={true}
              />
            </div>
          </div>
          {(currentSong.audio_url || currentSong.file_path) && (
            <CustomAudioPlayer
              src={getAudioUrlFromSong(currentSong, apiURL)}
            />
          )}
        </>
      ) : (
        <div className="music-player__idle-state">
          <figure className="music-player__media music-player__idle-media">
            <img
              src="/uploads/pig-nobg.png"
              alt="Music player idle"
              className="idle-image"
            />
            <div className="idle-overlay">
              <div className="idle-icon">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polygon points="5,3 19,12 5,21 5,3"></polygon>
                </svg>
              </div>
            </div>
          </figure>
          <div className="music-player__meta">
            <h3 className="music-player__meta-title">Ready to Play</h3>
            <p className="music-player__meta-description">
              Select a song from the recommendations below or browse your music
              library
            </p>
            <div className="music-player__idle-actions">
              <button
                className="music-player__idle-btn"
                onClick={() => navigate("/music")}
              >
                Browse Music
              </button>
              <button
                className="music-player__idle-btn secondary"
                onClick={() => navigate("/artists")}
              >
                Discover Artists
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="music-player__suggested">
        <h3 className="music-player__suggested-title">
          {isAuthenticated 
            ? (topRecommendations.length > 0 ? "Recommended for You" : "All Songs") 
            : (topRecommendations.length > 0 ? "Popular Songs" : "All Songs")
          }
        </h3>
        {(() => {
          // Use topRecommendations for both authenticated and unauthenticated users
          // Fallback to allSongs if topRecommendations is empty
          const suggestionsToShow = topRecommendations.length > 0 
            ? topRecommendations.slice(0, 3) 
            : allSongs.slice(0, 3).map(song => ({ song, similarity_score: 0 }));
          
          if (suggestionsToShow.length === 0) {
            return (
              <div className="music-player__suggested-empty">
                <div className="empty-state-icon">
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <polygon points="10,8 16,12 10,16 10,8"></polygon>
                  </svg>
                </div>
                <p>No recommendations available at the moment</p>
                <button
                  className="music-player__suggested-browse-btn"
                  onClick={() => navigate("/music")}
                >
                  Browse Music
                </button>
              </div>
            );
          }
          
          return suggestionsToShow.map((recommendation) => (
            <div
              key={recommendation.song.id}
              className={`music-player__suggested-item ${playingSongId === recommendation.song.id ? "playing" : ""}`}
              onClick={() => handleSuggestedPlay(recommendation.song.id)}
              style={{ cursor: "pointer" }}
            >
              <div className="music-player__suggested-banner">
                <figure className="music-player__suggested-media">
                  <img
                    src={
                      convertStorageUrl(
                        (recommendation.song as any).song_cover_path || 
                        recommendation.song.cover_image || 
                        "",
                        apiURL
                      ) || "/uploads/pig.png"
                    }
                    alt={`${typeof recommendation.song.artist === 'string' 
                      ? recommendation.song.artist 
                      : (recommendation.song.artist as any)?.artist_name || 'Unknown Artist'} - ${recommendation.song.title}`}
                    onError={(e) => {
                      e.currentTarget.src = "/uploads/pig.png";
                    }}
                  />
                </figure>
                <div className="music-player__suggested-meta">
                  <div className="meta-header">
                    <h3 className="music-player__suggested-meta-title">
                      {recommendation.song.title}
                    </h3>
                    <p className="music-player__suggested-meta-description">
                      {typeof recommendation.song.artist === 'string' 
                        ? recommendation.song.artist 
                        : (recommendation.song.artist as any)?.artist_name || 'Unknown Artist'}
                    </p>
                    <div className="music-player__suggested-details">
                      {recommendation.song.genre && (
                        <span className="music-player__suggested-genre">
                          {recommendation.song.genre}
                        </span>
                      )}
                      {recommendation.song.release_date && (
                        <span className="music-player__suggested-year">
                          {new Date(
                            recommendation.song.release_date
                          ).getFullYear()}
                        </span>
                      )}
                      {recommendation.similarity_score && (
                        <span className="music-player__suggested-similarity">
                          {Math.round(recommendation.similarity_score * 100)}%
                          match
                        </span>
                      )}
                    </div>
                    <div className="music-player__suggested-rating">
                      <RatingDisplay 
                        itemId={recommendation.song.id} 
                        itemType="song" 
                        showDistribution={false}
                        compact={true}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="music-player__suggested-controls">
                <button
                  className="music-player__suggested-play"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSuggestedPlay(recommendation.song.id);
                  }}
                  style={{ cursor: "pointer" }}
                  title={
                    playingSongId === recommendation.song.id
                      ? "Currently playing"
                      : "Play this song"
                  }
                >
                  {playingSongId === recommendation.song.id ? (
                    <Pause size={14} />
                  ) : (
                    <Play size={14} />
                  )}
                </button>
                <p className="timeStamp">
                  {durations[recommendation.song.id] ||
                    formatTime(recommendation.song.duration || 0)}
                </p>
              </div>
            </div>
          ));
        })()}
      </div>
    </section>
  );
};

export default MusicPlayer;
