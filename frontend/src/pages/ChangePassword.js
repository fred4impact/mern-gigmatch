import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaLock, FaEye, FaEyeSlash, FaArrowLeft, FaSpinner, FaCheckCircle } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const ChangePassword = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (currentPassword === newPassword) {
      toast.error('New password must be different from current password');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/auth/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          currentPassword, 
          newPassword 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        toast.success('Password changed successfully!');
        
        // Clear form
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        
        // Redirect after a short delay
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        toast.error(data.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="gigmatch-login-root">
        <div className="gigmatch-login-card">
          <div className="gigmatch-login-header">
            <h1 className="gigmatch-login-title">Password Changed!</h1>
            <p className="gigmatch-login-subtitle">
              Your password has been updated successfully
            </p>
          </div>
          
          <div className="gigmatch-login-form">
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <FaCheckCircle style={{ fontSize: '3rem', color: '#10b981', marginBottom: '1rem' }} />
              <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
                You will be redirected to your dashboard shortly...
              </p>
            </div>
            
            <div className="gigmatch-login-actions">
              <Link
                to="/dashboard"
                className="gigmatch-login-btn gigmatch-login-btn-primary"
                style={{ width: '100%', textAlign: 'center', textDecoration: 'none' }}
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="gigmatch-login-root">
      <div className="gigmatch-login-card">
        <div className="gigmatch-login-header">
          <h1 className="gigmatch-login-title">Change Password</h1>
          <p className="gigmatch-login-subtitle">
            Update your password to keep your account secure
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="gigmatch-login-form">
          <div className="gigmatch-login-group">
            <label className="gigmatch-login-label">Current Password</label>
            <div className="gigmatch-login-input-wrapper">
              <FaLock className="gigmatch-login-input-icon" />
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="gigmatch-login-input"
                placeholder="Enter current password"
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="gigmatch-login-password-toggle"
              >
                {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>
          
          <div className="gigmatch-login-group">
            <label className="gigmatch-login-label">New Password</label>
            <div className="gigmatch-login-input-wrapper">
              <FaLock className="gigmatch-login-input-icon" />
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="gigmatch-login-input"
                placeholder="Enter new password"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="gigmatch-login-password-toggle"
              >
                {showNewPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>
          
          <div className="gigmatch-login-group">
            <label className="gigmatch-login-label">Confirm New Password</label>
            <div className="gigmatch-login-input-wrapper">
              <FaLock className="gigmatch-login-input-icon" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="gigmatch-login-input"
                placeholder="Confirm new password"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="gigmatch-login-password-toggle"
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>
          
          <div className="gigmatch-login-actions">
            <button
              type="submit"
              className="gigmatch-login-btn gigmatch-login-btn-primary"
              disabled={loading}
              style={{ width: '100%' }}
            >
              {loading ? (
                <>
                  <FaSpinner className="gigmatch-login-spinner" />
                  Changing Password...
                </>
              ) : (
                'Change Password'
              )}
            </button>
          </div>
        </form>
        
        <div className="gigmatch-login-footer">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Link to="/dashboard" className="gigmatch-login-link">
              <FaArrowLeft style={{ marginRight: '0.5rem' }} />
              Back to Dashboard
            </Link>
            <Link to="/forgot-password" className="gigmatch-login-link">
              Forgot Password?
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword; 