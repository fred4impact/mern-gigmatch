import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import dashboardService from '../services/dashboardService';
import ProfilePicture from '../components/ProfilePicture';
import { 
  FaUser, 
  FaCalendarAlt, 
  FaMapMarkerAlt, 
  FaStar,
  FaChartLine,
  FaSearch,
  FaPlus,
  FaEdit,
  FaTag,
  FaPaperPlane,
  FaEye,
  FaCheck,
  FaTimes,
  FaClock,
  FaCrown
} from 'react-icons/fa';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dashboardStats, setDashboardStats] = useState([]);
  const [dashboardActivity, setDashboardActivity] = useState([]);
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [loading, setLoading] = useState(true);



  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch stats based on user role
        let statsData;
        if (user?.role === 'talent') {
          const response = await dashboardService.getTalentStats();
          statsData = response.data;
          
          // Create stats array for talents
          const talentStats = [
            { title: 'Profile Views', value: statsData.profileViews || '0', icon: <FaEye />, color: 'primary' },
            { title: 'Gigs Applied', value: statsData.totalApplications || '0', icon: <FaCalendarAlt />, color: 'success' },
            { title: 'Active Gigs', value: statsData.activeGigs || '0', icon: <FaMapMarkerAlt />, color: 'warning' },
            { title: 'Rating', value: statsData.rating || '0.0', icon: <FaStar />, color: 'info' }
          ];
          
          // Add specialty stat if user has subcategory
          if (user?.subcategory) {
            talentStats.unshift({
              title: 'Specialty',
              value: user.subcategory,
              icon: <FaTag />,
              color: 'secondary'
            });
          }
          
          setDashboardStats(talentStats);
        } else {
          const response = await dashboardService.getPlannerStats();
          statsData = response.data;
          
          // Create stats array for planners/studios
          const plannerStats = [
            { title: 'Total Events', value: statsData.totalEvents || '0', icon: <FaCalendarAlt />, color: 'primary' },
            { title: 'Applications', value: statsData.totalApplications || '0', icon: <FaPaperPlane />, color: 'success' },
            { title: 'Completed', value: statsData.completedEvents || '0', icon: <FaCheck />, color: 'warning' },
            { title: 'Rating', value: statsData.averageRating || '0.0', icon: <FaStar />, color: 'info' }
          ];
          
          setDashboardStats(plannerStats);
        }
        
        // Fetch recent activity
        const activityResponse = await dashboardService.getRecentActivity();
        setDashboardActivity(activityResponse.data);
        
        // Fetch profile completion
        const completionResponse = await dashboardService.getProfileCompletion();
        setProfileCompletion(completionResponse.data.completionPercentage);
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Error loading dashboard data');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  // Get category display name
  const getCategoryDisplayName = (category) => {
    const categories = {
      musician: 'Musician',
      dj: 'DJ',
      photographer: 'Photographer',
      videographer: 'Videographer',
      dancer: 'Dancer',
      comedian: 'Comedian',
      magician: 'Magician',
      other: 'Other'
    };
    return categories[category] || category;
  };

  // Format time for activity display
  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInHours < 48) return '1 day ago';
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  const getActivityIconColor = (type) => {
    switch (type) {
      case 'application': return 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)';
      case 'view': return 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)';
      case 'completion': return 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
      case 'review': return 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
      default: return 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)';
    }
  };

  return (
    <div className="dashboard-container">

      <div className="container py-4">
        {/* Welcome Section */}
        <div className="dashboard-welcome">
          <div className="d-flex align-items-center">
            <div className="me-4 flex-shrink-0">
              <ProfilePicture
                userId={user?._id}
                currentPicture={user?.avatar}
                size="large"
                editable={false}
                user={user}
              />
            </div>
            <div className="flex-grow-1">
              <h1 className="mb-2">Welcome back, {user?.firstName}!</h1>
              <p className="text-muted mb-0">
                {user?.role === 'talent' && user?.category && user?.subcategory ? (
                  <>
                    {getCategoryDisplayName(user.category)} • {user.subcategory}
                  </>
                ) : (
                  'Here\'s what\'s happening with your gigs and profile.'
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="row mb-4">
          {loading ? (
            // Loading skeleton
            [1, 2, 3, 4].map((i) => (
              <div key={i} className="col-lg-3 col-md-6 mb-3">
                <div className="dashboard-stats-card">
                  <div className="dashboard-stats-icon skeleton"></div>
                  <div className="dashboard-stats-value skeleton"></div>
                  <div className="dashboard-stats-title skeleton"></div>
                </div>
              </div>
            ))
          ) : (
            dashboardStats.map((stat, index) => (
              <div key={index} className="col-lg-3 col-md-6 mb-3">
                <div className="dashboard-stats-card">
                  <div className="dashboard-stats-icon" style={{ color: stat.color === 'primary' ? '#3b82f6' : 
                                                                      stat.color === 'success' ? '#10b981' :
                                                                      stat.color === 'warning' ? '#f59e0b' :
                                                                      stat.color === 'info' ? '#06b6d4' : '#6b7280' }}>
                    {stat.icon}
                  </div>
                  <div className="dashboard-stats-value">{stat.value}</div>
                  <div className="dashboard-stats-title">{stat.title}</div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Quick Actions */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="dashboard-card">
              <div className="dashboard-card-header">
                <h5 className="dashboard-card-title">Quick Actions</h5>
              </div>
              <div className="dashboard-card-body">
                <div className="row">
                  {user?.role === 'talent' ? (
                    // Talent-specific actions
                    <>
                      <div className="col-md-3 mb-3">
                        <button 
                          className="dashboard-btn dashboard-btn-warning w-100"
                          onClick={() => navigate('/events')}
                        >
                          <FaSearch />
                          Browse Events
                        </button>
                      </div>
                      <div className="col-md-3 mb-3">
                        <button 
                          className="dashboard-btn dashboard-btn-primary w-100"
                          onClick={() => navigate('/my-applications')}
                        >
                          <FaPaperPlane />
                          My Applications
                        </button>
                      </div>
                      <div className="col-md-3 mb-3">
                        <button 
                          className="dashboard-btn dashboard-btn-success w-100"
                          onClick={() => navigate('/subscription')}
                        >
                          <FaCrown />
                          Subscription
                        </button>
                      </div>
                      <div className="col-md-3 mb-3">
                        <button 
                          className="dashboard-btn dashboard-btn-info w-100"
                          onClick={() => navigate('/profile')}
                        >
                          <FaEdit />
                          Edit Profile
                        </button>
                      </div>
                    </>
                  ) : (
                    // Planner/Studio-specific actions
                    <>
                      <div className="col-md-3 mb-3">
                        <button 
                          className="dashboard-btn dashboard-btn-success w-100"
                          onClick={() => navigate('/create-event')}
                        >
                          <FaPlus />
                          Create Event
                        </button>
                      </div>
                      <div className="col-md-3 mb-3">
                        <button 
                          className="dashboard-btn dashboard-btn-warning w-100"
                          onClick={() => navigate('/my-events')}
                        >
                          <FaCalendarAlt />
                          My Events
                        </button>
                      </div>
                      <div className="col-md-3 mb-3">
                        <button 
                          className="dashboard-btn dashboard-btn-primary w-100"
                          onClick={() => navigate('/event-applications')}
                        >
                          <FaPaperPlane />
                          View Applications
                        </button>
                      </div>
                      <div className="col-md-3 mb-3">
                        <button 
                          className="dashboard-btn dashboard-btn-info w-100"
                          onClick={() => navigate('/profile')}
                        >
                          <FaEdit />
                          Edit Profile
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="row">
          <div className="col-lg-8 mb-4">
            <div className="dashboard-card">
              <div className="dashboard-card-header">
                <h5 className="dashboard-card-title">Recent Activity</h5>
              </div>
              <div className="dashboard-card-body">
                {loading ? (
                  // Loading skeleton
                  [1, 2, 3].map((i) => (
                    <div key={i} className="dashboard-activity-item">
                      <div className="dashboard-activity-icon skeleton"></div>
                      <div className="dashboard-activity-content">
                        <div className="dashboard-activity-text skeleton"></div>
                        <div className="dashboard-activity-time skeleton"></div>
                      </div>
                    </div>
                  ))
                ) : dashboardActivity.length > 0 ? (
                  dashboardActivity.map((activity, index) => (
                    <div key={index} className="dashboard-activity-item">
                      <div 
                        className="dashboard-activity-icon"
                        style={{ background: getActivityIconColor(activity.type) }}
                      >
                        {activity.type === 'application' ? <FaPaperPlane /> :
                         activity.type === 'view' ? <FaEye /> :
                         activity.type === 'completion' ? <FaCheck /> :
                         activity.type === 'event' ? <FaCalendarAlt /> :
                         <FaClock />}
                      </div>
                      <div className="dashboard-activity-content">
                        <div className="dashboard-activity-text">{activity.action}</div>
                        <div className="dashboard-activity-time">{formatTimeAgo(activity.time)}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted py-3">
                    No recent activity
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="dashboard-card">
              <div className="dashboard-card-header">
                <h5 className="dashboard-card-title">Profile Completion</h5>
              </div>
              <div className="dashboard-card-body">
                <div className="text-center mb-3">
                  <div className="dashboard-progress-circle">
                    <svg width="120" height="120" viewBox="0 0 120 120">
                      <circle
                        cx="60"
                        cy="60"
                        r="54"
                        fill="none"
                        stroke="#f1f5f9"
                        strokeWidth="8"
                      />
                      <circle
                        cx="60"
                        cy="60"
                        r="54"
                        fill="none"
                        stroke="url(#progressGradient)"
                        strokeWidth="8"
                        strokeDasharray={`${profileCompletion} 100`}
                        strokeDashoffset="25"
                        transform="rotate(-90 60 60)"
                      />
                      <defs>
                        <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" style={{ stopColor: '#3b82f6' }} />
                          <stop offset="100%" style={{ stopColor: '#8b5cf6' }} />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="dashboard-progress-text">{profileCompletion}%</div>
                  </div>
                </div>
                <div className="dashboard-progress-description">
                  {user?.role === 'talent' && (!user?.category || !user?.subcategory) ? (
                    'Complete your profile by selecting your category and specialty'
                  ) : (
                    'Complete your profile to get more gig opportunities'
                  )}
                </div>
                <button 
                  className="dashboard-btn dashboard-btn-primary w-100"
                  onClick={() => navigate('/profile')}
                >
                  Complete Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 