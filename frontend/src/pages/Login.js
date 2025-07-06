import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const result = await login(data.email, data.password);
      if (result.success) {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="gigmatch-login-root">
      <div className="gigmatch-login-card" style={{ maxWidth: '400px', margin: '2rem auto', padding: '2rem 1.5rem' }}>
        <div className="gigmatch-login-header">
          <h1 className="gigmatch-login-title">Sign In</h1>
          <p className="gigmatch-login-subtitle">Welcome back to GigMatch</p>
        </div>
        <form className="gigmatch-login-form" onSubmit={handleSubmit(onSubmit)} autoComplete="off">
          <div className="gigmatch-login-group">
            <label className="gigmatch-login-label" htmlFor="login-email">
              Email
            </label>
            <input
              id="login-email"
              type="email"
              className={`gigmatch-login-input${errors.email ? ' is-invalid' : ''}`}
              placeholder="Enter your email"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address'
                }
              })}
            />
            {errors.email && <div className="gigmatch-login-error">{errors.email.message}</div>}
          </div>
          <div className="gigmatch-login-group">
            <label className="gigmatch-login-label" htmlFor="login-password">
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                className={`gigmatch-login-input${errors.password ? ' is-invalid' : ''}`}
                placeholder="Enter your password"
                style={{ paddingRight: '3rem' }}
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters'
                  }
                })}
              />
              <button
                type="button"
                style={{
                  position: 'absolute',
                  right: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#6b7280',
                  cursor: 'pointer',
                  padding: '0.25rem'
                }}
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                aria-label="Toggle password visibility"
              >
                {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
              </button>
            </div>
            {errors.password && <div className="gigmatch-login-error">{errors.password.message}</div>}
          </div>
          <div className="gigmatch-login-actions">
            <button
              type="submit"
              className="gigmatch-login-btn gigmatch-login-btn-primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <div style={{ 
                  width: '1rem', 
                  height: '1rem', 
                  border: '2px solid transparent',
                  borderTop: '2px solid white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
              ) : (
                'Sign In'
              )}
            </button>
          </div>
        </form>
        <div className="gigmatch-login-footer">
          <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>
            Don't have an account?{' '}
            <Link to="/register" className="gigmatch-login-link">Sign up</Link>
          </span>
        </div>
      </div>
    </div>
  );
};

export default Login; 