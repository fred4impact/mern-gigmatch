import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import applicationService from '../services/applicationService';
import eventService from '../services/eventService';
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
  FaTrash,
  FaStar,
  FaEnvelope
} from 'react-icons/fa';
import toast from 'react-hot-toast';

const EventApplications = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [selectedStatus, setSelectedStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [responseMessage, setResponseMessage] = useState('');

  useEffect(() => {
    if (!['planner', 'studio'].includes(user?.role)) {
      navigate('/dashboard');
      return;
    }
    fetchMyEvents();
    fetchStats();
  }, [user]);

  useEffect(() => {
    if (selectedEvent) {
      fetchEventApplications();
    }
  }, [selectedEvent, selectedStatus, currentPage]);

  const fetchMyEvents = async () => {
    try {
      const response = await eventService.getMyEvents();
      setEvents(response.data || []);
    } catch (error) {
      toast.error('Error fetching events');
      console.error('Error:', error);
    }
  };

  const fetchEventApplications = async () => {
    if (!selectedEvent) return;
    
    try {
      setLoading(true);
      const filters = {
        status: selectedStatus || undefined,
        page: currentPage,
        limit: 10
      };
      const response = await applicationService.getEventApplications(selectedEvent._id, filters);
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

  const handleAccept = async (applicationId) => {
    setSelectedApplication({ id: applicationId, action: 'accept' });
    setShowResponseModal(true);
  };

  const handleReject = async (applicationId) => {
    setSelectedApplication({ id: applicationId, action: 'reject' });
    setShowResponseModal(true);
  };

  const handleResponseSubmit = async () => {
    try {
      if (selectedApplication.action === 'accept') {
        await applicationService.acceptApplication(selectedApplication.id, responseMessage);
        toast.success('Application accepted successfully');
      } else {
        await applicationService.rejectApplication(selectedApplication.id, responseMessage);
        toast.success('Application rejected successfully');
      }
      setShowResponseModal(false);
      setSelectedApplication(null);
      setResponseMessage('');
      fetchEventApplications();
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

  if (!['planner', 'studio'].includes(user?.role)) {
    return null;
  }

  return (
    <div className="dashboard-container event-applications-page" style={{ maxWidth: '1100px', margin: '2rem auto', padding: '2rem 1rem' }}>
      <div className="dashboard-card">
        <div className="dashboard-card-header">
          <h1 className="dashboard-card-title">Event Applications</h1>
          <p className="dashboard-card-subtitle">
            Review and manage applications for your events
          </p>
        </div>

        {/* Stats Cards */}
        <div className="dashboard-card-body">
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

          {/* Event Selection */}
          <div className="event-selection mb-4">
            <label className="form-label">Select Event:</label>
            <select 
              value={selectedEvent?._id || ''} 
              onChange={(e) => {
                const event = events.find(evt => evt._id === e.target.value);
                setSelectedEvent(event);
                setCurrentPage(1);
              }}
              className="form-select"
            >
              <option value="">Choose an event...</option>
              {events.map(event => (
                <option key={event._id} value={event._id}>
                  {event.title} - {formatDate(event.date)}
                </option>
              ))}
            </select>
          </div>

          {selectedEvent && (
            <>
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
              <div className="applications-list">
                {loading ? (
                  <div className="text-center py-4">
                    <div className="spinner-border" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : applications.length === 0 ? (
                  <div className="text-center py-4">
                    <FaPaperPlane className="text-muted mb-3" style={{ fontSize: '3rem' }} />
                    <h5>No applications found</h5>
                    <p className="text-muted">No applications match your current filters.</p>
                  </div>
                ) : (
                  <>
                    {applications.map((application) => (
                      <div key={application._id} className="application-card">
                        <div className="application-header">
                          <div className="application-talent">
                            <div className="talent-avatar">
                              {application.talent?.avatar ? (
                                <img src={application.talent.avatar} alt={application.talent.firstName} />
                              ) : (
                                <FaUser />
                              )}
                            </div>
                            <div className="talent-info">
                              <h6>{application.talent?.firstName} {application.talent?.lastName}</h6>
                              <p className="talent-category">
                                {application.talent?.category} • {application.talent?.subcategory}
                              </p>
                            </div>
                          </div>
                          <div className="application-status">
                            {getStatusIcon(application.status)}
                            <span style={{ color: getStatusColor(application.status) }}>
                              {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                            </span>
                          </div>
                        </div>

                        <div className="application-details">
                          <div className="application-message">
                            <strong>Message:</strong>
                            <p>{application.message || 'No message provided'}</p>
                          </div>
                          
                          <div className="application-info">
                            <div className="info-item">
                              <FaDollarSign />
                              <span><strong>Proposed Rate:</strong> {formatBudget(application.proposedRate)}</span>
                            </div>
                            <div className="info-item">
                              <FaCalendarAlt />
                              <span><strong>Applied:</strong> {formatDate(application.createdAt)}</span>
                            </div>
                          </div>

                          {application.status === 'pending' && (
                            <div className="application-actions">
                              <button 
                                className="btn btn-success btn-sm me-2"
                                onClick={() => handleAccept(application._id)}
                              >
                                <FaCheck /> Accept
                              </button>
                              <button 
                                className="btn btn-danger btn-sm"
                                onClick={() => handleReject(application._id)}
                              >
                                <FaTimes /> Reject
                              </button>
                            </div>
                          )}

                          {application.responseMessage && (
                            <div className="application-response">
                              <strong>Your Response:</strong>
                              <p>{application.responseMessage}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="pagination-container">
                        <nav>
                          <ul className="pagination">
                            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                              <button 
                                className="page-link" 
                                onClick={() => setCurrentPage(currentPage - 1)}
                                disabled={currentPage === 1}
                              >
                                Previous
                              </button>
                            </li>
                            {[...Array(totalPages)].map((_, index) => (
                              <li key={index} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
                                <button 
                                  className="page-link" 
                                  onClick={() => setCurrentPage(index + 1)}
                                >
                                  {index + 1}
                                </button>
                              </li>
                            ))}
                            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                              <button 
                                className="page-link" 
                                onClick={() => setCurrentPage(currentPage + 1)}
                                disabled={currentPage === totalPages}
                              >
                                Next
                              </button>
                            </li>
                          </ul>
                        </nav>
                      </div>
                    )}
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Response Modal */}
      {showResponseModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                {selectedApplication?.action === 'accept' ? 'Accept' : 'Reject'} Application
              </h5>
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => setShowResponseModal(false)}
              ></button>
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label">Response Message (Optional):</label>
                <textarea 
                  className="form-control" 
                  rows="3"
                  value={responseMessage}
                  onChange={(e) => setResponseMessage(e.target.value)}
                  placeholder="Add a personal message to the talent..."
                ></textarea>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => setShowResponseModal(false)}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className={`btn ${selectedApplication?.action === 'accept' ? 'btn-success' : 'btn-danger'}`}
                onClick={handleResponseSubmit}
              >
                {selectedApplication?.action === 'accept' ? 'Accept' : 'Reject'} Application
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventApplications; 