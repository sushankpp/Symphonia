import React, { useState, useEffect } from 'react';
import { ratingService, UserRatingsResponse } from '../services/ratingService';
import RatingDisplay from '../components/ui/rating/RatingDisplay';
import '../styles/blocks/user-ratings.scss';

const UserRatings: React.FC = () => {
  const [userRatings, setUserRatings] = useState<UserRatingsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'songs' | 'artists' | 'albums'>('songs');

  useEffect(() => {
    fetchUserRatings();
  }, []);

  const fetchUserRatings = async () => {
    try {
      setLoading(true);
      const data = await ratingService.getUserRatings();
      setUserRatings(data);
    } catch (error) {
      console.error('Error fetching user ratings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRatingUpdate = () => {
    fetchUserRatings(); // Refresh data when rating is updated
  };

  if (loading) {
    return (
      <div className="user-ratings-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your ratings...</p>
        </div>
      </div>
    );
  }

  if (!userRatings) {
    return (
      <div className="user-ratings-page">
        <div className="error-container">
          <h2>Error</h2>
          <p>Unable to load your ratings. Please try again later.</p>
        </div>
      </div>
    );
  }

  const getTabCount = (type: 'songs' | 'artists' | 'albums') => {
    return userRatings.ratings[type]?.length || 0;
  };

  const renderRatingItem = (rating: any, type: 'songs' | 'artists' | 'albums') => {
    const item = rating[type.slice(0, -1)]; // Remove 's' from end
    const itemId = item.id;
    
    return (
      <div key={rating.id} className="rating-item">
        <div className="item-cover">
          {type === 'songs' && (
            <img 
              src={item.song_cover_path || '/public/images/default-cover.jpg'} 
              alt={item.title}
              onError={(e) => {
                e.currentTarget.src = '/public/images/default-cover.jpg';
              }}
            />
          )}
          {type === 'artists' && (
            <img 
              src={item.profile_picture || '/public/images/default-artist.jpg'} 
              alt={item.artist_name}
              onError={(e) => {
                e.currentTarget.src = '/public/images/default-artist.jpg';
              }}
            />
          )}
          {type === 'albums' && (
            <img 
              src={item.cover_path || '/public/images/default-cover.jpg'} 
              alt={item.title}
              onError={(e) => {
                e.currentTarget.src = '/public/images/default-cover.jpg';
              }}
            />
          )}
        </div>
        
        <div className="item-info">
          <h4>{type === 'songs' ? item.title : type === 'artists' ? item.artist_name : item.title}</h4>
          <p className="item-subtitle">
            {type === 'songs' && item.artist}
            {type === 'artists' && item.bio}
            {type === 'albums' && item.artist}
          </p>
          {type === 'songs' && <p className="item-genre">{item.genre}</p>}
          
          <div className="rating-display">
            <RatingDisplay 
              itemId={itemId} 
              itemType={type.slice(0, -1) as 'song' | 'artist' | 'album'} 
              showDistribution={false}
              compact={true}
            />
          </div>
          
          <div className="rating-date">
            Rated on {new Date(rating.created_at).toLocaleDateString()}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="user-ratings-page">
      <div className="page-header">
        <h1>My Ratings</h1>
        <p className="page-subtitle">
          You have rated {userRatings.total_ratings} item{userRatings.total_ratings !== 1 ? 's' : ''} in total
        </p>
      </div>

      <div className="ratings-tabs">
        <button 
          className={`tab-btn ${activeTab === 'songs' ? 'active' : ''}`}
          onClick={() => setActiveTab('songs')}
        >
          Songs ({getTabCount('songs')})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'artists' ? 'active' : ''}`}
          onClick={() => setActiveTab('artists')}
        >
          Artists ({getTabCount('artists')})
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
            {userRatings.ratings.songs.length > 0 ? (
              <div className="ratings-grid">
                {userRatings.ratings.songs.map((rating) => renderRatingItem(rating, 'songs'))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">🎵</div>
                <h3>No Song Ratings</h3>
                <p>You haven't rated any songs yet. Start exploring and rate your favorite tracks!</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'artists' && (
          <div className="ratings-section">
            {userRatings.ratings.artists.length > 0 ? (
              <div className="ratings-grid">
                {userRatings.ratings.artists.map((rating) => renderRatingItem(rating, 'artists'))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">🎤</div>
                <h3>No Artist Ratings</h3>
                <p>You haven't rated any artists yet. Discover new artists and share your thoughts!</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'albums' && (
          <div className="ratings-section">
            {userRatings.ratings.albums.length > 0 ? (
              <div className="ratings-grid">
                {userRatings.ratings.albums.map((rating) => renderRatingItem(rating, 'albums'))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">💿</div>
                <h3>No Album Ratings</h3>
                <p>You haven't rated any albums yet. Rate your favorite albums and help others discover great music!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserRatings;
