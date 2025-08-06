import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

const AuthStatus: React.FC = () => {
  const { user, isAuthenticated, isLoading, checkAuth } = useAuth();

  const handleManualCheck = async () => {
    console.log("Manual auth check triggered...");
    await checkAuth();
  };

  const checkCookies = () => {
    console.log("=== COOKIE INSPECTION ===");
    const cookies = document.cookie.split(';');
    console.log("All cookies:", cookies);
    
    const laravelSession = cookies.find(cookie => 
      cookie.trim().startsWith('laravel_session=')
    );
    const xsrfToken = cookies.find(cookie => 
      cookie.trim().startsWith('XSRF-TOKEN=')
    );
    
    console.log("Laravel session cookie:", laravelSession);
    console.log("XSRF token cookie:", xsrfToken);
  };

  const checkLocalStorage = () => {
    console.log("=== LOCALSTORAGE INSPECTION ===");
    const accessToken = localStorage.getItem('access_token');
    const oauthRedirect = localStorage.getItem('oauth_redirect_url');
    
    console.log("Access token in localStorage:", accessToken ? "Yes" : "No");
    console.log("OAuth redirect URL:", oauthRedirect);
  };

  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      background: 'white', 
      padding: '10px', 
      border: '1px solid #ccc',
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 9999,
      maxWidth: '300px'
    }}>
      <div><strong>Auth Status:</strong></div>
      <div>Loading: {isLoading ? 'Yes' : 'No'}</div>
      <div>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</div>
      <div>User: {user ? user.name : 'None'}</div>
      <div>Email: {user ? user.email : 'None'}</div>
      <div style={{ marginTop: '5px' }}>
        <button 
          onClick={handleManualCheck}
          style={{ 
            marginRight: '5px', 
            padding: '2px 5px', 
            fontSize: '10px' 
          }}
        >
          Check Auth
        </button>
        <button 
          onClick={checkCookies}
          style={{ 
            marginRight: '5px', 
            padding: '2px 5px', 
            fontSize: '10px' 
          }}
        >
          Check Cookies
        </button>
        <button 
          onClick={checkLocalStorage}
          style={{ 
            padding: '2px 5px', 
            fontSize: '10px' 
          }}
        >
          Check Storage
        </button>
      </div>
    </div>
  );
};

export default AuthStatus; 