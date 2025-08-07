import { useCallback, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';

interface AuthHeaders {
  headers: HeadersInit;
  isAuthenticated: boolean;
  user: any;
}

export const useAuthHeaders = () => {
  const { user, isAuthenticated } = useAuth();

  const getAuthHeaders = useCallback(async (): Promise<AuthHeaders> => {
    try {
      // Check if user is authenticated
      if (!isAuthenticated || !user) {
        console.log('User not authenticated, returning basic headers');
        return {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          isAuthenticated: false,
          user: null
        };
      }

      // Get Bearer token from authService
      const token = authService.getToken();
      console.log('Bearer Token obtained:', token ? 'Yes' : 'No');
      console.log('Bearer Token value:', token ? token.substring(0, 20) + '...' : 'None');
      console.log('User data:', user);
      
      if (!token) {
        console.warn('No Bearer token found, user may need to re-login');
        return {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          isAuthenticated: false,
          user: null
        };
      }
      
      return {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        isAuthenticated: true,
        user
      };
    } catch (error) {
      console.error('Error getting auth headers:', error);
      return {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        isAuthenticated: false,
        user: null
      };
    }
  }, [isAuthenticated, user]);

  const makeAuthenticatedRequest = useCallback(async (
    url: string, 
    options: RequestInit = {}
  ): Promise<Response> => {
    const { headers, isAuthenticated } = await getAuthHeaders();
    
    const requestOptions: RequestInit = {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    };

    console.log(`Making ${options.method || 'GET'} request to ${url}`, {
      isAuthenticated,
      headers: requestOptions.headers,
    });

    return fetch(url, requestOptions);
  }, [getAuthHeaders]);

  const testAuthentication = useCallback(async () => {
    console.log('=== TESTING BEARER TOKEN AUTHENTICATION ===');
    console.log('1. Current user state:', user);
    console.log('2. isAuthenticated:', isAuthenticated);
    
    try {
      const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      
      // Test 1: Check if user has token
      console.log('--- Test 1: Checking Bearer token ---');
      const token = authService.getToken();
      console.log('Bearer token:', token ? token.substring(0, 30) + '...' : 'None');
      
      // Test 2: Get auth headers
      const { headers, isAuthenticated: authStatus } = await getAuthHeaders();
      console.log('3. Auth headers result:', { authStatus, headers });
      
      // Test 3: Test recently played with Bearer token
      console.log('--- Test 3: Recently played with Bearer token ---');
      const recentlyPlayedResponse = await fetch(`${baseURL}/api/recently-played`, {
        method: 'GET',
        headers,
      });
      
      console.log('Recently played response:', recentlyPlayedResponse.status, recentlyPlayedResponse.statusText);
      const recentlyPlayedData = await recentlyPlayedResponse.json().catch(() => ({}));
      console.log('Recently played data:', recentlyPlayedData);
      
      // Test 4: Test recommendations with Bearer token
      console.log('--- Test 4: Recommendations with Bearer token ---');
      const recommendationsResponse = await fetch(`${baseURL}/api/recommendations`, {
        method: 'GET',
        headers,
      });
      
      console.log('Recommendations response:', recommendationsResponse.status, recommendationsResponse.statusText);
      const recommendationsData = await recommendationsResponse.json().catch(() => ({}));
      console.log('Recommendations data:', recommendationsData);
      
      // Test 5: Test playlists with Bearer token
      console.log('--- Test 5: Playlists with Bearer token ---');
      const playlistsResponse = await fetch(`${baseURL}/api/playlists`, {
        method: 'GET',
        headers,
      });
      
      console.log('Playlists response:', playlistsResponse.status, playlistsResponse.statusText);
      const playlistsData = await playlistsResponse.json().catch(() => ({}));
      console.log('Playlists data:', playlistsData);
      
    } catch (error) {
      console.error('Authentication test error:', error);
    }
    
    console.log('=== END BEARER TOKEN AUTHENTICATION TEST ===');
  }, [user, isAuthenticated, getAuthHeaders]);

  // Memoize the return value to prevent unnecessary re-renders
  const result = useMemo(() => ({
    getAuthHeaders,
    makeAuthenticatedRequest,
    testAuthentication,
    isAuthenticated,
    user
  }), [getAuthHeaders, makeAuthenticatedRequest, testAuthentication, isAuthenticated, user]);

  return result;
}; 