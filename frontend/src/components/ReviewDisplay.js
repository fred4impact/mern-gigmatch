import React from 'react';
import { FaStar, FaUser, FaCalendarAlt, FaThumbsUp, FaFlag } from 'react-icons/fa';

const ReviewDisplay = ({ reviews, onReport }) => {
  const renderStars = (rating) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <FaStar
            key={star}
            className={`text-sm ${
              star <= rating ? 'text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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

  if (!reviews || reviews.length === 0) {
    return (
      <div className="review-display">
        <div className="text-center py-8">
          <FaStar className="text-muted mb-3" style={{ fontSize: '3rem' }} />
          <h3 className="text-lg font-semibold mb-2">No reviews yet</h3>
          <p className="text-muted">
            This talent hasn't received any reviews yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="review-display">
      <div className="review-header">
        <h3 className="review-title">Reviews ({reviews.length})</h3>
      </div>

      <div className="review-list">
        {reviews.map((review) => (
          <div key={review._id} className="review-item">
            <div className="review-header-info">
              <div className="reviewer-info">
                <div className="reviewer-avatar">
                  <FaUser className="reviewer-icon" />
                </div>
                <div className="reviewer-details">
                  <h4 className="reviewer-name">
                    {review.reviewer.firstName} {review.reviewer.lastName}
                  </h4>
                  <div className="review-meta">
                    <span className="review-date">
                      <FaCalendarAlt className="review-meta-icon" />
                      {formatDate(review.createdAt)}
                    </span>
                    {review.event && (
                      <span className="review-event">
                        for {review.event.title}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="review-actions">
                <button
                  onClick={() => onReport && onReport(review._id)}
                  className="report-btn"
                  title="Report this review"
                >
                  <FaFlag />
                </button>
              </div>
            </div>

            <div className="review-content">
              {/* Overall Rating */}
              <div className="review-rating-section">
                <div className="overall-rating">
                  <span className="rating-label">Overall:</span>
                  {renderStars(review.rating)}
                  <span className="rating-value">{review.rating}/5</span>
                </div>
              </div>

              {/* Category Ratings */}
              {review.categories && Object.keys(review.categories).length > 0 && (
                <div className="category-ratings">
                  {Object.entries(review.categories).map(([category, rating]) => (
                    <div key={category} className="category-rating">
                      <span className="category-label">
                        {getCategoryLabel(category)}:
                      </span>
                      {renderStars(rating)}
                    </div>
                  ))}
                </div>
              )}

              {/* Review Comment */}
              {review.comment && (
                <div className="review-comment">
                  <p>{review.comment}</p>
                </div>
              )}
            </div>

            {/* Review Footer */}
            <div className="review-footer">
              <div className="review-helpful">
                <button className="helpful-btn">
                  <FaThumbsUp />
                  <span>Helpful</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .review-display {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .review-header {
          padding: 1.5rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .review-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1f2937;
          margin: 0;
        }

        .review-list {
          max-height: 600px;
          overflow-y: auto;
        }

        .review-item {
          padding: 1.5rem;
          border-bottom: 1px solid #f3f4f6;
        }

        .review-item:last-child {
          border-bottom: none;
        }

        .review-header-info {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .reviewer-info {
          display: flex;
          align-items: center;
        }

        .reviewer-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #f3f4f6;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 0.75rem;
        }

        .reviewer-icon {
          color: #6b7280;
          font-size: 1rem;
        }

        .reviewer-name {
          font-size: 1rem;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 0.25rem 0;
        }

        .review-meta {
          display: flex;
          align-items: center;
          gap: 1rem;
          font-size: 0.875rem;
          color: #6b7280;
        }

        .review-meta-icon {
          margin-right: 0.25rem;
        }

        .review-actions {
          display: flex;
          gap: 0.5rem;
        }

        .report-btn {
          background: none;
          border: none;
          color: #6b7280;
          cursor: pointer;
          padding: 0.25rem;
          border-radius: 4px;
          transition: color 0.2s;
        }

        .report-btn:hover {
          color: #ef4444;
        }

        .review-content {
          margin-bottom: 1rem;
        }

        .review-rating-section {
          margin-bottom: 1rem;
        }

        .overall-rating {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .rating-label {
          font-weight: 600;
          color: #374151;
          font-size: 0.875rem;
        }

        .rating-value {
          font-weight: 600;
          color: #3b82f6;
          font-size: 0.875rem;
        }

        .category-ratings {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .category-rating {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.75rem;
        }

        .category-label {
          color: #6b7280;
          min-width: 80px;
        }

        .review-comment {
          background: #f9fafb;
          padding: 1rem;
          border-radius: 8px;
          border-left: 4px solid #3b82f6;
        }

        .review-comment p {
          margin: 0;
          color: #374151;
          line-height: 1.5;
        }

        .review-footer {
          display: flex;
          justify-content: flex-end;
        }

        .helpful-btn {
          background: none;
          border: 1px solid #d1d5db;
          color: #6b7280;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          transition: all 0.2s;
        }

        .helpful-btn:hover {
          background: #f3f4f6;
          border-color: #9ca3af;
        }
      `}</style>
    </div>
  );
};

export default ReviewDisplay; 