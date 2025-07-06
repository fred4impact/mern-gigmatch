import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import matchingService from '../services/matchingService';
import { 
  FaStar, 
  FaMapMarkerAlt, 
  FaMusic, 
  FaCheck, 
  FaFilter,
  FaSort
} from 'react-icons/fa';
import toast from 'react-hot-toast';

const MatchingResults = () => {
  const { eventId } = useParams();
  const { user } = useAuth();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    radius: 10,
    limit: 20
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
            <div className="row">
              {matches.map((match, index) => (
                <div key={match.talent._id} className="col-lg-6 col-md-12 mb-4">
                  <div className="card h-100 shadow-sm">
                    <div className="card-body">
                      {/* Match Score */}
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <h5 className="card-title mb-0">
                          {match.talent.firstName} {match.talent.lastName}
                        </h5>
                        <span className={`badge ${getMatchScoreColor(match.matchScore).replace('text-', 'bg-')}`}>
                          {Math.round(match.matchScore * 100)}% Match
                        </span>
                      </div>

                      {/* Talent Info */}
                      <div className="mb-3">
                        <p className="text-muted mb-1">
                          {match.talent.category} • {match.talent.subcategory}
                        </p>
                        <div className="d-flex align-items-center mb-2">
                          <FaStar className="text-warning me-1" />
                          <span className="me-2">
                            {match.talent.rating?.average || 'No ratings'}
                          </span>
                          {match.talent.rating?.totalReviews > 0 && (
                            <small className="text-muted">
                              ({match.talent.rating.totalReviews} reviews)
                            </small>
                          )}
                        </div>
                        {match.talent.location?.city && (
                          <div className="d-flex align-items-center mb-2">
                            <FaMapMarkerAlt className="text-muted me-1" />
                            <small className="text-muted">
                              {match.talent.location.city}, {match.talent.location.state}
                            </small>
                          </div>
                        )}
                        {match.talent.isVerified && (
                          <div className="d-flex align-items-center mb-2">
                            <FaCheck className="text-success me-1" />
                            <small className="text-success">Verified</small>
                          </div>
                        )}
                      </div>

                      {/* Match Factors */}
                      <div className="mb-3">
                        <h6 className="text-muted mb-2">Match Breakdown:</h6>
                        <div className="row">
                          <div className="col-6">
                            <small className="text-muted">Skills: {Math.round(match.factors.skillMatch * 100)}%</small>
                          </div>
                          <div className="col-6">
                            <small className="text-muted">Location: {Math.round(match.factors.locationMatch * 100)}%</small>
                          </div>
                          <div className="col-6">
                            <small className="text-muted">Availability: {Math.round(match.factors.availabilityMatch * 100)}%</small>
                          </div>
                          <div className="col-6">
                            <small className="text-muted">Rating: {Math.round(match.factors.ratingMatch * 100)}%</small>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="d-flex gap-2">
                        <button className="btn btn-outline-primary btn-sm flex-fill">
                          View Profile
                        </button>
                        <button className="btn btn-primary btn-sm flex-fill">
                          Contact
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MatchingResults; 