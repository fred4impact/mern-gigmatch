import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import ProfilePicture from '../components/ProfilePicture';
import { 
  FaUser, 
  FaEnvelope, 
  FaPhone, 
  FaMapMarkerAlt, 
  FaMusic, 
  FaCalendarAlt,
  FaBuilding,
  FaGlobe,
  FaSave,
  FaTimes,
  FaTag
} from 'react-icons/fa';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm();

  const userRole = watch('role') || user?.role;
  const selectedCategory = watch('category') || user?.category;

  // Category and subcategory data
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

  // Set form values when user data loads
  useEffect(() => {
    if (user) {
      setValue('firstName', user.firstName || '');
      setValue('lastName', user.lastName || '');
      setValue('email', user.email || '');
      setValue('phone', user.phone || '');
      setValue('role', user.role || 'talent');
      setValue('category', user.category || '');
      setValue('subcategory', user.subcategory || '');
      setValue('bio', user.bio || '');
      setValue('skills', user.skills?.join(', ') || '');
      setValue('availability', user.availability || '');
      setValue('location.city', user.location?.city || '');
      setValue('location.state', user.location?.state || '');
      setValue('location.country', user.location?.country || 'United States');
      setValue('organization.name', user.organization?.name || '');
      setValue('organization.website', user.organization?.website || '');
      setValue('organization.description', user.organization?.description || '');
    }
  }, [user, setValue]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      console.log('Form data before processing:', data);
      
      // Process skills array and handle empty category/subcategory
      const processedData = {
        ...data,
        skills: data.skills ? data.skills.split(',').map(skill => skill.trim()).filter(Boolean) : [],
        location: {
          city: data.location.city,
          state: data.location.state,
          country: data.location.country
        }
      };

      // Handle empty category and subcategory for talent users
      if (data.role === 'talent') {
        if (!data.category || data.category === '') {
          delete processedData.category;
        }
        if (!data.subcategory || data.subcategory === '') {
          delete processedData.subcategory;
        }
      }

      // Handle organization data for planner/studio users
      if (['planner', 'studio'].includes(data.role)) {
        processedData.organization = {
          name: data.organization.name,
          website: data.organization.website,
          description: data.organization.description
        };
      }

      const result = await updateProfile(processedData);
      
      if (result.success) {
        toast.success('Profile updated successfully!');
        setIsEditing(false);
      } else {
        toast.error(result.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('Error updating profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  if (!user) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '1rem'
      }}>
        <div className="good-course-form-container">
          <div className="good-course-form-header">
            <h1 className="good-course-form-title">Loading Profile...</h1>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="moises-profile-root">
      <div className="moises-profile-card">
        <section className="gigmatch-profile-content">
          <div className="gigmatch-profile-header">
            <ProfilePicture />
            <h1 className="gigmatch-profile-title">{user?.firstName} {user?.lastName}</h1>
            <p className="gigmatch-profile-subtitle">{user?.email}</p>
          </div>
          <form className="gigmatch-profile-form" onSubmit={handleSubmit(onSubmit)}>
            {/* Basic Information Section */}
            <div className="gigmatch-profile-section">
              <h3 className="gigmatch-section-title">Basic Information</h3>
              <div className="gigmatch-form-row">
                <div className="gigmatch-form-group">
                  <label className="gigmatch-form-label" htmlFor="firstName">First Name</label>
                  <input id="firstName" type="text" className={`gigmatch-form-input${errors.firstName ? ' is-invalid' : ''}`} placeholder="First name" disabled={!isEditing} {...register('firstName', { required: 'First name is required', minLength: { value: 2, message: 'First name must be at least 2 characters' } })} />
                  {errors.firstName && <div className="gigmatch-form-error">{errors.firstName.message}</div>}
                </div>
                <div className="gigmatch-form-group">
                  <label className="gigmatch-form-label" htmlFor="lastName">Last Name</label>
                  <input id="lastName" type="text" className={`gigmatch-form-input${errors.lastName ? ' is-invalid' : ''}`} placeholder="Last name" disabled={!isEditing} {...register('lastName', { required: 'Last name is required', minLength: { value: 2, message: 'Last name must be at least 2 characters' } })} />
                  {errors.lastName && <div className="gigmatch-form-error">{errors.lastName.message}</div>}
                </div>
              </div>
              <div className="gigmatch-form-row">
                <div className="gigmatch-form-group">
                  <label className="gigmatch-form-label" htmlFor="email">Email</label>
                  <input id="email" type="email" className={`gigmatch-form-input${errors.email ? ' is-invalid' : ''}`} placeholder="Email address" disabled={!isEditing} {...register('email', { required: 'Email is required', pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Invalid email address' } })} />
                  {errors.email && <div className="gigmatch-form-error">{errors.email.message}</div>}
                </div>
                <div className="gigmatch-form-group">
                  <label className="gigmatch-form-label" htmlFor="phone">Phone</label>
                  <input id="phone" type="tel" className={`gigmatch-form-input${errors.phone ? ' is-invalid' : ''}`} placeholder="Phone number" disabled={!isEditing} {...register('phone', { pattern: { value: /^[+]?[1-9][\d]{0,15}$/, message: 'Invalid phone number' } })} />
                  {errors.phone && <div className="gigmatch-form-error">{errors.phone.message}</div>}
                </div>
              </div>
              <div className="gigmatch-form-row">
                <div className="gigmatch-form-group">
                  <label className="gigmatch-form-label" htmlFor="city">City</label>
                  <input id="city" type="text" className={`gigmatch-form-input${errors.location?.city ? ' is-invalid' : ''}`} placeholder="City" disabled={!isEditing} {...register('location.city', { required: 'City is required' })} />
                  {errors.location?.city && <div className="gigmatch-form-error">{errors.location.city.message}</div>}
                </div>
                <div className="gigmatch-form-group">
                  <label className="gigmatch-form-label" htmlFor="state">State</label>
                  <input id="state" type="text" className={`gigmatch-form-input${errors.location?.state ? ' is-invalid' : ''}`} placeholder="State" disabled={!isEditing} {...register('location.state')} />
                  {errors.location?.state && <div className="gigmatch-form-error">{errors.location.state.message}</div>}
                </div>
              </div>
              <div className="gigmatch-form-group">
                <label className="gigmatch-form-label" htmlFor="country">Country</label>
                <select id="country" className={`gigmatch-form-input${errors.location?.country ? ' is-invalid' : ''}`} disabled={!isEditing} {...register('location.country')}>
                  <option value="United States">United States</option>
                  <option value="Canada">Canada</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Australia">Australia</option>
                  <option value="Germany">Germany</option>
                  <option value="France">France</option>
                  <option value="Other">Other</option>
                </select>
                {errors.location?.country && <div className="gigmatch-form-error">{errors.location.country.message}</div>}
              </div>
            </div>
            {/* Professional Information Section */}
            {userRole === 'talent' && (
              <div className="gigmatch-profile-section">
                <h3 className="gigmatch-section-title">Professional Information</h3>
                <div className="gigmatch-form-row">
                  <div className="gigmatch-form-group">
                    <label className="gigmatch-form-label" htmlFor="category">Category</label>
                    <select id="category" className={`gigmatch-form-input${errors.category ? ' is-invalid' : ''}`} disabled={!isEditing} {...register('category')}>
                      <option value="">Select a category</option>
                      {Object.entries(categories).map(([key, category]) => (
                        <option key={key} value={key}>{category.name}</option>
                      ))}
                    </select>
                    {errors.category && <div className="gigmatch-form-error">{errors.category.message}</div>}
                  </div>
                  <div className="gigmatch-form-group">
                    <label className="gigmatch-form-label" htmlFor="subcategory">Subcategory</label>
                    <select id="subcategory" className={`gigmatch-form-input${errors.subcategory ? ' is-invalid' : ''}`} disabled={!isEditing || !selectedCategory} {...register('subcategory')}>
                      <option value="">Select a subcategory</option>
                      {selectedCategory && categories[selectedCategory]?.subcategories.map(sub => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                    </select>
                    {errors.subcategory && <div className="gigmatch-form-error">{errors.subcategory.message}</div>}
                  </div>
                </div>
                <div className="gigmatch-form-group">
                  <label className="gigmatch-form-label" htmlFor="bio">Bio</label>
                  <textarea id="bio" className={`gigmatch-form-input${errors.bio ? ' is-invalid' : ''}`} placeholder="Tell us about yourself, your experience, and what makes you unique..." rows={4} disabled={!isEditing} {...register('bio', { maxLength: { value: 500, message: 'Bio cannot exceed 500 characters' } })} />
                  {errors.bio && <div className="gigmatch-form-error">{errors.bio.message}</div>}
                </div>
                <div className="gigmatch-form-group">
                  <label className="gigmatch-form-label" htmlFor="skills">Skills</label>
                  <input id="skills" type="text" className={`gigmatch-form-input${errors.skills ? ' is-invalid' : ''}`} placeholder="e.g., Guitar, Piano, Jazz, Rock, Classical" disabled={!isEditing} {...register('skills')} />
                  <div className="gigmatch-form-help">Separate skills with commas</div>
                  {errors.skills && <div className="gigmatch-form-error">{errors.skills.message}</div>}
                </div>
                <div className="gigmatch-form-group">
                  <label className="gigmatch-form-label" htmlFor="availability">Availability</label>
                  <textarea id="availability" className={`gigmatch-form-input${errors.availability ? ' is-invalid' : ''}`} placeholder="Describe your availability (e.g., Weekends only, Evenings available, Flexible schedule)" rows={3} disabled={!isEditing} {...register('availability', { maxLength: { value: 200, message: 'Availability cannot exceed 200 characters' } })} />
                  {errors.availability && <div className="gigmatch-form-error">{errors.availability.message}</div>}
                </div>
              </div>
            )}
            {/* Organization Information Section */}
            {['planner', 'studio'].includes(userRole) && (
              <div className="gigmatch-profile-section">
                <h3 className="gigmatch-section-title">Organization Information</h3>
                <div className="gigmatch-form-group">
                  <label className="gigmatch-form-label" htmlFor="orgName">Organization Name</label>
                  <input id="orgName" type="text" className={`gigmatch-form-input${errors.organization?.name ? ' is-invalid' : ''}`} placeholder="Your company or organization name" disabled={!isEditing} {...register('organization.name')} />
                  {errors.organization?.name && <div className="gigmatch-form-error">{errors.organization.name.message}</div>}
                </div>
                <div className="gigmatch-form-group">
                  <label className="gigmatch-form-label" htmlFor="orgWebsite">Website</label>
                  <input id="orgWebsite" type="url" className={`gigmatch-form-input${errors.organization?.website ? ' is-invalid' : ''}`} placeholder="https://yourwebsite.com" disabled={!isEditing} {...register('organization.website', { pattern: { value: /^https?:\/\/.+/, message: 'Please enter a valid URL starting with http:// or https://' } })} />
                  {errors.organization?.website && <div className="gigmatch-form-error">{errors.organization.website.message}</div>}
                </div>
                <div className="gigmatch-form-group">
                  <label className="gigmatch-form-label" htmlFor="orgDescription">Organization Description</label>
                  <textarea id="orgDescription" className={`gigmatch-form-input${errors.organization?.description ? ' is-invalid' : ''}`} placeholder="Tell us about your organization, services, and what you do..." rows={4} disabled={!isEditing} {...register('organization.description', { maxLength: { value: 1000, message: 'Description cannot exceed 1000 characters' } })} />
                  {errors.organization?.description && <div className="gigmatch-form-error">{errors.organization.description.message}</div>}
                </div>
              </div>
            )}
            {/* Form Actions */}
            <div className="gigmatch-profile-actions">
              {!isEditing ? (
                <button type="button" className="gigmatch-profile-btn gigmatch-profile-btn-primary" onClick={handleEdit}>Edit Profile</button>
              ) : (
                <>
                  <button type="submit" className="gigmatch-profile-btn gigmatch-profile-btn-primary" disabled={isLoading}>
                    {isLoading ? <div className="spinner" /> : 'Save Changes'}
                  </button>
                  <button type="button" className="gigmatch-profile-btn gigmatch-profile-btn-secondary" onClick={handleCancel} disabled={isLoading}>Cancel</button>
                </>
              )}
            </div>
          </form>
        </section>
      </div>
    </div>
  );
};

export default Profile; 