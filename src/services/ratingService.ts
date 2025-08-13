import { makeAuthenticatedRequest } from './apiService';

export interface RatingData {
  id: number;
  user_id: number;
  rateable_id: number;
  rateable_type: string;
  rating: number;
  created_at: string;
  updated_at: string;
}

export interface RatingResponse {
  message: string;
  rating: RatingData;
}

export interface RatingDistribution {
  [key: string]: number;
}

export interface UserRating {
  id: number;
  rating: number;
  user?: {
    id: number;
    name: string;
    email: string;
  };
  created_at: string;
  updated_at: string;
}

export interface ItemRatingsResponse {
  success: boolean;
  user_rating: number;
  average_rating: number;
  total_ratings: number;
  rating_distribution: RatingDistribution;
  ratings: UserRating[];
}

export interface UserRatingsResponse {
  success: boolean;
  ratings: {
    songs: Array<{
      id: number;
      rating: number;
      created_at: string;
      updated_at: string;
      song: {
        id: number;
        title: string;
        artist: string;
        genre: string;
        file_path: string;
        song_cover_path: string;
      };
    }>;
    artists: Array<{
      id: number;
      rating: number;
      created_at: string;
      updated_at: string;
      artist: {
        id: number;
        artist_name: string;
        bio: string;
        profile_picture: string;
      };
    }>;
    albums: Array<{
      id: number;
      rating: number;
      created_at: string;
      updated_at: string;
      album: {
        id: number;
        title: string;
        artist: string;
        cover_path: string;
      };
    }>;
  };
  total_ratings: number;
}

export interface ArtistRatingsResponse {
  success: boolean;
  ratings: {
    songs: Array<{
      id: number;
      rating: number;
      user: {
        id: number;
        name: string;
        email: string;
      };
      song: {
        id: number;
        title: string;
        genre: string;
      };
      created_at: string;
    }>;
    artist_profile: Array<{
      id: number;
      rating: number;
      user: {
        id: number;
        name: string;
        email: string;
      };
      created_at: string;
    }>;
    albums: Array<{
      id: number;
      rating: number;
      user: {
        id: number;
        name: string;
        email: string;
      };
      album: {
        id: number;
        title: string;
      };
      created_at: string;
    }>;
  };
  summary: {
    total_ratings: number;
    average_rating: number;
    rating_distribution: RatingDistribution;
  };
}

export interface CreateRatingRequest {
  rateable_id: number;
  rateable_type: 'song' | 'artist' | 'album';
  rating: number;
}

class RatingService {
  private baseUrl = import.meta.env.VITE_API_URL;

  /**
   * Create or update a rating
   */
  async createRating(data: CreateRatingRequest): Promise<RatingResponse> {
    const response = await makeAuthenticatedRequest(`${this.baseUrl}/api/ratings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.json();
  }

  /**
   * Get ratings for a specific item (song, artist, or album)
   */
  async getItemRatings(id: number, type: 'song' | 'artist' | 'album'): Promise<ItemRatingsResponse> {
    const response = await makeAuthenticatedRequest(`${this.baseUrl}/api/ratings/${id}?type=${type}`);
    return response.json();
  }

  /**
   * Get current user's ratings
   */
  async getUserRatings(): Promise<UserRatingsResponse> {
    const response = await makeAuthenticatedRequest(`${this.baseUrl}/api/user/ratings`);
    return response.json();
  }

  /**
   * Get artist's ratings (for artist dashboard)
   */
  async getArtistRatings(): Promise<ArtistRatingsResponse> {
    const response = await makeAuthenticatedRequest(`${this.baseUrl}/api/artist/ratings`);
    return response.json();
  }
}

export const ratingService = new RatingService();
