import { useCallback } from 'react';
import { useAuthHeaders } from './useAuthHeaders';

interface Playlist {
  id: number;
  name: string;
  description?: string;
  user_id: number;
  created_at: string;
  updated_at: string;
}

interface CreatePlaylistData {
  name: string;
  description?: string;
}

export const usePlaylist = () => {
  const { makeAuthenticatedRequest, isAuthenticated } = useAuthHeaders();
  const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  const createPlaylist = useCallback(async (data: CreatePlaylistData): Promise<Playlist | null> => {
    if (!isAuthenticated) {
      console.log('User not authenticated, cannot create playlist');
      return null;
    }

    try {
      const response = await makeAuthenticatedRequest(`${baseURL}/api/playlists`, {
        method: 'POST',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create playlist');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating playlist:', error);
      return null;
    }
  }, [makeAuthenticatedRequest, isAuthenticated, baseURL]);

  const getUserPlaylists = useCallback(async (): Promise<Playlist[]> => {
    if (!isAuthenticated) {
      console.log('User not authenticated, returning empty playlists');
      return [];
    }

    try {
      const response = await makeAuthenticatedRequest(`${baseURL}/api/playlists`);

      if (!response.ok) {
        throw new Error('Failed to fetch playlists');
      }

      const data = await response.json();
      return data.playlists || data;
    } catch (error) {
      console.error('Error fetching playlists:', error);
      return [];
    }
  }, [makeAuthenticatedRequest, isAuthenticated, baseURL]);

  const addSongToPlaylist = useCallback(async (playlistId: number, songId: number): Promise<boolean> => {
    if (!isAuthenticated) {
      console.log('User not authenticated, cannot add song to playlist');
      return false;
    }

    try {
      const response = await makeAuthenticatedRequest(`${baseURL}/api/playlists/${playlistId}/songs`, {
        method: 'POST',
        body: JSON.stringify({ song_id: songId }),
      });

      if (!response.ok) {
        throw new Error('Failed to add song to playlist');
      }

      return true;
    } catch (error) {
      console.error('Error adding song to playlist:', error);
      return false;
    }
  }, [makeAuthenticatedRequest, isAuthenticated, baseURL]);

  return {
    createPlaylist,
    getUserPlaylists,
    addSongToPlaylist,
    isAuthenticated,
  };
}; 