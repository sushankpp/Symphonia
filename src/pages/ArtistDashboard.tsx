import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { artistService, DashboardResponse } from "../services/artistService";
import { Link } from "react-router-dom";
import SidebarHeader from "../components/ui/headers/SidebarHeader";
import TopHeader from "../components/ui/headers/TopHeader";

const ArtistDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      
      const data = await artistService.getDashboardStats();
      console.log("Dashboard API Response:", data);
      setDashboardData(data);
    } catch (err) {
      console.error("Dashboard API Error:", err);
      setError(err instanceof Error ? err.message : "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number | undefined) => {
    if (num === undefined || num === null) return "0";
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
      // Fallback: clear localStorage and redirect
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
  };

  if (user?.role !== "artist") {
    return (
      <div className="access-denied">
        <h2>Access Denied</h2>
        <p>You need to be an artist to access this page.</p>
        <button 
          onClick={handleLogout}
          className="logout-btn"
        >
          Logout
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading your dashboard...</p>
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
          <div className="artist-dashboard">
            <div className="artist-header">
              <h1>Artist Dashboard</h1>
              <p>Welcome back, {user?.name}</p>
            </div>

            {dashboardData && (
              <>
                {/* Main Stats Grid */}
                <div className="stats-grid">
                  <div className="stat-card primary">
                    <div className="stat-icon">🎵</div>
                    <div className="stat-content">
                      <h3>{dashboardData.stats.total_tracks}</h3>
                      <p>Total Tracks</p>
                    </div>
                  </div>

                  <div className="stat-card success">
                    <div className="stat-icon">👀</div>
                    <div className="stat-content">
                      <h3>{formatNumber(dashboardData.stats.total_views)}</h3>
                      <p>Total Views</p>
                    </div>
                  </div>

                  <div className="stat-card warning">
                    <div className="stat-icon">⭐</div>
                    <div className="stat-content">
                      <h3>{dashboardData.stats.total_ratings}</h3>
                      <p>Total Ratings</p>
                    </div>
                  </div>

                  <div className="stat-card info">
                    <div className="stat-icon">📊</div>
                    <div className="stat-content">
                      <h3>
                        {dashboardData.stats.average_rating
                          ? dashboardData.stats.average_rating.toFixed(1)
                          : "0.0"}
                        /5
                      </h3>
                      <p>Average Rating</p>
                    </div>
                  </div>
                </div>

                {/* Charts and Analytics */}
                <div className="analytics-section">
                  <div className="chart-container">
                    <h3>Monthly Analytics (Last 6 Months)</h3>
                    <div className="monthly-chart">
                      {dashboardData.stats.monthly_stats.map((month, index) => {
                        const maxViews = Math.max(
                          ...dashboardData.stats.monthly_stats.map(
                            (m) => m.views || 0
                          )
                        );
                        const maxRatings = Math.max(
                          ...dashboardData.stats.monthly_stats.map(
                            (m) => m.ratings || 0
                          )
                        );

                        return (
                          <div key={index} className="month-stat">
                            <div className="month-label">{month.month}</div>
                            <div className="month-bars">
                              <div
                                className="play-bar"
                                style={{
                                  height: `${Math.max(10, maxViews > 0 ? (month.views / maxViews) * 100 : 10)}px`,
                                }}
                                title={`${month.views} views`}
                              ></div>
                              <div
                                className="rating-bar"
                                style={{
                                  height: `${Math.max(10, maxRatings > 0 ? (month.ratings / maxRatings) * 100 : 10)}px`,
                                }}
                                title={`${month.ratings} ratings`}
                              ></div>
                            </div>
                            <div className="month-values">
                              <span className="plays">
                                {formatNumber(month.views)} views
                              </span>
                              <span className="ratings">
                                {month.ratings} ratings
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="chart-legend">
                      <div className="legend-item">
                        <div className="legend-color play-color"></div>
                        <span>Views</span>
                      </div>
                      <div className="legend-item">
                        <div className="legend-color rating-color"></div>
                        <span>Ratings</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Top Tracks */}
                <div className="top-tracks-section">
                  <div className="top-rated-tracks">
                    <div className="section-header">
                      <h3>Top Rated Tracks</h3>
                      <Link
                        to="/artist/music?sort_by=rating&sort_order=desc"
                        className="view-all-btn"
                      >
                        View All
                      </Link>
                    </div>
                    <div className="tracks-list">
                      {dashboardData.top_rated_tracks.map((track) => (
                        <div key={track.id} className="track-item">
                          <div className="track-info">
                            <h4>{track.title}</h4>
                            <div className="track-stats">
                              <span className="rating">
                                ⭐ {track.ratings_count} ratings
                              </span>
                              <span className="views">
                                👀 {formatNumber(track.views)} views
                              </span>
                            </div>
                          </div>
                          <div className="track-actions">
                            <Link
                              to={`/artist/music/${track.id}/stats`}
                              className="view-stats-btn"
                            >
                              View Stats
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="most-viewed-tracks">
                    <div className="section-header">
                      <h3>Most Viewed Tracks</h3>
                      <Link
                        to="/artist/music?sort_by=views&sort_order=desc"
                        className="view-all-btn"
                      >
                        View All
                      </Link>
                    </div>
                    <div className="tracks-list">
                      {Object.values(dashboardData.most_viewed_tracks).map(
                        (track) => (
                          <div key={track.id} className="track-item">
                            <div className="track-info">
                              <h4>{track.title}</h4>
                              <div className="track-stats">
                                <span className="views">
                                  👀 {formatNumber(track.views)} views
                                </span>
                                <span className="rating">
                                  ⭐ {track.ratings_count || 0} ratings
                                </span>
                              </div>
                            </div>
                            <div className="track-actions">
                              <Link
                                to={`/artist/music/${track.id}/stats`}
                                className="view-stats-btn"
                              >
                                View Stats
                              </Link>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="recent-activity-section">
                  <h3>Recent Activity</h3>
                  <div className="activity-list">
                    {dashboardData.recent_activity.map((activity) => (
                      <div key={activity.id} className="activity-item">
                        <div className="activity-icon">👤</div>
                        <div className="activity-content">
                          <div className="activity-description">
                            <strong>{activity.user.name}</strong> played{" "}
                            <strong>{activity.song.title}</strong>
                          </div>
                          <div className="activity-time">
                            {new Date(activity.created_at).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="quick-actions">
                  <h3>Quick Actions</h3>
                  <div className="actions-grid">
                    <Link to="/upload" className="action-card">
                      <div className="action-icon">⬆️</div>
                      <h4>Upload New Track</h4>
                      <p>Share your latest music with the world</p>
                    </Link>

                    <Link to="/artist/music" className="action-card">
                      <div className="action-icon">🎵</div>
                      <h4>Manage Music</h4>
                      <p>View and edit your uploaded tracks</p>
                    </Link>

                    <Link to="/profile" className="action-card">
                      <div className="action-icon">👤</div>
                      <h4>Edit Profile</h4>
                      <p>Update your artist information</p>
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

export default ArtistDashboard;
