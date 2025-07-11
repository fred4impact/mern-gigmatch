import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaEnvelope, FaArrowLeft, FaSpinner } from 'react-icons/fa';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setEmailSent(true);
        toast.success('Password reset email sent! Check your inbox.');
      } else {
        toast.error(data.message || 'Failed to send reset email');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="gigmatch-login-root">
        <div className="gigmatch-login-card">
          <div className="gigmatch-login-header">
            <h1 className="gigmatch-login-title">Check Your Email</h1>
            <p className="gigmatch-login-subtitle">
              We've sent a password reset link to <strong>{email}</strong>
            </p>
          </div>
          
          <div className="gigmatch-login-form">
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <FaEnvelope style={{ fontSize: '3rem', color: '#10b981', marginBottom: '1rem' }} />
              <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
                Click the link in the email to reset your password. The link will expire in 10 minutes.
              </p>
              <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>
                Didn't receive the email? Check your spam folder or try again.
              </p>
            </div>
            
            <div className="gigmatch-login-actions">
              <button
                onClick={() => setEmailSent(false)}
                className="gigmatch-login-btn gigmatch-login-btn-primary"
                style={{ width: '100%' }}
              >
                Try Again
              </button>
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

  return (
    <div className="gigmatch-login-root">
      <div className="gigmatch-login-card">
        <div className="gigmatch-login-header">
          <h1 className="gigmatch-login-title">Forgot Password</h1>
          <p className="gigmatch-login-subtitle">
            Enter your email address and we'll send you a link to reset your password
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="gigmatch-login-form">
          <div className="gigmatch-login-group">
            <label className="gigmatch-login-label">Email Address</label>
            <div className="gigmatch-login-input-wrapper">
              <FaEnvelope className="gigmatch-login-input-icon" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="gigmatch-login-input"
                placeholder="Enter your email"
                required
              />
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
                  Sending...
                </>
              ) : (
                'Send Reset Link'
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

export default ForgotPassword; 