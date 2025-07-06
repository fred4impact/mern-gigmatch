import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { 
  FaStar, 
  FaUser, 
  FaCalendarAlt, 
  FaThumbsUp,
  FaClock,
  FaComments,
  FaCheck
} from 'react-icons/fa';
import toast from 'react-hot-toast';

const ReviewForm = ({ event, talent, onSubmit, onCancel }) => {
  const [overallRating, setOverallRating] = useState(0);
  const [categoryRatings, setCategoryRatings] = useState({
    professionalism: 0,
    punctuality: 0,
    quality: 0,
    communication: 0
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm();

  const handleOverallRatingChange = (rating) => {
    setOverallRating(rating);
  };

  const handleCategoryRatingChange = (category, rating) => {
    setCategoryRatings(prev => ({
      ...prev,
      [category]: rating
    }));
  };

  const renderStars = (rating, onRatingChange, size = 'text-lg') => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onRatingChange(star)}
            className={`${size} ${
              star <= rating ? 'text-yellow-400' : 'text-gray-300'
            } hover:text-yellow-400 transition-colors`}
          >
            <FaStar />
          </button>
        ))}
      </div>
    );
  };

  const getCategoryLabel = (category) => {
    const labels = {
      professionalism: 'Professionalism',
      punctuality: 'Punctuality',
      quality: 'Quality of Work',
      communication: 'Communication'
    };
    return labels[category] || category;
  };

  const handleFormSubmit = async (data) => {
    if (overallRating === 0) {
      toast.error('Please provide an overall rating');
      return;
    }

    const reviewData = {
      rating: overallRating,
      comment: data.comment,
      categories: categoryRatings
    };

    try {
      await onSubmit(reviewData);
      toast.success('Review submitted successfully!');
      reset();
      setOverallRating(0);
      setCategoryRatings({
        professionalism: 0,
        punctuality: 0,
        quality: 0,
        communication: 0
      });
    } catch (error) {
      toast.error('Error submitting review');
    }
  };

  return (
    <div className="review-form">
      <div className="review-form-header">
        <h3 className="review-form-title">Leave a Review</h3>
        <p className="review-form-subtitle">
          Share your experience working with {talent.firstName} {talent.lastName}
        </p>
      </div>

      {/* Event Info */}
      <div className="review-event-info">
        <div className="event-details">
          <h4 className="event-title">{event.title}</h4>
          <div className="event-meta">
            <span className="event-date">
              <FaCalendarAlt className="event-icon" />
              {new Date(event.date).toLocaleDateString()}
            </span>
            <span className="event-location">
              <FaUser className="event-icon" />
              {event.location.city}, {event.location.state}
            </span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="review-form-content">
        {/* Overall Rating */}
        <div className="review-section">
          <label className="review-label">
            Overall Rating *
          </label>
          <div className="rating-container">
            {renderStars(overallRating, handleOverallRatingChange, 'text-2xl')}
            <span className="rating-text">
              {overallRating > 0 ? `${overallRating} out of 5 stars` : 'Select rating'}
            </span>
          </div>
        </div>

        {/* Category Ratings */}
        <div className="review-section">
          <label className="review-label">
            Detailed Ratings
          </label>
          <div className="category-ratings">
            {Object.entries(categoryRatings).map(([category, rating]) => (
              <div key={category} className="category-rating">
                <div className="category-label">
                  <span>{getCategoryLabel(category)}</span>
                </div>
                <div className="category-stars">
                  {renderStars(rating, (value) => handleCategoryRatingChange(category, value))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Review Comment */}
        <div className="review-section">
          <label className="review-label">
            Your Review
          </label>
          <textarea
            className={`review-textarea${errors.comment ? ' is-invalid' : ''}`}
            placeholder="Share your experience working with this talent. What went well? What could be improved?"
            rows="4"
            {...register('comment', {
              maxLength: { value: 500, message: 'Review cannot exceed 500 characters' }
            })}
          />
          {errors.comment && (
            <div className="review-error">{errors.comment.message}</div>
          )}
        </div>

        {/* Form Actions */}
        <div className="review-actions">
          <button
            type="button"
            onClick={onCancel}
            className="review-btn review-btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="review-btn review-btn-primary"
            disabled={overallRating === 0}
          >
            <FaCheck className="review-btn-icon" />
            Submit Review
          </button>
        </div>
      </form>

      <style jsx>{`
        .review-form {
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          padding: 2rem;
          max-width: 600px;
          margin: 0 auto;
        }

        .review-form-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .review-form-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 0.5rem;
        }

        .review-form-subtitle {
          color: #6b7280;
          font-size: 1rem;
        }

        .review-event-info {
          background: #f9fafb;
          border-radius: 8px;
          padding: 1rem;
          margin-bottom: 2rem;
        }

        .event-title {
          font-size: 1.125rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .event-meta {
          display: flex;
          gap: 1rem;
          font-size: 0.875rem;
          color: #6b7280;
        }

        .event-icon {
          margin-right: 0.25rem;
        }

        .review-section {
          margin-bottom: 1.5rem;
        }

        .review-label {
          display: block;
          font-weight: 600;
          color: #374151;
          margin-bottom: 0.5rem;
        }

        .rating-container {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .rating-text {
          color: #6b7280;
          font-size: 0.875rem;
        }

        .category-ratings {
          display: grid;
          gap: 1rem;
        }

        .category-rating {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem;
          background: #f9fafb;
          border-radius: 6px;
        }

        .category-label {
          font-weight: 500;
          color: #374151;
        }

        .review-textarea {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 0.875rem;
          resize: vertical;
          transition: border-color 0.2s;
        }

        .review-textarea:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .review-textarea.is-invalid {
          border-color: #ef4444;
        }

        .review-error {
          color: #ef4444;
          font-size: 0.75rem;
          margin-top: 0.25rem;
        }

        .review-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          margin-top: 2rem;
        }

        .review-btn {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.2s;
        }

        .review-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .review-btn-primary {
          background: #3b82f6;
          color: white;
        }

        .review-btn-primary:hover:not(:disabled) {
          background: #2563eb;
        }

        .review-btn-secondary {
          background: #f3f4f6;
          color: #374151;
        }

        .review-btn-secondary:hover {
          background: #e5e7eb;
        }

        .review-btn-icon {
          font-size: 0.875rem;
        }
      `}</style>
    </div>
  );
};

export default ReviewForm; 