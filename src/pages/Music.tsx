import React, { useEffect, useState } from "react";
import SidebarHeader from "../components/ui/headers/SidebarHeader";
import TopHeader from "../components/ui/headers/TopHeader";
import SongsList from "../components/ui/layouts/SongsList";
import { useRecommendation } from "../contexts/RecommendationContext";
import { convertStorageUrl, getAudioDuration, formatTime } from "../utils/audioDuration";
import { useNavigate } from "react-router-dom";
import { Star, Play } from "lucide-react";

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
  album_id?: number;
  genre?: string;
  description?: string;
  views?: number;
  released_date?: string;
};

function Music() {
  const navigate = useNavigate();
  const { recommendations, recordPlay, testAuthentication } = useRecommendation();
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [songDurations, setSongDurations] = useState<{ [key: number]: string }>({});
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);
  const apiURL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetch(`${apiURL}/api/artists`)
      .then((res) => res.json())
      .then((artists: Artist[]) => {
        const promises = artists.map((artist) =>
          fetch(`${apiURL}/api/artists/${artist.id}/songs`)
            .then((res) => res.json())
            .then((data) => {
              const artistSongs = (data.songs || []).map((songData: any) => {
                const song = songData.song || songData;
                const mappedSong = {
                  ...song,
                  artist_name: artist.artist_name,
                  artist_id: artist.id,
                  released_date: song.release_date,
                };
                return mappedSong;
              });
              return artistSongs;
            })
            .catch((error) => {
              console.error(
                `Error fetching songs for artist ${artist.id}:`,
                error
              );
              return [];
            })
        );

        return Promise.all(promises);
      })
      .then((allSongsArrays) => {
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

  const handleSongClick = async (songId: number) => {
    const song = songs.find((s) => s.id === songId);
    if (song && song.artist_id) {
      navigate(`/player/${song.artist_id}/${songId}`);
    }
  };

  const handleRecommendationClick = async (songId: number) => {
    await recordPlay(songId);
    // Navigate to player if we have artist info
    const recommendation = recommendations.find(r => r.song.id === songId);
    if (recommendation) {
      const artistId = typeof recommendation.song.artist === 'object' && recommendation.song.artist !== null
        ? (recommendation.song.artist as any)?.id 
        : 0;
      navigate(`/player/${artistId || 0}/${songId}`);
    }
  };

  useEffect(() => {
    if (songs.length > 0) {
      songs.forEach((song) => {
        const convertedUrl = convertStorageUrl(
          song.file_path,
          import.meta.env.VITE_API_URL
        );
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
          
          {/* Temporary Debug Button */}
          <div style={{ margin: '10px', padding: '10px', background: '#f0f0f0', borderRadius: '5px' }}>
            <button 
              onClick={testAuthentication}
              style={{ 
                padding: '8px 16px', 
                background: '#007bff', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              🔍 Test Authentication
            </button>
            <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#666' }}>
              Click to debug authentication issues
            </p>
          </div>
          
          {/* Recommendations Section */}
          {recommendations.length > 0 && (
            <section className="music-recommendations">
              <div className="music-recommendations__header">
                <h2 className="music-recommendations__title">
                  <Star size={20} />
                  Recommended for You
                </h2>
                <p className="music-recommendations__subtitle">
                  Based on your listening history
                </p>
              </div>
              <div className="music-recommendations__grid">
                {recommendations.slice(0, 6).map((recommendation) => (
                  <div key={recommendation.song.id} className="music-recommendation-card">
                    <div className="music-recommendation-card__image">
                      <img 
                        src={convertStorageUrl((recommendation.song as any).song_cover_path || recommendation.song.cover_image || "", apiURL) || "/uploads/pig.png"} 
                        alt={`${typeof recommendation.song.artist === 'string' 
                          ? recommendation.song.artist 
                          : (recommendation.song.artist as any)?.artist_name || 'Unknown Artist'} - ${recommendation.song.title}`}
                        onError={(e) => {
                          e.currentTarget.src = "/uploads/pig.png";
                        }}
                      />
                      <button 
                        className="music-recommendation-card__play"
                        onClick={() => handleRecommendationClick(recommendation.song.id)}
                      >
                        <Play size={16} />
                      </button>
                    </div>
                    <div className="music-recommendation-card__content">
                      <h3 className="music-recommendation-card__title">
                        {recommendation.song.title}
                      </h3>
                      <p className="music-recommendation-card__artist">
                        {typeof recommendation.song.artist === 'string' 
                          ? recommendation.song.artist 
                          : (recommendation.song.artist as any)?.artist_name || 'Unknown Artist'}
                      </p>
                      <div className="music-recommendation-card__meta">
                        <span className="music-recommendation-card__similarity">
                          {Math.round(recommendation.similarity_score * 100)}% match
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* All Songs Section */}
          <section className="music-all-songs">
            <div className="music-all-songs__header">
              <h2 className="music-all-songs__title">All Songs</h2>
            </div>
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
                    songs={songs.map((song) => {
                      const mappedSong = {
                        id: song.id,
                        title: song.title,
                        duration: songDurations[song.id] || "--:--",
                        song_cover: song.song_cover
                          ? convertStorageUrl(
                              song.song_cover,
                              import.meta.env.VITE_API_URL
                            )
                          : "",
                        artist_name: song.artist_name || "Unknown Artist",
                        artist_id: song.artist_id,
                        album_id: song.album_id,
                        genre: song.genre,
                        description: song.description,
                        views: song.views,
                        released_date: song.released_date,
                      };
                      return mappedSong;
                    })}
                    activeMenuId={activeMenuId}
                    onSongClick={handleSongClick}
                  />
                ) : (
                  <p className="info">No songs available</p>
                )}
              </div>
            )}
          </section>
        </div>
      </main>
    </>
  );
}

export default Music;
