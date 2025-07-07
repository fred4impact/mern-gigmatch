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
      case 'closed': return 'secondary';
      case 'cancelled': return 'danger';
      default: return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="container min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="row w-100 justify-content-center">
          <div className="col-12 col-md-8 col-lg-5">
            <div className="card shadow-sm border-0 rounded-4 p-4 text-center">
              <div className="spinner-border text-primary mb-3" role="status" />
              <p className="mb-0">Loading your events...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="mb-3">
        <Link to="/dashboard" className="btn btn-outline-secondary btn-sm">
          &larr; Go Back to Dashboard
        </Link>
      </div>
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <div>
          <h1 className="h3 fw-bold mb-1">My Events</h1>
          <div className="text-secondary">Manage your created events and gig opportunities</div>
        </div>
        <Link to="/create-event" className="btn btn-primary d-flex align-items-center gap-2">
          <FaPlus /> Create New Event
        </Link>
      </div>
      {/* Stats Row */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-4">
          <div className="card border-0 shadow-sm text-center bg-warning bg-opacity-75 text-white">
            <div className="card-body">
              <div className="fs-3 fw-bold">{events.length}</div>
              <div className="">Total Events</div>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-4">
          <div className="card border-0 shadow-sm text-center bg-success bg-opacity-75 text-white">
            <div className="card-body">
              <div className="fs-3 fw-bold">{events.filter(e => e.status === 'open').length}</div>
              <div className="">Active Events</div>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-4">
          <div className="card border-0 shadow-sm text-center bg-primary bg-opacity-75 text-white">
            <div className="card-body">
              <div className="fs-3 fw-bold">{events.filter(e => e.status === 'closed').length}</div>
              <div className="">Completed</div>
            </div>
          </div>
        </div>
      </div>
      {/* Events List */}
      <div className="mb-4">
        <h4 className="fw-semibold mb-3">Your Events ({events.length})</h4>
        {events.length === 0 ? (
          <div className="card border-0 shadow-sm text-center p-5">
            <p className="mb-3">You haven't created any events yet.</p>
            <Link to="/create-event" className="btn btn-primary d-inline-flex align-items-center gap-2">
              <FaPlus /> Create Your First Event
            </Link>
          </div>
        ) : (
          <div className="row g-4">
            {events.map((event) => (
              <div key={event._id} className="col-12 col-md-6 col-lg-4">
                <div className="card h-100 border-0 event-hover-shadow">
                  <div className="card-body d-flex flex-column">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h5 className="card-title mb-0">{event.title}</h5>
                      <span className={`badge bg-${getStatusColor(event.status)} text-capitalize`}>
                        {event.status}
                      </span>
                    </div>
                    {event.description && (
                      <p className="text-secondary small mb-2">
                        {event.description.length > 120
                          ? `${event.description.substring(0, 120)}...`
                          : event.description}
                      </p>
                    )}
                    <ul className="list-unstyled mb-2">
                      {event.type && (
                        <li className="mb-1 d-flex align-items-center gap-2">
                          <FaTag className="text-muted" />
                          <span>{event.type}</span>
                        </li>
                      )}
                      {event.location?.city && (
                        <li className="mb-1 d-flex align-items-center gap-2">
                          <FaMapMarkerAlt className="text-muted" />
                          <span>{event.location.city}, {event.location.state}</span>
                        </li>
                      )}
                      {event.date && (
                        <li className="mb-1 d-flex align-items-center gap-2">
                          <FaCalendarAlt className="text-muted" />
                          <span>{formatDate(event.date)}</span>
                        </li>
                      )}
                      {event.budget && (
                        <li className="mb-1 d-flex align-items-center gap-2">
                          <FaDollarSign className="text-muted" />
                          <span>{formatBudget(event.budget)}</span>
                        </li>
                      )}
                    </ul>
                    <div className="text-muted small mb-2">Created: {formatDate(event.createdAt)}</div>
                    <div className="mt-auto d-flex gap-2 flex-wrap">
                      <Link
                        to={`/events/${event._id}`}
                        className="btn btn-outline-primary btn-sm d-flex align-items-center gap-1"
                      >
                        <FaEye /> View
                      </Link>
                      <Link
                        to={`/events/edit/${event._id}`}
                        className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1"
                      >
                        <FaEdit /> Edit
                      </Link>
                      <button
                        className="btn btn-outline-danger btn-sm d-flex align-items-center gap-1"
                        onClick={() => handleDelete(event._id)}
                      >
                        <FaTrash /> Delete
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
  );
};

export default MyEvents;