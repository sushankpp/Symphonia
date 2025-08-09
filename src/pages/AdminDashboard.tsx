import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { adminService, AdminDashboardStats } from '../services/adminService';
import { Link } from 'react-router-dom';
import SidebarHeader from '../components/ui/headers/SidebarHeader';
import TopHeader from '../components/ui/headers/TopHeader';

const AdminDashboard: React.FC = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const data = await adminService.getDashboardStats();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  // Show loading while authentication is being checked
  if (authLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  // Redirect to home if not authenticated
  if (!isAuthenticated) {
    window.location.href = '/';
    return null;
  }

  // Check if user has admin role
  if (user?.role !== 'admin') {
    return (
      <div className="access-denied">
        <h2>Access Denied</h2>
        <p>You don't have permission to access this page.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h3>Error Loading Dashboard</h3>
        <p>{error}</p>
        <button onClick={fetchDashboardStats} className="retry-btn">
          Retry
        </button>
      </div>
    );
  }

  return (
    <>
      <SidebarHeader />
      <main className="page__home" id="primary">
        <div className="container">
          <TopHeader />
          <div className="admin-dashboard">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <p>Welcome back, {user?.name}</p>
      </div>

      {stats && (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-content">
                <h3>{stats.total_users}</h3>
                <p>Total Users</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">🎵</div>
              <div className="stat-content">
                <h3>{stats.total_artists}</h3>
                <p>Artists</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">👑</div>
              <div className="stat-content">
                <h3>{stats.total_admins}</h3>
                <p>Admins</p>
              </div>
            </div>

            <div className="stat-card pending-requests">
              <div className="stat-icon">⏳</div>
              <div className="stat-content">
                <h3>{stats.pending_role_requests}</h3>
                <p>Pending Role Requests</p>
              </div>
              <Link to="/admin/role-requests" className="view-all-link">
                View All
              </Link>
            </div>
          </div>

          <div className="dashboard-content">
            <div className="recent-section">
              <div className="recent-users">
                <div className="section-header">
                  <h3>Recent Users</h3>
                  <Link to="/admin/users" className="view-all-btn">
                    View All Users
                  </Link>
                </div>
                <div className="users-list">
                  {(stats.recent_users || []).map((user) => (
                    <div key={user.id} className="user-item">
                      <div className="user-info">
                        <h4>{user.name}</h4>
                        <p>{user.email}</p>
                        <span className={`role-badge ${user.role}`}>
                          {user.role}
                        </span>
                      </div>
                      <div className="user-meta">
                        <span className={`status ${user.status}`}>
                          {user.status}
                        </span>
                        <small>
                          {new Date(user.created_at).toLocaleDateString()}
                        </small>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="recent-requests">
                <div className="section-header">
                  <h3>Recent Role Requests</h3>
                  <Link to="/admin/role-requests" className="view-all-btn">
                    View All Requests
                  </Link>
                </div>
                <div className="requests-list">
                  {(stats.recent_role_requests || []).map((request) => (
                    <div key={request.id} className="request-item">
                      <div className="request-info">
                        <h4>{request.user.name}</h4>
                        <p>{request.user.email}</p>
                        <div className="request-details">
                          <span className="role-change">
                            Requesting: <strong>{request.requested_role}</strong>
                          </span>
                          <p className="reason">{request.reason}</p>
                        </div>
                      </div>
                      <div className="request-meta">
                        <span className={`status ${request.status}`}>
                          {request.status}
                        </span>
                        <small>
                          {new Date(request.created_at).toLocaleDateString()}
                        </small>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="quick-actions">
            <h3>Quick Actions</h3>
            <div className="actions-grid">
              <Link to="/admin/users" className="action-card">
                <div className="action-icon">👥</div>
                <h4>Manage Users</h4>
                <p>View, edit, and manage user accounts</p>
              </Link>

              <Link to="/admin/role-requests" className="action-card">
                <div className="action-icon">📝</div>
                <h4>Role Requests</h4>
                <p>Review and approve role change requests</p>
              </Link>

              <Link to="/admin/users?role=artist" className="action-card">
                <div className="action-icon">🎵</div>
                <h4>Manage Artists</h4>
                <p>View and manage artist accounts</p>
              </Link>

              <Link to="/admin/users?role=admin" className="action-card">
                <div className="action-icon">👑</div>
                <h4>Manage Admins</h4>
                <p>View and manage admin accounts</p>
              </Link>
            </div>
          </div>
        </>
      )}
          </div>
        </div>
      </main>
    </>
  );
};

export default AdminDashboard;
