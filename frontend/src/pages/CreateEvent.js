import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import eventService from '../services/eventService';
import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaDollarSign,
  FaTag,
  FaSave,
  FaTimes,
  FaMusic,
  FaUsers
} from 'react-icons/fa';
import toast from 'react-hot-toast';

const CreateEvent = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMusicianTypes, setSelectedMusicianTypes] = useState([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm();

  const selectedCategory = watch('musicianCategory');

  const musicianCategories = [
    { value: 'musician', label: 'Individual Musician' },
    { value: 'dj', label: 'DJ' },
    { value: 'band', label: 'Band' },
    { value: 'ensemble', label: 'Ensemble' },
    { value: 'orchestra', label: 'Orchestra' },
    { value: 'choir', label: 'Choir' },
    { value: 'other', label: 'Other' }
  ];

  const musicianTypesByCategory = {
    musician: [
      'drummer', 'guitarist', 'bassist', 'keyboardist', 'pianist', 'saxophonist',
      'trumpeter', 'violinist', 'cellist', 'flutist', 'clarinetist', 'trombonist',
      'vocalist', 'singer', 'percussionist', 'accordionist', 'harmonica', 'banjo'
    ],
    dj: [
      'wedding-dj', 'club-dj', 'mobile-dj', 'radio-dj'
    ],
    band: [
      'jazz-band', 'rock-band', 'pop-band', 'country-band', 'blues-band',
      'reggae-band', 'folk-band', 'indie-band', 'cover-band', 'tribute-band'
    ],
    ensemble: [
      'string-quartet', 'brass-quintet', 'woodwind-quintet', 'jazz-trio',
      'piano-trio', 'duo', 'solo-artist'
    ],
    orchestra: ['orchestra'],
    choir: ['choir'],
    other: ['mc', 'emcee', 'karaoke', 'other']
  };

  const getDisplayName = (value) => {
    const displayNames = {
      'drummer': 'Drummer', 'guitarist': 'Guitarist', 'bassist': 'Bassist',
      'keyboardist': 'Keyboardist', 'pianist': 'Pianist', 'saxophonist': 'Saxophonist',
      'trumpeter': 'Trumpeter', 'violinist': 'Violinist', 'cellist': 'Cellist',
      'flutist': 'Flutist', 'clarinetist': 'Clarinetist', 'trombonist': 'Trombonist',
      'vocalist': 'Vocalist', 'singer': 'Singer', 'percussionist': 'Percussionist',
      'accordionist': 'Accordionist', 'harmonica': 'Harmonica', 'banjo': 'Banjo',
      'wedding-dj': 'Wedding DJ', 'club-dj': 'Club DJ', 'mobile-dj': 'Mobile DJ', 'radio-dj': 'Radio DJ',
      'jazz-band': 'Jazz Band', 'rock-band': 'Rock Band', 'pop-band': 'Pop Band',
      'country-band': 'Country Band', 'blues-band': 'Blues Band', 'reggae-band': 'Reggae Band',
      'folk-band': 'Folk Band', 'indie-band': 'Indie Band', 'cover-band': 'Cover Band',
      'tribute-band': 'Tribute Band',
      'string-quartet': 'String Quartet', 'brass-quintet': 'Brass Quintet',
      'woodwind-quintet': 'Woodwind Quintet', 'jazz-trio': 'Jazz Trio',
      'piano-trio': 'Piano Trio', 'duo': 'Duo', 'solo-artist': 'Solo Artist',
      'mc': 'MC', 'emcee': 'Emcee', 'karaoke': 'Karaoke', 'other': 'Other'
    };
    return displayNames[value] || value;
  };

  const handleMusicianTypeChange = (type) => {
    setSelectedMusicianTypes(prev => {
      if (prev.includes(type)) {
        return prev.filter(t => t !== type);
      } else {
        return [...prev, type];
      }
    });
  };

  if (!['planner', 'studio'].includes(user?.role)) {
    return (
      <div className="container min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="row w-100 justify-content-center">
          <div className="col-12 col-md-8 col-lg-5">
            <div className="card shadow-sm border-0 rounded-4 p-4 text-center">
              <h1 className="h4 mb-2 fw-bold">Access Denied</h1>
              <p className="text-secondary mb-0">Only event planners and studios can create events.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const processedData = {
        ...data,
        tags: data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
        musicianTypes: selectedMusicianTypes,
        location: {
          city: data.location.city,
          state: data.location.state,
          country: data.location.country
        }
      };

      const response = await eventService.createEvent(processedData);
      toast.success('Event created successfully!');
      navigate('/dashboard');
    } catch (error) {
      const message = error.message || 'Error creating event';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/dashboard');
  };

  return (
    <div className="container py-4">
      <div className="mb-3">
        <Link to="/dashboard" className="btn btn-outline-secondary btn-sm">
          &larr; Go Back to Dashboard
        </Link>
      </div>
      <div className="row justify-content-center">
        <div className="col-12 col-lg-10 col-xl-9">
          <div className="card border-0 shadow-sm p-4 mb-4">
            <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
              <div>
                <h1 className="h3 fw-bold mb-1">Create New Event</h1>
                <div className="text-secondary">Post a new event or gig opportunity for talented professionals</div>
              </div>
              <div className="d-flex gap-2">
                <button type="button" className="btn btn-outline-secondary" onClick={handleCancel} disabled={isLoading}>
                  <FaTimes className="me-1" /> Discard
                </button>
                <button type="submit" form="create-event-form" className="btn btn-primary" disabled={isLoading}>
                  {isLoading ? <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true" /> : <FaSave className="me-1" />} Save Event
                </button>
              </div>
            </div>
            <form id="create-event-form" onSubmit={handleSubmit(onSubmit)} autoComplete="off">
              {/* Event Details Section */}
              <div className="mb-4">
                <h5 className="fw-semibold mb-3">Event Information</h5>
                <div className="mb-3">
                  <label className="form-label">Event Title *</label>
                  <input
                    type="text"
                    className={`form-control${errors.title ? ' is-invalid' : ''}`}
                    placeholder="e.g., Wedding Reception, Corporate Party, Music Festival"
                    {...register('title', {
                      required: 'Event title is required',
                      minLength: { value: 5, message: 'Title must be at least 5 characters' },
                      maxLength: { value: 120, message: 'Title cannot exceed 120 characters' }
                    })}
                  />
                  {errors.title && <div className="invalid-feedback d-block">{errors.title.message}</div>}
                </div>
                <div className="mb-3">
                  <label className="form-label">Description</label>
                  <textarea
                    className={`form-control${errors.description ? ' is-invalid' : ''}`}
                    placeholder="Describe the event, requirements, and what you're looking for..."
                    rows="4"
                    {...register('description', {
                      maxLength: { value: 2000, message: 'Description cannot exceed 2000 characters' }
                    })}
                  />
                  {errors.description && <div className="invalid-feedback d-block">{errors.description.message}</div>}
                </div>
                <div className="row g-3">
                  <div className="col-md-4">
                    <label className="form-label">Event Date *</label>
                    <div className="input-group">
                      <span className="input-group-text"><FaCalendarAlt /></span>
                      <input
                        type="datetime-local"
                        className={`form-control${errors.date ? ' is-invalid' : ''}`}
                        {...register('date', { required: 'Event date is required' })}
                      />
                      {errors.date && <div className="invalid-feedback d-block">{errors.date.message}</div>}
                    </div>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Location (City, State) *</label>
                    <div className="input-group">
                      <span className="input-group-text"><FaMapMarkerAlt /></span>
                      <input
                        type="text"
                        className={`form-control${errors.location?.city ? ' is-invalid' : ''}`}
                        placeholder="City"
                        {...register('location.city', { required: 'City is required' })}
                      />
                      <input
                        type="text"
                        className={`form-control${errors.location?.state ? ' is-invalid' : ''}`}
                        placeholder="State"
                        {...register('location.state', { required: 'State is required' })}
                      />
                      {errors.location?.city && <div className="invalid-feedback d-block">{errors.location.city.message}</div>}
                      {errors.location?.state && <div className="invalid-feedback d-block">{errors.location.state.message}</div>}
                    </div>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Country *</label>
                    <input
                      type="text"
                      className={`form-control${errors.location?.country ? ' is-invalid' : ''}`}
                      placeholder="Country"
                      defaultValue="United States"
                      {...register('location.country', { required: 'Country is required' })}
                    />
                    {errors.location?.country && <div className="invalid-feedback d-block">{errors.location.country.message}</div>}
                  </div>
                </div>
              </div>
              {/* Musician Category & Types */}
              <div className="mb-4">
                <h5 className="fw-semibold mb-3">Talent Requirements</h5>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Talent Category *</label>
                    <select
                      className={`form-select${errors.musicianCategory ? ' is-invalid' : ''}`}
                      {...register('musicianCategory', { required: 'Talent category is required' })}
                    >
                      <option value="">Select category</option>
                      {musicianCategories.map((cat) => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                    {errors.musicianCategory && <div className="invalid-feedback d-block">{errors.musicianCategory.message}</div>}
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Talent Types</label>
                    <div className="d-flex flex-wrap gap-2">
                      {selectedCategory && musicianTypesByCategory[selectedCategory]?.map((type) => (
                        <div key={type} className="form-check form-check-inline">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id={`type-${type}`}
                            checked={selectedMusicianTypes.includes(type)}
                            onChange={() => handleMusicianTypeChange(type)}
                          />
                          <label className="form-check-label" htmlFor={`type-${type}`}>{getDisplayName(type)}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              {/* Budget & Tags */}
              <div className="mb-4">
                <h5 className="fw-semibold mb-3">Budget & Tags</h5>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Budget (USD)</label>
                    <div className="input-group">
                      <span className="input-group-text"><FaDollarSign /></span>
                      <input
                        type="number"
                        className="form-control"
                        placeholder="e.g., 500"
                        {...register('budget')}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Tags (comma separated)</label>
                    <div className="input-group">
                      <span className="input-group-text"><FaTag /></span>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g., wedding, jazz, outdoor"
                        {...register('tags')}
                      />
                    </div>
                  </div>
                </div>
              </div>
              {/* Actions */}
              <div className="d-flex justify-content-end gap-2">
                <button type="button" className="btn btn-outline-secondary" onClick={handleCancel} disabled={isLoading}>
                  <FaTimes className="me-1" /> Discard
                </button>
                <button type="submit" className="btn btn-primary" disabled={isLoading}>
                  {isLoading ? <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true" /> : <FaSave className="me-1" />} Save Event
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateEvent; 