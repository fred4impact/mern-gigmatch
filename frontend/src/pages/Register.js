import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaMapMarkerAlt, FaPhone } from 'react-icons/fa';

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm();

  const password = watch('password');

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const result = await registerUser(data);
      if (result.success) {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="gigmatch-register-root">
      <div className="gigmatch-register-card" style={{ maxWidth: '400px', margin: '2rem auto', padding: '2rem 1.5rem' }}>
        <div className="gigmatch-register-header">
          <h1 className="gigmatch-register-title">Sign Up</h1>
          <p className="gigmatch-register-subtitle">Create your GigMatch account</p>
        </div>
        <form className="gigmatch-register-form" onSubmit={handleSubmit(onSubmit)} autoComplete="off">
          <div className="gigmatch-register-row">
            <div className="gigmatch-register-group">
              <label className="gigmatch-register-label" htmlFor="register-firstName">
                First Name
              </label>
              <input
                id="register-firstName"
                type="text"
                className={`gigmatch-register-input${errors.firstName ? ' is-invalid' : ''}`}
                placeholder="First name"
                {...register('firstName', {
                  required: 'First name is required',
                  minLength: { value: 2, message: 'First name must be at least 2 characters' }
                })}
              />
              {errors.firstName && <div className="gigmatch-register-error">{errors.firstName.message}</div>}
            </div>
            <div className="gigmatch-register-group">
              <label className="gigmatch-register-label" htmlFor="register-lastName">
                Last Name
              </label>
              <input
                id="register-lastName"
                type="text"
                className={`gigmatch-register-input${errors.lastName ? ' is-invalid' : ''}`}
                placeholder="Last name"
                {...register('lastName', {
                  required: 'Last name is required',
                  minLength: { value: 2, message: 'Last name must be at least 2 characters' }
                })}
              />
              {errors.lastName && <div className="gigmatch-register-error">{errors.lastName.message}</div>}
            </div>
          </div>
          
          <div className="gigmatch-register-row">
            <div className="gigmatch-register-group">
              <label className="gigmatch-register-label" htmlFor="register-email">
                Email
              </label>
              <input
                id="register-email"
                type="email"
                className={`gigmatch-register-input${errors.email ? ' is-invalid' : ''}`}
                placeholder="Email"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
              />
              {errors.email && <div className="gigmatch-register-error">{errors.email.message}</div>}
            </div>
            <div className="gigmatch-register-group">
              <label className="gigmatch-register-label" htmlFor="register-phone">
                Phone (optional)
              </label>
              <input
                id="register-phone"
                type="tel"
                className={`gigmatch-register-input${errors.phone ? ' is-invalid' : ''}`}
                placeholder="Phone number"
                {...register('phone', {
                  pattern: {
                    value: /^[+]?[1-9][\d]{0,15}$/,
                    message: 'Invalid phone number'
                  }
                })}
              />
              {errors.phone && <div className="gigmatch-register-error">{errors.phone.message}</div>}
            </div>
          </div>
          
          <div className="gigmatch-register-row">
            <div className="gigmatch-register-group">
              <label className="gigmatch-register-label" htmlFor="register-city">
                City
              </label>
              <input
                id="register-city"
                type="text"
                className={`gigmatch-register-input${errors.location?.city ? ' is-invalid' : ''}`}
                placeholder="City"
                {...register('location.city', { required: 'City is required' })}
              />
              {errors.location?.city && <div className="gigmatch-register-error">{errors.location.city.message}</div>}
            </div>
            <div className="gigmatch-register-group">
              <label className="gigmatch-register-label" htmlFor="register-role">I am a...</label>
              <select
                id="register-role"
                className={`gigmatch-register-select${errors.role ? ' is-invalid' : ''}`}
                {...register('role', { required: 'Please select your role' })}
              >
                <option value="">Select your role</option>
                <option value="talent">Talent (Musician, DJ, Photographer, etc.)</option>
                <option value="planner">Event Planner</option>
                <option value="studio">Studio Owner</option>
              </select>
              {errors.role && <div className="gigmatch-register-error">{errors.role.message}</div>}
            </div>
          </div>
          
          <div className="gigmatch-register-row">
            <div className="gigmatch-register-group">
              <label className="gigmatch-register-label" htmlFor="register-password">
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="register-password"
                  type={showPassword ? 'text' : 'password'}
                  className={`gigmatch-register-input${errors.password ? ' is-invalid' : ''}`}
                  placeholder="Password"
                  style={{ paddingRight: '3rem' }}
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 6, message: 'Password must be at least 6 characters' }
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
              {errors.password && <div className="gigmatch-register-error">{errors.password.message}</div>}
            </div>
            <div className="gigmatch-register-group">
              <label className="gigmatch-register-label" htmlFor="register-confirmPassword">
                Confirm Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="register-confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  className={`gigmatch-register-input${errors.confirmPassword ? ' is-invalid' : ''}`}
                  placeholder="Confirm password"
                  style={{ paddingRight: '3rem' }}
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: value => value === password || 'Passwords do not match'
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
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  tabIndex={-1}
                  aria-label="Toggle confirm password visibility"
                >
                  {showConfirmPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                </button>
              </div>
              {errors.confirmPassword && <div className="gigmatch-register-error">{errors.confirmPassword.message}</div>}
            </div>
          </div>
          
          <div className="gigmatch-register-actions">
            <button
              type="submit"
              className="gigmatch-register-btn gigmatch-register-btn-primary"
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
                'Create Account'
              )}
            </button>
          </div>
        </form>
        
        <div className="gigmatch-register-footer">
          <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>
            Already have an account?{' '}
            <Link to="/login" className="gigmatch-register-link">Sign in</Link>
          </span>
        </div>
      </div>
    </div>
  );
};

export default Register; 