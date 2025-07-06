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

const MyApplications = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [selectedStatus, setSelectedStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

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

  if (user?.role !== 'talent') {
    return null;
  }

  return (
    <div className="moises-profile-root">
      <div className="moises-profile-card">
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
            <div className="applications-grid">
              {applications.map((application) => (
                <div key={application._id} className="application-card">
                  <div className="application-card-header">
                    <div className="application-status">
                      {getStatusIcon(application.status)}
                      <span 
                        className="application-status-text"
                        style={{ color: getStatusColor(application.status) }}
                      >
                        {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                      </span>
                    </div>
                    <div className="application-date">
                      Applied {formatDate(application.createdAt)}
                    </div>
                  </div>

                  <div className="application-card-body">
                    <h3 className="application-event-title">
                      {application.event.title}
                    </h3>
                    
                    <div className="application-event-details">
                      <div className="application-event-detail">
                        <FaCalendarAlt />
                        <span>{formatDate(application.event.date)}</span>
                      </div>
                      <div className="application-event-detail">
                        <FaMapMarkerAlt />
                        <span>
                          {application.event.location.city}
                          {application.event.location.state && `, ${application.event.location.state}`}
                        </span>
                      </div>
                      <div className="application-event-detail">
                        <FaDollarSign />
                        <span>{formatBudget(application.event.budget)}</span>
                      </div>
                    </div>

                    {application.message && (
                      <div className="application-message">
                        <strong>Your Message:</strong>
                        <p>{application.message}</p>
                      </div>
                    )}

                    {application.proposedRate && (
                      <div className="application-rate">
                        <strong>Proposed Rate:</strong> ${application.proposedRate.toLocaleString()}
                      </div>
                    )}

                    {application.responseMessage && (
                      <div className="application-response">
                        <strong>Response:</strong>
                        <p>{application.responseMessage}</p>
                      </div>
                    )}
                  </div>

                  <div className="application-card-footer">
                    <Link 
                      to={`/events/${application.event._id}`}
                      className="application-btn application-btn-secondary"
                    >
                      <FaEye /> View Event
                    </Link>
                    {application.status === 'pending' && (
                      <button
                        onClick={() => handleWithdraw(application._id)}
                        className="application-btn application-btn-danger"
                      >
                        <FaTrash /> Withdraw
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
    </div>
  );
};

export default MyApplications; 