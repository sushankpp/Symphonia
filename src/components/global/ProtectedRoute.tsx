import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import AccessDenied from "./AccessDenied";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  requireAuth?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles = [],
  requireAuth = true,
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  // If authentication is not required, render children
  if (!requireAuth) {
    return <>{children}</>;
  }

  // If user is not authenticated, redirect to home
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // If no specific roles are required, just check if user is authenticated
  if (allowedRoles.length === 0) {
    return <>{children}</>;
  }

  // Check if user has required role
  const hasRequiredRole = allowedRoles.includes(user?.role || "");

  if (!hasRequiredRole) {
    // Show access denied message instead of redirecting
    return (
      <AccessDenied
        requiredRole={allowedRoles.join(" or ")}
        message={`You need to be ${allowedRoles.join(" or ")} to access this feature.`}
      />
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
