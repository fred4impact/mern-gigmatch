import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import eventService from '../services/eventService';
import applicationService from '../services/applicationService';
import ApplicationForm from '../components/ApplicationForm';
import { 
  FaMapMarkerAlt, 
  FaCalendarAlt, 
  FaDollarSign,
  FaTag,
  FaUser,
  FaEdit,
  FaTrash,
  FaArrowLeft,
  FaEnvelope,
  FaPhone,
  FaPaperPlane,
  FaCheck,
  FaClock,
  FaTimes,
  FaSearch
} from 'react-icons/fa';
import toast from 'react-hot-toast';

const EventDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState(null);

  useEffect(() => {
    fetchEvent();
  }, [id]);

  useEffect(() => {
    if (user?.role === 'talent' && event) {
      fetchApplicationStatus();
    }
  }, [event, user]);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      const response = await eventService.getEventById(id);
      setEvent(response.data);
    } catch (error) {
      toast.error('Error fetching event details');
      console.error('Error:', error);
      navigate('/events');
    } finally {
      setLoading(false);
    }
  };

  const fetchApplicationStatus = async () => {
    try {
      const response = await applicationService.getMyApplications();
      const myApplication = response.data.find(app => app.event._id === event._id);
      setApplicationStatus(myApplication ? myApplication.status : null);
    } catch (error) {
      console.error('Error fetching application status:', error);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this event?')) {
      return;
    }

    try {
      await eventService.deleteEvent(id);
      toast.success('Event deleted successfully');
      navigate('/my-events');
    } catch (error) {
      toast.error('Error deleting event');
      console.error('Error:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatBudget = (budget) => {
    if (!budget) return 'Not specified';
    return `$${budget.toLocaleString()}`;
  };

  const getApplicationStatusDisplay = () => {
    switch (applicationStatus) {
      case 'accepted':
        return { 
          label: 'Application Accepted', 
          icon: <FaCheck />, 
          color: '#10b981',
          bgColor: 'rgba(16, 185, 129, 0.1)'
        };
      case 'pending':
        return { 
          label: 'Application Pending', 
          icon: <FaClock />, 
          color: '#f59e0b',
          bgColor: 'rgba(245, 158, 11, 0.1)'
        };
      case 'rejected':
        return { 
          label: 'Application Rejected', 
          icon: <FaTimes />, 
          color: '#ef4444',
          bgColor: 'rgba(239, 68, 68, 0.1)'
        };
      default:
        return null;
    }
  };

  const isEventCreator = event?.createdBy?._id === user?.id;

  if (loading) {
    return (
      <div className="moises-profile-root">
        <div className="moises-profile-card">
          <div className="text-center">
            <div className="moises-spinner"></div>
            <p>Loading event details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="moises-profile-root">
        <div className="moises-profile-card">
          <div className="text-center">
            <h2>Event Not Found</h2>
            <p>The event you're looking for doesn't exist or has been removed.</p>
            <Link to="/events" className="moises-profile-btn moises-profile-btn-primary">
              <FaArrowLeft /> Back to Events
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container event-details-no-bg" style={{ maxWidth: '900px', margin: '2rem auto', padding: '2rem 1rem' }}>
      <div className="dashboard-card">
        <div style={{ marginBottom: '1rem' }}>
          <Link to="/dashboard" className="dashboard-btn dashboard-btn-secondary">
            &larr; Go Back to Dashboard
          </Link>
        </div>
        {/* Header */}
        <div className="dashboard-card-header">
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <Link to="/events" className="dashboard-btn dashboard-btn-secondary mb-3">
                <FaArrowLeft /> Back to Events
              </Link>
              <h1 className="dashboard-card-title">{event.title}</h1>
              <p className="dashboard-card-subtitle">
                Posted by {event.createdBy?.firstName} {event.createdBy?.lastName}
              </p>
            </div>
            <div className="text-end">
              <span className={`event-status event-status-${event.status}`}>
                {event.status}
              </span>
              {user?.role === 'talent' && applicationStatus && (
                <div className="mt-2">
                  <span 
                    className="event-status"
                    style={{ 
                      color: getApplicationStatusDisplay()?.color,
                      backgroundColor: getApplicationStatusDisplay()?.bgColor
                    }}
                  >
                    {getApplicationStatusDisplay()?.icon}
                    {getApplicationStatusDisplay()?.label}
                  </span>
                </div>
              )}
              {isEventCreator && (
                <div className="mt-2">
                  <Link 
                    to={`/events/${event._id}/edit`}
                    className="dashboard-btn dashboard-btn-info me-2"
                  >
                    <FaEdit /> Edit
                  </Link>
                  <button
                    className="dashboard-btn dashboard-btn-danger"
                    onClick={handleDelete}
                  >
                    <FaTrash /> Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Main Body */}
        <div className="dashboard-card-body">
          {/* Event Details */}
          <div className="moises-profile-section">
            <h3 className="moises-section-title">Event Information</h3>
            
            {event.description && (
              <div className="event-description-full mb-4">
                <h4>Description</h4>
                <p>{event.description}</p>
              </div>
            )}

            <div className="event-details-grid">
              {event.type && (
                <div className="event-detail-item">
                  <FaTag className="event-detail-icon" />
                  <div>
                    <strong>Event Type:</strong>
                    <span>{event.type}</span>
                  </div>
                </div>
              )}

              {event.location?.city && (
                <div className="event-detail-item">
                  <FaMapMarkerAlt className="event-detail-icon" />
                  <div>
                    <strong>Location:</strong>
                    <span>
                      {event.location.city}
                      {event.location.state && `, ${event.location.state}`}
                      {event.location.country && `, ${event.location.country}`}
                    </span>
                  </div>
                </div>
              )}

              {event.date && (
                <div className="event-detail-item">
                  <FaCalendarAlt className="event-detail-icon" />
                  <div>
                    <strong>Date & Time:</strong>
                    <span>{formatDate(event.date)}</span>
                  </div>
                </div>
              )}

              {event.budget && (
                <div className="event-detail-item">
                  <FaDollarSign className="event-detail-icon" />
                  <div>
                    <strong>Budget:</strong>
                    <span>{formatBudget(event.budget)}</span>
                  </div>
                </div>
              )}
            </div>

            {event.tags && event.tags.length > 0 && (
              <div className="event-tags-section">
                <h4>Tags</h4>
                <div className="event-tags">
                  {event.tags.map((tag, index) => (
                    <span key={index} className="event-tag">{tag}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Contact Information */}
          {!isEventCreator && (
            <div className="moises-profile-section">
              <h3 className="moises-section-title">Contact Information</h3>
              <div className="contact-info">
                <div className="contact-item">
                  <FaUser className="contact-icon" />
                  <div>
                    <strong>Contact Person:</strong>
                    <span>{event.createdBy?.firstName} {event.createdBy?.lastName}</span>
                  </div>
                </div>
                <div className="contact-item">
                  <FaEnvelope className="contact-icon" />
                  <div>
                    <strong>Email:</strong>
                    <span>{event.createdBy?.email}</span>
                  </div>
                </div>
                {event.createdBy?.organization?.name && (
                  <div className="contact-item">
                    <FaTag className="contact-icon" />
                    <div>
                      <strong>Organization:</strong>
                      <span>{event.createdBy.organization.name}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="moises-profile-actions">
            <div className="moises-profile-btn-group">
              {!isEventCreator && user?.role === 'talent' && event?.status === 'open' && !applicationStatus && (
                <button 
                  className="moises-profile-btn moises-profile-btn-primary"
                  onClick={() => setShowApplicationForm(true)}
                >
                  <FaPaperPlane /> Apply for This Gig
                </button>
              )}
              {!isEventCreator && user?.role === 'talent' && applicationStatus === 'accepted' && (
                <div className="application-accepted-message">
                  <div className="alert alert-success">
                    <FaCheck /> Congratulations! Your application has been accepted. 
                    The event organizer will contact you with further details.
                  </div>
                </div>
              )}
              {!isEventCreator && user?.role === 'talent' && applicationStatus === 'pending' && (
                <div className="application-pending-message">
                  <div className="alert alert-warning">
                    <FaClock /> Your application is under review. You'll be notified once the organizer makes a decision.
                  </div>
                </div>
              )}
              {!isEventCreator && user?.role === 'talent' && applicationStatus === 'rejected' && (
                <div className="application-rejected-message">
                  <div className="alert alert-danger">
                    <FaTimes /> Your application was not selected for this event. 
                    Don't worry, there are plenty of other opportunities!
                  </div>
                </div>
              )}
              {isEventCreator && ['planner', 'studio'].includes(user?.role) && event?.status === 'open' && (
                <Link 
                  to={`/events/${event._id}/matches`}
                  className="moises-profile-btn moises-profile-btn-success me-2"
                >
                  <FaSearch /> Find AI Matches
                </Link>
              )}
              <Link to="/events" className="moises-profile-btn moises-profile-btn-secondary">
                Browse More Events
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Application Form Modal */}
      {showApplicationForm && event && (
        <ApplicationForm
          event={event}
          onClose={() => setShowApplicationForm(false)}
          onSuccess={() => {
            setShowApplicationForm(false);
            toast.success('Application submitted successfully!');
          }}
        />
      )}
    </div>
  );
};

export default EventDetails; 