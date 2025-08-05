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
import './EventApplications.css';

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
    <div className="ea-container">
      <div className="ea-card ea-main-card">
        <div className="ea-header">
          <h1 className="ea-title">Event Applications</h1>
          <p className="ea-subtitle">Review and manage applications for your events</p>
        </div>
        <hr className="ea-divider" />
        {/* Stats Cards */}
        <div className="ea-stats-row">
          <div className="ea-stat-card pending">
            <FaClock className="ea-stat-icon" />
            <div className="ea-stat-info">
              <div className="ea-stat-number">{stats.pending || 0}</div>
              <div className="ea-stat-label">Pending</div>
            </div>
          </div>
          <div className="ea-stat-card accepted">
            <FaCheck className="ea-stat-icon" />
            <div className="ea-stat-info">
              <div className="ea-stat-number">{stats.accepted || 0}</div>
              <div className="ea-stat-label">Accepted</div>
            </div>
          </div>
          <div className="ea-stat-card rejected">
            <FaTimes className="ea-stat-icon" />
            <div className="ea-stat-info">
              <div className="ea-stat-number">{stats.rejected || 0}</div>
              <div className="ea-stat-label">Rejected</div>
            </div>
          </div>
          <div className="ea-stat-card withdrawn">
            <FaUndo className="ea-stat-icon" />
            <div className="ea-stat-info">
              <div className="ea-stat-number">{stats.withdrawn || 0}</div>
              <div className="ea-stat-label">Withdrawn</div>
            </div>
          </div>
        </div>
        {/* Event Selector */}
        <div className="ea-event-selector-row">
          <label htmlFor="event-select" className="ea-event-label">Select Event:</label>
          <select
            id="event-select"
            className="ea-event-select"
            value={selectedEvent?._id || ''}
            onChange={e => {
              const event = events.find(ev => ev._id === e.target.value);
              setSelectedEvent(event);
              setCurrentPage(1);
            }}
          >
            <option value="">-- Choose an event --</option>
            {events.map(ev => (
              <option key={ev._id} value={ev._id}>{ev.title}</option>
            ))}
          </select>
        </div>
        {/* Applications Table/List */}
        <div className="ea-applications-list">
          {loading ? (
            <div className="ea-loading">Loading applications...</div>
          ) : applications.length === 0 ? (
            <div className="ea-empty">No applications found for this event.</div>
          ) : (
            <table className="ea-table">
              <thead>
                <tr>
                  <th>Applicant</th>
                  <th>Status</th>
                  <th>Date Applied</th>
                  <th>Budget</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.map(app => (
                  <tr key={app._id} className="ea-table-row">
                    <td>
                      <div className="ea-applicant-info">
                        <div className="ea-applicant-avatar">
                          {app.talent?.avatar ? (
                            <img src={app.talent.avatar.startsWith('http') ? app.talent.avatar : `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/${app.talent.avatar}`} alt="avatar" />
                          ) : (
                            <FaUser className="ea-applicant-avatar-icon" />
                          )}
                        </div>
                        <div>
                          <div className="ea-applicant-name">{app.talent?.firstName} {app.talent?.lastName}</div>
                          <div className="ea-applicant-email">{app.talent?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`ea-status-badge ${app.status}`}>{getStatusIcon(app.status)} {app.status.charAt(0).toUpperCase() + app.status.slice(1)}</span>
                    </td>
                    <td>{formatDate(app.createdAt)}</td>
                    <td>{formatBudget(app.budget)}</td>
                    <td>
                      {app.status === 'pending' && (
                        <div className="ea-action-btns">
                          <button className="ea-btn accept" onClick={() => handleAccept(app._id)}><FaCheck /> Accept</button>
                          <button className="ea-btn reject" onClick={() => handleReject(app._id)}><FaTimes /> Reject</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="ea-pagination">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                className={`ea-page-btn${currentPage === i + 1 ? ' active' : ''}`}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
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