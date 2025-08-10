import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { artistService, ArtistMusic, MusicResponse } from '../services/artistService';
import { Link } from 'react-router-dom';
import SidebarHeader from '../components/ui/headers/SidebarHeader';
import TopHeader from '../components/ui/headers/TopHeader';

const ArtistMusicPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [music, setMusic] = useState<ArtistMusic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingTrack, setEditingTrack] = useState<ArtistMusic | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  
  // Pagination and sorting
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [perPage] = useState(15);
  const [sortBy, setSortBy] = useState<'created_at' | 'views' | 'rating'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    fetchMusic();
  }, [currentPage, sortBy, sortOrder]);

  const fetchMusic = async () => {
    try {
      setLoading(true);
      setError(null);
      const response: MusicResponse = await artistService.getMusic({
        per_page: perPage,
        sort_by: sortBy,
        sort_order: sortOrder,
      });
      
      console.log('Music API Response:', response);
      
      setMusic(response.music.data || []);
      setCurrentPage(response.music.current_page || 1);
      setTotalPages(Math.ceil(response.music.total / response.music.per_page) || 1);
      setTotal(response.music.total || 0);
    } catch (err) {
      console.error('Music API Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load music');
      setMusic([])
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: typeof sortBy) => {
    if (field === sortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setCurrentPage(1);
  };

  const handleEditTrack = (track: ArtistMusic) => {
    setEditingTrack({ ...track });
    setShowEditModal(true);
  };

  const handleUpdateTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTrack) return;

    try {
      const updatedTrack = await artistService.updateSong(editingTrack.id, {
        title: editingTrack.title,
        genre: editingTrack.genre,
      });
      
      setMusic(music.map(track => track.id === updatedTrack.id ? updatedTrack : track));
      setEditingTrack(null);
      setShowEditModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update track');
    }
  };

  const handleDeleteTrack = async (trackId: number) => {
    if (!confirm('Are you sure you want to delete this track? This action cannot be undone.')) {
      return;
    }

    try {
      await artistService.deleteSong(trackId);
      setMusic(music.filter(track => track.id !== trackId));
      setTotal(total - 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete track');
    }
  };

  const formatNumber = (num: number | undefined) => {
    if (num === undefined || num === null) return '0';
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const getSortIcon = (field: typeof sortBy) => {
    if (field !== sortBy) return '↕️';
    return sortOrder === 'asc' ? '↑' : '↓';
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

  if (user?.role !== 'artist') {
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

  return (
    <>
      <SidebarHeader />
      <main className="page__home" id="primary">
        <div className="container">
          <TopHeader />
          <div className="artist-music">
      <div className="page-header">
        <h1>My Music</h1>
        <div className="header-actions">
          <Link to="/upload" className="upload-btn">
            Upload New Track
          </Link>
        </div>
      </div>

      {/* Sort Controls */}
      <div className="controls-section">
        <div className="sort-controls">
          <span>Sort by:</span>
          <button
            className={`sort-btn ${sortBy === 'created_at' ? 'active' : ''}`}
            onClick={() => handleSort('created_at')}
          >
            Date {getSortIcon('created_at')}
          </button>
          <button
            className={`sort-btn ${sortBy === 'views' ? 'active' : ''}`}
            onClick={() => handleSort('views')}
          >
            Views {getSortIcon('views')}
          </button>
          <button
            className={`sort-btn ${sortBy === 'rating' ? 'active' : ''}`}
            onClick={() => handleSort('rating')}
          >
            Rating {getSortIcon('rating')}
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading your music...</p>
        </div>
      ) : (
        <>
          <div className="music-grid">
            {music && music.length > 0 ? music.map((track) => (
              <div key={track.id} className="music-card">
                <div className="music-cover">
                  {track.song_cover_url ? (
                    <img src={track.song_cover_url} alt={track.title} />
                  ) : (
                    <div className="placeholder-cover">
                      🎵
                    </div>
                  )}
                  <div className="music-overlay">
                    <Link to={`/artist/music/${track.id}/stats`} className="stats-btn">
                      📊 View Stats
                    </Link>
                  </div>
                </div>

                <div className="music-info">
                  <h3>{track.title}</h3>
                  <p className="genre">{track.genre}</p>
                  
                  <div className="music-stats">
                    <div className="stat-item">
                      <span className="stat-icon">👀</span>
                      <span>{formatNumber(track.views)} views</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-icon">⭐</span>
                      <span>
                        {track.ratings_avg_rating ? track.ratings_avg_rating.toFixed(1) : '0.0'}/5 
                        ({track.ratings_count || 0})
                      </span>
                    </div>
                  </div>

                  <div className="music-meta">
                    <span className="upload-date">
                      Uploaded: {new Date(track.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="music-actions">
                    <button
                      onClick={() => handleEditTrack(track)}
                      className="action-btn edit-btn"
                    >
                      Edit
                    </button>
                    <Link
                      to={`/artist/music/${track.id}/stats`}
                      className="action-btn stats-btn"
                    >
                      Stats
                    </Link>
                    <button
                      onClick={() => handleDeleteTrack(track.id)}
                      className="action-btn delete-btn"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )) : null}
          </div>

          {music && music.length === 0 && !loading && (
            <div className="no-music">
              <div className="no-music-icon">🎵</div>
              <h3>No music uploaded yet</h3>
              <p>Start sharing your music with the world!</p>
              <Link to="/upload" className="upload-btn">
                Upload Your First Track
              </Link>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="pagination-btn"
              >
                Previous
              </button>
              
              <span className="pagination-info">
                Page {currentPage} of {totalPages} ({total} tracks)
              </span>
              
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="pagination-btn"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Edit Track Modal */}
      {showEditModal && editingTrack && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Track</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="close-btn"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleUpdateTrack} className="modal-body">
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={editingTrack.title}
                  onChange={(e) => setEditingTrack({ ...editingTrack, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Genre</label>
                <input
                  type="text"
                  value={editingTrack.genre}
                  onChange={(e) => setEditingTrack({ ...editingTrack, genre: e.target.value })}
                  required
                />
              </div>

              <div className="form-actions">
                <button type="button" onClick={() => setShowEditModal(false)} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="save-btn">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
          </div>
        </div>
      </main>
    </>
  );
};

export default ArtistMusicPage;
