const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const testAPIEndpoints = async () => {
  console.log('🔍 Testing API endpoints...');
  console.log('API Base URL:', API_BASE_URL);

  const endpoints = [
    '/api/artists',
    '/api/auth/user',
    '/api/recently-played',
    '/api/recommendations',
    '/api/playlists'
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`\n--- Testing ${endpoint} ---`);
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      console.log(`Status: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Response:', data);
      } else {
        const errorText = await response.text();
        console.error('Error response:', errorText);
      }
    } catch (error) {
      console.error(`❌ Failed to fetch ${endpoint}:`, error);
    }
  }
};

export const testWithAuth = async (token: string) => {
  console.log('🔍 Testing authenticated endpoints...');
  
  const endpoints = [
    '/api/auth/user',
    '/api/recently-played',
    '/api/recommendations',
    '/api/playlists'
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`\n--- Testing ${endpoint} with auth ---`);
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log(`Status: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Response:', data);
      } else {
        const errorText = await response.text();
        console.error('Error response:', errorText);
      }
    } catch (error) {
      console.error(`❌ Failed to fetch ${endpoint}:`, error);
    }
  }
};
