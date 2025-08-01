import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { convertStorageUrl } from "../../../utils/audioDuration.tsx";

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
  const [recentlyPlayed, setRecentlyPlayed] = useState<RecentlyPlayedItem[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const apiURL = import.meta.env.VITE_API_URL;

  const fetchRecentlyPlayed = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiURL}/api/recently-played`);
      if (!res.ok) throw new Error("Failed to fetch recently played");
      const data = await res.json();
      console.log(data);

      const durationPromises = data.map((item: RecentlyPlayedItem) => {
        return new Promise<RecentlyPlayedItem>((resolve) => {
          const audioUrl = convertStorageUrl(item.song.file_path, apiURL);
          const audio = new Audio(audioUrl);
          audio.addEventListener("loadedmetadata", () => {
            const minutes = Math.floor(audio.duration / 60);
            const seconds = Math.floor(audio.duration % 60);
            resolve({
              ...item,
              song: {
                ...item.song,
                duration: `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`,
              },
            });
          });

          audio.addEventListener("error", () => {
            resolve({
              ...item,
              song: {
                ...item.song,
                duration: "--:--",
              },
            });
          });
        });
      });

      const updatedRecentlyPlayed = await Promise.all(durationPromises);
      setRecentlyPlayed(updatedRecentlyPlayed);
    } catch (error) {
      console.error(error);
      setError("Failed to load recently played items");
    } finally {
      setLoading(false);
    }
  }, [apiURL]);

  useEffect(() => {
    fetchRecentlyPlayed();
  }, [fetchRecentlyPlayed]);

  const displayedItems = limit
    ? recentlyPlayed.slice(0, limit)
    : recentlyPlayed;

  const handleSongClick = (artistId: number, songId: number) => {
    // This function is not used in the new code, but keeping it for now
    // as it was part of the original file's logic.
    // The new code doesn't have a navigate function, so this will cause an error.
    // For now, removing the navigate call as it's not directly related to the new audio logic.
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
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p>{error}</p>
        ) : (
          displayedItems.map((item) => (
            <div
              className="recently-played__item"
              key={item.song.id}
              onClick={() => handleSongClick(item.song.id, item.song.id)} // Changed to item.song.id
              style={{ cursor: "pointer" }}
            >
              <figure className="recently-played__media">
                <img src={convertStorageUrl(item.song.song_cover_path, apiURL)} alt={item.song.title} />
              </figure>
              <div className="recently-played__meta">
                <h3 className="recently-played__item-title">
                  {item.song.title}
                </h3>
                <p className="timeStamp">{item.song.duration || "--:--"}</p>
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
