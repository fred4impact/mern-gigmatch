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

  // Watch musician category to show relevant musician types
  const selectedCategory = watch('musicianCategory');

  // Musician categories
  const musicianCategories = [
    { value: 'musician', label: 'Individual Musician' },
    { value: 'dj', label: 'DJ' },
    { value: 'band', label: 'Band' },
    { value: 'ensemble', label: 'Ensemble' },
    { value: 'orchestra', label: 'Orchestra' },
    { value: 'choir', label: 'Choir' },
    { value: 'other', label: 'Other' }
  ];

  // Musician types by category
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

  // Helper function to get display names
  const getDisplayName = (value) => {
    const displayNames = {
      // Individual musicians
      'drummer': 'Drummer', 'guitarist': 'Guitarist', 'bassist': 'Bassist',
      'keyboardist': 'Keyboardist', 'pianist': 'Pianist', 'saxophonist': 'Saxophonist',
      'trumpeter': 'Trumpeter', 'violinist': 'Violinist', 'cellist': 'Cellist',
      'flutist': 'Flutist', 'clarinetist': 'Clarinetist', 'trombonist': 'Trombonist',
      'vocalist': 'Vocalist', 'singer': 'Singer', 'percussionist': 'Percussionist',
      'accordionist': 'Accordionist', 'harmonica': 'Harmonica', 'banjo': 'Banjo',
      // DJ types
      'wedding-dj': 'Wedding DJ', 'club-dj': 'Club DJ', 'mobile-dj': 'Mobile DJ', 'radio-dj': 'Radio DJ',
      // Band types
      'jazz-band': 'Jazz Band', 'rock-band': 'Rock Band', 'pop-band': 'Pop Band',
      'country-band': 'Country Band', 'blues-band': 'Blues Band', 'reggae-band': 'Reggae Band',
      'folk-band': 'Folk Band', 'indie-band': 'Indie Band', 'cover-band': 'Cover Band',
      'tribute-band': 'Tribute Band',
      // Ensemble types
      'string-quartet': 'String Quartet', 'brass-quintet': 'Brass Quintet',
      'woodwind-quintet': 'Woodwind Quintet', 'jazz-trio': 'Jazz Trio',
      'piano-trio': 'Piano Trio', 'duo': 'Duo', 'solo-artist': 'Solo Artist',
      // Other
      'mc': 'MC', 'emcee': 'Emcee', 'karaoke': 'Karaoke', 'other': 'Other'
    };
    return displayNames[value] || value;
  };

  // Handle musician type selection
  const handleMusicianTypeChange = (type) => {
    setSelectedMusicianTypes(prev => {
      if (prev.includes(type)) {
        return prev.filter(t => t !== type);
      } else {
        return [...prev, type];
      }
    });
  };

  // Check if user can create events
  if (!['planner', 'studio'].includes(user?.role)) {
    return (
      <div className="moises-profile-root">
        <div className="moises-profile-card">
          <div className="moises-profile-header">
            <h1 className="moises-profile-title">Access Denied</h1>
            <p className="moises-profile-subtitle">
              Only event planners and studios can create events.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      // Process tags and musician data
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
    <div className="moises-profile-root">
      <div className="moises-profile-card">
        <div style={{ marginBottom: '1rem' }}>
          <Link to="/dashboard" className="moises-profile-btn moises-profile-btn-secondary">
            &larr; Go Back to Dashboard
          </Link>
        </div>
        <div className="moises-profile-header">
          <h1 className="moises-profile-title">Create New Event</h1>
          <p className="moises-profile-subtitle">
            Post a new event or gig opportunity for talented professionals
          </p>
        </div>

        <div style={{ maxWidth: '500px', margin: '2rem auto', padding: '2rem 1.5rem', background: '#fff', borderRadius: '16px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
          <form className="gigmatch-form-container" onSubmit={handleSubmit(onSubmit)}>
            {/* Event Details Section */}
            <div className="gigmatch-form-section">
              <h2 className="gigmatch-form-title">Event Details</h2>
              <div className="gigmatch-form-group full-width">
                <label className="gigmatch-form-label">Event Title *</label>
                <input
                  type="text"
                  className={`gigmatch-form-input${errors.title ? ' is-invalid' : ''}`}
                  placeholder="e.g., Wedding Reception, Corporate Party, Music Festival"
                  {...register('title', {
                    required: 'Event title is required',
                    minLength: { value: 5, message: 'Title must be at least 5 characters' },
                    maxLength: { value: 120, message: 'Title cannot exceed 120 characters' }
                  })}
                />
                {errors.title && <div className="gigmatch-form-error">{errors.title.message}</div>}
              </div>
              <div className="gigmatch-form-group full-width">
                <label className="gigmatch-form-label">Description</label>
                <textarea
                  className={`gigmatch-form-input${errors.description ? ' is-invalid' : ''}`}
                  placeholder="Describe the event, requirements, and what you're looking for..."
                  rows="4"
                  {...register('description', {
                    maxLength: { value: 2000, message: 'Description cannot exceed 2000 characters' }
                  })}
                />
                {errors.description && <div className="gigmatch-form-error">{errors.description.message}</div>}
              </div>
              <div className="gigmatch-form-row">
                <div className="gigmatch-form-group">
                  <label className="gigmatch-form-label"><FaTag className="gigmatch-form-icon" /> Event Type</label>
                  <input
                    type="text"
                    className={`gigmatch-form-input${errors.type ? ' is-invalid' : ''}`}
                    placeholder="e.g., Wedding, Corporate, Birthday, Concert"
                    {...register('type', {
                      maxLength: { value: 60, message: 'Type cannot exceed 60 characters' }
                    })}
                  />
                  {errors.type && <div className="gigmatch-form-error">{errors.type.message}</div>}
                </div>
                <div className="gigmatch-form-group">
                  <label className="gigmatch-form-label"><FaDollarSign className="gigmatch-form-icon" /> Budget</label>
                  <input
                    type="number"
                    className={`gigmatch-form-input${errors.budget ? ' is-invalid' : ''}`}
                    placeholder="Enter budget amount"
                    {...register('budget', {
                      min: { value: 0, message: 'Budget must be positive' }
                    })}
                  />
                  {errors.budget && <div className="gigmatch-form-error">{errors.budget.message}</div>}
                </div>
              </div>
              <div className="gigmatch-form-group full-width">
                <label className="gigmatch-form-label"><FaCalendarAlt className="gigmatch-form-icon" /> Event Date</label>
                <input
                  type="datetime-local"
                  className={`gigmatch-form-input${errors.date ? ' is-invalid' : ''}`}
                  {...register('date')}
                />
                {errors.date && <div className="gigmatch-form-error">{errors.date.message}</div>}
              </div>
            </div>
            {/* Musician Requirements Section */}
            <div className="gigmatch-form-section">
              <h2 className="gigmatch-form-title">Musician Requirements</h2>
              <div className="gigmatch-form-row">
                <div className="gigmatch-form-group">
                  <label className="gigmatch-form-label">Musician Category</label>
                  <select
                    className={`gigmatch-form-input${errors.musicianCategory ? ' is-invalid' : ''}`}
                    {...register('musicianCategory')}
                  >
                    <option value="">Select category</option>
                    {musicianCategories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                  {errors.musicianCategory && <div className="gigmatch-form-error">{errors.musicianCategory.message}</div>}
                </div>
                <div className="gigmatch-form-group">
                  <label className="gigmatch-form-label"><FaUsers className="gigmatch-form-icon" /> Number of Musicians</label>
                  <input
                    type="number"
                    className={`gigmatch-form-input${errors.musicianCount ? ' is-invalid' : ''}`}
                    placeholder="e.g., 4"
                    min="1"
                    {...register('musicianCount', {
                      min: { value: 1, message: 'At least 1 musician required' }
                    })}
                  />
                  {errors.musicianCount && <div className="gigmatch-form-error">{errors.musicianCount.message}</div>}
                </div>
              </div>
              {selectedCategory && (
                <div className="gigmatch-form-group full-width">
                  <label className="gigmatch-form-label">Musician Types Needed</label>
                  <div className="musician-types-grid">
                    {musicianTypesByCategory[selectedCategory].map(type => (
                      <label key={type} className="musician-type-checkbox">
                        <input
                          type="checkbox"
                          checked={selectedMusicianTypes.includes(type)}
                          onChange={() => handleMusicianTypeChange(type)}
                        />
                        <span className="musician-type-label">{getDisplayName(type)}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
              <div className="gigmatch-form-group full-width">
                <label className="gigmatch-form-label"><FaMusic className="gigmatch-form-icon" /> Genre/Style</label>
                <input
                  type="text"
                  className={`gigmatch-form-input${errors.genre ? ' is-invalid' : ''}`}
                  placeholder="e.g., Jazz, Rock, Classical, Pop, Country"
                  {...register('genre', {
                    maxLength: { value: 100, message: 'Genre cannot exceed 100 characters' }
                  })}
                />
                {errors.genre && <div className="gigmatch-form-error">{errors.genre.message}</div>}
              </div>
            </div>
            {/* Location Section */}
            <div className="gigmatch-form-section">
              <h2 className="gigmatch-form-title">Location</h2>
              <div className="gigmatch-form-row">
                <div className="gigmatch-form-group">
                  <label className="gigmatch-form-label"><FaMapMarkerAlt className="gigmatch-form-icon" /> City</label>
                  <input
                    type="text"
                    className={`gigmatch-form-input${errors.location?.city ? ' is-invalid' : ''}`}
                    placeholder="City"
                    {...register('location.city')}
                  />
                  {errors.location?.city && <div className="gigmatch-form-error">{errors.location.city.message}</div>}
                </div>
                <div className="gigmatch-form-group">
                  <label className="gigmatch-form-label">State/Province</label>
                  <input
                    type="text"
                    className="gigmatch-form-input"
                    placeholder="State/Province"
                    {...register('location.state')}
                  />
                </div>
              </div>
              <div className="gigmatch-form-group full-width">
                <label className="gigmatch-form-label">Country</label>
                <input
                  type="text"
                  className="gigmatch-form-input"
                  placeholder="Country"
                  defaultValue="United States"
                  {...register('location.country')}
                />
              </div>
            </div>
            {/* Tags & Keywords Section */}
            <div className="gigmatch-form-section">
              <h2 className="gigmatch-form-title">Tags & Keywords</h2>
              <div className="gigmatch-form-group full-width">
                <label className="gigmatch-form-label"><FaTag className="gigmatch-form-icon" /> Tags</label>
                <input
                  type="text"
                  className={`gigmatch-form-input${errors.tags ? ' is-invalid' : ''}`}
                  placeholder="e.g., live music, photography, catering, decoration"
                  {...register('tags')}
                />
                <small className="gigmatch-form-help">Separate tags with commas</small>
                {errors.tags && <div className="gigmatch-form-error">{errors.tags.message}</div>}
              </div>
            </div>
            {/* Action Buttons Section */}
            <div className="gigmatch-form-actions">
              <button
                type="submit"
                className="gigmatch-form-btn gigmatch-form-btn-primary"
                disabled={isLoading}
              >
                <FaSave style={{ marginRight: 8 }} />
                {isLoading ? 'Creating...' : 'Create Event'}
              </button>
              <button
                type="button"
                className="gigmatch-form-btn gigmatch-form-btn-secondary"
                onClick={handleCancel}
                disabled={isLoading}
              >
                <FaTimes style={{ marginRight: 8 }} />
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateEvent; 