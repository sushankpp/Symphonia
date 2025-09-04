import React, { useState, useEffect } from 'react';

const ApiHealthCheck: React.FC = () => {
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(true);

  const checkApiHealth = async () => {
    setIsChecking(true);
    setError(null);
    
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/music`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        // Add timeout to prevent hanging
        signal: AbortSignal.timeout(5000)
      });
      
      if (response.ok) {
        setIsHealthy(true);
      } else {
        setIsHealthy(false);
        setError(`Music API responded with status: ${response.status}`);
      }
    } catch (err: any) {
      setIsHealthy(false);
      if (err.name === 'AbortError') {
        setError('API request timed out');
      } else if (err.message.includes('NetworkError')) {
        setError('Cannot connect to API server - check if backend is running');
      } else {
        setError(`Connection error: ${err.message}`);
      }
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkApiHealth();
    
    // Auto-hide after 3.5 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 3500);
    
    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) {
    return null;
  }

  if (isChecking) {
    return (
      <div className="api-health-check">
        <div className="health-status checking">
          🔍 Checking API connection...
        </div>
      </div>
    );
  }

  if (isHealthy === null) {
    return null;
  }

  return (
    <div className="api-health-check">
      {isHealthy ? (
        <div className="health-status healthy">
          ✅ API connection healthy
        </div>
      ) : (
        <div className="health-status unhealthy">
          ❌ API connection failed
          {error && <div className="health-error">{error}</div>}
          <button 
            onClick={checkApiHealth}
            className="health-retry-btn"
          >
            🔄 Retry
          </button>
        </div>
      )}
    </div>
  );
};

export default ApiHealthCheck;
