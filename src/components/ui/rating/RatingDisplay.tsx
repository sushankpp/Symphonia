import React, { useState, useEffect } from 'react';
import { ratingService, ItemRatingsResponse } from '../../../services/ratingService';
import './RatingDisplay.scss';

interface RatingDisplayProps {
  itemId: number;
  itemType: 'song' | 'artist' | 'album';
  showDistribution?: boolean;
  compact?: boolean;
}

const RatingDisplay: React.FC<RatingDisplayProps> = ({ 
  itemId, 
  itemType, 
  showDistribution = true,
  compact = false 
}) => {
  const [ratingData, setRatingData] = useState<ItemRatingsResponse | null>(null);
  const [userRating, setUserRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchRatingData();
  }, [itemId, itemType]);

  const fetchRatingData = async () => {
    try {
      setLoading(true);
      const data = await ratingService.getItemRatings(itemId, itemType);
      setRatingData(data);
      setUserRating(data.user_rating || 0);
    } catch (error) {
      console.error('Error fetching ratings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRating = async (newRating: number) => {
    try {
      setSubmitting(true);
      await ratingService.createRating({
        rateable_id: itemId,
        rateable_type: itemType,
        rating: newRating
      });
      
      setUserRating(newRating);
      await fetchRatingData(); // Refresh rating data
    } catch (error) {
      console.error('Error submitting rating:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className={`rating-container ${compact ? 'compact' : ''}`}>
        <div className="rating-loading">Loading ratings...</div>
      </div>
    );
  }

  if (!ratingData) {
    return (
      <div className={`rating-container ${compact ? 'compact' : ''}`}>
        <div className="rating-error">Unable to load ratings</div>
      </div>
    );
  }

  return (
    <div className={`rating-container ${compact ? 'compact' : ''}`}>
      <div className="rating-stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => handleRating(star)}
            disabled={submitting}
            className={`star ${star <= userRating ? 'filled' : ''} ${submitting ? 'disabled' : ''}`}
            title={`Rate ${star} star${star > 1 ? 's' : ''}`}
          >
            ★
          </button>
        ))}
      </div>
      
      <div className="rating-info">
        <span className="average-rating">
          {ratingData.average_rating?.toFixed(1)} ★
        </span>
        <span className="total-ratings">
          ({ratingData.total_ratings} rating{ratingData.total_ratings !== 1 ? 's' : ''})
        </span>
      </div>
      
      {showDistribution && ratingData.rating_distribution && (
        <div className="rating-distribution">
          {Object.entries(ratingData.rating_distribution).reverse().map(([stars, count]) => (
            <div key={stars} className="rating-bar">
              <span className="stars-label">{stars}★</span>
              <div className="bar">
                <div 
                  className="fill" 
                  style={{
                    width: `${ratingData.total_ratings > 0 ? (count / ratingData.total_ratings) * 100 : 0}%`
                  }}
                ></div>
              </div>
              <span className="count">{count}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RatingDisplay;
