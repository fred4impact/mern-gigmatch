import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import subscriptionService from '../services/subscriptionService';
import { 
  FaCrown, 
  FaMapMarkerAlt, 
  FaBullseye, 
  FaImages, 
  FaUsers,
  FaStar,
  FaCheck,
  FaArrowUp,
  FaInfoCircle
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const SubscriptionDashboard = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === 'talent') {
      fetchSubscriptionData();
    }
  }, [user]);

  const fetchSubscriptionData = async () => {
    try {
      setLoading(true);
      const recommendationsRes = await subscriptionService.getRecommendations();
      setSubscription(recommendationsRes.data.currentSubscription);
      setRecommendations(recommendationsRes.data.recommendations || []);
    } catch (error) {
      console.error('Error fetching subscription data:', error);
      toast.error('Error loading subscription data');
    } finally {
      setLoading(false);
    }
  };

  const getTierInfo = (tier) => {
    const tiers = {
      'free-basic': {
        name: 'Free Basic',
        icon: <FaInfoCircle />,
        color: 'text-gray-600',
        bgColor: 'bg-gray-100',
        features: ['5 leads per month', 'Basic profile', 'Standard matching']
      },
      'pro-tier': {
        name: 'Pro Tier',
        icon: <FaStar />,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
        features: ['Unlimited leads', 'AI boosted matching', 'Priority listing']
      },
      'location-pro': {
        name: 'Location Pro',
        icon: <FaMapMarkerAlt />,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        features: ['Location-based filtering', 'AI boosted matching', 'Priority listing']
      },
      'skill-focused': {
        name: 'Skill Focused',
        icon: <FaBullseye />,
        color: 'text-purple-600',
        bgColor: 'bg-purple-100',
        features: ['Skill-based filtering', 'Location-based filtering', 'AI boosted matching']
      },
      'portfolio-plus': {
        name: 'Portfolio Plus',
        icon: <FaImages />,
        color: 'text-orange-600',
        bgColor: 'bg-orange-100',
        features: ['Portfolio gallery', 'Skill-based filtering', 'Location-based filtering']
      },
      'agency-plan': {
        name: 'Agency Plan',
        icon: <FaUsers />,
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        features: ['Group accounts', 'Portfolio gallery', 'All premium features']
      }
    };
    return tiers[tier] || tiers['free-basic'];
  };

  const getUsagePercentage = () => {
    if (!subscription || subscription.tier !== 'free-basic') return 0;
    return Math.min((subscription.usage.leadsUsed / subscription.features.leadsPerMonth) * 100, 100);
  };

  const getUsageColor = () => {
    const percentage = getUsagePercentage();
    if (percentage >= 80) return 'text-danger';
    if (percentage >= 60) return 'text-warning';
    return 'text-success';
  };

  if (user?.role !== 'talent') {
    return (
      <div className="moises-profile-root">
        <div className="moises-profile-card">
          <div className="text-center">
            <h2>Access Denied</h2>
            <p>Only talents can view subscription dashboard.</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="moises-profile-root">
        <div className="moises-profile-card">
          <div className="text-center">
            <div className="moises-spinner"></div>
            <p>Loading subscription data...</p>
          </div>
        </div>
      </div>
    );
  }

  const tierInfo = getTierInfo(subscription?.tier || 'free-basic');

  return (
    <div className="moises-profile-root">
      <div className="moises-profile-card">
        <div style={{ marginBottom: '1rem' }}>
          <Link to="/dashboard" className="moises-profile-btn moises-profile-btn-secondary">
            &larr; Go Back to Dashboard
          </Link>
        </div>
        <div className="moises-profile-header">
          <h1 className="moises-profile-title">Subscription Dashboard</h1>
          <p className="moises-profile-subtitle">
            Manage your subscription and discover opportunities to grow
          </p>
        </div>

        {/* Current Subscription */}
        <div className="moises-profile-section">
          <h3 className="moises-section-title">Current Plan</h3>
          <div className={`card ${tierInfo.bgColor} border-0`}>
            <div className="card-body">
              <div className="row align-items-center">
                <div className="col-auto">
                  <div className={`display-4 ${tierInfo.color}`}>
                    {tierInfo.icon}
                  </div>
                </div>
                <div className="col">
                  <h4 className="card-title mb-1">{tierInfo.name}</h4>
                  <p className="card-text mb-2">
                    Status: <span className="text-success fw-bold">Active</span>
                  </p>
                  {subscription?.tier === 'free-basic' && (
                    <div className="mb-2">
                      <div className={`${getUsageColor()} mb-1`}>
                        {subscription.usage.leadsUsed} / {subscription.features.leadsPerMonth} leads used
                      </div>
                      <div className="progress" style={{ height: '8px' }}>
                        <div 
                          className={`progress-bar ${getUsageColor().replace('text-', 'bg-')}`}
                          style={{ width: `${getUsagePercentage()}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Plan Features */}
          <div className="mt-3">
            <h5 className="text-muted mb-2">Your Plan Features:</h5>
            <div className="row">
              {tierInfo.features.map((feature, index) => (
                <div key={index} className="col-md-6 mb-2">
                  <div className="d-flex align-items-center">
                    <FaCheck className="text-success me-2" />
                    <small>{feature}</small>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="moises-profile-section">
            <h3 className="moises-section-title">Upgrade Recommendations</h3>
            <div className="row">
              {recommendations.map((rec, index) => {
                const recTierInfo = getTierInfo(rec.tier);
                return (
                  <div key={index} className="col-lg-6 col-md-12 mb-3">
                    <div className="card h-100 border">
                      <div className="card-body">
                        <div className="d-flex align-items-center mb-3">
                          <div className={`${recTierInfo.color} me-3`}>
                            {recTierInfo.icon}
                          </div>
                          <div>
                            <h5 className="card-title mb-1">{recTierInfo.name}</h5>
                            <span className="badge bg-primary">Recommended</span>
                          </div>
                        </div>
                        <p className="card-text text-muted mb-3">{rec.reason}</p>
                        <div className="mb-3">
                          <h6 className="text-muted mb-2">Key Benefits:</h6>
                          <ul className="list-unstyled">
                            {rec.benefits.map((benefit, idx) => (
                              <li key={idx} className="mb-1">
                                <FaArrowUp className="text-primary me-2" />
                                <small>{benefit}</small>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <button className="btn btn-primary w-100">
                          Upgrade to {recTierInfo.name}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Statistics */}
        {subscription && (
          <div className="moises-profile-section">
            <h3 className="moises-section-title">Your Performance</h3>
            <div className="row">
              <div className="col-md-6 mb-3">
                <div className="card border-0 bg-light">
                  <div className="card-body text-center">
                    <div className="display-6 text-warning mb-2">
                      <FaStar />
                    </div>
                    <h4 className="card-title">{subscription.usage.leadsUsed}</h4>
                    <p className="card-text text-muted">Leads Used This Month</p>
                  </div>
                </div>
              </div>
              {subscription.tier === 'free-basic' && (
                <div className="col-md-6 mb-3">
                  <div className="card border-0 bg-light">
                    <div className="card-body text-center">
                      <div className="display-6 text-info mb-2">
                        <FaInfoCircle />
                      </div>
                      <h4 className="card-title">{subscription.leadsRemaining}</h4>
                      <p className="card-text text-muted">Leads Remaining</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionDashboard; 