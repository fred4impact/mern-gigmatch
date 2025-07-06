import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();
  
  return (
    <nav className="gigmatch-navbar">
      <div className="gigmatch-navbar-container">
        <div className="gigmatch-navbar-brand">
          <Link to="/" className="gigmatch-brand-link">
            GigMatch
          </Link>
        </div>
        
        <div className="gigmatch-navbar-menu">
          <Link 
            to="/" 
            className={`gigmatch-nav-link ${location.pathname === '/' ? 'active' : ''}`}
          >
            Home
          </Link>
          
          {isAuthenticated && (
            <>
              <Link 
                to="/dashboard" 
                className={`gigmatch-nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
              >
                Dashboard
              </Link>
              <Link 
                to="/profile" 
                className={`gigmatch-nav-link ${location.pathname === '/profile' ? 'active' : ''}`}
              >
                Profile
              </Link>
            </>
          )}
        </div>
        
        <div className="gigmatch-navbar-actions">
          {!isAuthenticated ? (
            <Link to="/login" className="gigmatch-btn gigmatch-btn-primary">
              Sign In
            </Link>
          ) : (
            <div className="gigmatch-user-menu">
              <span className="gigmatch-user-greeting">
                Hi, {user?.firstName || user?.email}
              </span>
              <button 
                className="gigmatch-btn gigmatch-btn-secondary" 
                onClick={logout}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 