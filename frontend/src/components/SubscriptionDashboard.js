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
  FaTimes,
  FaArrowUp,
  FaInfoCircle
} from 'react-icons/fa';
import toast from 'react-hot-toast';

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
      const [subscriptionRes, recommendationsRes] = await Promise.all([
        subscriptionService.getMySubscription(),
        subscriptionService.getRecommendations()
      ]);
      
      setSubscription(subscriptionRes.data);
      setRecommendations(recommendationsRes.data.recommendations || []);
    } catch (error) {
      console.error('Error fetching subscription data:', error);
      toast.error('Error loading subscription data');
    } finally {
      setLoading(false);
    }
  };

  const getTierInfo = (tier, leadsPerMonth) => {
    const tiers = {
      'free': {
        name: 'Free',
        icon: <FaInfoCircle />,
        color: 'text-gray-600',
        bgColor: 'bg-gray-100',
        features: [
          (typeof leadsPerMonth === 'number' && leadsPerMonth > 0)
            ? `${leadsPerMonth} leads per month`
            : 'Limited leads',
          'Basic profile',
          'Standard matching'
        ]
      },
      'pro': {
        name: 'Pro',
        icon: <FaStar />,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
        features: [
          'Unlimited leads',
          'AI boosted matching',
          'Priority listing',
          'Portfolio gallery',
          'Advanced filtering'
        ]
      }
    };
    return tiers[tier] || tiers['free'];
  };

  const getUsagePercentage = () => {
    if (!subscription || subscription.tier !== 'free') return 0;
    return Math.min((subscription.usage.leadsUsed / subscription.features.leadsPerMonth) * 100, 100);
  };

  const getUsageColor = () => {
    const percentage = getUsagePercentage();
    if (percentage >= 80) return 'text-red-600';
    if (percentage >= 60) return 'text-orange-600';
    return 'text-green-600';
  };

  if (user?.role !== 'talent') {
    return null;
  }

  if (loading) {
    return (
      <div className="subscription-dashboard">
        <div className="subscription-card">
          <div className="text-center">
            <div className="spinner"></div>
            <p>Loading subscription data...</p>
          </div>
        </div>
      </div>
    );
  }

  const tierInfo = getTierInfo(subscription?.tier || 'free', subscription?.features?.leadsPerMonth);

  return (
    <div className="subscription-dashboard">
      <div className="subscription-card">
        <div className="subscription-header">
          <h2 className="subscription-title">Subscription Dashboard</h2>
          <p className="subscription-subtitle">
            Manage your subscription and discover opportunities to grow
          </p>
        </div>

        {/* Current Subscription */}
        <div className="subscription-section">
          <h3 className="section-title">Current Plan</h3>
          <div className={`current-plan ${tierInfo.bgColor}`}>
            <div className="plan-icon">
              <span className={tierInfo.color}>{tierInfo.icon}</span>
            </div>
            <div className="plan-details">
              <h4 className="plan-name">{tierInfo.name}</h4>
              <p className="plan-status">
                Status: <span className="text-green-600 font-semibold">Active</span>
              </p>
              {subscription?.tier === 'free' && (
                <div className="usage-info">
                  <div className="usage-text">
                    <span className={getUsageColor()}>
                      {subscription.usage.leadsUsed} / {subscription.features.leadsPerMonth} leads used
                    </span>
                  </div>
                  <div className="usage-bar">
                    <div 
                      className={`usage-progress ${getUsageColor().replace('text-', 'bg-')}`}
                      style={{ width: `${getUsagePercentage()}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Plan Features */}
          <div className="plan-features">
            <h5 className="features-title">Your Plan Features:</h5>
            <ul className="features-list">
              {tierInfo.features.map((feature, index) => (
                <li key={index} className="feature-item">
                  <FaCheck className="feature-icon text-green-600" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="subscription-section">
            <h3 className="section-title">Upgrade Recommendations</h3>
            <div className="recommendations-grid">
              {recommendations.map((rec, index) => {
                const recTierInfo = getTierInfo(rec.tier, rec.features?.leadsPerMonth);
                return (
                  <div key={index} className="recommendation-card">
                    <div className="recommendation-header">
                      <div className="recommendation-icon">
                        <span className={recTierInfo.color}>{recTierInfo.icon}</span>
                      </div>
                      <div className="recommendation-title">
                        <h4>{recTierInfo.name}</h4>
                        <span className="recommendation-badge">Recommended</span>
                      </div>
                    </div>
                    <p className="recommendation-reason">{rec.reason}</p>
                    <div className="recommendation-benefits">
                      <h5>Key Benefits:</h5>
                      <ul>
                        {rec.benefits.map((benefit, idx) => (
                          <li key={idx} className="benefit-item">
                            <FaArrowUp className="benefit-icon text-blue-600" />
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <button className="upgrade-btn">
                      Upgrade to {recTierInfo.name}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Statistics */}
        {subscription && (
          <div className="subscription-section">
            <h3 className="section-title">Your Performance</h3>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">
                  <FaStar className="text-yellow-500" />
                </div>
                <div className="stat-content">
                  <h4 className="stat-value">{subscription.usage.leadsUsed}</h4>
                  <p className="stat-label">Leads Used This Month</p>
                </div>
              </div>
              {subscription.tier === 'free' && (
                <div className="stat-card">
                  <div className="stat-icon">
                    <FaInfoCircle className="text-blue-500" />
                  </div>
                  <div className="stat-content">
                    <h4 className="stat-value">{subscription.leadsRemaining}</h4>
                    <p className="stat-label">Leads Remaining</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .subscription-dashboard {
          padding: 2rem 0;
        }

        .subscription-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          padding: 2rem;
          margin-bottom: 2rem;
        }

        .subscription-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .subscription-title {
          font-size: 1.875rem;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 0.5rem;
        }

        .subscription-subtitle {
          color: #6b7280;
          font-size: 1.125rem;
        }

        .subscription-section {
          margin-bottom: 2rem;
        }

        .section-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 1rem;
        }

        .current-plan {
          display: flex;
          align-items: center;
          padding: 1.5rem;
          border-radius: 8px;
          margin-bottom: 1rem;
        }

        .plan-icon {
          font-size: 2rem;
          margin-right: 1rem;
        }

        .plan-details {
          flex: 1;
        }

        .plan-name {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 0.25rem;
        }

        .plan-status {
          color: #6b7280;
          margin-bottom: 0.5rem;
        }

        .usage-info {
          margin-top: 0.5rem;
        }

        .usage-text {
          font-size: 0.875rem;
          margin-bottom: 0.25rem;
        }

        .usage-bar {
          width: 100%;
          height: 8px;
          background-color: #e5e7eb;
          border-radius: 4px;
          overflow: hidden;
        }

        .usage-progress {
          height: 100%;
          border-radius: 4px;
          transition: width 0.3s ease;
        }

        .plan-features {
          margin-top: 1rem;
        }

        .features-title {
          font-size: 1rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .features-list {
          list-style: none;
          padding: 0;
        }

        .feature-item {
          display: flex;
          align-items: center;
          margin-bottom: 0.5rem;
          font-size: 0.875rem;
        }

        .feature-icon {
          margin-right: 0.5rem;
          font-size: 0.75rem;
        }

        .recommendations-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1rem;
        }

        .recommendation-card {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 1.5rem;
          background: white;
        }

        .recommendation-header {
          display: flex;
          align-items: center;
          margin-bottom: 1rem;
        }

        .recommendation-icon {
          font-size: 1.5rem;
          margin-right: 0.75rem;
        }

        .recommendation-title h4 {
          font-size: 1.125rem;
          font-weight: 600;
          margin-bottom: 0.25rem;
        }

        .recommendation-badge {
          background: #3b82f6;
          color: white;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .recommendation-reason {
          color: #6b7280;
          margin-bottom: 1rem;
          font-size: 0.875rem;
        }

        .recommendation-benefits h5 {
          font-size: 0.875rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .recommendation-benefits ul {
          list-style: none;
          padding: 0;
          margin-bottom: 1rem;
        }

        .benefit-item {
          display: flex;
          align-items: center;
          margin-bottom: 0.25rem;
          font-size: 0.75rem;
        }

        .benefit-icon {
          margin-right: 0.5rem;
          font-size: 0.625rem;
        }

        .upgrade-btn {
          width: 100%;
          background: #3b82f6;
          color: white;
          border: none;
          padding: 0.75rem;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .upgrade-btn:hover {
          background: #2563eb;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .stat-card {
          display: flex;
          align-items: center;
          padding: 1rem;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          background: white;
        }

        .stat-icon {
          font-size: 1.5rem;
          margin-right: 1rem;
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 0.25rem;
        }

        .stat-label {
          color: #6b7280;
          font-size: 0.875rem;
        }

        .spinner {
          border: 4px solid #f3f4f6;
          border-top: 4px solid #3b82f6;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
          margin: 0 auto 1rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default SubscriptionDashboard; 