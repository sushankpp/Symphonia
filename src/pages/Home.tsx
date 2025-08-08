import React, { useEffect, useState } from "react";
import SidebarHeader from "../components/ui/headers/SidebarHeader";
import TopHeader from "../components/ui/headers/TopHeader";
import Trending from "../components/ui/cards/Trending";
import CardListings from "../components/ui/cards/CardListings";
import RecentlyPlayed from "../components/ui/cards/RecentlyPlayed";
import MusicPlayer from "../components/ui/cards/MusicPlayer";
import ErrorBoundary from "../components/global/ErrorBoundary";
import { useRecommendation } from "../contexts/RecommendationContext";
import { useNavigate } from "react-router-dom";
import { musicService } from "../services/musicService";
import { useAuth } from "../contexts/AuthContext";
import { authService } from "../services/authService";

type MusicPlayerProps = {
  src: string | null;
};

interface Artist {
  id: number;
  artist_name: string;
  artist_image: string;
  music_count: number;
}

export default function Home({ src }: MusicPlayerProps) {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchTopArtists = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get authentication headers - use empty headers for non-authenticated users
        const authHeaders = isAuthenticated ? authService.getAuthHeaders() : {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        };
        
        // Fetch top artists (personalized if logged in, global if not)
        const topArtistsData = await musicService.getTopArtists(authHeaders);
        
        console.log("Top artists fetched:", topArtistsData);
        
        // Extract artist objects from the response structure
        const extractedArtists = topArtistsData.map((item: any) => {
          // Handle both new structure (with artist property) and old structure
          if (item.artist) {
            return item.artist;
          }
          return item;
        });
        
        console.log("Extracted artists:", extractedArtists);
        setArtists(extractedArtists);
      } catch (error) {
        console.error("Error fetching top artists:", error);
        setError("Failed to load top artists");
      } finally {
        setLoading(false);
      }
    };

    fetchTopArtists();
  }, [isAuthenticated]);

  const handleArtistClick = (artistId: number) => {
    navigate(`/artists/${artistId}`);
  };

  return (
    <>
      <SidebarHeader />
      <main className="page__home" id="primary">
        <div className="container">
          <TopHeader />
          


          <div className="music-items__wrapper">
            <Trending />
            <ErrorBoundary>
              {loading ? (
                <div className="loading-section">
                  <p>Loading top artists...</p>
                </div>
              ) : error ? (
                <div className="error-section">
                  <p>{error}</p>
                </div>
              ) : (
                <CardListings 
                  artists={artists.slice(0, 4)} 
                  onArtistClick={handleArtistClick} 
                  columns={4} 
                  title={isAuthenticated ? "Recommended Artists" : "Top Artists"}
                />
              )}
            </ErrorBoundary>
            <RecentlyPlayed limit={2} />
            <MusicPlayer />
          </div>
        </div>
      </main>
    </>
  );
}
