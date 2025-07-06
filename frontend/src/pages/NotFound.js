import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { FaHome, FaSearch } from 'react-icons/fa';

const NotFound = () => {
  return (
    <Container className="py-5">
      <Row className="justify-content-center text-center">
        <Col lg={6}>
          <div className="mb-4">
            <h1 className="display-1 text-muted">404</h1>
            <h2 className="h3 mb-3">Page Not Found</h2>
            <p className="text-muted mb-4">
              Oops! The page you're looking for doesn't exist. 
              It might have been moved, deleted, or you entered the wrong URL.
            </p>
          </div>
          
          <div className="d-flex gap-3 justify-content-center flex-wrap">
            <Button as={Link} to="/" variant="primary">
              <FaHome className="me-2" />
              Go Home
            </Button>
            <Button as={Link} to="/dashboard" variant="outline-primary">
              <FaSearch className="me-2" />
              Browse Gigs
            </Button>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default NotFound; 