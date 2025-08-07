import { authService } from './authService';

export const makeAuthenticatedRequest = async (url: string, options: RequestInit = {}) => {
  const headers = {
    ...authService.getAuthHeaders(),
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    authService.clearToken();
    window.location.href = '/login';
    throw new Error('Authentication failed');
  }

  return response;
};
