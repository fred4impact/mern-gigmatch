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
import './EventsList.css';

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
      <div className="el-container">
        <div className="el-header">
          <h1 className="el-title">Browse Events</h1>
          <p className="el-subtitle">Find the perfect gig opportunities for your skills</p>
        </div>
        <hr className="el-divider" />
        {/* Filters */}
        <div className="el-filters-row">
          <div className="el-filter-group">
            <label className="el-filter-label">Event Type</label>
            <input
              type="text"
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
              className="el-filter-input"
              placeholder="e.g., Wedding, Corporate"
            />
          </div>
          <div className="el-filter-group">
            <label className="el-filter-label">Location</label>
            <input
              type="text"
              name="location"
              value={filters.location}
              onChange={handleFilterChange}
              className="el-filter-input"
              placeholder="e.g., New York, Los Angeles"
            />
          </div>
          <div className="el-filter-group">
            <label className="el-filter-label">Status</label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="el-filter-input"
            >
              <option value="">All Status</option>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <button
            type="button"
            onClick={clearFilters}
            className="el-btn el-btn-secondary"
          >
            Clear Filters
          </button>
        </div>
        {/* Events Grid */}
        <div className="el-events-grid">
          <div className="el-loading">Loading events...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="el-container">
      <div className="el-header">
        <h1 className="el-title">Browse Events</h1>
        <p className="el-subtitle">Find the perfect gig opportunities for your skills</p>
      </div>
      <hr className="el-divider" />
      {/* Filters */}
      <div className="el-filters-row">
        <div className="el-filter-group">
          <label className="el-filter-label">Event Type</label>
          <input
            type="text"
            name="type"
            value={filters.type}
            onChange={handleFilterChange}
            className="el-filter-input"
            placeholder="e.g., Wedding, Corporate"
          />
        </div>
        <div className="el-filter-group">
          <label className="el-filter-label">Location</label>
          <input
            type="text"
            name="location"
            value={filters.location}
            onChange={handleFilterChange}
            className="el-filter-input"
            placeholder="e.g., New York, Los Angeles"
          />
        </div>
        <div className="el-filter-group">
          <label className="el-filter-label">Status</label>
          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="el-filter-input"
          >
            <option value="">All Status</option>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <button
          type="button"
          onClick={clearFilters}
          className="el-btn el-btn-secondary"
        >
          Clear Filters
        </button>
      </div>
      {/* Events Grid */}
      <div className="el-events-grid">
        {events.length === 0 ? (
          <div className="el-empty">No events found.</div>
        ) : (
          events.map(event => {
            const applicationStatus = getApplicationStatus(event._id);
            const displayStatus = getEventDisplayStatus(event, applicationStatus);
            return (
              <div key={event._id} className={`el-event-card ${displayStatus.status}`}>
                <div className="el-event-card-header">
                  <span className="el-event-title">{event.title}</span>
                  <span className={`el-status-badge ${displayStatus.status}`}>{displayStatus.icon} {displayStatus.label}</span>
                </div>
                <div className="el-event-card-body">
                  <div className="el-event-info-row">
                    <span className="el-event-info"><FaTag /> {event.type}</span>
                    <span className="el-event-info">
                      <FaMapMarkerAlt />
                      {event.location?.city || ''}
                      {event.location?.state ? `, ${event.location.state}` : ''}
                      {event.location?.country ? `, ${event.location.country}` : ''}
                    </span>
                  </div>
                  <div className="el-event-info-row">
                    <span className="el-event-info"><FaCalendarAlt /> {formatDate(event.date)}</span>
                    <span className="el-event-info"><FaDollarSign /> {formatBudget(event.budget)}</span>
                  </div>
                </div>
                <div className="el-event-card-footer">
                  <Link to={`/events/${event._id}`} className="el-btn el-btn-primary">
                    <FaEye /> View
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default EventsList; 