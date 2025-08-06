import React, { useState } from 'react';
import { getCsrfToken } from '../../utils/csrf';

const CsrfTest: React.FC = () => {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testCsrfToken = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const csrfToken = await getCsrfToken();
      setToken(csrfToken);
      console.log('CSRF Token:', csrfToken);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get CSRF token');
      console.error('CSRF Token Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: '60px',
      right: '10px',
      background: '#1f2937',
      color: 'white',
      padding: '12px',
      borderRadius: '8px',
      fontSize: '12px',
      zIndex: 9998,
      maxWidth: '300px'
    }}>
      <h4 style={{ margin: '0 0 8px 0' }}>CSRF Test</h4>
      <button 
        onClick={testCsrfToken}
        disabled={loading}
        style={{
          background: '#3b82f6',
          color: 'white',
          border: 'none',
          padding: '4px 8px',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '10px'
        }}
      >
        {loading ? 'Testing...' : 'Test CSRF Token'}
      </button>
      
      {token && (
        <div style={{ marginTop: '8px' }}>
          <strong>Token:</strong> {token.substring(0, 20)}...
        </div>
      )}
      
      {error && (
        <div style={{ marginTop: '8px', color: '#ef4444' }}>
          <strong>Error:</strong> {error}
        </div>
      )}
    </div>
  );
};

export default CsrfTest; 