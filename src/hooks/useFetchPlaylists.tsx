import { useState, useEffect, useCallback } from "react";
import { useAuthHeaders } from "./useAuthHeaders";

type Song = {
  id: number;
  title: string;
  song_cover_path: string;
  artist_id?: number;
  album_id?: number;
  genre?: string;
  description?: string;
  views?: number;
  released_date?: string;
};

type Playlist = {
  id: number;
  playlist_name: string;
  user_id: number;
  created_at: string;
  updated_at: string;
  songs: Song[];
};

export const useFetchPlaylists = () => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { makeAuthenticatedRequest } = useAuthHeaders();

  const fetchPlaylists = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const apiURL = import.meta.env.VITE_API_URL;
      const response = await makeAuthenticatedRequest(`${apiURL}/api/playlists`);

      if (!response.ok) {
        throw new Error("Failed to fetch playlists");
      }

      const data = await response.json();
      setPlaylists(data);
    } catch (err) {
      console.error("Error fetching playlists:", err);
      setError("Failed to fetch playlists");
    } finally {
      setIsLoading(false);
    }
  }, [makeAuthenticatedRequest]);

  const createPlaylist = useCallback(
    async (playlistName: string) => {
      try {
        const apiURL = import.meta.env.VITE_API_URL;
        const response = await makeAuthenticatedRequest(`${apiURL}/api/playlists`, {
          method: "POST",
          body: JSON.stringify({ playlist_name: playlistName }),
        });

        if (!response.ok) {
          throw new Error("Failed to create playlist");
        }

        const newPlaylist = await response.json();
        console.log("Playlist created successfully:", newPlaylist);

        await fetchPlaylists();

        return newPlaylist;
      } catch (error) {
        console.error("Error creating playlist:", error);
        throw error;
      }
    },
    [fetchPlaylists, makeAuthenticatedRequest]
  );

  const addSongToPlaylist = useCallback(
    async (playlistId: number, songId: number) => {
      try {
        const apiURL = import.meta.env.VITE_API_URL;
        const response = await makeAuthenticatedRequest(
          `${apiURL}/api/playlists/${playlistId}/songs`,
          {
            method: "POST",
            body: JSON.stringify({ song_id: songId }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to add song to playlist");
        }

        console.log("Song added to playlist successfully");
        return true;
      } catch (error) {
        console.error("Error adding song to playlist:", error);
        throw error;
      }
    },
    [makeAuthenticatedRequest]
  );

  useEffect(() => {
    fetchPlaylists();
  }, [fetchPlaylists]);

  return {
    playlists,
    error,
    isLoading,
    refreshPlaylists: fetchPlaylists,
    createPlaylist,
    addSongToPlaylist,
  };
};
