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

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!requireAuth) {
    return <>{children}</>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles.length === 0) {
    return <>{children}</>;
  }

  const hasRequiredRole = allowedRoles.includes(user?.role || "");

  if (!hasRequiredRole) {
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
