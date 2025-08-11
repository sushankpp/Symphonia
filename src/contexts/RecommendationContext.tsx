import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { musicService } from "../services/musicService";
import { useAuthHeaders } from "../hooks/useAuthHeaders";

interface Song {
  id: number;
  title: string;
  artist: string;
  album?: string;
  duration: number;
  cover_image?: string;
  audio_url?: string;
  file_path?: string;
  genre?: string;
  release_date?: string;
}

interface Recommendation {
  song: Song;
  similarity_score: number;
}

interface RecommendationContextType {
  recommendations: Recommendation[];
  topRecommendations: Recommendation[];
  recentlyPlayed: Song[];
  allSongs: Song[];
  isLoading: boolean;
  error: string | null;
  loadRecommendations: () => Promise<void>;
  loadTopRecommendations: () => Promise<void>;
  recordPlay: (songId: number) => Promise<void>;
  refreshRecommendations: () => Promise<void>;
  loadAllSongs: () => Promise<void>;
  loadRecentlyPlayed: () => Promise<void>;
}

const RecommendationContext = createContext<
  RecommendationContextType | undefined
>(undefined);

export const useRecommendation = () => {
  const context = useContext(RecommendationContext);
  if (context === undefined) {
    throw new Error(
      "useRecommendation must be used within a RecommendationProvider"
    );
  }
  return context;
};

export const RecommendationProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [topRecommendations, setTopRecommendations] = useState<
    Recommendation[]
  >([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState<Song[]>([]);
  const [allSongs, setAllSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  let authHeaders;
  try {
    authHeaders = useAuthHeaders();
  } catch (error) {
    console.warn("useAuthHeaders not available, using default values");
    authHeaders = {
      getAuthHeaders: async () => ({
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        isAuthenticated: false,
        user: null,
      }),
      isAuthenticated: false,
    };
  }
  
  const { getAuthHeaders, isAuthenticated } = authHeaders;

  const loadRecommendations = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!isAuthenticated) {
        console.log("User not authenticated, skipping recommendations");
        setRecommendations([]);
        return;
      }

      const { headers } = await getAuthHeaders();
      const data = await musicService.getRecommendations(headers);

      // console.log('=== RECOMMENDATIONS API RESPONSE ===');
      // console.log('Raw recommendations data:', data);
      // console.log('First recommendation object:', data[0]);
      // console.log('First recommendation song object:', data[0]?.song);
      // console.log('First recommendation song file_path:', data[0]?.song?.file_path);
      // console.log('First recommendation song audio_url:', data[0]?.song?.audio_url);
      // console.log('=== END RECOMMENDATIONS API RESPONSE ===');

      if (data.length === 0) {
        // No recommendations from API
        setRecommendations([]);
      } else {
        setRecommendations(data);
      }
    } catch (error) {
      console.error("Error loading recommendations:", error);
      setError("Failed to load recommendations");
      // No fallback data
      setRecommendations([]);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, getAuthHeaders]);

  const loadTopRecommendations = useCallback(async () => {
    try {
      const headers = isAuthenticated
        ? (await getAuthHeaders()).headers
        : {
            Accept: "application/json",
            "Content-Type": "application/json",
          };

      const data = await musicService.getTopRecommendations(headers, 5);

      // console.log("=== TOP RECOMMENDATIONS API RESPONSE ===");
      // console.log("Raw top recommendations data:", data);
      // console.log("First top recommendation object:", data[0]);
      // console.log("First top recommendation song object:", data[0]?.song);
      // console.log(
      //   "First top recommendation song file_path:",
      //   data[0]?.song?.file_path
      // );
      // console.log("First top recommendation song audio_url:", data[0]?.song?.audio_url);
      // console.log("=== END TOP RECOMMENDATIONS API RESPONSE ===");

      if (data.length === 0) {
        // No top recommendations from API
        setTopRecommendations([]);
      } else {
        setTopRecommendations(data);
      }
    } catch (error) {
      console.error("Error loading top recommendations:", error);
      // No fallback data
      setTopRecommendations([]);
    }
  }, [isAuthenticated, getAuthHeaders]);

  const recordPlay = useCallback(
    async (songId: number) => {
      try {
        console.log("Recording play for song:", songId);

        if (!isAuthenticated) {
          console.log("User not authenticated, skipping play recording");
          return;
        }

        const { headers } = await getAuthHeaders();
        await musicService.recordSongPlay(songId, headers);
        console.log("Successfully recorded play");

        // Refresh recommendations after recording play
        await Promise.all([loadRecommendations(), loadTopRecommendations()]);
        // Refresh recently played - call the function directly without dependency
        try {
          console.log("Loading recently played...");

          if (isAuthenticated) {
            const { headers } = await getAuthHeaders();
            const data = await musicService.getRecentlyPlayed(headers);
            console.log("Recently played data:", data);

            // Extract the song objects from the recently played items
            const songs = data.map((item: any) => item.song || item);
            console.log("Extracted songs:", songs);
            setRecentlyPlayed(songs);
          }
        } catch (error) {
          console.error("Error loading recently played:", error);
          setRecentlyPlayed([]);
        }
      } catch (error) {
        console.error("Error recording play:", error);
        // Don't throw - just log the error
      }
    },
    [
      isAuthenticated,
      getAuthHeaders,
      loadRecommendations,
      loadTopRecommendations,
    ]
  );

  const refreshRecommendations = useCallback(async () => {
    await Promise.all([loadRecommendations(), loadTopRecommendations()]);
  }, [loadRecommendations, loadTopRecommendations]);

  const loadAllSongs = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await musicService.getAllSongs();
      setAllSongs(data);
    } catch (error) {
      console.error("Error loading all songs:", error);
      setError("Failed to load songs");
      setAllSongs([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadRecentlyPlayed = useCallback(async () => {
    try {
      console.log("Loading recently played...");

      if (!isAuthenticated) {
        console.log("User not authenticated, returning empty recently played");
        setRecentlyPlayed([]);
        return;
      }

      const { headers } = await getAuthHeaders();
      const data = await musicService.getRecentlyPlayed(headers);
      console.log("Recently played data:", data);

      // Extract the song objects from the recently played items
      const songs = data.map((item: any) => item.song || item);
      console.log("Extracted songs:", songs);
      setRecentlyPlayed(songs);
    } catch (error) {
      console.error("Error loading recently played:", error);
      setRecentlyPlayed([]);
    }
  }, [isAuthenticated, getAuthHeaders]);

  // Load initial data only once when component mounts or auth state changes
  useEffect(() => {
    const loadInitialData = async () => {
      // Load songs that don't require authentication first
      await loadAllSongs();
      
      // Load top recommendations (works for both authenticated and unauthenticated users)
      await loadTopRecommendations();
      
      // Only load user-specific data if authenticated
      if (isAuthenticated) {
        await Promise.all([
          loadRecommendations(),
          loadRecentlyPlayed(),
        ]);
      }
    };

    loadInitialData();
  }, [
    isAuthenticated,
    loadRecommendations,
    loadTopRecommendations,
    loadAllSongs,
    loadRecentlyPlayed,
  ]); // Include all dependencies

  // Refresh recently played data periodically only if authenticated
  useEffect(() => {
    if (!isAuthenticated) return; // Only refresh if authenticated

    const interval = setInterval(() => {
      loadRecentlyPlayed();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [isAuthenticated, loadRecentlyPlayed]);

  return (
    <RecommendationContext.Provider
      value={{
        recommendations,
        topRecommendations,
        recentlyPlayed,
        allSongs,
        isLoading,
        error,
        loadRecommendations,
        loadTopRecommendations,
        recordPlay,
        refreshRecommendations,
        loadAllSongs,
        loadRecentlyPlayed,
      }}
    >
      {children}
    </RecommendationContext.Provider>
  );
};
