import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUsers, FaCalendarAlt, FaClipboardList, FaDollarSign, FaTrash, FaBan, FaCheckCircle, FaSearch, FaRegCheckCircle, FaRegTimesCircle, FaRegCalendarCheck, FaChevronDown, FaHome } from 'react-icons/fa';

const SIDEBAR_SECTIONS = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'users', label: 'Users' },
  { key: 'events', label: 'Events' },
  { key: 'bookings', label: 'Bookings' },
  { key: 'disputes', label: 'Disputes' },
  { key: 'analytics', label: 'Analytics' },
  { key: 'subscriptions', label: 'Subscriptions' },
];

const AdminDashboard = () => {
  const [section, setSection] = useState('dashboard');
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [disputes, setDisputes] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState({});
  const [currentAdminId, setCurrentAdminId] = useState(null);
  const [userSearch, setUserSearch] = useState('');
  const [eventSearch, setEventSearch] = useState('');
  const [bookingSearch, setBookingSearch] = useState('');
  const [disputeSearch, setDisputeSearch] = useState('');
  const [subscriptionSearch, setSubscriptionSearch] = useState('');
  const [showDeletedUsers, setShowDeletedUsers] = useState(false);
  const navigate = useNavigate();

  // Get current admin user ID from localStorage (assumes it's stored after login)
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user._id) setCurrentAdminId(user._id);
  }, []);

  // Fetch functions for each section
  const fetchUsers = () => {
    setLoading(true); setError(null);
    fetch('/api/admin/users?includeDeleted=true', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
      .then(res => { if (!res.ok) throw new Error('Failed to fetch users'); return res.json(); })
      .then(data => { setUsers(data.users || []); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  };
  const fetchEvents = () => {
    setLoading(true); setError(null);
    fetch('/api/admin/events', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
      .then(res => { if (!res.ok) throw new Error('Failed to fetch events'); return res.json(); })
      .then(data => { setEvents(data.events || []); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  };
  const fetchBookings = () => {
    setLoading(true); setError(null);
    fetch('/api/admin/bookings', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
      .then(res => { if (!res.ok) throw new Error('Failed to fetch bookings'); return res.json(); })
      .then(data => { setBookings(data.bookings || []); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  };
  const fetchDisputes = () => {
    setLoading(true); setError(null);
    fetch('/api/admin/disputes', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
      .then(res => { if (!res.ok) throw new Error('Failed to fetch disputes'); return res.json(); })
      .then(data => { setDisputes(data.disputes || []); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  };
  const fetchSubscriptions = () => {
    setLoading(true); setError(null);
    fetch('/api/admin/subscriptions', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
      .then(res => { if (!res.ok) throw new Error('Failed to fetch subscriptions'); return res.json(); })
      .then(data => { setSubscriptions(data.subscriptions || []); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  };
  const fetchAnalytics = () => {
    setLoading(true); setError(null);
    Promise.all([
      fetch('/api/admin/analytics/overview', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
        .then(res => { if (!res.ok) throw new Error('Failed to fetch analytics'); return res.json(); }),
      fetch('/api/admin/analytics/revenue', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
        .then(res => { if (!res.ok) throw new Error('Failed to fetch revenue'); return res.json(); })
    ])
      .then(([overview, revenue]) => {
        setAnalytics(overview);
        setMonthlyRevenue(revenue.monthlyRevenue || []);
        setLoading(false);
      })
      .catch(err => { setError(err.message); setLoading(false); });
  };

  useEffect(() => {
    if (section === 'users') fetchUsers();
    else if (section === 'events') fetchEvents();
    else if (section === 'bookings') fetchBookings();
    else if (section === 'disputes') fetchDisputes();
    else if (section === 'subscriptions') fetchSubscriptions();
    else if (section === 'analytics') fetchAnalytics();
  }, [section]);

  const handleUserAction = async (userId, action) => {
    setActionLoading(prev => ({ ...prev, [userId]: true }));
    setError(null);
    let url = `/api/admin/users/${userId}`;
    let method = 'PATCH';
    if (action === 'ban') url += '/ban';
    else if (action === 'unban') url += '/unban';
    else if (action === 'delete') method = 'DELETE';
    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!res.ok) throw new Error(`Failed to ${action} user`);
      await res.json();
      fetchUsers();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  // Helper for summary cards (with icon and color)
  const SummaryCard = ({ label, value, icon, color }) => (
    <div className="admin-summary-card">
      <div className="admin-summary-icon" style={{ background: color + '22', color }}>{icon}</div>
      <div className="admin-summary-content">
        <div className="admin-summary-title">{label}</div>
        <div className="admin-summary-value">{value}</div>
      </div>
    </div>
  );

  // Calculate extra summary stats
  const activeSubscriptions = subscriptions.filter(s => s.status === 'active').length;
  const openDisputes = disputes.filter(d => d.status === 'pending').length;
  const bookingsThisMonth = bookings.filter(b => {
    if (!b.createdAt) return false;
    const date = new Date(b.createdAt);
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }).length;

  // Filtered users for search
  const filteredUsers = users.filter(user => {
    const q = userSearch.toLowerCase();
    return (
      user.firstName?.toLowerCase().includes(q) ||
      user.lastName?.toLowerCase().includes(q) ||
      user.email?.toLowerCase().includes(q)
    );
  });

  // Filtered events for search
  const filteredEvents = events.filter(event => {
    const q = eventSearch.toLowerCase();
    return (
      event.title?.toLowerCase().includes(q) ||
      event.type?.toLowerCase().includes(q) ||
      (event.createdBy && (`${event.createdBy.firstName} ${event.createdBy.lastName}`.toLowerCase().includes(q)))
    );
  });

  // Filtered bookings for search
  const filteredBookings = bookings.filter(booking => {
    const q = bookingSearch.toLowerCase();
    return (
      booking.event?.title?.toLowerCase().includes(q) ||
      (booking.talent && (`${booking.talent.firstName} ${booking.talent.lastName}`.toLowerCase().includes(q))) ||
      booking.status?.toLowerCase().includes(q)
    );
  });

  // Filtered disputes for search
  const filteredDisputes = disputes.filter(dispute => {
    const q = disputeSearch.toLowerCase();
    return (
      (dispute.reviewer && (`${dispute.reviewer.firstName} ${dispute.reviewer.lastName}`.toLowerCase().includes(q))) ||
      (dispute.reviewedUser && (`${dispute.reviewedUser.firstName} ${dispute.reviewedUser.lastName}`.toLowerCase().includes(q))) ||
      dispute.event?.title?.toLowerCase().includes(q) ||
      dispute.status?.toLowerCase().includes(q)
    );
  });

  // Filtered subscriptions for search
  const filteredSubscriptions = subscriptions.filter(sub => {
    const q = subscriptionSearch.toLowerCase();
    return (
      (sub.user && (`${sub.user.firstName} ${sub.user.lastName}`.toLowerCase().includes(q))) ||
      sub.tier?.toLowerCase().includes(q) ||
      sub.status?.toLowerCase().includes(q)
    );
  });

  // Helper for role badge
  const roleBadge = (role) => {
    if (role === 'admin') return <span className="admin-badge badge-admin">Admin</span>;
    if (role === 'talent') return <span className="admin-badge badge-talent">Talent</span>;
    if (role === 'planner') return <span className="admin-badge badge-planner">Planner</span>;
    return <span className="admin-badge">{role}</span>;
  };
  // Helper for status badge
  const statusBadge = (isActive) => (
    isActive
      ? <span className="admin-badge badge-active">Active</span>
      : <span className="admin-badge badge-banned">Banned</span>
  );

  // Helper for event status badge
  const eventStatusBadge = (status) => {
    if (status === 'open') return <span className="admin-badge badge-active">Open</span>;
    if (status === 'closed') return <span className="admin-badge badge-banned">Closed</span>;
    if (status === 'cancelled') return <span className="admin-badge" style={{ background: '#6b7280' }}>Cancelled</span>;
    return <span className="admin-badge">{status}</span>;
  };
  // Helper for event type badge
  const eventTypeBadge = (type) => (
    <span className="admin-badge" style={{ background: '#f59e0b' }}>{type}</span>
  );

  // Helper for booking status badge
  const bookingStatusBadge = (status) => {
    if (status === 'pending') return <span className="admin-badge" style={{ background: '#f59e0b' }}>Pending</span>;
    if (status === 'accepted') return <span className="admin-badge badge-active">Accepted</span>;
    if (status === 'rejected') return <span className="admin-badge badge-banned">Rejected</span>;
    if (status === 'withdrawn') return <span className="admin-badge" style={{ background: '#6b7280' }}>Withdrawn</span>;
    return <span className="admin-badge">{status}</span>;
  };

  // Helper for dispute status badge
  const disputeStatusBadge = (status) => {
    if (status === 'pending') return <span className="admin-badge" style={{ background: '#f59e0b' }}>Pending</span>;
    if (status === 'approved') return <span className="admin-badge badge-active">Approved</span>;
    if (status === 'rejected') return <span className="admin-badge badge-banned">Rejected</span>;
    return <span className="admin-badge">{status}</span>;
  };

  // Helper for subscription status badge
  const subscriptionStatusBadge = (status) => {
    if (status === 'active') return <span className="admin-badge badge-active">Active</span>;
    if (status === 'inactive') return <span className="admin-badge" style={{ background: '#6b7280' }}>Inactive</span>;
    if (status === 'cancelled') return <span className="admin-badge badge-banned">Cancelled</span>;
    if (status === 'expired') return <span className="admin-badge" style={{ background: '#f59e0b' }}>Expired</span>;
    return <span className="admin-badge">{status}</span>;
  };
  // Helper for subscription tier badge
  const subscriptionTierBadge = (tier) => {
    if (tier === 'pro') return <span className="admin-badge" style={{ background: '#6366f1' }}>Pro</span>;
    if (tier === 'free') return <span className="admin-badge" style={{ background: '#10b981' }}>Free</span>;
    return <span className="admin-badge">{tier}</span>;
  };

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
    window.location.reload();
  };

  return (
    <div className="admin-dashboard-container">
      <aside className="admin-sidebar">
        <div className="sidebar-title">Admin</div>
        <div style={{ marginBottom: '2rem' }}>
          <Link to="/" style={{ color: '#eebbc3', fontWeight: 'bold', textDecoration: 'none', fontSize: '1.1rem' }}>
            ← Site Home
          </Link>
        </div>
        <nav>
          <ul>
            {SIDEBAR_SECTIONS.map(item => (
              <li key={item.key}>
                <a
                  href={`#${item.key}`}
                  className={section === item.key ? 'active' : ''}
                  onClick={e => {
                    e.preventDefault();
                    setSection(item.key);
                  }}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="admin-sidebar-bottom">
          <a href="/" className="admin-site-link" target="_blank" rel="noopener noreferrer">
            Go to Main Site
          </a>
          <button onClick={handleLogout} className="admin-logout-btn">
            Logout
          </button>
        </div>
      </aside>
      <main className="admin-main-content">
        <header className="admin-topbar">
          <h1>Admin Dashboard</h1>
          <div className="admin-topbar-right">
            {/* Placeholder for notifications/profile */}
            <span>🔔</span>
            <span>Admin</span>
          </div>
        </header>
        <section className="admin-content-area">
          {section === 'dashboard' && (
            <>
              <h2>Welcome, Admin!</h2>
              <div className="admin-summary-grid">
                <SummaryCard label="Total Users" value={analytics ? analytics.users : users.length} color="#3b82f6" icon={<FaUsers />} />
                <SummaryCard label="Total Events" value={analytics ? analytics.events : events.length} color="#10b981" icon={<FaCalendarAlt />} />
                <SummaryCard label="Total Bookings" value={analytics ? analytics.bookings : bookings.length} color="#f59e0b" icon={<FaClipboardList />} />
                <SummaryCard label="Total Revenue" value={analytics ? `$${analytics.revenue}` : '-'} color="#8b5cf6" icon={<FaDollarSign />} />
                <SummaryCard label="Active Subscriptions" value={activeSubscriptions} color="#6366f1" icon={<FaRegCheckCircle />} />
                <SummaryCard label="Open Disputes" value={openDisputes} color="#ef4444" icon={<FaRegTimesCircle />} />
                <SummaryCard label="Bookings This Month" value={bookingsThisMonth} color="#06b6d4" icon={<FaRegCalendarCheck />} />
              </div>
              <p style={{ marginTop: '2rem' }}>Select a section from the sidebar to manage users, events, bookings, disputes, analytics, or subscriptions.</p>
            </>
          )}
          {section === 'users' && (
            <div>
              <div className="admin-section-header">
                <div className="admin-section-title">Users</div>
                <div className="admin-search-bar">
                  <input
                    className="admin-search-input"
                    type="text"
                    placeholder="Search by name or email..."
                    value={userSearch}
                    onChange={e => setUserSearch(e.target.value)}
                  />
                </div>
              </div>
              <div className="admin-toggle-row">
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5em', fontWeight: 500 }}>
                  <input
                    type="checkbox"
                    checked={showDeletedUsers}
                    onChange={e => setShowDeletedUsers(e.target.checked)}
                    style={{ marginRight: 6 }}
                  />
                  Show deleted users
                </label>
              </div>
              {loading && <p>Loading users...</p>}
              {error && <p style={{ color: 'red' }}>{error}</p>}
              {!loading && !error && (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers
                      .filter(user => showDeletedUsers || !user.deleted)
                      .map(user => (
                        <tr key={user._id}>
                          <td>{user.firstName} {user.lastName}</td>
                          <td>{user.email}</td>
                          <td>{roleBadge(user.role)}</td>
                          <td>{user.deleted ? <span className="admin-badge badge-deleted">Deleted</span> : statusBadge(user.isActive)}</td>
                          <td>
                            <button
                              className="admin-action-btn"
                              disabled={user._id === currentAdminId || user.role === 'admin' || user.isActive === false || actionLoading[user._id] || user.deleted}
                              onClick={() => handleUserAction(user._id, 'ban')}
                              title="Ban user"
                            >
                              <FaBan style={{ marginRight: 4 }} />
                              {actionLoading[user._id] && user.isActive ? 'Banning...' : 'Ban'}
                            </button>
                            <button
                              className="admin-action-btn"
                              disabled={user._id === currentAdminId || user.role === 'admin' || user.isActive === true || actionLoading[user._id] || user.deleted}
                              onClick={() => handleUserAction(user._id, 'unban')}
                              title="Unban user"
                            >
                              <FaCheckCircle style={{ marginRight: 4 }} />
                              {actionLoading[user._id] && !user.isActive ? 'Unbanning...' : 'Unban'}
                            </button>
                            <button
                              className="admin-action-btn"
                              disabled={user._id === currentAdminId || user.role === 'admin' || actionLoading[user._id] || user.deleted}
                              onClick={() => handleUserAction(user._id, 'delete')}
                              title="Delete user"
                            >
                              <FaTrash style={{ marginRight: 4 }} />
                              {actionLoading[user._id] ? 'Deleting...' : 'Delete'}
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
          {section === 'events' && (
            <div>
              <div className="admin-section-header">
                <div className="admin-section-title">Events</div>
                <div className="admin-search-bar">
                  <input
                    className="admin-search-input"
                    type="text"
                    placeholder="Search by title, type, or creator..."
                    value={eventSearch}
                    onChange={e => setEventSearch(e.target.value)}
                  />
                </div>
              </div>
              {loading && <p>Loading events...</p>}
              {error && <p style={{ color: 'red' }}>{error}</p>}
              {!loading && !error && (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Type</th>
                      <th>Location</th>
                      <th>Created By</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEvents.map(event => (
                      <tr key={event._id}>
                        <td>{event.title}</td>
                        <td>{event.date ? new Date(event.date).toLocaleDateString() : '-'}</td>
                        <td>{eventStatusBadge(event.status)}</td>
                        <td>{eventTypeBadge(event.type)}</td>
                        <td>{event.location?.city}, {event.location?.country}</td>
                        <td>{event.createdBy ? `${event.createdBy.firstName} ${event.createdBy.lastName}` : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
          {section === 'bookings' && (
            <div>
              <div className="admin-section-header">
                <div className="admin-section-title">Bookings</div>
                <div className="admin-search-bar">
                  <input
                    className="admin-search-input"
                    type="text"
                    placeholder="Search by event, talent, or status..."
                    value={bookingSearch}
                    onChange={e => setBookingSearch(e.target.value)}
                  />
                </div>
              </div>
              {loading && <p>Loading bookings...</p>}
              {error && <p style={{ color: 'red' }}>{error}</p>}
              {!loading && !error && (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Event</th>
                      <th>Talent</th>
                      <th>Status</th>
                      <th>Proposed Rate</th>
                      <th>Message</th>
                      <th>Applied</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBookings.map(booking => (
                      <tr key={booking._id}>
                        <td>{booking.event?.title || '-'}</td>
                        <td>{booking.talent ? `${booking.talent.firstName} ${booking.talent.lastName}` : '-'}</td>
                        <td>{bookingStatusBadge(booking.status)}</td>
                        <td>{booking.proposedRate ? `$${booking.proposedRate}` : '-'}</td>
                        <td>{booking.message || '-'}</td>
                        <td>{booking.createdAt ? new Date(booking.createdAt).toLocaleDateString() : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
          {section === 'disputes' && (
            <div>
              <div className="admin-section-header">
                <div className="admin-section-title">Disputes</div>
                <div className="admin-search-bar">
                  <input
                    className="admin-search-input"
                    type="text"
                    placeholder="Search by reviewer, reviewed user, event, or status..."
                    value={disputeSearch}
                    onChange={e => setDisputeSearch(e.target.value)}
                  />
                </div>
              </div>
              {loading && <p>Loading disputes...</p>}
              {error && <p style={{ color: 'red' }}>{error}</p>}
              {!loading && !error && filteredDisputes.length === 0 && <p>No disputes found.</p>}
              {!loading && !error && filteredDisputes.length > 0 && (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Reviewer</th>
                      <th>Reviewed User</th>
                      <th>Event</th>
                      <th>Rating</th>
                      <th>Status</th>
                      <th>Submitted</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDisputes.map(dispute => (
                      <tr key={dispute._id}>
                        <td>{dispute.reviewer ? `${dispute.reviewer.firstName} ${dispute.reviewer.lastName}` : '-'}</td>
                        <td>{dispute.reviewedUser ? `${dispute.reviewedUser.firstName} ${dispute.reviewedUser.lastName}` : '-'}</td>
                        <td>{dispute.event?.title || '-'}</td>
                        <td>{dispute.rating}</td>
                        <td>{disputeStatusBadge(dispute.status)}</td>
                        <td>{dispute.createdAt ? new Date(dispute.createdAt).toLocaleDateString() : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
          {section === 'subscriptions' && (
            <div>
              <div className="admin-section-header">
                <div className="admin-section-title">Subscriptions</div>
                <div className="admin-search-bar">
                  <input
                    className="admin-search-input"
                    type="text"
                    placeholder="Search by user, tier, or status..."
                    value={subscriptionSearch}
                    onChange={e => setSubscriptionSearch(e.target.value)}
                  />
                </div>
              </div>
              {loading && <p>Loading subscriptions...</p>}
              {error && <p style={{ color: 'red' }}>{error}</p>}
              {!loading && !error && (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Tier</th>
                      <th>Status</th>
                      <th>Start Date</th>
                      <th>End Date</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSubscriptions.map(sub => (
                      <tr key={sub._id}>
                        <td>{sub.user ? `${sub.user.firstName} ${sub.user.lastName}` : '-'}</td>
                        <td>{subscriptionTierBadge(sub.tier)}</td>
                        <td>{subscriptionStatusBadge(sub.status)}</td>
                        <td>{sub.startDate ? new Date(sub.startDate).toLocaleDateString() : '-'}</td>
                        <td>{sub.endDate ? new Date(sub.endDate).toLocaleDateString() : '-'}</td>
                        <td>{sub.paymentInfo?.amount ? `$${sub.paymentInfo.amount}` : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
          {section === 'analytics' && (
            <div>
              <h2>Analytics</h2>
              {loading && <p>Loading analytics...</p>}
              {error && <p style={{ color: 'red' }}>{error}</p>}
              {!loading && !error && analytics && (
                <div style={{ display: 'flex', flexWrap: 'wrap', marginBottom: 24 }}>
                  <SummaryCard label="Total Users" value={analytics.users} color="#3b82f6" icon={<FaUsers />} />
                  <SummaryCard label="Total Events" value={analytics.events} color="#10b981" icon={<FaCalendarAlt />} />
                  <SummaryCard label="Total Bookings" value={analytics.bookings} color="#f59e0b" icon={<FaClipboardList />} />
                  <SummaryCard label="Total Revenue" value={`$${analytics.revenue}`} color="#8b5cf6" icon={<FaDollarSign />} />
                </div>
              )}
              {!loading && !error && monthlyRevenue.length > 0 && (
                <div style={{ marginTop: 24 }}>
                  <h4>Monthly Revenue (last 12 months)</h4>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Month</th>
                        <th>Year</th>
                        <th>Total Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {monthlyRevenue.map((item, idx) => (
                        <tr key={idx}>
                          <td>{item._id.month}</td>
                          <td>{item._id.year}</td>
                          <td>${item.total}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard; 