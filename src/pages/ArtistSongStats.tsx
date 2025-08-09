import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { artistService, SongStats } from '../services/artistService';
import { useParams, Link } from 'react-router-dom';
import SidebarHeader from '../components/ui/headers/SidebarHeader';
import TopHeader from '../components/ui/headers/TopHeader';

const ArtistSongStats: React.FC = () => {
  const { user } = useAuth();
  const { songId } = useParams<{ songId: string }>();
  const [stats, setStats] = useState<SongStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'ratings' | 'plays'>('overview');

  useEffect(() => {
    if (songId) {
      fetchSongStats(parseInt(songId));
    }
  }, [songId]);

  const fetchSongStats = async (id: number) => {
    try {
      setLoading(true);
      const data = await artistService.getSongStats(id);
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load song statistics');
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

  const getRatingStars = (rating: number) => {
    return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
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
        <p>Loading song statistics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h3>Error Loading Statistics</h3>
        <p>{error}</p>
        <Link to="/artist/music" className="back-btn">
          Back to Music
        </Link>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="no-data">
        <h3>Song Not Found</h3>
        <Link to="/artist/music" className="back-btn">
          Back to Music
        </Link>
      </div>
    );
  }

  return (
    <>
      <SidebarHeader />
      <main className="page__home" id="primary">
        <div className="container">
          <TopHeader />
          <div className="artist-song-stats">
      <div className="page-header">
        <div className="header-content">
          <Link to="/artist/music" className="back-link">← Back to Music</Link>
          <h1>{stats.song.title}</h1>
          <p className="song-meta">
            <span className="genre">{stats.song.genre}</span>
            {stats.song.release_date && (
              <span className="release-date">
                Released: {new Date(stats.song.release_date).toLocaleDateString()}
              </span>
            )}
          </p>
        </div>
        <div className="header-actions">
          <Link to={`/artist/music/${stats.song.id}/edit`} className="edit-btn">
            Edit Track
          </Link>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="overview-stats">
        <div className="stat-card">
          <div className="stat-icon">👀</div>
          <div className="stat-content">
            <h3>{formatNumber(stats.song.total_plays)}</h3>
            <p>Total Plays</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-content">
            <h3>{stats.song.average_rating.toFixed(1)}/5</h3>
            <p>Average Rating</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>{stats.song.total_ratings}</h3>
            <p>Total Ratings</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <h3>{new Date(stats.song.created_at).toLocaleDateString()}</h3>
            <p>Upload Date</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`tab-btn ${activeTab === 'ratings' ? 'active' : ''}`}
          onClick={() => setActiveTab('ratings')}
        >
          Ratings ({stats.all_ratings.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'plays' ? 'active' : ''}`}
          onClick={() => setActiveTab('plays')}
        >
          Recent Plays
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            {/* Ratings Breakdown */}
            <div className="ratings-breakdown">
              <h3>Ratings Breakdown</h3>
              <div className="ratings-chart">
                {[5, 4, 3, 2, 1].map((rating) => {
                  const count = parseInt(stats.ratings_breakdown[rating] || '0');
                  const percentage = stats.song.total_ratings > 0 
                    ? (count / stats.song.total_ratings) * 100 
                    : 0;
                  
                  return (
                    <div key={rating} className="rating-row">
                      <div className="rating-label">
                        {getRatingStars(rating)}
                      </div>
                      <div className="rating-bar">
                        <div 
                          className="rating-fill" 
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <div className="rating-count">
                        {count} ({percentage.toFixed(1)}%)
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Daily Plays Chart */}
            <div className="daily-plays-chart">
              <h3>Daily Plays (Last 30 Days)</h3>
              <div className="plays-chart">
                {stats.daily_plays.map((day, index) => {
                  const maxPlays = Math.max(...stats.daily_plays.map(d => d.plays));
                  const height = maxPlays > 0 ? (day.plays / maxPlays) * 100 : 0;
                  
                  return (
                    <div key={index} className="day-bar">
                      <div 
                        className="bar-fill" 
                        style={{ height: `${Math.max(2, height)}%` }}
                        title={`${day.date}: ${day.plays} plays`}
                      ></div>
                      <div className="day-label">
                        {new Date(day.date).toLocaleDateString('en', { day: 'numeric' })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'ratings' && (
          <div className="ratings-tab">
            <div className="ratings-list">
              {stats.all_ratings.length === 0 ? (
                <div className="no-data">
                  <p>No ratings yet</p>
                </div>
              ) : (
                stats.all_ratings.map((rating) => (
                  <div key={rating.id} className="rating-item">
                    <div className="rating-user">
                      <div className="user-avatar">
                        {rating.user.profile_picture ? (
                          <img src={rating.user.profile_picture} alt={rating.user.name} />
                        ) : (
                          <div className="avatar-placeholder">
                            {rating.user.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="user-info">
                        <h4>{rating.user.name}</h4>
                        <div className="rating-stars">
                          {getRatingStars(rating.rating)}
                        </div>
                      </div>
                    </div>
                    <div className="rating-content">
                      {rating.comment && (
                        <p className="rating-comment">{rating.comment}</p>
                      )}
                      <div className="rating-date">
                        {new Date(rating.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'plays' && (
          <div className="plays-tab">
            <div className="plays-list">
              {stats.recent_plays.length === 0 ? (
                <div className="no-data">
                  <p>No recent plays</p>
                </div>
              ) : (
                stats.recent_plays.map((play) => (
                  <div key={play.id} className="play-item">
                    <div className="play-user">
                      <div className="user-avatar">
                        {play.user.profile_picture ? (
                          <img src={play.user.profile_picture} alt={play.user.name} />
                        ) : (
                          <div className="avatar-placeholder">
                            {play.user.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="user-info">
                        <h4>{play.user.name}</h4>
                        <p>played your track</p>
                      </div>
                    </div>
                    <div className="play-time">
                      {new Date(play.played_at).toLocaleString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Song Details */}
      {stats.song.description && (
        <div className="song-details">
          <h3>Description</h3>
          <p>{stats.song.description}</p>
        </div>
      )}

      {stats.song.lyrics && (
        <div className="song-lyrics">
          <h3>Lyrics</h3>
          <pre>{stats.song.lyrics}</pre>
        </div>
      )}
          </div>
        </div>
      </main>
    </>
  );
};

export default ArtistSongStats;
