import SidebarHeader from "../components/ui/headers/SidebarHeader.tsx";
import TopHeader from "../components/ui/headers/TopHeader.tsx";
import ArtistDetails from "../components/ui/layouts/ArtistDetails.tsx";
import SongsList from "../components/ui/layouts/SongsList.tsx";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAudioDuration, formatTime, convertStorageUrl } from "../utils/audioDuration.tsx";

type Artist = {
  id: number;
  artist_image: string;
  artist_name: string;
  song_count: number;
};

type Song = {
  id: number;
  title: string;
  file_path: string;
};

type ArtistWithSongs = {
  artist: Artist;
  songs: Song[];
};

function Music() {
  const navigate = useNavigate();
  const [artistWithSongs, setArtistWithSongs] = useState<ArtistWithSongs[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);
  const [songDurations, setSongDurations] = useState<{ [key: number]: string }>(
    {}
  );

  const apiURL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    setLoading(true);

    fetch(`${apiURL}/api/artists`)
      .then((res) => res.json())
      .then((artists: Artist[]) => {
        const promises = artists.map((artist) =>
          fetch(`${apiURL}/api/artists/${artist.id}/songs`)
            .then((res) => res.json())
            .then((data) => ({
              artist: data.artist,
              songs: data.songs || [],
            }))
            .catch((error) => {
              console.error(
                `Error fetching songs for artist ${artist.id}:`,
                error
              );
              return {
                artist: artist,
                songs: [],
              };
            })
        );

        return Promise.all(promises);
      })
      .then((results) => {
        setArtistWithSongs(results);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching artists:", error);
        setError("Failed to load music data");
        setLoading(false);
      });
  }, []);

  const handleSongClick = (artistId: number, songId: number) => {
    navigate(`/player/${artistId}/${songId}`);
  };

  useEffect(() => {
    if (artistWithSongs.length > 0) {
      artistWithSongs.forEach((item) => {
        item.songs.forEach((currentSong) => {
          const convertedUrl = convertStorageUrl(currentSong.file_path, import.meta.env.VITE_API_URL);
          getAudioDuration(convertedUrl)
            .then((duration) => {
              const formattedDuration = formatTime(duration);
              setSongDurations((prev) => ({
                ...prev,
                [currentSong.id]: formattedDuration,
              }));
            })
            .catch((error) => {
              console.error(
                `Error fetching duration for song ${currentSong.id}:`,
                error
              );
            });
        });
      });
    }
  }, [artistWithSongs]);

  return (
    <>
      <SidebarHeader />
      <main className="page__home" id="primary">
        <div className="container">
          <TopHeader />
          {loading ? (
            <p className="loading">
              Music Data are being loaded. Please wait....
            </p>
          ) : error ? (
            <p className="error-message">{error}</p>
          ) : (
            <div className="music-list__container">
              {artistWithSongs.length > 0 ? (
                artistWithSongs.map((item, index) => (
                  <div className="music-list__wrapper" key={index}>
                    <ArtistDetails
                      artistImage={convertStorageUrl(item.artist.artist_image, import.meta.env.VITE_API_URL)}
                      artistName={item.artist.artist_name}
                      songCount={item.artist.song_count}
                      onPlayAllClick={() =>
                        console.log(
                          `Play all songs for ${item.artist.artist_name}`
                        )
                      }
                    />
                    <SongsList
                      songs={item.songs.map((song) => ({
                        id: song.id,
                        title: song.title,
                        duration: songDurations[song.id] || "--:--",
                      }))}
                      activeMenuId={activeMenuId}
                      onSongClick={(songId) =>
                        handleSongClick(item.artist.id, songId)
                      }
                    />
                  </div>
                ))
              ) : (
                <p className="info">No artists available</p>
              )}
            </div>
          )}
        </div>
      </main>
    </>
  );
}

export default Music;
