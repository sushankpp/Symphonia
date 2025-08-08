import { authService } from './authService';

class MusicService {
  private baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000';



  async getAllSongs(): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseURL}/api/music`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch songs');
      }

      const data = await response.json();
      return data.songs || data;
    } catch (error) {
      console.error('Error fetching songs:', error);
      throw error;
    }
  }

  async recordSongPlay(songId: number, authHeaders: HeadersInit): Promise<any> {
    try {
      const response = await fetch(`${this.baseURL}/api/recently-played`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ song_id: songId }),
      });

      console.log('Record play response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Record play error response:', errorData);
        throw new Error(`Failed to record song play: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Record play success:', result);
      return result;
    } catch (error) {
      console.error('Error recording song play:', error);
      // Don't throw error for recording plays - it's not critical
      return { success: false, message: 'Failed to record play' };
    }
  }

  async getRecommendations(authHeaders: HeadersInit): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseURL}/api/recommendations`, {
        method: 'GET',
        headers: authHeaders,
      });

      if (!response.ok) {
        console.error('Recommendations response not ok:', response.status, response.statusText);
        // Try to get error details
        try {
          const errorData = await response.text();
          console.error('Recommendations error details:', errorData);
        } catch (e) {
          console.error('Could not read error response');
        }
        throw new Error('Failed to fetch recommendations');
      }

      const data = await response.json();
      return data.recommendations || data;
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      // Return empty array instead of throwing - API endpoint might not exist yet
      console.log('Recommendations API not available, returning empty array');
      return [];
    }
  }

  async getTopRecommendations(authHeaders: HeadersInit, limit: number = 5): Promise<any[]> {
    try {
      // Try the dedicated top-recommendations endpoint first
      let response = await fetch(`${this.baseURL}/api/top-recommendations`, {
        method: 'GET',
        headers: authHeaders,
      });

      // If that fails, try the recommendations endpoint with query params
      if (!response.ok) {
        console.log('Top recommendations endpoint not found, trying recommendations with query params...');
        response = await fetch(`${this.baseURL}/api/recommendations?top=true&limit=${limit}`, {
          method: 'GET',
          headers: authHeaders,
        });
      }

      if (!response.ok) {
        console.error('Top recommendations response not ok:', response.status, response.statusText);
        throw new Error('Failed to fetch top recommendations');
      }

      const data = await response.json();
      // Handle both new structure (with top_recommendations property) and old structure
      return data.top_recommendations || data.recommendations || data;
    } catch (error) {
      console.error('Error fetching top recommendations:', error);
      // Return empty array instead of throwing - API endpoint might not exist yet
      console.log('Top recommendations API not available, returning empty array');
      return [];
    }
  }

  async getPopularSongs(): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseURL}/api/music?popular=true`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch popular songs');
      }

      const data = await response.json();
      return data.songs || data;
    } catch (error) {
      console.error('Error fetching popular songs:', error);
      // Return empty array instead of throwing
      return [];
    }
  }

  async getRecentlyPlayed(authHeaders: HeadersInit): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseURL}/api/recently-played`, {
        method: 'GET',
        headers: authHeaders,
      });

      console.log('Recently played response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Recently played error response:', errorData);
        throw new Error(`Failed to fetch recently played: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Recently played data:', data);
      return data.recently_played || data;
    } catch (error) {
      console.error('Error fetching recently played:', error);
      // Return empty array instead of throwing
      return [];
    }
  }

  async getTopArtists(authHeaders: HeadersInit): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseURL}/api/top-artists`, {
        method: 'GET',
        headers: authHeaders,
      });

      console.log('Top artists response status:', response.status);
      
      if (!response.ok) {
        // If top-artists endpoint doesn't exist, fallback to regular artists
        console.log('Top artists endpoint not found, falling back to regular artists...');
        const fallbackResponse = await fetch(`${this.baseURL}/api/artists`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        });

        if (!fallbackResponse.ok) {
          throw new Error('Failed to fetch artists');
        }

        const fallbackData = await fallbackResponse.json();
        return fallbackData.artists || fallbackData;
      }

      const data = await response.json();
      console.log('Top artists data:', data);
      // Extract the top_artists array from the response
      return data.top_artists || data.artists || data;
    } catch (error) {
      console.error('Error fetching top artists:', error);
      // Return empty array instead of throwing
      return [];
    }
  }
}

export const musicService = new MusicService(); 