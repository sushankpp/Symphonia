import { useRecommendation } from "../../../contexts/RecommendationContext";
import { Play, Plus } from "lucide-react";
import { formatTime, getAudioDuration, convertStorageUrl } from "../../../utils/audioDuration.tsx";
import { useState, useEffect } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const Trending = () => {
  const { topRecommendations, recordPlay } = useRecommendation();
  const { isAuthenticated } = useAuth();
  const [durations, setDurations] = useState<Record<number, string>>({});
  const navigate = useNavigate();
  const apiURL = import.meta.env.VITE_API_URL;

  const handlePlay = async () => {
    if (topRecommendations.length > 0) {
      const song = topRecommendations[0];
      
      await recordPlay(song.song.id);
      // Navigate to music player
      const artistId = typeof song.song.artist === 'object' ? song.song.artist?.id : 0;
      const targetUrl = `/player/${artistId || 0}/${song.song.id}`;
      navigate(targetUrl);
    }
  };

  const handleAddToPlaylist = () => {
    // TODO: Implement add to playlist functionality
    console.log("Add to playlist clicked");
  };

  // Get the top recommendation (highest similarity score)
  const topSong = topRecommendations.length > 0 
    ? topRecommendations.reduce((prev, current) => 
        (current.similarity_score > prev.similarity_score) ? current : prev
      ) 
    : null;

  // Debug logging
  console.log("Trending - topRecommendations:", topRecommendations);
  console.log("Trending - topSong:", topSong);

  // Calculate duration for top song if needed
  useEffect(() => {
    if (topSong && !durations[topSong.song.id] && (topSong.song.file_path || topSong.song.audio_url)) {
      const audioUrl = convertStorageUrl(topSong.song.file_path || topSong.song.audio_url, apiURL);
      getAudioDuration(audioUrl).then(duration => {
        if (duration > 0) {
          setDurations(prev => ({
            ...prev,
            [topSong.song.id]: formatTime(duration)
          }));
        }
      }).catch(error => {
        console.error(`Error calculating duration for ${topSong.song.title}:`, error);
      });
    }
  }, [topSong, durations, apiURL]);

  if (!isAuthenticated) {
    return (
      <section className="trending">
        <div className="trending-wrapper">
          <div className="trending-content">
            <p className="trending-status">Trending Now</p>
            <h2 className="trending-title">Popular Songs</h2>
            <div className="trending-artist">Discover what's trending</div>
            <div className="trending-play">
              <button className="trending-play__song btn" disabled>
                Login to see personalized recommendations
              </button>
              <button className="trending-add__song btn" disabled>
                <Plus size={16} />
              </button>
            </div>
          </div>
          <figure className="trending-media">
            <span className="trending-media__item">
              <img
                src="/uploads/pig-nobg.png"
                alt="trending songs"
              />
            </span>
          </figure>
        </div>
      </section>
    );
  }

  if (!topSong) {
    return (
      <section className="trending">
        <div className="trending-wrapper">
          <div className="trending-content">
            <p className="trending-status">Loading Recommendations</p>
            <h2 className="trending-title">Finding your perfect match</h2>
            <div className="trending-artist">Based on your listening history</div>
            <div className="trending-play">
              <button className="trending-play__song btn" disabled>
                Loading...
              </button>
              <button className="trending-add__song btn" disabled>
                <Plus size={16} />
              </button>
            </div>
          </div>
          <figure className="trending-media">
            <span className="trending-media__item">
              <img
                src="/uploads/pig-nobg.png"
                alt="loading recommendations"
              />
            </span>
          </figure>
        </div>
      </section>
    );
  }

  return (
    <section className="trending">
      <div className="trending-wrapper">
        <div className="trending-content">
          <p className="trending-status">Top Recommendation</p>
          <h2 className="trending-title">{topSong.song.title}</h2>
          <div className="trending-artist">
            {typeof topSong.song.artist === 'string' 
              ? topSong.song.artist 
              : topSong.song.artist?.artist_name || 'Unknown Artist'}
          </div>
          <div className="trending-details">
            {topSong.song.genre && (
              <span className="trending-genre">{topSong.song.genre}</span>
            )}
            {topSong.song.released_date && (
              <span className="trending-year">
                {new Date(topSong.song.released_date).getFullYear()}
              </span>
            )}
            <span className="trending-duration">{durations[topSong.song.id] || topSong.song.duration || '--:--'}</span>
          </div>
          <div className="trending-similarity">
            {Math.round(topSong.similarity_score * 100)}% Match
          </div>
          <div className="trending-play">
            <button
              className="trending-play__song btn"
              onClick={handlePlay}
              style={{ cursor: 'pointer' }}
              title="Play this song"
            >
              Play Now{" "}
              <Play size={16} />
            </button>
            <button 
              className="trending-add__song btn" 
              onClick={handleAddToPlaylist}
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
        <figure className="trending-media">
          <span className="trending-media__item">
            <img
              src={convertStorageUrl(topSong.song.song_cover_path || topSong.song.cover_image || "", apiURL) || "/uploads/pig-nobg.png"}
              alt={`${typeof topSong.song.artist === 'string' 
                ? topSong.song.artist 
                : topSong.song.artist?.artist_name || 'Unknown Artist'} - ${topSong.song.title}`}
              onError={(e) => {
                e.currentTarget.src = "/uploads/pig-nobg.png";
              }}
            />
          </span>
        </figure>
      </div>
    </section>
  );
};

export default Trending;
