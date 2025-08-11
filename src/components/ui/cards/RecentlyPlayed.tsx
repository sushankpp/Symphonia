import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  convertStorageUrl,
  formatTime,
  getAudioDuration,
} from "../../../utils/audioDuration";
import { useRecommendation } from "../../../contexts/RecommendationContext";
import { useAuth } from "../../../contexts/AuthContext";

const safeRenderText = (content: any): string => {
  if (typeof content === "string") return content;
  if (typeof content === "number") return content.toString();
  if (content === null || content === undefined) return "";
  if (typeof content === "object") {
    console.warn("Attempting to render object as text:", content);
    return JSON.stringify(content);
  }
  return String(content);
};

type Artist = {
  id: number;
  artist_name: string;
  artist_image: string;
};

type Song = {
  id: number;
  title: string;
  file_path: string;
  song_cover_path: string;
  duration?: string;
  artist: Artist;
  artist_id?: number;
  album_id?: number;
  genre?: string;
  description?: string;
  views?: number;
  released_date?: string;
};

type RecentlyPlayedItem = {
  id: number;
  song: Song;
};

type RecentlyPlayedProps = {
  limit?: number;
};

const RecentlyPlayed = ({ limit }: RecentlyPlayedProps) => {
  const navigate = useNavigate();
  const { recentlyPlayed, loadRecentlyPlayed } = useRecommendation();
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [durations, setDurations] = useState<Record<number, string>>({});

  const apiURL = import.meta.env.VITE_API_URL;

  const fetchRecentlyPlayed = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      await loadRecentlyPlayed();
    } catch (error) {
      console.error(error);
      setError("Failed to load recently played items");
    } finally {
      setLoading(false);
    }
  }, [loadRecentlyPlayed, isAuthenticated]);

  useEffect(() => {
    fetchRecentlyPlayed();
  }, [fetchRecentlyPlayed, isAuthenticated]);

  console.log(
    "RecentlyPlayed component - recentlyPlayed data:",
    recentlyPlayed
  );
  console.log(
    "RecentlyPlayed component - recentlyPlayed length:",
    recentlyPlayed.length
  );

  const convertedRecentlyPlayed: RecentlyPlayedItem[] = recentlyPlayed.map(
    (song: any) => {
      let formattedDuration = durations[song.id] || "--:--";

      if (!durations[song.id] && song.duration) {
        formattedDuration = formatTime(song.duration);
      } else if (!durations[song.id] && (song.file_path || song.audio_url)) {
        const audioUrl = convertStorageUrl(
          song.file_path || song.audio_url,
          apiURL
        );
        getAudioDuration(audioUrl)
          .then((duration) => {
            if (duration > 0) {
              setDurations((prev) => ({
                ...prev,
                [song.id]: formatTime(duration),
              }));
            }
          })
          .catch((error) => {
            console.error(
              `Error calculating duration for ${song.title}:`,
              error
            );
          });
      }

      return {
        id: song.id,
        song: {
          id: song.id,
          title: song.title,
          file_path: song.file_path || song.audio_url || "",
          song_cover_path: song.song_cover_path || song.cover_image || "",
          duration: formattedDuration,
          artist: {
            id:
              typeof song.artist === "object"
                ? song.artist?.id || song.artist_id || 0
                : 0,
            artist_name:
              typeof song.artist === "string"
                ? song.artist
                : song.artist?.artist_name || "Unknown Artist",
            artist_image:
              typeof song.artist === "object"
                ? song.artist?.artist_image || song.song_cover_path || ""
                : "",
          },
          artist_id:
            typeof song.artist === "object"
              ? song.artist?.id || song.artist_id
              : song.artist_id,
          album_id: song.album_id,
          genre: song.genre,
          description: song.description,
          views: song.views,
          released_date: song.release_date || song.released_date,
        },
      };
    }
  );

  const displayedItems = limit
    ? convertedRecentlyPlayed.slice(0, limit)
    : convertedRecentlyPlayed;

  const handleSongClick = (artistId: number, songId: number) => {
    navigate(`/player/${artistId}/${songId}`);
  };

  return (
    <section className="recently-played">
      <div className="recently-played__header">
        <h2 className="recently-played__title">Recently Played</h2>
        {limit && (
          <a href="/recent" className="recently-played__link">
            See All
          </a>
        )}
      </div>
      <div className="recently-played__wrapper">
        {!isAuthenticated ? (
          <p>Please log in to view recently played songs</p>
        ) : loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p>{error}</p>
        ) : displayedItems.length === 0 ? (
          <p>No recently played songs</p>
        ) : (
          displayedItems.map((item) => (
            <div
              className="recently-played__item"
              key={item.song.id}
              onClick={() =>
                handleSongClick(item.song.artist?.id || 0, item.song.id)
              }
              style={{ cursor: "pointer" }}
            >
              <figure className="recently-played__media">
                <img
                  src={
                    item.song.song_cover_path
                      ? convertStorageUrl(item.song.song_cover_path, apiURL)
                      : "/uploads/pig.png"
                  }
                  alt={item.song.title}
                  onError={(e) => {
                    e.currentTarget.src = "/uploads/pig.png";
                  }}
                />
              </figure>
              <div className="recently-played__meta">
                <h3 className="recently-played__item-title">
                  {safeRenderText(item.song.title)}
                </h3>
                <p className="recently-played__artist">
                  {safeRenderText(
                    typeof item.song.artist === "string"
                      ? item.song.artist
                      : item.song.artist?.artist_name || "Unknown Artist"
                  )}
                </p>
                <div className="recently-played__details">
                  <span className="recently-played__duration">
                    {safeRenderText(item.song.duration || "--:--")}
                  </span>
                  {item.song.released_date && (
                    <span className="recently-played__year">
                      {safeRenderText(
                        new Date(item.song.released_date).getFullYear()
                      )}
                    </span>
                  )}
                  {item.song.genre && (
                    <span className="recently-played__genre">
                      {safeRenderText(item.song.genre)}
                    </span>
                  )}
                </div>
                <button
                  className="recently-played__music-add"
                  id="add-playlist"
                >
                  <svg className="icon icon-add">
                    <use xlinkHref="#icon-add"></use>
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
};

export default RecentlyPlayed;
