import CardListings from "../components/ui/cards/CardListings.tsx";
import TopHeader from "../components/ui/headers/TopHeader.tsx";
import SidebarHeader from "../components/ui/headers/SidebarHeader.tsx";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

type Artist = {
  id: number;
  artist_name: string;
  artist_image: string;
  music_count: number;
};

function Artists() {
  const [artists, setArtists] = useState<Artist[]>([]);
  // const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  // const [songs, setSongs] = useState<Song[]>([]);
  const navigate = useNavigate();
  const apiURL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetch(`${apiURL}/api/artists`)
      .then((res) => res.json())
      .then((data) => {
        setArtists(data);
      })
      .catch((error) => console.error(error));
  }, []);

  // const handleArtistClick = (artistId: number) => {
  //     fetch(`${apiURL}/api/artists/${artistId}/songs`)
  //         .then(res => res.json())
  //         .then(data => {
  //             const artist = artists.find(artist => artist.id === artistId) || null;
  //             setSelectedArtist(artist);
  //             setSongs(data);
  //         })
  //         .catch(error => console.error(error));
  // };
  //
  // const handleBackToList = () => {
  //     setSelectedArtist(null);
  //     setSongs([]);
  // };

  const handleArtistClick = (artistId: number) => {
    navigate(`/artists/${artistId}`);
  };

  return (
    <>
      <SidebarHeader />
      <main className="page__home" id="primary">
        <div className="container">
          <TopHeader />
          <CardListings
            artists={artists}
            linkText=""
            title="Artists"
            style={{ fontSize: "1.3rem" }}
            onArtistClick={handleArtistClick}
          />
        </div>
      </main>
    </>
  );
}

export default Artists;
