import { makeAuthenticatedRequest } from './apiService';

// Ensure API_BASE_URL always includes /api
const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API_BASE_URL = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;

export interface ArtistDashboardStats {
  total_tracks: number;
  total_views: number;
  total_ratings: number;
  average_rating: number;
  monthly_analytics: Array<{
    month: string;
    plays: number;
    ratings: number;
  }>;
  recent_activity: Array<{
    id: number;
    type: 'play' | 'rating' | 'upload';
    song: {
      id: number;
      title: string;
    };
    user?: {
      id: number;
      name: string;
    };
    created_at: string;
    details?: any;
  }>;
  top_rated_tracks: Array<{
    id: number;
    title: string;
    average_rating: number;
    total_ratings: number;
  }>;
  most_viewed_tracks: Array<{
    id: number;
    title: string;
    total_plays: number;
  }>;
}

export interface ArtistMusic {
  id: number;
  title: string;
  genre: string;
  description?: string;
  lyrics?: string;
  release_date?: string;
  created_at: string;
  updated_at: string;
  file_path: string;
  cover_image?: string;
  total_plays: number;
  average_rating: number;
  total_ratings: number;
  artist: {
    id: number;
    name: string;
  };
}

export interface SongStats {
  song: ArtistMusic;
  ratings_breakdown: {
    [key: string]: number; // "1": 5, "2": 10, etc.
  };
  daily_plays: Array<{
    date: string;
    plays: number;
  }>;
  recent_plays: Array<{
    id: number;
    user: {
      id: number;
      name: string;
      profile_picture?: string;
    };
    played_at: string;
  }>;
  all_ratings: Array<{
    id: number;
    rating: number;
    comment?: string;
    user: {
      id: number;
      name: string;
      profile_picture?: string;
    };
    created_at: string;
  }>;
}

export interface MusicResponse {
  data: ArtistMusic[];
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

class ArtistService {
  // Dashboard
  async getDashboardStats(): Promise<ArtistDashboardStats> {
    const response = await makeAuthenticatedRequest(`${API_BASE_URL}/artist/dashboard`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch artist dashboard stats');
    }
    
    const result = await response.json();
    return result.data;
  }

  // Music Management
  async getMusic(params: {
    page?: number;
    per_page?: number;
    sort_by?: 'views' | 'ratings' | 'created_at' | 'title';
    sort_order?: 'asc' | 'desc';
  } = {}): Promise<MusicResponse> {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.per_page) queryParams.append('per_page', params.per_page.toString());
    if (params.sort_by) queryParams.append('sort_by', params.sort_by);
    if (params.sort_order) queryParams.append('sort_order', params.sort_order);

    const response = await makeAuthenticatedRequest(
      `${API_BASE_URL}/artist/music?${queryParams.toString()}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch artist music');
    }
    
    return await response.json();
  }

  async getSongStats(id: number): Promise<SongStats> {
    const response = await makeAuthenticatedRequest(`${API_BASE_URL}/artist/music/${id}/stats`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch song statistics');
    }
    
    const result = await response.json();
    return result.data;
  }

  async updateSong(id: number, data: {
    title?: string;
    genre?: string;
    description?: string;
    lyrics?: string;
    release_date?: string;
  }): Promise<ArtistMusic> {
    const response = await makeAuthenticatedRequest(`${API_BASE_URL}/artist/music/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update song');
    }
    
    const result = await response.json();
    return result.data;
  }

  async deleteSong(id: number): Promise<void> {
    const response = await makeAuthenticatedRequest(`${API_BASE_URL}/artist/music/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete song');
    }
  }
}

export const artistService = new ArtistService();
