const API_BASE_URL = import.meta.env.VITE_API_URL;

// Get cookie by name (matching your JS implementation)
const getCookie = (name: string): string => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || '';
  return '';
};

// Get CSRF token from Laravel's /sanctum/csrf-cookie endpoint
export const getCsrfToken = async (): Promise<string | null> => {
  try {
    console.log("Getting CSRF token...");
    // First, get the CSRF cookie
    await fetch(`${API_BASE_URL.replace('/api', '')}/sanctum/csrf-cookie`, {
      method: 'GET',
      credentials: 'include',
    });

    // Extract CSRF token from cookies
    const csrfToken = getCookie('XSRF-TOKEN');
    
    if (csrfToken) {
      console.log("CSRF token found:", csrfToken ? "Yes" : "No");
      return csrfToken;
    }

    console.log("No CSRF token found in cookies");
    return null;
  } catch (error) {
    console.error('CSRF token fetch failed:', error);
    return null;
  }
};

// Create headers with CSRF token for session-based authentication
export const createAuthHeaders = async (): Promise<HeadersInit> => {
  const csrfToken = await getCsrfToken();
  
  const headers: Record<string, string> = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  };

  if (csrfToken) {
    headers['X-XSRF-TOKEN'] = csrfToken;
  }

  console.log("Created session auth headers:", Object.keys(headers));
  return headers;
};

// Create headers for FormData requests with session authentication
export const createFormDataHeaders = async (): Promise<HeadersInit> => {
  const csrfToken = await getCsrfToken();
  
  const headers: Record<string, string> = {
    'Accept': 'application/json',
  };

  if (csrfToken) {
    headers['X-XSRF-TOKEN'] = csrfToken;
  }

  return headers;
}; 