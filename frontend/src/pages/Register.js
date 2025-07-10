import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';

const categories = {
  musician: {
    name: 'Musician',
    subcategories: [
      'Keyboardist/Pianist',
      'Guitarist',
      'Bassist',
      'Drummer',
      'Singer/Vocalist',
      'Saxophonist',
      'Trumpeter',
      'Violinist',
      'Cellist',
      'Flutist',
      'Clarinetist',
      'Trombonist',
      'Percussionist',
      'Harpist',
      'Accordionist',
      'Other'
    ]
  },
  dj: {
    name: 'DJ',
    subcategories: [
      'Wedding DJ',
      'Club DJ',
      'Corporate Event DJ',
      'Mobile DJ',
      'Radio DJ',
      'Turntablist',
      'Electronic Music DJ',
      'Hip-Hop DJ',
      'Latin DJ',
      'Other'
    ]
  },
  photographer: {
    name: 'Photographer',
    subcategories: [
      'Wedding Photographer',
      'Portrait Photographer',
      'Event Photographer',
      'Commercial Photographer',
      'Fashion Photographer',
      'Real Estate Photographer',
      'Product Photographer',
      'Street Photographer',
      'Nature Photographer',
      'Other'
    ]
  },
  videographer: {
    name: 'Videographer',
    subcategories: [
      'Wedding Videographer',
      'Corporate Videographer',
      'Music Video Director',
      'Documentary Filmmaker',
      'Commercial Videographer',
      'Event Videographer',
      'Drone Videographer',
      'Other'
    ]
  },
  dancer: {
    name: 'Dancer',
    subcategories: [
      'Ballet Dancer',
      'Contemporary Dancer',
      'Hip-Hop Dancer',
      'Jazz Dancer',
      'Tap Dancer',
      'Latin Dancer',
      'Ballroom Dancer',
      'Belly Dancer',
      'Pole Dancer',
      'Other'
    ]
  },
  comedian: {
    name: 'Comedian',
    subcategories: [
      'Stand-up Comedian',
      'Improv Comedian',
      'Comedy Writer',
      'Comedy Host',
      'Other'
    ]
  },
  magician: {
    name: 'Magician',
    subcategories: [
      'Close-up Magician',
      'Stage Magician',
      'Mentalist',
      'Illusionist',
      'Children\'s Magician',
      'Corporate Magician',
      'Other'
    ]
  },
  other: {
    name: 'Other',
    subcategories: [
      'Face Painter',
      'Balloon Artist',
      'Caricature Artist',
      'Live Painter',
      'Poet/Spoken Word',
      'Aerialist',
      'Fire Performer',
      'Juggler',
      'Mime',
      'Other'
    ]
  }
};

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
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
    if (!acceptTerms) return;
    setIsLoading(true);
    try {
      const submitData = { ...data };
      delete submitData.confirmPassword;
      const result = await registerUser(submitData);
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
    <div className="container min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="row w-100 justify-content-center">
        <div className="col-12 col-md-8 col-lg-5">
          <div className="card shadow-sm border-0 rounded-4 p-4">
            <div className="text-center mb-4">
              <span style={{fontSize: '2.5rem'}} role="img" aria-label="logo">🎵</span>
            </div>
            <h1 className="h3 mb-2 fw-bold text-center">Create your account</h1>
            <p className="text-secondary text-center mb-4">Start your journey with GigMatch</p>
            <button className="btn btn-light w-100 mb-3 d-flex align-items-center justify-content-center gap-2" type="button" disabled>
              <span className="bg-white border rounded-circle d-flex align-items-center justify-content-center" style={{width: '1.7rem', height: '1.7rem', fontWeight: 'bold'}}>G</span>
              Sign up with Google
            </button>
            <div className="d-flex align-items-center mb-3">
              <hr className="flex-grow-1" />
              <span className="mx-2 text-muted">OR</span>
              <hr className="flex-grow-1" />
            </div>
            <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
              <div className="row g-2 mb-3">
                <div className="col">
                  <label htmlFor="register-firstName" className="form-label">First Name</label>
                  <div className="input-group">
                    <span className="input-group-text"><FaUser /></span>
                    <input
                      id="register-firstName"
                      type="text"
                      className={`form-control${errors.firstName ? ' is-invalid' : ''}`}
                      placeholder="First name"
                      {...register('firstName', { required: 'Please enter your first name.' })}
                    />
                    {errors.firstName && <div className="invalid-feedback d-block">{errors.firstName.message}</div>}
                  </div>
                </div>
                <div className="col">
                  <label htmlFor="register-lastName" className="form-label">Last Name</label>
                  <div className="input-group">
                    <span className="input-group-text"><FaUser /></span>
                    <input
                      id="register-lastName"
                      type="text"
                      className={`form-control${errors.lastName ? ' is-invalid' : ''}`}
                      placeholder="Last name"
                      {...register('lastName', { required: 'Please enter your last name.' })}
                    />
                    {errors.lastName && <div className="invalid-feedback d-block">{errors.lastName.message}</div>}
                  </div>
                </div>
              </div>
              <div className="mb-3">
                <label htmlFor="register-category" className="form-label">Category</label>
                <select
                  id="register-category"
                  className={`form-select${errors.category ? ' is-invalid' : ''}`}
                  {...register('category', { required: 'Please select a category.' })}
                >
                  <option value="">Select category</option>
                  {Object.entries(categories).map(([key, cat]) => (
                    <option key={key} value={key}>{cat.name}</option>
                  ))}
                </select>
                {errors.category && <div className="invalid-feedback d-block">{errors.category.message}</div>}
              </div>
              <div className="mb-3">
                <label htmlFor="register-subcategory" className="form-label">Subcategory</label>
                <select
                  id="register-subcategory"
                  className={`form-select${errors.subcategory ? ' is-invalid' : ''}`}
                  {...register('subcategory', { required: 'Please select a subcategory.' })}
                  disabled={!watch('category')}
                >
                  <option value="">Select subcategory</option>
                  {watch('category') && categories[watch('category')]?.subcategories.map(sub => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
                {errors.subcategory && <div className="invalid-feedback d-block">{errors.subcategory.message}</div>}
              </div>
              <div className="mb-3">
                <label htmlFor="register-email" className="form-label">Email</label>
                <div className="input-group">
                  <span className="input-group-text"><FaEnvelope /></span>
                  <input
                    id="register-email"
                    type="email"
                    className={`form-control${errors.email ? ' is-invalid' : ''}`}
                    placeholder="Your email"
                    {...register('email', {
                      required: 'Please enter a valid email address.',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Please enter a valid email address.'
                      }
                    })}
                  />
                  {errors.email && <div className="invalid-feedback d-block">{errors.email.message}</div>}
                </div>
              </div>
              <div className="mb-3">
                <label htmlFor="register-password" className="form-label">Password</label>
                <div className="input-group">
                  <span className="input-group-text"><FaLock /></span>
                  <input
                    id="register-password"
                    type={showPassword ? 'text' : 'password'}
                    className={`form-control${errors.password ? ' is-invalid' : ''}`}
                    placeholder="Password"
                    {...register('password', {
                      required: 'Please enter a password.',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters.'
                      }
                    })}
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary border-start-0"
                    tabIndex={-1}
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    style={{borderTopLeftRadius: 0, borderBottomLeftRadius: 0}}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                  {errors.password && <div className="invalid-feedback d-block">{errors.password.message}</div>}
                </div>
              </div>
              <div className="mb-3">
                <label htmlFor="register-confirmPassword" className="form-label">Confirm Password</label>
                <div className="input-group">
                  <span className="input-group-text"><FaLock /></span>
                  <input
                    id="register-confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    className={`form-control${errors.confirmPassword ? ' is-invalid' : ''}`}
                    placeholder="Confirm password"
                    {...register('confirmPassword', {
                      required: 'Please confirm your password.',
                      validate: value => value === password || 'Password does not match the confirm password.'
                    })}
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary border-start-0"
                    tabIndex={-1}
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    style={{borderTopLeftRadius: 0, borderBottomLeftRadius: 0}}
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                  {errors.confirmPassword && <div className="invalid-feedback d-block">{errors.confirmPassword.message}</div>}
                </div>
              </div>
              <div className="form-check mb-3">
                <input
                  type="checkbox"
                  id="accept-terms"
                  checked={acceptTerms}
                  onChange={e => setAcceptTerms(e.target.checked)}
                  className="form-check-input"
                />
                <label htmlFor="accept-terms" className="form-check-label">
                  I accept the <a href="#" target="_blank" rel="noopener noreferrer">Terms and Conditions</a>
                </label>
              </div>
              {!acceptTerms && (
                <div className="text-danger small mb-2">Please accept our Terms and Conditions.</div>
              )}
              <button
                type="submit"
                className="btn btn-primary w-100 fw-semibold"
                disabled={isLoading || !acceptTerms}
              >
                {isLoading ? (
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                ) : (
                  'Create an account'
                )}
              </button>
            </form>
            <div className="text-center mt-4">
              <span>
                Already have an account?{' '}
                <Link to="/login" className="link-primary">Sign in here</Link>
              </span>
            </div>
            {/* Trusted by the world's best teams (optional logos) */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register; 