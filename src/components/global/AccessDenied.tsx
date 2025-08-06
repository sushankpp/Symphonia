import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface AccessDeniedProps {
  requiredRole?: string;
  message?: string;
}

const AccessDenied: React.FC<AccessDeniedProps> = ({ 
  requiredRole = 'artist or admin',
  message = "You don't have permission to access this feature."
}) => {
  const { user } = useAuth();

  return (
    <div className="access-denied">
      <div className="access-denied__content">
        <div className="access-denied__icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/>
          </svg>
        </div>
        <h2>Access Denied</h2>
        <p>{message}</p>
        {user && (
          <div className="access-denied__user-info">
            <p>Current role: <strong>{user.role}</strong></p>
            <p>Required role: <strong>{requiredRole}</strong></p>
          </div>
        )}
        <div className="access-denied__actions">
          <button 
            onClick={() => window.history.back()} 
            className="btn btn--secondary"
          >
            Go Back
          </button>
          <button 
            onClick={() => window.location.href = '/'} 
            className="btn btn--primary"
          >
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccessDenied; 