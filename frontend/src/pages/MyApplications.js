import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import applicationService from '../services/applicationService';
import { 
  FaPaperPlane, 
  FaClock, 
  FaCheck, 
  FaTimes, 
  FaUndo,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaDollarSign,
  FaUser,
  FaEye,
  FaTrash
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import ReviewForm from '../components/ReviewForm';
import reviewService from '../services/reviewService';

const MyApplications = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [selectedStatus, setSelectedStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [reviewingApp, setReviewingApp] = useState(null);
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (user?.role !== 'talent') {
      navigate('/dashboard');
      return;
    }
    fetchApplications();
    fetchStats();
  }, [user, selectedStatus, currentPage]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const filters = {
        status: selectedStatus || undefined,
        page: currentPage,
        limit: 10
      };
      const response = await applicationService.getMyApplications(filters);
      setApplications(response.data);
      setTotalPages(response.pagination.totalPages);
    } catch (error) {
      toast.error('Error fetching applications');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await applicationService.getApplicationStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleWithdraw = async (applicationId) => {
    if (!window.confirm('Are you sure you want to withdraw this application?')) {
      return;
    }

    try {
      await applicationService.withdrawApplication(applicationId);
      toast.success('Application withdrawn successfully');
      fetchApplications();
      fetchStats();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <FaClock className="application-status-icon pending" />;
      case 'accepted':
        return <FaCheck className="application-status-icon accepted" />;
      case 'rejected':
        return <FaTimes className="application-status-icon rejected" />;
      case 'withdrawn':
        return <FaUndo className="application-status-icon withdrawn" />;
      default:
        return <FaPaperPlane className="application-status-icon" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return '#f59e0b';
      case 'accepted':
        return '#10b981';
      case 'rejected':
        return '#ef4444';
      case 'withdrawn':
        return '#6b7280';
      default:
        return '#6b7280';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatBudget = (budget) => {
    if (!budget) return 'Not specified';
    return `$${budget.toLocaleString()}`;
  };

  // Helper: check if event is in the past
  const isEventPast = (event) => {
    if (!event?.date) return false;
    return new Date(event.date) < new Date();
  };

  // Helper: check if review already left (for now, assume not; can be improved if reviews are fetched)
  const canLeaveReview = (app) => {
    return app.status === 'accepted' && isEventPast(app.event);
  };

  const handleReviewSubmit = async (reviewData) => {
    if (!reviewingApp) return;
    setSubmittingReview(true);
    try {
      await reviewService.submitApplicationReview(reviewingApp._id, reviewData);
      toast.success('Review submitted!');
      setReviewingApp(null);
      fetchApplications();
    } catch (error) {
      toast.error(error.message || 'Error submitting review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (user?.role !== 'talent') {
    return null;
  }

  return (
    <div className="my-application">
      <div className="dashboard-card">
        <div style={{ marginBottom: '1rem' }}>
          <Link to="/dashboard" className="moises-profile-btn moises-profile-btn-secondary">
            &larr; Go Back to Dashboard
          </Link>
        </div>
        <div className="moises-profile-header">
          <h1 className="moises-profile-title">My Applications</h1>
          <p className="moises-profile-subtitle">
            Track your event applications and their status
          </p>
        </div>

        {/* Stats Cards */}
        <div className="applications-stats">
          <div className="stat-card">
            <div className="stat-icon pending">
              <FaClock />
            </div>
            <div className="stat-content">
              <div className="stat-number">{stats.pending || 0}</div>
              <div className="stat-label">Pending</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon accepted">
              <FaCheck />
            </div>
            <div className="stat-content">
              <div className="stat-number">{stats.accepted || 0}</div>
              <div className="stat-label">Accepted</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon rejected">
              <FaTimes />
            </div>
            <div className="stat-content">
              <div className="stat-number">{stats.rejected || 0}</div>
              <div className="stat-label">Rejected</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon withdrawn">
              <FaUndo />
            </div>
            <div className="stat-content">
              <div className="stat-number">{stats.withdrawn || 0}</div>
              <div className="stat-label">Withdrawn</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="applications-filters">
          <div className="filter-group">
            <label>Filter by Status:</label>
            <select 
              value={selectedStatus} 
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="filter-select"
            >
              <option value="">All Applications</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
              <option value="withdrawn">Withdrawn</option>
            </select>
          </div>
        </div>

        {/* Applications List */}
        <div className="applications-container">
          {loading ? (
            <div className="applications-loading">
              <div className="moises-spinner"></div>
              <p>Loading applications...</p>
            </div>
          ) : applications.length === 0 ? (
            <div className="applications-empty">
              <FaPaperPlane className="applications-empty-icon" />
              <h3>No applications found</h3>
              <p>
                {selectedStatus 
                  ? `You don't have any ${selectedStatus} applications.`
                  : "You haven't applied to any events yet."
                }
              </p>
              <Link to="/events" className="applications-empty-btn">
                Browse Events
              </Link>
            </div>
          ) : (
            <div className="applications-grid" style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>
              {applications.map((application) => (
                <div
                  key={application._id}
                  className={`application-card modern-app-card application-card-status-${application.status}`}
                  style={{
                    background: '#fff',
                    borderRadius: '1rem',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    padding: '2rem',
                    minWidth: '320px',
                    maxWidth: '420px',
                    flex: '1 1 340px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    transition: 'box-shadow 0.2s',
                    marginBottom: '1.5rem',
                  }}
                >
                  <div className="application-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div className="application-status" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {getStatusIcon(application.status)}
                      <span 
                        className="application-status-text"
                        style={{ color: getStatusColor(application.status), fontWeight: 600 }}
                      >
                        {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                      </span>
                    </div>
                    <div className="application-date" style={{ fontSize: '0.95rem', color: '#6b7280' }}>
                      Applied {formatDate(application.createdAt)}
                    </div>
                  </div>

                  <div className="application-card-body" style={{ marginBottom: '1rem' }}>
                    <h3 className="application-event-title" style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                      {application.event.title}
                    </h3>
                    <div className="application-event-details" style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                      <div className="application-event-detail" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#6b7280', fontSize: '0.98rem' }}>
                        <FaCalendarAlt />
                        <span>{formatDate(application.event.date)}</span>
                      </div>
                      <div className="application-event-detail" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#6b7280', fontSize: '0.98rem' }}>
                        <FaMapMarkerAlt />
                        <span>
                          {application.event.location.city}
                          {application.event.location.state && `, ${application.event.location.state}`}
                        </span>
                      </div>
                      <div className="application-event-detail" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#6b7280', fontSize: '0.98rem' }}>
                        <FaDollarSign />
                        <span>{formatBudget(application.event.budget)}</span>
                      </div>
                    </div>
                    {application.message && (
                      <div className="application-message" style={{ background: '#f9fafb', borderRadius: '0.5rem', padding: '0.75rem', marginTop: '0.5rem', fontSize: '0.97rem' }}>
                        <strong>Your Message:</strong>
                        <p style={{ margin: 0 }}>{application.message}</p>
                      </div>
                    )}
                    {application.proposedRate && (
                      <div className="application-rate" style={{ marginTop: '0.5rem', fontSize: '0.97rem' }}>
                        <strong>Proposed Rate:</strong> ${application.proposedRate.toLocaleString()}
                      </div>
                    )}
                    {application.responseMessage && (
                      <div className="application-response" style={{ background: '#f1f5f9', borderRadius: '0.5rem', padding: '0.75rem', marginTop: '0.5rem', fontSize: '0.97rem' }}>
                        <strong>Response:</strong>
                        <p style={{ margin: 0 }}>{application.responseMessage}</p>
                      </div>
                    )}
                  </div>

                  <div className="application-card-footer" style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: 'auto' }}>
                    <Link 
                      to={`/events/${application.event._id}`}
                      className="application-btn application-btn-secondary"
                      style={{ padding: '0.5rem 1.2rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb', background: '#f3f4f6', color: '#374151', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'background 0.2s' }}
                    >
                      <FaEye /> View Event
                    </Link>
                    {application.status === 'pending' && (
                      <button
                        onClick={() => handleWithdraw(application._id)}
                        className="application-btn application-btn-danger"
                        style={{ padding: '0.5rem 1.2rem', borderRadius: '0.5rem', border: '1px solid #ef4444', background: '#fff1f2', color: '#b91c1c', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'background 0.2s' }}
                      >
                        <FaTrash /> Withdraw
                      </button>
                    )}
                    {canLeaveReview(application) && (
                      <button
                        onClick={() => setReviewingApp(application)}
                        className="application-btn application-btn-primary"
                        style={{ padding: '0.5rem 1.2rem', borderRadius: '0.5rem', border: '1px solid #4f46e5', background: '#e0e7ff', color: '#3730a3', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'background 0.2s' }}
                        disabled={!!reviewingApp}
                      >
                        <FaUser /> Leave a Review
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="applications-pagination">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="pagination-btn"
            >
              Previous
            </button>
            <span className="pagination-info">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="pagination-btn"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Review Modal/Inline Form */}
      {reviewingApp && (
        <div className="review-modal-bg">
          <div className="review-modal">
            <ReviewForm
              event={reviewingApp.event}
              talent={user}
              onSubmit={handleReviewSubmit}
              onCancel={() => setReviewingApp(null)}
            />
            {submittingReview && <div className="review-loading">Submitting...</div>}
          </div>
        </div>
      )}
    </div>
  );
};

export default MyApplications; 