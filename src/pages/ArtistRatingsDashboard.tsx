import React, { useState, useEffect } from 'react';
import { ratingService, ArtistRatingsResponse } from '../services/ratingService';
import RatingDisplay from '../components/ui/rating/RatingDisplay';
import '../styles/blocks/artist-ratings-dashboard.scss';

const ArtistRatingsDashboard: React.FC = () => {
  const [artistRatings, setArtistRatings] = useState<ArtistRatingsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'songs' | 'profile' | 'albums'>('songs');

  useEffect(() => {
    fetchArtistRatings();
  }, []);

  const fetchArtistRatings = async () => {
    try {
      setLoading(true);
      const data = await ratingService.getArtistRatings();
      setArtistRatings(data);
    } catch (error) {
      console.error('Error fetching artist ratings:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="artist-ratings-dashboard">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your ratings dashboard...</p>
        </div>
      </div>
    );
  }

  if (!artistRatings) {
    return (
      <div className="artist-ratings-dashboard">
        <div className="error-container">
          <h2>Error</h2>
          <p>Unable to load your ratings dashboard. Please try again later.</p>
        </div>
      </div>
    );
  }

  const getTabCount = (type: 'songs' | 'profile' | 'albums') => {
    if (type === 'profile') {
      return artistRatings.ratings.artist_profile?.length || 0;
    }
    return artistRatings.ratings[type]?.length || 0;
  };

  const renderRatingItem = (rating: any, type: 'songs' | 'profile' | 'albums') => {
    if (type === 'profile') {
      return (
        <div key={rating.id} className="rating-item profile-rating">
          <div className="user-info">
            <div className="user-avatar">
              <span>{rating.user.name.charAt(0).toUpperCase()}</span>
            </div>
            <div className="user-details">
              <h4>{rating.user.name}</h4>
              <p>{rating.user.email}</p>
            </div>
          </div>
          
          <div className="rating-details">
            <div className="stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <span key={star} className={star <= rating.rating ? 'filled' : ''}>
                  ★
                </span>
              ))}
            </div>
            <p className="rating-date">
              {new Date(rating.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      );
    }

    const item = rating[type.slice(0, -1)]; // Remove 's' from end
    const itemId = item.id;
    
    return (
      <div key={rating.id} className="rating-item">
        <div className="item-info">
          <h4>{item.title}</h4>
          {type === 'songs' && <p className="item-genre">{item.genre}</p>}
        </div>
        
        <div className="user-info">
          <div className="user-avatar">
            <span>{rating.user.name.charAt(0).toUpperCase()}</span>
          </div>
          <div className="user-details">
            <h5>{rating.user.name}</h5>
            <p>{rating.user.email}</p>
          </div>
        </div>
        
        <div className="rating-details">
          <div className="stars">
            {[1, 2, 3, 4, 5].map((star) => (
              <span key={star} className={star <= rating.rating ? 'filled' : ''}>
                ★
              </span>
            ))}
          </div>
          <p className="rating-date">
            {new Date(rating.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="artist-ratings-dashboard">
      <div className="page-header">
        <h1>My Ratings Dashboard</h1>
        <p className="page-subtitle">
          Track how your content is being received by listeners
        </p>
      </div>

      <div className="summary-stats">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>Total Ratings</h3>
            <p className="stat-number">{artistRatings.summary.total_ratings}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-content">
            <h3>Average Rating</h3>
            <p className="stat-number">{artistRatings.summary.average_rating.toFixed(1)} ★</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">🎵</div>
          <div className="stat-content">
            <h3>Songs Rated</h3>
            <p className="stat-number">{artistRatings.ratings.songs.length}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">👤</div>
          <div className="stat-content">
            <h3>Profile Ratings</h3>
            <p className="stat-number">{artistRatings.ratings.artist_profile.length}</p>
          </div>
        </div>
      </div>

      <div className="rating-distribution-section">
        <h2>Rating Distribution</h2>
        <div className="distribution-chart">
          {Object.entries(artistRatings.summary.rating_distribution).reverse().map(([stars, count]) => (
            <div key={stars} className="distribution-bar">
              <span className="stars-label">{stars}★</span>
              <div className="bar">
                <div 
                  className="fill" 
                  style={{
                    width: `${artistRatings.summary.total_ratings > 0 ? (count / artistRatings.summary.total_ratings) * 100 : 0}%`
                  }}
                ></div>
              </div>
              <span className="count">{count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="ratings-tabs">
        <button 
          className={`tab-btn ${activeTab === 'songs' ? 'active' : ''}`}
          onClick={() => setActiveTab('songs')}
        >
          Songs ({getTabCount('songs')})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          Profile ({getTabCount('profile')})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'albums' ? 'active' : ''}`}
          onClick={() => setActiveTab('albums')}
        >
          Albums ({getTabCount('albums')})
        </button>
      </div>

      <div className="ratings-content">
        {activeTab === 'songs' && (
          <div className="ratings-section">
            {artistRatings.ratings.songs.length > 0 ? (
              <div className="ratings-list">
                {artistRatings.ratings.songs.map((rating) => renderRatingItem(rating, 'songs'))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">🎵</div>
                <h3>No Song Ratings Yet</h3>
                <p>Your songs haven't received any ratings yet. Keep creating great music!</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="ratings-section">
            {artistRatings.ratings.artist_profile.length > 0 ? (
              <div className="ratings-list">
                {artistRatings.ratings.artist_profile.map((rating) => renderRatingItem(rating, 'profile'))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">👤</div>
                <h3>No Profile Ratings Yet</h3>
                <p>Your artist profile hasn't received any ratings yet.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'albums' && (
          <div className="ratings-section">
            {artistRatings.ratings.albums.length > 0 ? (
              <div className="ratings-list">
                {artistRatings.ratings.albums.map((rating) => renderRatingItem(rating, 'albums'))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">💿</div>
                <h3>No Album Ratings Yet</h3>
                <p>Your albums haven't received any ratings yet.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ArtistRatingsDashboard;
