// import { authService } from './authService';

class MusicService {
  private baseURL = import.meta.env.VITE_API_URL || "http://localhost:8000";

  async getAllSongs(): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseURL}/api/music`, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch songs");
      }

      const data = await response.json();
      return data.songs || data;
    } catch (error) {
      console.error("Error fetching songs:", error);
      throw error;
    }
  }

  async recordSongPlay(songId: number, authHeaders: HeadersInit): Promise<any> {
    try {
      const response = await fetch(`${this.baseURL}/api/recently-played`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ song_id: songId }),
      });

      if (import.meta.env.DEV) {
        console.log("Record play response status:", response.status);
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Record play error response:", errorData);
        throw new Error(
          `Failed to record song play: ${response.status} ${response.statusText}`
        );
      }

      const result = await response.json();
              if (import.meta.env.DEV) {
          console.log("Record play success:", result);
        }
      return result;
    } catch (error) {
      console.error("Error recording song play:", error);
      return { success: false, message: "Failed to record play" };
    }
  }

  async getRecommendations(authHeaders: HeadersInit): Promise<any[]> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // Increased to 30 seconds

      try {
        const response = await fetch(`${this.baseURL}/api/recommendations`, {
          method: "GET",
          headers: authHeaders,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          console.error(
            "Recommendations response not ok:",
            response.status,
            response.statusText
          );

          try {
            const errorData = await response.text();
            console.error("Recommendations error details:", errorData);
          } catch (e) {
            console.error("Could not read error response");
          }
          throw new Error("Failed to fetch recommendations");
        }

        const data = await response.json();
        return data.recommendations || data;
      } catch (fetchError: unknown) {
        clearTimeout(timeoutId);
        if (fetchError instanceof Error && fetchError.name === "AbortError") {
          console.warn("Recommendations request timed out after 30 seconds");
        }
        throw fetchError;
      }
    } catch (error) {
      if (
        error instanceof TypeError &&
        error.message.includes("NetworkError")
      ) {
        console.warn(
          "Network error when fetching recommendations - API server may not be running"
        );
      } else if (error instanceof Error && error.name === "AbortError") {
        console.warn("Recommendations request was aborted due to timeout");
      } else {
        console.error("Error fetching recommendations:", error);
      }

      console.warn("Recommendations API not available, returning empty array");
      return [];
    }
  }

  async getTopRecommendations(
    authHeaders: HeadersInit,
    limit: number = 5
  ): Promise<any[]> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // Increased to 30 seconds

      try {
        let response = await fetch(`${this.baseURL}/api/top-recommendations`, {
          method: "GET",
          headers: authHeaders,
          signal: controller.signal,
        });

        if (!response.ok) {
          console.log(
            "Top recommendations endpoint not found, trying recommendations with query params..."
          );
          response = await fetch(
            `${this.baseURL}/api/recommendations?top=true&limit=${limit}`,
            {
              method: "GET",
              headers: authHeaders,
              signal: controller.signal,
            }
          );
        }

        clearTimeout(timeoutId);

        if (!response.ok) {
          console.error(
            "Top recommendations response not ok:",
            response.status,
            response.statusText
          );
          throw new Error("Failed to fetch top recommendations");
        }

        const data = await response.json();

        return data.top_recommendations || data.recommendations || data;
      } catch (fetchError: unknown) {
        clearTimeout(timeoutId);
        if (fetchError instanceof Error && fetchError.name === "AbortError") {
          console.warn("Top recommendations request timed out after 30 seconds");
        }
        throw fetchError;
      }
    } catch (error) {
      if (
        error instanceof TypeError &&
        error.message.includes("NetworkError")
      ) {
        console.warn(
          "Network error when fetching top recommendations - API server may not be running"
        );
      } else if (error instanceof Error && error.name === "AbortError") {
        console.warn("Top recommendations request was aborted due to timeout");
      } else {
        console.error("Error fetching top recommendations:", error);
      }

      // Return empty array instead of throwing to prevent app crashes
      return [];
    }
  }

  async getPopularSongs(): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseURL}/api/music?popular=true`, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch popular songs");
      }

      const data = await response.json();
      return data.songs || data;
    } catch (error) {
      console.error("Error fetching popular songs:", error);

      return [];
    }
  }

  async getRecentlyPlayed(authHeaders: HeadersInit): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseURL}/api/recently-played`, {
        method: "GET",
        headers: authHeaders,
      });

              if (import.meta.env.DEV) {
          console.log("Recently played response status:", response.status);
        }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Recently played error response:", errorData);
        throw new Error(
          `Failed to fetch recently played: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
              if (import.meta.env.DEV) {
          console.log("Recently played data:", data);
        }
      return data.recently_played || data;
    } catch (error) {
      console.error("Error fetching recently played:", error);

      return [];
    }
  }

  async getTopArtists(authHeaders: HeadersInit): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseURL}/api/top-artists`, {
        method: "GET",
        headers: authHeaders,
      });

      console.log("Top artists response status:", response.status);

      if (!response.ok) {
        console.log(
          "Top artists endpoint not found, falling back to regular artists..."
        );
        const fallbackResponse = await fetch(`${this.baseURL}/api/artists`, {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        });

        if (!fallbackResponse.ok) {
          throw new Error("Failed to fetch artists");
        }

        const fallbackData = await fallbackResponse.json();
        return fallbackData.artists || fallbackData;
      }

      const data = await response.json();
      console.log("Top artists data:", data);

      return data.top_artists || data.artists || data;
    } catch (error) {
      console.error("Error fetching top artists:", error);

      return [];
    }
  }
}

export const musicService = new MusicService();
