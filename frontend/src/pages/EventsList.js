import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import eventService from '../services/eventService';
import applicationService from '../services/applicationService';
import { 
  FaSearch, 
  FaMapMarkerAlt, 
  FaCalendarAlt, 
  FaDollarSign,
  FaTag,
  FaFilter,
  FaEye,
  FaCheck,
  FaClock,
  FaTimes
} from 'react-icons/fa';
import toast from 'react-hot-toast';

const EventsList = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [applicationStatuses, setApplicationStatuses] = useState({});
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: '',
    location: '',
    status: ''
  });

  useEffect(() => {
    fetchEvents();
  }, [filters]);

  useEffect(() => {
    if (user?.role === 'talent' && events.length > 0) {
      fetchApplicationStatuses();
    }
  }, [events, user]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await eventService.getEvents(filters);
      setEvents(response.data || []);
    } catch (error) {
      toast.error('Error fetching events');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplicationStatuses = async () => {
    try {
      const response = await applicationService.getMyApplications();
      const statusMap = {};
      response.data.forEach(app => {
        statusMap[app.event._id] = app.status;
      });
      setApplicationStatuses(statusMap);
    } catch (error) {
      console.error('Error fetching application statuses:', error);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      type: '',
      location: '',
      status: ''
    });
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

  const getApplicationStatus = (eventId) => {
    return applicationStatuses[eventId] || null;
  };

  const getEventDisplayStatus = (event, applicationStatus) => {
    if (applicationStatus === 'accepted') {
      return { status: 'accepted', label: 'Accepted', icon: <FaCheck />, color: '#10b981' };
    } else if (applicationStatus === 'pending') {
      return { status: 'pending', label: 'Applied', icon: <FaClock />, color: '#f59e0b' };
    } else if (applicationStatus === 'rejected') {
      return { status: 'rejected', label: 'Rejected', icon: <FaTimes />, color: '#ef4444' };
    } else {
      return { status: event.status, label: event.status, icon: null, color: null };
    }
  };

  const getEventCardClass = (event, applicationStatus) => {
    if (applicationStatus === 'accepted') {
      return 'event-card event-card-accepted';
    } else if (applicationStatus === 'pending') {
      return 'event-card event-card-pending';
    } else if (applicationStatus === 'rejected') {
      return 'event-card event-card-rejected';
    }
    return 'event-card';
  };

  if (loading) {
    return (
      <div className="dashboard-container" style={{ maxWidth: '1100px', margin: '2rem auto', padding: '2rem 1rem' }}>
        <div className="dashboard-card">
          <div className="text-center">
            <div className="dashboard-spinner"></div>
            <p>Loading events...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container" style={{ maxWidth: '1100px', margin: '2rem auto', padding: '2rem 1rem' }}>
      <div className="dashboard-card">
        <div className="dashboard-card-header">
          <h1 className="dashboard-card-title">Browse Events</h1>
          <p className="dashboard-card-subtitle">
            Find the perfect gig opportunities for your skills
          </p>
        </div>

        {/* Filters */}
        <div className="dashboard-card-body">
          <h3 className="dashboard-section-title">
            <FaFilter className="dashboard-form-icon" /> Filters
          </h3>
          <div className="dashboard-form-row">
            <div className="dashboard-form-group">
              <label className="dashboard-form-label">Event Type</label>
              <input
                type="text"
                name="type"
                value={filters.type}
                onChange={handleFilterChange}
                className="dashboard-form-input"
                placeholder="e.g., Wedding, Corporate"
              />
            </div>
            <div className="dashboard-form-group">
              <label className="dashboard-form-label">Location</label>
              <input
                type="text"
                name="location"
                value={filters.location}
                onChange={handleFilterChange}
                className="dashboard-form-input"
                placeholder="e.g., New York, Los Angeles"
              />
            </div>
            <div className="dashboard-form-group">
              <label className="dashboard-form-label">Status</label>
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="dashboard-form-input"
              >
                <option value="">All Status</option>
                <option value="open">Open</option>
                <option value="closed">Closed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
          <button
            type="button"
            onClick={clearFilters}
            className="dashboard-btn dashboard-btn-secondary"
          >
            Clear Filters
          </button>
        </div>

        {/* Events List */}
        <div className="dashboard-card-body">
          <h3 className="dashboard-section-title">
            Events ({events.length})
          </h3>
          
          {events.length === 0 ? (
            <div className="text-center py-4">
              <p>No events found matching your criteria.</p>
              {['planner', 'studio'].includes(user?.role) && (
                <Link to="/create-event" className="dashboard-btn dashboard-btn-primary">
                  Create Your First Event
                </Link>
              )}
            </div>
          ) : (
            <div className="events-grid">
              {events.map((event) => {
                const applicationStatus = getApplicationStatus(event._id);
                const displayStatus = getEventDisplayStatus(event, applicationStatus);
                const cardClass = getEventCardClass(event, applicationStatus);
                
                return (
                  <div key={event._id} className={cardClass}>
                    <div className="event-card-header">
                      <h4 className="event-card-title">{event.title}</h4>
                      <span 
                        className={`event-status event-status-${displayStatus.status}`}
                        style={{ color: displayStatus.color }}
                      >
                        {displayStatus.icon && <span className="status-icon">{displayStatus.icon}</span>}
                        {displayStatus.label}
                      </span>
                    </div>
                  
                  <div className="event-card-body">
                    {event.description && (
                      <p className="event-description">
                        {event.description.length > 150 
                          ? `${event.description.substring(0, 150)}...` 
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
                    
                    {event.tags && event.tags.length > 0 && (
                      <div className="event-tags">
                        {event.tags.slice(0, 3).map((tag, index) => (
                          <span key={index} className="event-tag">{tag}</span>
                        ))}
                        {event.tags.length > 3 && (
                          <span className="event-tag">+{event.tags.length - 3} more</span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="event-card-footer">
                    <Link 
                      to={`/events/${event._id}`}
                      className="dashboard-btn dashboard-btn-primary"
                    >
                      <FaEye /> View Details
                    </Link>
                    {user?.role === 'talent' && !applicationStatus && event.status === 'open' && (
                      <Link 
                        to={`/events/${event._id}`}
                        className="dashboard-btn dashboard-btn-success"
                        style={{ marginLeft: '8px' }}
                      >
                        <FaSearch /> Apply Now
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventsList; 