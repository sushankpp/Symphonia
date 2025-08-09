import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { artistService, ArtistDashboardStats } from '../services/artistService';
import { Link } from 'react-router-dom';
import SidebarHeader from '../components/ui/headers/SidebarHeader';
import TopHeader from '../components/ui/headers/TopHeader';

const ArtistDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<ArtistDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const data = await artistService.getDashboardStats();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  if (user?.role !== 'artist') {
    return (
      <div className="access-denied">
        <h2>Access Denied</h2>
        <p>You need to be an artist to access this page.</p>
        <Link to="/profile" className="role-request-link">
          Request Artist Role
        </Link>
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

      {stats && (
        <>
          {/* Main Stats Grid */}
          <div className="stats-grid">
            <div className="stat-card primary">
              <div className="stat-icon">🎵</div>
              <div className="stat-content">
                <h3>{stats.total_tracks}</h3>
                <p>Total Tracks</p>
              </div>
            </div>

            <div className="stat-card success">
              <div className="stat-icon">👀</div>
              <div className="stat-content">
                <h3>{formatNumber(stats.total_views)}</h3>
                <p>Total Views</p>
              </div>
            </div>

            <div className="stat-card warning">
              <div className="stat-icon">⭐</div>
              <div className="stat-content">
                <h3>{stats.total_ratings}</h3>
                <p>Total Ratings</p>
              </div>
            </div>

            <div className="stat-card info">
              <div className="stat-icon">📊</div>
              <div className="stat-content">
                <h3>{stats.average_rating.toFixed(1)}/5</h3>
                <p>Average Rating</p>
              </div>
            </div>
          </div>

          {/* Charts and Analytics */}
          <div className="analytics-section">
            <div className="chart-container">
              <h3>Monthly Analytics (Last 6 Months)</h3>
              <div className="monthly-chart">
                {stats.monthly_analytics.map((month, index) => (
                  <div key={index} className="month-stat">
                    <div className="month-label">{month.month}</div>
                    <div className="month-bars">
                      <div 
                        className="play-bar" 
                        style={{ 
                          height: `${Math.max(10, (month.plays / Math.max(...stats.monthly_analytics.map(m => m.plays))) * 100)}px` 
                        }}
                        title={`${month.plays} plays`}
                      ></div>
                      <div 
                        className="rating-bar" 
                        style={{ 
                          height: `${Math.max(10, (month.ratings / Math.max(...stats.monthly_analytics.map(m => m.ratings))) * 100)}px` 
                        }}
                        title={`${month.ratings} ratings`}
                      ></div>
                    </div>
                    <div className="month-values">
                      <span className="plays">{formatNumber(month.plays)} plays</span>
                      <span className="ratings">{month.ratings} ratings</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="chart-legend">
                <div className="legend-item">
                  <div className="legend-color play-color"></div>
                  <span>Plays</span>
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
                <Link to="/artist/music?sort_by=ratings&sort_order=desc" className="view-all-btn">
                  View All
                </Link>
              </div>
              <div className="tracks-list">
                {stats.top_rated_tracks.map((track) => (
                  <div key={track.id} className="track-item">
                    <div className="track-info">
                      <h4>{track.title}</h4>
                      <div className="track-stats">
                        <span className="rating">⭐ {track.average_rating.toFixed(1)}/5</span>
                        <span className="rating-count">({track.total_ratings} ratings)</span>
                      </div>
                    </div>
                    <div className="track-actions">
                      <Link to={`/artist/music/${track.id}/stats`} className="view-stats-btn">
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
                <Link to="/artist/music?sort_by=views&sort_order=desc" className="view-all-btn">
                  View All
                </Link>
              </div>
              <div className="tracks-list">
                {stats.most_viewed_tracks.map((track) => (
                  <div key={track.id} className="track-item">
                    <div className="track-info">
                      <h4>{track.title}</h4>
                      <div className="track-stats">
                        <span className="views">👀 {formatNumber(track.total_plays)} plays</span>
                      </div>
                    </div>
                    <div className="track-actions">
                      <Link to={`/artist/music/${track.id}/stats`} className="view-stats-btn">
                        View Stats
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="recent-activity-section">
            <h3>Recent Activity</h3>
            <div className="activity-list">
              {stats.recent_activity.map((activity) => (
                <div key={activity.id} className="activity-item">
                  <div className="activity-icon">
                    {activity.type === 'play' && '▶️'}
                    {activity.type === 'rating' && '⭐'}
                    {activity.type === 'upload' && '⬆️'}
                  </div>
                  <div className="activity-content">
                    <div className="activity-description">
                      {activity.type === 'play' && (
                        <>
                          <strong>{activity.user?.name || 'Someone'}</strong> played{' '}
                          <strong>{activity.song.title}</strong>
                        </>
                      )}
                      {activity.type === 'rating' && (
                        <>
                          <strong>{activity.user?.name || 'Someone'}</strong> rated{' '}
                          <strong>{activity.song.title}</strong>
                          {activity.details?.rating && (
                            <span className="rating-value"> {activity.details.rating}/5 ⭐</span>
                          )}
                        </>
                      )}
                      {activity.type === 'upload' && (
                        <>
                          You uploaded <strong>{activity.song.title}</strong>
                        </>
                      )}
                    </div>
                    <div className="activity-time">
                      {new Date(activity.created_at).toRelativeTimeString?.() || 
                       new Date(activity.created_at).toLocaleString()}
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

              <Link to="/artist/analytics" className="action-card">
                <div className="action-icon">📊</div>
                <h4>Detailed Analytics</h4>
                <p>Deep dive into your music performance</p>
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
