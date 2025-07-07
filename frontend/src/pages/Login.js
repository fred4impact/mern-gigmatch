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
    <div className="container min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="row w-100 justify-content-center">
        <div className="col-12 col-md-8 col-lg-5">
          <div className="card shadow-sm border-0 rounded-4 p-4">
            <div className="text-center mb-4">
              <span style={{fontSize: '2.5rem'}} role="img" aria-label="logo">🎵</span>
            </div>
            <h1 className="h3 mb-2 fw-bold text-center">Sign in</h1>
            <p className="text-secondary text-center mb-4">Welcome back! Please enter your details.</p>
            <button className="btn btn-light w-100 mb-3 d-flex align-items-center justify-content-center gap-2" type="button" disabled>
              <span className="bg-white border rounded-circle d-flex align-items-center justify-content-center" style={{width: '1.7rem', height: '1.7rem', fontWeight: 'bold'}}>G</span>
              Sign in with Google
            </button>
            <div className="d-flex align-items-center mb-3">
              <hr className="flex-grow-1" />
              <span className="mx-2 text-muted">OR</span>
              <hr className="flex-grow-1" />
            </div>
            <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
              <div className="mb-3">
                <label htmlFor="login-email" className="form-label">Email</label>
                <div className="input-group">
                  <span className="input-group-text"><FaEnvelope /></span>
                  <input
                    id="login-email"
                    type="email"
                    className={`form-control${errors.email ? ' is-invalid' : ''}`}
                    placeholder="Enter your email"
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address'
                      }
                    })}
                  />
                  {errors.email && <div className="invalid-feedback d-block">{errors.email.message}</div>}
                </div>
              </div>
              <div className="mb-3">
                <label htmlFor="login-password" className="form-label">Password</label>
                <div className="input-group">
                  <span className="input-group-text"><FaLock /></span>
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    className={`form-control${errors.password ? ' is-invalid' : ''}`}
                    placeholder="Enter your password"
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
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="form-check">
                  <input className="form-check-input" type="checkbox" id="remember-me" />
                  <label className="form-check-label" htmlFor="remember-me"> Remember me</label>
                </div>
                <div>
                  <a href="#" className="link-primary small">Forgot Password?</a>
                </div>
              </div>
              <button
                type="submit"
                className="btn btn-primary w-100 fw-semibold"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                ) : (
                  'Sign In'
                )}
              </button>
            </form>
            <div className="text-center mt-4">
              <span>
                Don&apos;t have an account?{' '}
                <Link to="/register" className="link-primary">Sign up here</Link>
              </span>
            </div>
            {/* Trusted by the world's best teams (optional logos) */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 