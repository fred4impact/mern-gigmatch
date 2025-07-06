import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import eventService from '../services/eventService';
import { 
  FaPlus, 
  FaMapMarkerAlt, 
  FaCalendarAlt, 
  FaDollarSign,
  FaTag,
  FaEye,
  FaEdit,
  FaTrash,
  FaUsers
} from 'react-icons/fa';
import toast from 'react-hot-toast';

const MyEvents = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyEvents();
  }, []);

  const fetchMyEvents = async () => {
    try {
      setLoading(true);
      const response = await eventService.getMyEvents();
      setEvents(response.data || []);
    } catch (error) {
      toast.error('Error fetching your events');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event?')) {
      return;
    }

    try {
      await eventService.deleteEvent(eventId);
      toast.success('Event deleted successfully');
      fetchMyEvents(); // Refresh the list
    } catch (error) {
      toast.error('Error deleting event');
      console.error('Error:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatBudget = (budget) => {
    if (!budget) return 'Not specified';
    return `$${budget.toLocaleString()}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'success';
      case 'closed': return 'warning';
      case 'cancelled': return 'danger';
      default: return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="good-course-profile-root">
        <div className="good-course-profile-card">
          <div className="text-center">
            <div className="good-course-spinner"></div>
            <p>Loading your events...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="my-events-container" style={{ maxWidth: '1100px', margin: '2rem auto', padding: '2rem 1rem' }}>
      <div className="my-events-card" style={{ background: '#fff', borderRadius: '16px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', padding: '2rem' }}>
        <div style={{ marginBottom: '1rem' }}>
          <Link to="/dashboard" className="gigmatch-profile-btn gigmatch-profile-btn-secondary">
            &larr; Go Back to Dashboard
          </Link>
        </div>
        <div className="my-events-header" style={{ marginBottom: '2rem' }}>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="my-events-title">My Events</h1>
              <p className="my-events-subtitle">
                Manage your created events and gig opportunities
              </p>
            </div>
            <Link to="/create-event" className="gigmatch-profile-btn gigmatch-profile-btn-primary">
              <FaPlus /> Create New Event
            </Link>
          </div>
        </div>
        {/* Stats */}
        <div className="my-events-section" style={{ marginBottom: '2rem' }}>
          <div className="events-stats">
            <div className="stat-item">
              <div className="stat-number">{events.length}</div>
              <div className="stat-label">Total Events</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">
                {events.filter(e => e.status === 'open').length}
              </div>
              <div className="stat-label">Active Events</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">
                {events.filter(e => e.status === 'closed').length}
              </div>
              <div className="stat-label">Completed</div>
            </div>
          </div>
        </div>
        {/* Events List */}
        <div className="my-events-section">
          <h3 className="my-events-section-title" style={{ marginBottom: '1.5rem' }}>
            Your Events ({events.length})
          </h3>
          {events.length === 0 ? (
            <div className="text-center py-4">
              <p>You haven't created any events yet.</p>
              <Link to="/create-event" className="gigmatch-profile-btn gigmatch-profile-btn-primary">
                <FaPlus /> Create Your First Event
              </Link>
            </div>
          ) : (
            <div className="my-events-grid">
              {events.map((event) => (
                <div key={event._id} className="event-card">
                  <div className="event-card-header">
                    <h4 className="event-card-title">{event.title}</h4>
                    <span className={`event-status event-status-${event.status}`}>
                      {event.status}
                    </span>
                  </div>
                  <div className="event-card-body">
                    {event.description && (
                      <p className="event-description">
                        {event.description.length > 120 
                          ? `${event.description.substring(0, 120)}...` 
                          : event.description
                        }
                      </p>
                    )}
                    <div className="event-details">
                      {event.type && (
                        <div className="event-detail">
                          <FaTag className="event-detail-icon" />
                          <span>{event.type}</span>
                        </div>
                      )}
                      {event.location?.city && (
                        <div className="event-detail">
                          <FaMapMarkerAlt className="event-detail-icon" />
                          <span>{event.location.city}, {event.location.state}</span>
                        </div>
                      )}
                      {event.date && (
                        <div className="event-detail">
                          <FaCalendarAlt className="event-detail-icon" />
                          <span>{formatDate(event.date)}</span>
                        </div>
                      )}
                      {event.budget && (
                        <div className="event-detail">
                          <FaDollarSign className="event-detail-icon" />
                          <span>{formatBudget(event.budget)}</span>
                        </div>
                      )}
                    </div>
                    <div className="event-meta">
                      <small>Created: {formatDate(event.createdAt)}</small>
                    </div>
                    <div className="event-actions" style={{ marginTop: '1rem' }}>
                      <Link 
                        to={`/events/${event._id}`}
                        className="gigmatch-profile-btn gigmatch-profile-btn-primary"
                      >
                        <FaEye /> View
                      </Link>
                      <Link 
                        to={`/events/${event._id}/edit`}
                        className="gigmatch-profile-btn gigmatch-profile-btn-info"
                      >
                        <FaEdit /> Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(event._id)}
                        className="gigmatch-profile-btn gigmatch-profile-btn-danger"
                      >
                        <FaTrash /> Delete
                      </button>
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

export default MyEvents;