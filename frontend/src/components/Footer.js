import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const Footer = () => {
  return (
    <footer className="bg-dark text-light py-4 mt-auto">
      <Container>
        <Row>
          <Col md={6}>
            <h5>🎯 GigMatch</h5>
            <p className="text-muted">
              Smart, location-aware talent matchmaking platform for creative professionals.
            </p>
          </Col>
          <Col md={3}>
            <h6>Quick Links</h6>
            <ul className="list-unstyled">
              <li><a href="/" className="text-muted text-decoration-none">Home</a></li>
              <li><a href="/about" className="text-muted text-decoration-none">About</a></li>
              <li><a href="/contact" className="text-muted text-decoration-none">Contact</a></li>
            </ul>
          </Col>
          <Col md={3}>
            <h6>Support</h6>
            <ul className="list-unstyled">
              <li><a href="/help" className="text-muted text-decoration-none">Help Center</a></li>
              <li><a href="/terms" className="text-muted text-decoration-none">Terms of Service</a></li>
              <li><a href="/privacy" className="text-muted text-decoration-none">Privacy Policy</a></li>
            </ul>
          </Col>
        </Row>
        <hr className="my-3" />
        <Row>
          <Col className="text-center">
            <p className="text-muted mb-0">
              © {new Date().getFullYear()} GigMatch. All rights reserved.
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer; 