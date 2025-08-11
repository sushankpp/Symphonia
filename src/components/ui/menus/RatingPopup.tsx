import React, { useState, useEffect } from "react";
import { sendRating } from "../../../utils/sendRating";

interface RatingPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onRate: (rating: number) => void;
  title: string;
  currentRating?: number;
  type: "artist" | "song" | "album";
  rateableId: number;
}

const RatingPopup: React.FC<RatingPopupProps> = ({
  isOpen,
  onClose,
  onRate,
  title,
  currentRating = 0,
  type,
  rateableId,
}) => {
  const [rating, setRating] = useState(currentRating);
  const [hoveredRating, setHoveredRating] = useState(0);

  useEffect(() => {
    setRating(currentRating);
  }, [currentRating]);

  const handleStarClick = (starRating: number) => {
    setRating(starRating);
  };

  const handleStarHover = (starRating: number) => {
    setHoveredRating(starRating);
  };

  const handleStarLeave = () => {
    setHoveredRating(0);
  };

  const handleSubmit = async () => {
    try {
      await sendRating({ rateableId, rateableType: type, rating });
      onRate(rating);
      onClose();
    } catch (error) {
      console.error("Failed to send rating:", error);
      alert(
        `Failed to submit rating. Please try again. Error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  };

  const handleCancel = () => {
    setRating(currentRating);
    onClose();
  };

  if (!isOpen) return null;

  const renderStars = () => {
    const stars = [];
    const displayRating = hoveredRating || rating;

    for (let i = 1; i <= 5; i++) {
      stars.push(
        <button
          key={i}
          className={`rating-star ${i <= displayRating ? "filled" : ""}`}
          onClick={() => handleStarClick(i)}
          onMouseEnter={() => handleStarHover(i)}
          onMouseLeave={handleStarLeave}
          type="button"
        >
          ★
        </button>
      );
    }
    return stars;
  };

  return (
    <div className="rating-popup-overlay" onClick={onClose}>
      <div className="rating-popup" onClick={(e) => e.stopPropagation()}>
        <div className="rating-popup__header">
          <h3 className="rating-popup__title">Rate {type}</h3>
          <button
            className="rating-popup__close"
            onClick={onClose}
            type="button"
          >
            ×
          </button>
        </div>

        <div className="rating-popup__content">
          <p className="rating-popup__item-title">{title}</p>

          <div className="rating-popup__stars">{renderStars()}</div>

          <div className="rating-popup__rating-text">
            {rating > 0 ? (
              <span className="rating-text">
                {rating === 1 && "Poor"}
                {rating === 2 && "Fair"}
                {rating === 3 && "Good"}
                {rating === 4 && "Very Good"}
                {rating === 5 && "Excellent"}
              </span>
            ) : (
              <span className="rating-text">Select a rating</span>
            )}
          </div>
        </div>

        <div className="rating-popup__actions">
          <button
            className="rating-popup__btn rating-popup__btn--cancel"
            onClick={handleCancel}
            type="button"
          >
            Cancel
          </button>
          <button
            className="rating-popup__btn rating-popup__btn--submit"
            onClick={handleSubmit}
            disabled={rating === 0}
            type="button"
          >
            Submit Rating
          </button>
        </div>
      </div>
    </div>
  );
};

export default RatingPopup;
