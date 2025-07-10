import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import { 
  FaSearch, 
  FaMapMarkerAlt, 
  FaShieldAlt, 
  FaComments, 
  FaChartLine, 
  FaStar,
  FaUsers,
  FaCalendarAlt,
  FaUserTie, FaUserFriends, FaCalendarAlt as FaCalendarPlus, FaClipboardList, FaHandshake, FaMapMarkerAlt as FaMapMarkerAltPlus, FaUserPlus
} from 'react-icons/fa';
import dashboardService from '../services/dashboardService';

const Home = () => {
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [statsError, setStatsError] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoadingStats(true);
    dashboardService.getPublicStats()
      .then(data => {
        if (mounted) {
          setStats(data);
          setLoadingStats(false);
        }
      })
      .catch(err => {
        if (mounted) {
          setStatsError(err.message);
          setLoadingStats(false);
        }
      });
    return () => { mounted = false; };
  }, []);

  console.log('Home component rendering'); // Debug log
  
  const features = [
    {
      icon: <FaSearch />,
      title: 'AI-Powered Matchmaking',
      description: 'Smart recommendations based on skills, location, and availability'
    },
    {
      icon: <FaMapMarkerAlt />,
      title: 'Location-Aware Booking',
      description: 'Find gigs within optimal travel time from your location'
    },
    {
      icon: <FaShieldAlt />,
      title: 'Secure Payments',
      description: 'Deposit-based bookings with Stripe integration for trust'
    },
    {
      icon: <FaComments />,
      title: 'Seamless Communication',
      description: 'Built-in messaging and booking flow from interest to completion'
    },
    {
      icon: <FaChartLine />,
      title: 'Analytics Dashboard',
      description: 'Track your gig stats, profile views, and performance trends'
    },
    {
      icon: <FaStar />,
      title: 'Verified Reviews',
      description: 'Post-gig reviews with admin moderation for quality assurance'
    }
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-section">
        <Container>
          <Row className="justify-content-center text-center">
            <Col lg={8}>
              <h1 className="display-4 fw-bold mb-4">
                Find Your Perfect Gig Match
              </h1>
              <p className="lead mb-4">
                Connect with event planners, studios, and verified service providers. 
                AI-powered matchmaking for creative professionals.
              </p>
              <div className="d-flex gap-3 justify-content-center flex-wrap">
                <Button as={Link} to="/register" variant="light" size="lg">
                  Get Started
                </Button>
                <Button as={Link} to="/login" variant="outline-light" size="lg">
                  Sign In
                </Button>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Features Section */}
      <section className="py-5">
        <Container>
          <Row className="text-center mb-5">
            <Col>
              <h2 className="display-6 fw-bold mb-3">Why Choose GigMatch?</h2>
              <p className="lead text-muted">
                The smart way to connect creative talent with amazing opportunities
              </p>
            </Col>
          </Row>
          
          <Row>
            {features.map((feature, index) => (
              <Col key={index} lg={4} md={6} className="mb-4">
                <Card className="h-100 border-0 shadow-sm feature-card">
                  <Card.Body className="text-center">
                    <div className="feature-icon text-primary mb-3">
                      {feature.icon}
                    </div>
                    <Card.Title className="h5 mb-3">{feature.title}</Card.Title>
                    <Card.Text className="text-muted">
                      {feature.description}
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Stats Section */}
      <section className="py-5 bg-white">
        <Container>
          <Row className="g-4 justify-content-center">
            {loadingStats && <Col><div>Loading stats...</div></Col>}
            {statsError && <Col><div style={{color: 'red'}}>{statsError}</div></Col>}
            {stats && (
              <>
                <Col md={3} sm={6} xs={12}>
                  <Card className="stat-card border-0 shadow-lg text-center p-2 rounded-4 h-100 stat-card-hover" style={{ minHeight: 120, border: '0.75px solid #0d6efd', transition: 'transform 0.2s, box-shadow 0.2s' }}>
                    <div className="stat-icon bg-primary bg-opacity-10 text-primary mx-auto mb-2 rounded-circle d-flex align-items-center justify-content-center" style={{ width: 40, height: 40, fontSize: 20 }}>
                      <FaUsers />
                    </div>
                    <div className="text-uppercase small text-muted mb-1">Total</div>
                    <div className="stat-number h3 fw-bold mb-1">{stats.talents + stats.planners}</div>
                    <div className="stat-label text-secondary fw-semibold">Active Users</div>
                  </Card>
                </Col>
                <Col md={3} sm={6} xs={12}>
                  <Card className="stat-card border-0 shadow-lg text-center p-2 rounded-4 h-100 stat-card-hover" style={{ minHeight: 120, border: '0.75px solid #dc3545', transition: 'transform 0.2s, box-shadow 0.2s' }}>
                    <div className="stat-icon bg-danger bg-opacity-10 text-danger mx-auto mb-2 rounded-circle d-flex align-items-center justify-content-center" style={{ width: 40, height: 40, fontSize: 20 }}>
                      <FaMapMarkerAlt />
                    </div>
                    <div className="text-uppercase small text-muted mb-1">Total</div>
                    <div className="stat-number h3 fw-bold mb-1">{stats.cities}</div>
                    <div className="stat-label text-secondary fw-semibold">Cities Covered</div>
                  </Card>
                </Col>
                <Col md={3} sm={6} xs={12}>
                  <Card className="stat-card border-0 shadow-lg text-center p-2 rounded-4 h-100 stat-card-hover" style={{ minHeight: 120, border: '0.75px solid #fd7e14', transition: 'transform 0.2s, box-shadow 0.2s' }}>
                    <div className="stat-icon bg-primary bg-opacity-10 text-primary mx-auto mb-2 rounded-circle d-flex align-items-center justify-content-center" style={{ width: 40, height: 40, fontSize: 20 }}>
                      <FaCalendarPlus />
                    </div>
                    <div className="text-uppercase small text-muted mb-1">This Month</div>
                    <div className="stat-number h3 fw-bold mb-1">{stats.newEventsThisMonth}</div>
                    <div className="stat-label text-secondary fw-semibold">New Events</div>
                  </Card>
                </Col>
                <Col md={3} sm={6} xs={12}>
                  <Card className="stat-card border-0 shadow-lg text-center p-2 rounded-4 h-100 stat-card-hover" style={{ minHeight: 120, border: '0.75px solid #198754', transition: 'transform 0.2s, box-shadow 0.2s' }}>
                    <div className="stat-icon bg-info bg-opacity-10 text-info mx-auto mb-2 rounded-circle d-flex align-items-center justify-content-center" style={{ width: 40, height: 40, fontSize: 20 }}>
                      <FaCalendarAlt />
                    </div>
                    <div className="text-uppercase small text-muted mb-1">Total</div>
                    <div className="stat-number h3 fw-bold mb-1">{stats.events}</div>
                    <div className="stat-label text-secondary fw-semibold">Events Posted</div>
                  </Card>
                </Col>
              </>
            )}
          </Row>
        </Container>
      </section>

      {/* How It Works Section */}
      <section className="py-5 bg-light">
        <Container>
          <Row className="text-center mb-5">
            <Col>
              <h2 className="display-6 fw-bold mb-3">How It Works</h2>
              <p className="lead text-muted">
                Simple steps to find your next gig
              </p>
            </Col>
          </Row>
          
          <Row className="justify-content-center">
            <Col lg={8}>
              <Row>
                <Col md={4} className="text-center mb-4">
                  <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
                       style={{ width: '60px', height: '60px' }}>
                    <FaUsers size={24} />
                  </div>
                  <h5>1. Create Profile</h5>
                  <p className="text-muted">Set up your profile with skills, location, and availability</p>
                </Col>
                
                <Col md={4} className="text-center mb-4">
                  <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
                       style={{ width: '60px', height: '60px' }}>
                    <FaSearch size={24} />
                  </div>
                  <h5>2. Find Gigs</h5>
                  <p className="text-muted">Browse and get matched with relevant opportunities</p>
                </Col>
                
                <Col md={4} className="text-center mb-4">
                  <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
                       style={{ width: '60px', height: '60px' }}>
                    <FaCalendarAlt size={24} />
                  </div>
                  <h5>3. Book & Connect</h5>
                  <p className="text-muted">Secure booking with messaging and payment integration</p>
                </Col>
              </Row>
            </Col>
          </Row>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="py-5 bg-primary text-white">
        <Container>
          <Row className="text-center">
            <Col lg={8} className="mx-auto">
              <h2 className="display-6 fw-bold mb-3">Ready to Start?</h2>
              <p className="lead mb-4">
                Join thousands of creative professionals finding their perfect gigs
              </p>
              <Button as={Link} to="/register" variant="light" size="lg">
                Create Your Profile
              </Button>
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  );
};

export default Home; 