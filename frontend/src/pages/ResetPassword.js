import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaLock, FaEye, FaEyeSlash, FaArrowLeft, FaSpinner, FaCheckCircle } from 'react-icons/fa';
import toast from 'react-hot-toast';

const ResetPassword = () => {
  const { resetToken } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);

  useEffect(() => {
    if (!resetToken) {
      setTokenValid(false);
      toast.error('Invalid reset link');
    }
  }, [resetToken]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!password || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/auth/reset-password/${resetToken}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        toast.success('Password reset successful!');
        
        // Store the token and redirect to dashboard
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data));
        
        // Redirect after a short delay
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        toast.error(data.message || 'Failed to reset password');
        if (data.message?.includes('expired') || data.message?.includes('Invalid')) {
          setTokenValid(false);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!tokenValid) {
    return (
      <div className="gigmatch-login-root">
        <div className="gigmatch-login-card">
          <div className="gigmatch-login-header">
            <h1 className="gigmatch-login-title">Invalid Reset Link</h1>
            <p className="gigmatch-login-subtitle">
              This password reset link is invalid or has expired
            </p>
          </div>
          
          <div className="gigmatch-login-form">
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
                Please request a new password reset link.
              </p>
            </div>
            
            <div className="gigmatch-login-actions">
              <Link
                to="/forgot-password"
                className="gigmatch-login-btn gigmatch-login-btn-primary"
                style={{ width: '100%', textAlign: 'center', textDecoration: 'none' }}
              >
                Request New Link
              </Link>
            </div>
          </div>
          
          <div className="gigmatch-login-footer">
            <Link to="/login" className="gigmatch-login-link">
              <FaArrowLeft style={{ marginRight: '0.5rem' }} />
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="gigmatch-login-root">
        <div className="gigmatch-login-card">
          <div className="gigmatch-login-header">
            <h1 className="gigmatch-login-title">Password Reset Successful!</h1>
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
          <h1 className="gigmatch-login-title">Reset Password</h1>
          <p className="gigmatch-login-subtitle">
            Enter your new password below
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="gigmatch-login-form">
          <div className="gigmatch-login-group">
            <label className="gigmatch-login-label">New Password</label>
            <div className="gigmatch-login-input-wrapper">
              <FaLock className="gigmatch-login-input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="gigmatch-login-input"
                placeholder="Enter new password"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="gigmatch-login-password-toggle"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
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
                  Resetting...
                </>
              ) : (
                'Reset Password'
              )}
            </button>
          </div>
        </form>
        
        <div className="gigmatch-login-footer">
          <Link to="/login" className="gigmatch-login-link">
            <FaArrowLeft style={{ marginRight: '0.5rem' }} />
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword; 