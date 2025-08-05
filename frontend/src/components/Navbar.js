import React, { useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaChevronDown, FaUserCircle, FaUser, FaCog, FaSignOutAlt, FaTachometerAlt, FaLock } from 'react-icons/fa';
import './Navbar.css';

const Navbar = () => {
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef();

  // Close dropdown on outside click
  React.useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpen]);

  return (
    <nav className="nav-main">
      <div className="nav-container">
        <div className="nav-brand">
          <Link to="/" className="nav-brand-link">
            GigMatch
          </Link>
        </div>
        <div className="nav-menu">
          <Link to="/" className={`nav-link${location.pathname === '/' ? ' active' : ''}`}>Home</Link>
          {isAuthenticated && (
            <>
              <Link to="/dashboard" className={`nav-link${location.pathname === '/dashboard' ? ' active' : ''}`}>Dashboard</Link>
              <Link to="/profile" className={`nav-link${location.pathname === '/profile' ? ' active' : ''}`}>Profile</Link>
            </>
          )}
        </div>
        <div className="nav-actions">
          {!isAuthenticated ? (
            <>
              <Link to="/login" className="nav-btn nav-btn-primary" style={{ marginRight: '0.5rem' }}>Sign In</Link>
              <Link to="/register" className="nav-btn nav-btn-secondary">Sign Up</Link>
            </>
          ) : (
            <div className="nav-user-menu" ref={menuRef}>
              <button className="nav-user-trigger" onClick={() => setMenuOpen((v) => !v)}>
                {user?.avatar ? (
                  <img src={user.avatar.startsWith('http') ? user.avatar : `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/${user.avatar}`} alt="avatar" className="nav-user-avatar" />
                ) : (
                  <FaUserCircle className="nav-user-avatar-placeholder" />
                )}
                <span className="nav-user-name">{user?.firstName || user?.email}</span>
                <FaChevronDown className={`nav-chevron${menuOpen ? ' open' : ''}`} />
              </button>
              {menuOpen && (
                <div className="nav-dropdown">
                  <div className="nav-dropdown-header">
                    {user?.avatar ? (
                      <img src={user.avatar.startsWith('http') ? user.avatar : `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/${user.avatar}`} alt="avatar" className="nav-dropdown-avatar" />
                    ) : (
                      <FaUser className="nav-dropdown-avatar-placeholder" />
                    )}
                    <div className="nav-dropdown-userinfo">
                      <div className="nav-dropdown-name">{user?.firstName} {user?.lastName}</div>
                      <div className="nav-dropdown-email">{user?.email}</div>
                    </div>
                  </div>
                  <Link to="/profile" className="nav-dropdown-item"><FaUser /> My Profile</Link>
                  <Link to="/dashboard" className="nav-dropdown-item"><FaTachometerAlt /> Dashboard</Link>
                  <Link to="/change-password" className="nav-dropdown-item"><FaLock /> Change Password</Link>
                  {/* Uncomment if you have a settings page: */}
                  {/* <Link to="/settings" className="nav-dropdown-item"><FaCog /> Settings</Link> */}
                  <button className="nav-dropdown-item nav-dropdown-logout" onClick={logout}><FaSignOutAlt /> Logout</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 