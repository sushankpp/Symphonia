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



  // Memoize the return value to prevent unnecessary re-renders
  const result = useMemo(() => ({
    getAuthHeaders,
    makeAuthenticatedRequest,
    isAuthenticated,
    user
  }), [getAuthHeaders, makeAuthenticatedRequest, isAuthenticated, user]);

  return result;
}; 