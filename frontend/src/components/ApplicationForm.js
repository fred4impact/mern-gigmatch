import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import applicationService from '../services/applicationService';
import { 
  FaPaperPlane, 
  FaTimes, 
  FaDollarSign, 
  FaCalendarAlt, 
  FaLink, 
  FaUser,
  FaMusic,
  FaStar
} from 'react-icons/fa';
import toast from 'react-hot-toast';

const ApplicationForm = ({ event, onClose, onSuccess }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm();

  const proposedRate = watch('proposedRate');

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const applicationData = {
        message: data.message,
        proposedRate: data.proposedRate ? parseFloat(data.proposedRate) : null,
        availability: data.availability,
        portfolio: data.portfolio,
        experience: data.experience
      };

      await applicationService.applyToEvent(event._id, applicationData);
      
      toast.success('Application submitted successfully!');
      onSuccess && onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <div className="application-modal-overlay">
      <div className="application-modal">
        <div className="application-modal-header">
          <div className="application-modal-title">
            <FaMusic className="application-modal-icon" />
            <h2>Apply to Event</h2>
          </div>
          <button 
            className="application-modal-close"
            onClick={handleCancel}
            disabled={isLoading}
          >
            <FaTimes />
          </button>
        </div>

        <div className="application-modal-body">
          {/* Event Preview */}
          <div className="application-event-preview">
            <h3>{event.title}</h3>
            <div className="application-event-details">
              <div className="application-event-detail">
                <FaCalendarAlt />
                <span>{new Date(event.date).toLocaleDateString()}</span>
              </div>
              <div className="application-event-detail">
                <FaDollarSign />
                <span>${event.budget?.toLocaleString() || 'TBD'}</span>
              </div>
              <div className="application-event-detail">
                <FaUser />
                <span>{event.type}</span>
              </div>
            </div>
          </div>

          <form className="application-form" onSubmit={handleSubmit(onSubmit)}>
            {/* Personal Message */}
            <div className="application-form-group">
              <label className="application-form-label">
                <FaPaperPlane className="application-form-icon" />
                Personal Message *
              </label>
              <textarea
                className={`application-form-input${errors.message ? ' is-invalid' : ''}`}
                placeholder="Introduce yourself and explain why you're perfect for this event..."
                rows="4"
                {...register('message', {
                  required: 'Personal message is required',
                  minLength: { value: 20, message: 'Message must be at least 20 characters' },
                  maxLength: { value: 1000, message: 'Message cannot exceed 1000 characters' }
                })}
              />
              {errors.message && <div className="application-form-error">{errors.message.message}</div>}
            </div>

            {/* Proposed Rate */}
            <div className="application-form-group">
              <label className="application-form-label">
                <FaDollarSign className="application-form-icon" />
                Proposed Rate (USD)
              </label>
              <div className="application-rate-input">
                <input
                  type="number"
                  className={`application-form-input${errors.proposedRate ? ' is-invalid' : ''}`}
                  placeholder="Enter your proposed rate"
                  min="0"
                  step="0.01"
                  {...register('proposedRate', {
                    min: { value: 0, message: 'Rate must be positive' }
                  })}
                />
                {proposedRate && (
                  <div className="application-rate-preview">
                    ${parseFloat(proposedRate).toLocaleString()}
                  </div>
                )}
              </div>
              {errors.proposedRate && <div className="application-form-error">{errors.proposedRate.message}</div>}
            </div>

            {/* Availability */}
            <div className="application-form-group">
              <label className="application-form-label">
                <FaCalendarAlt className="application-form-icon" />
                Availability
              </label>
              <textarea
                className={`application-form-input${errors.availability ? ' is-invalid' : ''}`}
                placeholder="Describe your availability for this event..."
                rows="3"
                {...register('availability', {
                  maxLength: { value: 500, message: 'Availability cannot exceed 500 characters' }
                })}
              />
              {errors.availability && <div className="application-form-error">{errors.availability.message}</div>}
            </div>

            {/* Portfolio Link */}
            <div className="application-form-group">
              <label className="application-form-label">
                <FaLink className="application-form-icon" />
                Portfolio/Website
              </label>
              <input
                type="url"
                className={`application-form-input${errors.portfolio ? ' is-invalid' : ''}`}
                placeholder="https://your-portfolio.com"
                {...register('portfolio', {
                  pattern: {
                    value: /^https?:\/\/.+/,
                    message: 'Please enter a valid URL starting with http:// or https://'
                  }
                })}
              />
              {errors.portfolio && <div className="application-form-error">{errors.portfolio.message}</div>}
            </div>

            {/* Experience */}
            <div className="application-form-group">
              <label className="application-form-label">
                <FaStar className="application-form-icon" />
                Relevant Experience
              </label>
              <textarea
                className={`application-form-input${errors.experience ? ' is-invalid' : ''}`}
                placeholder="Describe your relevant experience for this type of event..."
                rows="4"
                {...register('experience', {
                  maxLength: { value: 1000, message: 'Experience cannot exceed 1000 characters' }
                })}
              />
              {errors.experience && <div className="application-form-error">{errors.experience.message}</div>}
            </div>

            {/* Application Actions */}
            <div className="application-form-actions">
              <button
                type="submit"
                className="application-btn application-btn-primary"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="application-spinner"></span>
                ) : (
                  <>
                    <FaPaperPlane />
                    Submit Application
                  </>
                )}
              </button>
              <button
                type="button"
                className="application-btn application-btn-secondary"
                onClick={handleCancel}
                disabled={isLoading}
              >
                <FaTimes />
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ApplicationForm; 