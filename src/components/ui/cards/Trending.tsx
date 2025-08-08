import { useRecommendation } from "../../../contexts/RecommendationContext";
import { Play, Plus } from "lucide-react";
import {
  formatTime,
  getAudioDuration,
  convertStorageUrl,
} from "../../../utils/audioDuration.tsx";
import { useState, useEffect } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

const Trending = () => {
  const { topRecommendations, recordPlay } = useRecommendation();
  const { isAuthenticated } = useAuth();
  const [durations, setDurations] = useState<Record<number, string>>({});
  const navigate = useNavigate();
  const apiURL = import.meta.env.VITE_API_URL;

  const handlePlay = async (song: any) => {
    await recordPlay(song.song.id);
    // Navigate to music player
    const artistId =
      typeof song.song.artist === "object" ? song.song.artist?.id : 0;
    const targetUrl = `/player/${artistId || 0}/${song.song.id}`;
    navigate(targetUrl);
  };

  const handleAddToPlaylist = () => {
    // TODO: Implement add to playlist functionality
    console.log("Add to playlist clicked");
  };

  // Get the top recommendation (highest similarity score)
  const topSong =
    topRecommendations.length > 0
      ? topRecommendations.reduce((prev, current) =>
          current.similarity_score > prev.similarity_score ? current : prev
        )
      : null;

  // Debug logging
  console.log("Trending - topRecommendations:", topRecommendations);
  console.log("Trending - topSong:", topSong);

  // Calculate duration for top song if needed
  useEffect(() => {
    if (
      topSong &&
      !durations[topSong.song.id] &&
      (topSong.song.file_path || topSong.song.audio_url)
    ) {
      const audioUrl = convertStorageUrl(
        topSong.song.file_path || topSong.song.audio_url,
        apiURL
      );
      getAudioDuration(audioUrl)
        .then((duration) => {
          if (duration > 0) {
            setDurations((prev) => ({
              ...prev,
              [topSong.song.id]: formatTime(duration),
            }));
          }
        })
        .catch((error) => {
          console.error(
            `Error calculating duration for ${topSong.song.title}:`,
            error
          );
        });
    }
  }, [topSong, durations, apiURL]);

  if (!isAuthenticated && !topSong) {
    return (
      <section className="trending">
        <div className="trending-wrapper">
          <div className="trending-content">
            <p className="trending-status">Trending Now</p>
            <h2 className="trending-title">Popular Songs</h2>
            <div className="trending-artist">Discover what's trending</div>
            <div className="trending-play">
              <button className="trending-play__song btn" disabled>
                Loading trending content...
              </button>
              <button className="trending-add__song btn" disabled>
                <Plus size={16} />
              </button>
            </div>
          </div>
          <figure className="trending-media">
            <span className="trending-media__item">
              <img src="/uploads/pig-nobg.png" alt="trending songs" />
            </span>
          </figure>
        </div>
      </section>
    );
  }

  if (!topSong) {
    return (
      <section className="trending-slider">
        <div className="trending-slider__header">
          <h2 className="trending-slider__title">Loading Recommendations</h2>
          <p className="trending-slider__subtitle">
            Finding your perfect match
          </p>
        </div>

        <div className="trending-loading">
          <div
            className="trending-loading__slide"
            style={{
              backgroundImage: `url("/uploads/pig-nobg.png")`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          >
            <div className="trending-loading__content">
              <div className="trending-loading__meta">
                <p className="trending-loading__status">Loading...</p>
                <h3 className="trending-loading__title">
                  Finding your perfect match
                </h3>
                <div className="trending-loading__artist">
                  Based on your listening history
                </div>
              </div>
              <div className="trending-loading__actions">
                <button className="trending-loading__play btn" disabled>
                  Loading...
                </button>
                <button className="trending-loading__add btn" disabled>
                  <Plus size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="trending-slider">
      <div className="trending-slider__header">
        <h2 className="trending-slider__title">
          {isAuthenticated ? "Top Recommendations" : "Trending Now"}
        </h2>
      </div>

      <Swiper
        modules={[Pagination, Autoplay]}
        spaceBetween={20}
        slidesPerView={1}
        pagination={{ clickable: true }}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        loop={true}
        className="trending-swiper"
      >
        {topRecommendations.map((recommendation, index) => (
          <SwiperSlide key={recommendation.song.id}>
            <div
              className="trending-slide"
              style={{
                backgroundImage: `url(${convertStorageUrl(recommendation.song.song_cover_path || recommendation.song.cover_image || "", apiURL) || "/uploads/pig-nobg.png"})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}
            >
              <div className="trending-slide__content">
                <div className="trending-slide__meta">
                  <p className="trending-slide__status">
                    {isAuthenticated
                      ? `Recommendation ${index + 1}`
                      : "Trending"}
                  </p>
                  <h3 className="trending-slide__title">
                    {recommendation.song.title}
                  </h3>
                  <div className="trending-slide__artist">
                    {typeof recommendation.song.artist === "string"
                      ? recommendation.song.artist
                      : recommendation.song.artist?.artist_name ||
                        "Unknown Artist"}
                  </div>
                  <div className="trending-slide__details">
                    {recommendation.song.genre && (
                      <span className="trending-slide__genre">
                        {recommendation.song.genre}
                      </span>
                    )}
                    {recommendation.song.released_date && (
                      <span className="trending-slide__year">
                        {new Date(
                          recommendation.song.released_date
                        ).getFullYear()}
                      </span>
                    )}
                    <span className="trending-slide__duration">
                      {durations[recommendation.song.id] ||
                        recommendation.song.duration ||
                        "--:--"}
                    </span>
                  </div>
                </div>
                <div className="trending-slide__actions">
                  <button
                    className="trending-slide__play btn"
                    onClick={() => handlePlay(recommendation)}
                    style={{ cursor: "pointer" }}
                    title="Play this song"
                  >
                    Play Now <Play size={16} />
                  </button>
                  <button
                    className="trending-slide__add btn"
                    onClick={handleAddToPlaylist}
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};

export default Trending;
