import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import matchingService from '../services/matchingService';
import ProfilePicture from './ProfilePicture';
import { 
  FaStar, 
  FaMapMarkerAlt, 
  FaMusic, 
  FaCheck, 
  FaTimes,
  FaFilter,
  FaSort,
  FaEye,
  FaPaperPlane
} from 'react-icons/fa';
import toast from 'react-hot-toast';

const MatchingResults = () => {
  const { eventId } = useParams();
  const { user } = useAuth();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    radius: 10,
    limit: 20,
    includeInactive: false
  });

  useEffect(() => {
    if (eventId && ['planner', 'studio'].includes(user?.role)) {
      fetchMatches();
    }
  }, [eventId, user, filters]);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const response = await matchingService.findEventMatches(eventId, filters);
      setMatches(response.data.matches || []);
    } catch (error) {
      console.error('Error fetching matches:', error);
      toast.error('Error loading matches');
    } finally {
      setLoading(false);
    }
  };

  const getMatchScoreColor = (score) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-blue-600';
    if (score >= 0.4) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const getMatchScoreLabel = (score) => {
    if (score >= 0.8) return 'Excellent Match';
    if (score >= 0.6) return 'Good Match';
    if (score >= 0.4) return 'Fair Match';
    return 'Basic Match';
  };

  const getCompetencyColor = (level) => {
    const colors = {
      'beginner': 'text-gray-600',
      'intermediate': 'text-blue-600',
      'pro': 'text-green-600',
      'expert': 'text-purple-600'
    };
    return colors[level] || 'text-gray-600';
  };

  const formatDistance = (distance) => {
    if (distance < 1) return `${Math.round(distance * 1000)}m`;
    return `${distance.toFixed(1)}km`;
  };

  if (!['planner', 'studio'].includes(user?.role)) {
    return (
      <div className="moises-profile-root">
        <div className="moises-profile-card">
          <div className="text-center">
            <h2>Access Denied</h2>
            <p>Only planners and studios can view matching results.</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="moises-profile-root">
        <div className="moises-profile-card">
          <div className="text-center">
            <div className="moises-spinner"></div>
            <p>Finding the best matches for your event...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="moises-profile-root">
      <div className="moises-profile-card">
        <div className="moises-profile-header">
          <h1 className="moises-profile-title">AI-Powered Matches</h1>
          <p className="moises-profile-subtitle">
            Found {matches.length} talented professionals for your event
          </p>
        </div>

        {/* Filters */}
        <div className="moises-profile-section">
          <h3 className="moises-section-title">
            <FaFilter className="moises-form-icon" /> Search Filters
          </h3>
          <div className="moises-form-row">
            <div className="moises-form-group">
              <label className="moises-form-label">Search Radius (km)</label>
              <select
                value={filters.radius}
                onChange={(e) => setFilters(prev => ({ ...prev, radius: parseInt(e.target.value) }))}
                className="moises-form-input"
              >
                <option value={5}>5 km</option>
                <option value={10}>10 km</option>
                <option value={25}>25 km</option>
                <option value={50}>50 km</option>
              </select>
            </div>
            <div className="moises-form-group">
              <label className="moises-form-label">Results Limit</label>
              <select
                value={filters.limit}
                onChange={(e) => setFilters(prev => ({ ...prev, limit: parseInt(e.target.value) }))}
                className="moises-form-input"
              >
                <option value={10}>10 results</option>
                <option value={20}>20 results</option>
                <option value={50}>50 results</option>
              </select>
            </div>
          </div>
        </div>

        {/* Matches List */}
        <div className="moises-profile-section">
          <h3 className="moises-section-title">
            <FaSort className="moises-form-icon" /> Matches (Sorted by AI Score)
          </h3>
          
          {matches.length === 0 ? (
            <div className="text-center py-8">
              <FaMusic className="text-muted mb-3" style={{ fontSize: '3rem' }} />
              <h3 className="text-lg font-semibold mb-2">No matches found</h3>
              <p className="text-muted">
                Try adjusting your search filters or expanding your search radius.
              </p>
            </div>
          ) : (
            <div className="matches-grid">
              {matches.map((match, index) => (
                <div key={match.talent._id} className="match-card">
                  {/* Match Score Badge */}
                  <div className="match-score-badge">
                    <span className={`match-score ${getMatchScoreColor(match.matchScore)}`}>
                      {Math.round(match.matchScore * 100)}%
                    </span>
                    <span className="match-label">{getMatchScoreLabel(match.matchScore)}</span>
                  </div>

                  {/* Talent Info */}
                  <div className="talent-info">
                    <div className="talent-header">
                      <ProfilePicture
                        userId={match.talent._id}
                        currentPicture={match.talent.profilePicture}
                        size="medium"
                        editable={false}
                        user={match.talent}
                      />
                      <div className="talent-details">
                        <h4 className="talent-name">
                          {match.talent.firstName} {match.talent.lastName}
                        </h4>
                        <p className="talent-category">
                          {match.talent.category} • {match.talent.subcategory}
                        </p>
                        <div className="talent-rating">
                          <FaStar className="star-icon" />
                          <span className="rating-value">
                            {match.talent.rating?.average || 'No ratings'}
                          </span>
                          {match.talent.rating?.totalReviews > 0 && (
                            <span className="rating-count">
                              ({match.talent.rating.totalReviews} reviews)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Match Factors */}
                    <div className="match-factors">
                      <h5 className="factors-title">Match Breakdown:</h5>
                      <div className="factors-grid">
                        <div className="factor-item">
                          <span className="factor-label">Skills</span>
                          <span className="factor-score">
                            {Math.round(match.factors.skillMatch * 100)}%
                          </span>
                        </div>
                        <div className="factor-item">
                          <span className="factor-label">Location</span>
                          <span className="factor-score">
                            {Math.round(match.factors.locationMatch * 100)}%
                          </span>
                        </div>
                        <div className="factor-item">
                          <span className="factor-label">Availability</span>
                          <span className="factor-score">
                            {Math.round(match.factors.availabilityMatch * 100)}%
                          </span>
                        </div>
                        <div className="factor-item">
                          <span className="factor-label">Rating</span>
                          <span className="factor-score">
                            {Math.round(match.factors.ratingMatch * 100)}%
                          </span>
                        </div>
                        <div className="factor-item">
                          <span className="factor-label">Experience</span>
                          <span className="factor-score">
                            {Math.round(match.factors.competencyMatch * 100)}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Additional Info */}
                    <div className="talent-additional">
                      <div className="competency-level">
                        <span className={`competency-badge ${getCompetencyColor(match.talent.competencyLevel)}`}>
                          {match.talent.competencyLevel}
                        </span>
                      </div>
                      {match.talent.location?.city && (
                        <div className="location-info">
                          <FaMapMarkerAlt className="location-icon" />
                          <span>{match.talent.location.city}, {match.talent.location.state}</span>
                        </div>
                      )}
                      {match.talent.isVerified && (
                        <div className="verification-badge">
                          <FaCheck className="verified-icon" />
                          <span>Verified</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="match-actions">
                      <button className="action-btn view-btn">
                        <FaEye /> View Profile
                      </button>
                      <button className="action-btn contact-btn">
                        <FaPaperPlane /> Contact
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .matches-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 1.5rem;
        }

        .match-card {
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 1.5rem;
          background: white;
          position: relative;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .match-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        }

        .match-score-badge {
          position: absolute;
          top: 1rem;
          right: 1rem;
          text-align: center;
        }

        .match-score {
          display: block;
          font-size: 1.5rem;
          font-weight: 700;
        }

        .match-label {
          font-size: 0.75rem;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .talent-info {
          margin-top: 1rem;
        }

        .talent-header {
          display: flex;
          align-items: center;
          margin-bottom: 1rem;
        }

        .talent-details {
          margin-left: 1rem;
          flex: 1;
        }

        .talent-name {
          font-size: 1.125rem;
          font-weight: 600;
          margin-bottom: 0.25rem;
        }

        .talent-category {
          color: #6b7280;
          font-size: 0.875rem;
          margin-bottom: 0.5rem;
          text-transform: capitalize;
        }

        .talent-rating {
          display: flex;
          align-items: center;
          font-size: 0.875rem;
        }

        .star-icon {
          color: #fbbf24;
          margin-right: 0.25rem;
        }

        .rating-value {
          font-weight: 600;
          margin-right: 0.25rem;
        }

        .rating-count {
          color: #6b7280;
        }

        .match-factors {
          margin-bottom: 1rem;
        }

        .factors-title {
          font-size: 0.875rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: #374151;
        }

        .factors-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.5rem;
        }

        .factor-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.75rem;
        }

        .factor-label {
          color: #6b7280;
        }

        .factor-score {
          font-weight: 600;
          color: #3b82f6;
        }

        .talent-additional {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1rem;
          flex-wrap: wrap;
        }

        .competency-badge {
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 500;
          text-transform: capitalize;
          background: #f3f4f6;
        }

        .location-info {
          display: flex;
          align-items: center;
          font-size: 0.75rem;
          color: #6b7280;
        }

        .location-icon {
          margin-right: 0.25rem;
        }

        .verification-badge {
          display: flex;
          align-items: center;
          font-size: 0.75rem;
          color: #059669;
          font-weight: 500;
        }

        .verified-icon {
          margin-right: 0.25rem;
        }

        .match-actions {
          display: flex;
          gap: 0.5rem;
        }

        .action-btn {
          flex: 1;
          padding: 0.5rem;
          border: none;
          border-radius: 6px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.25rem;
          transition: all 0.2s;
        }

        .view-btn {
          background: #f3f4f6;
          color: #374151;
        }

        .view-btn:hover {
          background: #e5e7eb;
        }

        .contact-btn {
          background: #3b82f6;
          color: white;
        }

        .contact-btn:hover {
          background: #2563eb;
        }
      `}</style>
    </div>
  );
};

export default MatchingResults; 