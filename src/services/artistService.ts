import { makeAuthenticatedRequest } from "./apiService";

const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
const API_BASE_URL = baseUrl.endsWith("/api") ? baseUrl : `${baseUrl}/api`;

export interface ArtistDashboardStats {
  total_tracks: number;
  total_views: number;
  total_ratings: number;
  average_rating: number;
  monthly_stats: Array<{
    month: string;
    views: number;
    ratings: number;
  }>;
  recent_activity: Array<{
    id: number;
    type?: string;
    rating?: number;
    action?: string;
    created_at: string;
    updated_at?: string;
    user?: {
      id: number;
      name: string;
      email?: string;
    };
    song?: {
      id: number;
      title: string;
      artist_id?: number;
      views?: number;
    };
  }>;
  top_rated_tracks: Array<{
    id: number;
    title: string;
    views: number;
    ratings_count: number;
    avg_rating?: string;
    rating_details?: {
      count: number;
      average: number;
    };
    ratings: Array<{
      id: number;
      rating: number;
      user_id: number;
    }>;
  }>;
  most_viewed_tracks: Array<{
    id: number;
    title: string;
    views: number;
    ratings_count: number;
    avg_rating?: string;
    rating_details?: {
      count: number;
      average: number;
    };
  }>;
}

export interface ArtistMusic {
  id: number;
  title: string;
  genre: string;
  views: number;
  ratings_count: number;
  ratings_avg_rating: number;
  song_cover_url: string;
  file_url: string;
  recent_plays: number;
  created_at: string;
  artist: {
    id: number;
    artist_name: string;
  };
  album?: {
    id: number;
    title: string;
  };
}

export interface MusicUploadRequest {
  id: number;
  title: string;
  song_title?: string;
  genre: string;
  description?: string;
  lyrics?: string;
  release_date?: string;
  song_cover_url?: string;
  song_cover_path?: string;
  file_url: string;
  file_path?: string;
  upload_status: "pending" | "approved" | "rejected";
  status?: "pending" | "approved" | "rejected";
  admin_notes?: string;
  created_at: string;
  updated_at: string;
  artist?: {
    id: number;
    artist_name: string;
  };
  song_artist?: {
    id: number;
    artist_name: string;
  };
}

export interface MusicItem {
  id: string;
  title: string;
  genre: string;
  upload_status: "pending" | "approved" | "rejected";
  request_id?: number;
  admin_notes?: string;
  song_cover_url: string;
  file_url: string;
  views: number; // 0 for requests
  ratings_count: number; // 0 for requests
  ratings_avg_rating?: number;
  created_at: string;
  artist: {
    id: number;
    artist_name: string;
  };
}

export interface SongStats {
  song: {
    id: number;
    title: string;
    genre: string;
    views: number;
    ratings_count: number;
    ratings_avg_rating: number;
    song_cover_url: string;
    file_url: string;
    artist: {
      id: number;
      artist_name: string;
    };
    album?: {
      id: number;
      title: string;
    };
  };
  ratings_breakdown: Array<{
    rating: number;
    count: number;
  }>;
  recent_plays: Array<{
    id: number;
    user_id: number;
    song_id: number;
    created_at: string;
    user: {
      id: number;
      name: string;
    };
  }>;
  daily_plays: Array<{
    date: string;
    plays: number;
  }>;
  all_ratings: Array<{
    id: number;
    rating: number;
    created_at: string;
    user: {
      id: number;
      name: string;
    };
  }>;
}

export interface MusicResponse {
  success: boolean;
  music: {
    current_page: number;
    data: ArtistMusic[];
    total: number;
    per_page: number;
  };
}

export interface DashboardResponse {
  success: boolean;
  stats: ArtistDashboardStats;
  recent_activity: ArtistDashboardStats["recent_activity"];
  top_rated_tracks: ArtistDashboardStats["top_rated_tracks"];
  most_viewed_tracks: ArtistDashboardStats["most_viewed_tracks"];
}

export interface SongStatsResponse {
  success: boolean;
  song: SongStats["song"];
  ratings_breakdown: SongStats["ratings_breakdown"];
  recent_plays: SongStats["recent_plays"];
  daily_plays: SongStats["daily_plays"];
  all_ratings: SongStats["all_ratings"];
}

export interface UploadRequestsResponse {
  success: boolean;
  requests: {
    current_page: number;
    data: MusicUploadRequest[];
    total: number;
    per_page: number;
    last_page: number;
  };
}

export interface MusicWithRequestsResponse {
  success: boolean;
  music: {
    current_page: number;
    data: MusicItem[];
    total: number;
    per_page: number;
  };
}

export interface AdminUploadRequestsResponse {
  success: boolean;
  requests: {
    current_page: number;
    data: MusicUploadRequest[];
    total: number;
    per_page: number;
    last_page: number;
  };
}

class ArtistService {
  async getDashboardStats(): Promise<DashboardResponse> {
    const response = await makeAuthenticatedRequest(
      `${API_BASE_URL}/artist/dashboard`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch artist dashboard stats");
    }

    return await response.json();
  }

  async getMusic(
    params: {
      per_page?: number;
      sort_by?: "created_at" | "views" | "rating";
      sort_order?: "asc" | "desc";
    } = {}
  ): Promise<MusicResponse> {
    const queryParams = new URLSearchParams();

    if (params.per_page)
      queryParams.append("per_page", params.per_page.toString());
    if (params.sort_by) queryParams.append("sort_by", params.sort_by);
    if (params.sort_order) queryParams.append("sort_order", params.sort_order);

    const response = await makeAuthenticatedRequest(
      `${API_BASE_URL}/artist/music?${queryParams.toString()}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch artist music");
    }

    return await response.json();
  }

  async getMusicWithRequests(
    params: {
      per_page?: number;
      sort_by?: "created_at" | "views" | "rating";
      sort_order?: "asc" | "desc";
      status?: "all" | "pending" | "approved" | "rejected";
    } = {}
  ): Promise<MusicWithRequestsResponse> {
    const queryParams = new URLSearchParams();

    if (params.per_page)
      queryParams.append("per_page", params.per_page.toString());
    if (params.sort_by) queryParams.append("sort_by", params.sort_by);
    if (params.sort_order) queryParams.append("sort_order", params.sort_order);
    if (params.status && params.status !== "all")
      queryParams.append("status", params.status);

    const response = await makeAuthenticatedRequest(
      `${API_BASE_URL}/artist/music?${queryParams.toString()}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch artist music with requests");
    }

    return await response.json();
  }

  async getUploadRequests(
    params: {
      per_page?: number;
      status?: "all" | "pending" | "approved" | "rejected";
    } = {}
  ): Promise<UploadRequestsResponse> {
    const queryParams = new URLSearchParams();

    if (params.per_page)
      queryParams.append("per_page", params.per_page.toString());
    if (params.status && params.status !== "all")
      queryParams.append("status", params.status);

    const response = await makeAuthenticatedRequest(
      `${API_BASE_URL}/music-upload-requests?${queryParams.toString()}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch upload requests");
    }

    return await response.json();
  }

  async cancelUploadRequest(requestId: number): Promise<void> {
    const response = await makeAuthenticatedRequest(
      `${API_BASE_URL}/music-upload-requests/${requestId}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to cancel upload request");
    }
  }

  async getSongStats(id: number): Promise<SongStatsResponse> {
    const response = await makeAuthenticatedRequest(
      `${API_BASE_URL}/artist/music/${id}/stats`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch song statistics");
    }

    return await response.json();
  }

  async updateSong(
    id: number,
    data: {
      title?: string;
      genre?: string;
      description?: string;
      lyrics?: string;
      release_date?: string;
    }
  ): Promise<ArtistMusic> {
    const response = await makeAuthenticatedRequest(
      `${API_BASE_URL}/artist/music/${id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update song");
    }

    const result = await response.json();
    return result.data;
  }

  async deleteSong(id: number): Promise<void> {
    const response = await makeAuthenticatedRequest(
      `${API_BASE_URL}/artist/music/${id}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to delete song");
    }
  }
}

export const artistService = new ArtistService();
