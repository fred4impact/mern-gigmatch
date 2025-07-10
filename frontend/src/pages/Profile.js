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
      const processedData = {
        ...data,
        skills: data.skills ? data.skills.split(',').map(skill => skill.trim()).filter(Boolean) : [],
        location: {
          city: data.location.city,
          state: data.location.state,
          country: data.location.country
        }
      };
      if (data.role === 'talent') {
        if (!data.category || data.category === '') {
          delete processedData.category;
        }
        if (!data.subcategory || data.subcategory === '') {
          delete processedData.subcategory;
        }
      }
      await updateProfile(processedData);
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      toast.error('Error updating profile');
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

  const handleAvatarUpdate = async (newAvatar) => {
    setIsLoading(true);
    try {
      await updateProfile({ avatar: newAvatar });
      toast.success('Profile picture updated!');
    } catch (error) {
      toast.error('Error updating profile picture');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="container min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="row w-100 justify-content-center">
          <div className="col-12 col-md-8 col-lg-5">
            <div className="card shadow-sm border-0 rounded-4 p-4 text-center">
              <div className="spinner-border text-primary mb-3" role="status" />
              <p className="mb-0">Loading profile...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-10 col-xl-9">
          <div className="card border-0 shadow-sm p-4 mb-4">
            <div className="d-flex flex-wrap align-items-center gap-4 mb-4">
              <div className="flex-shrink-0">
                <ProfilePicture
                  avatar={user.avatar}
                  firstName={user.firstName}
                  lastName={user.lastName}
                  size={120}
                  editable={isEditing}
                  onAvatarUpdate={handleAvatarUpdate}
                  isLoading={isLoading}
                />
              </div>
              <div className="flex-grow-1">
                <h2 className="fw-bold mb-1">{user.firstName} {user.lastName}</h2>
                <div className="mb-2 text-secondary">{user.role && user.role.charAt(0).toUpperCase() + user.role.slice(1)}</div>
                <div className="mb-2">
                  <span className="badge bg-primary me-2">{user.category || 'No Category'}</span>
                  {user.subcategory && <span className="badge bg-secondary">{user.subcategory}</span>}
                </div>
                <div className="mb-2">
                  <FaEnvelope className="me-2 text-muted" />{user.email}
                </div>
                {user.phone && (
                  <div className="mb-2">
                    <FaPhone className="me-2 text-muted" />{user.phone}
                  </div>
                )}
                {user.location && (
                  <div className="mb-2">
                    <FaMapMarkerAlt className="me-2 text-muted" />
                    {user.location.city}, {user.location.state}, {user.location.country}
                  </div>
                )}
                {user.organization?.name && (
                  <div className="mb-2">
                    <FaBuilding className="me-2 text-muted" />{user.organization.name}
                  </div>
                )}
                {user.organization?.website && (
                  <div className="mb-2">
                    <FaGlobe className="me-2 text-muted" />
                    <a href={user.organization.website} target="_blank" rel="noopener noreferrer">
                      {user.organization.website}
                    </a>
                  </div>
                )}
                <div className="mt-3">
                  {!isEditing && (
                    <button className="btn btn-primary btn-sm me-2" onClick={handleEdit}>
                      Edit Profile
                    </button>
                  )}
                  {isEditing && (
                    <>
                      <button className="btn btn-success btn-sm me-2" form="profile-form" type="submit" disabled={isLoading}>
                        {isLoading ? <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true" /> : <FaSave className="me-1" />} Save
                      </button>
                      <button className="btn btn-outline-secondary btn-sm" onClick={handleCancel} disabled={isLoading}>
                        <FaTimes className="me-1" /> Cancel
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
            {/* Profile Details Form */}
            {isEditing && (
              <form id="profile-form" onSubmit={handleSubmit(onSubmit)} autoComplete="off">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">First Name</label>
                    <input
                      type="text"
                      className={`form-control${errors.firstName ? ' is-invalid' : ''}`}
                      {...register('firstName', { required: 'First name is required' })}
                    />
                    {errors.firstName && <div className="invalid-feedback d-block">{errors.firstName.message}</div>}
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Last Name</label>
                    <input
                      type="text"
                      className={`form-control${errors.lastName ? ' is-invalid' : ''}`}
                      {...register('lastName', { required: 'Last name is required' })}
                    />
                    {errors.lastName && <div className="invalid-feedback d-block">{errors.lastName.message}</div>}
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className={`form-control${errors.email ? ' is-invalid' : ''}`}
                      {...register('email', { required: 'Email is required' })}
                      disabled
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Phone</label>
                    <input
                      type="text"
                      className="form-control"
                      {...register('phone')}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Role</label>
                    <input
                      type="text"
                      className="form-control"
                      value={userRole}
                      disabled
                    />
                  </div>
                  {userRole === 'talent' && (
                    <>
                      <div className="col-md-6">
                        <label className="form-label">Category</label>
                        <select
                          className="form-select"
                          {...register('category')}
                        >
                          <option value="">Select category</option>
                          {Object.entries(categories).map(([key, cat]) => (
                            <option key={key} value={key}>{cat.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Subcategory</label>
                        <select
                          className="form-select"
                          {...register('subcategory')}
                        >
                          <option value="">Select subcategory</option>
                          {selectedCategory && categories[selectedCategory]?.subcategories.map(sub => (
                            <option key={sub} value={sub}>{sub}</option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}
                  <div className="col-md-12">
                    <label className="form-label">Bio</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      {...register('bio')}
                    />
                  </div>
                  <div className="col-md-12">
                    <label className="form-label">Skills (comma separated)</label>
                    <input
                      type="text"
                      className="form-control"
                      {...register('skills')}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Availability</label>
                    <input
                      type="text"
                      className="form-control"
                      {...register('availability')}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">City</label>
                    <input
                      type="text"
                      className="form-control"
                      {...register('location.city')}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">State</label>
                    <input
                      type="text"
                      className="form-control"
                      {...register('location.state')}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Country</label>
                    <input
                      type="text"
                      className="form-control"
                      {...register('location.country')}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Organization Name</label>
                    <input
                      type="text"
                      className="form-control"
                      {...register('organization.name')}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Organization Website</label>
                    <input
                      type="text"
                      className="form-control"
                      {...register('organization.website')}
                    />
                  </div>
                  <div className="col-md-12">
                    <label className="form-label">Organization Description</label>
                    <textarea
                      className="form-control"
                      rows="2"
                      {...register('organization.description')}
                    />
                  </div>
                </div>
                <div className="d-flex justify-content-end gap-2 mt-4">
                  <button className="btn btn-success" type="submit" disabled={isLoading}>
                    {isLoading ? <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true" /> : <FaSave className="me-1" />} Save
                  </button>
                  <button className="btn btn-outline-secondary" type="button" onClick={handleCancel} disabled={isLoading}>
                    <FaTimes className="me-1" /> Cancel
                  </button>
                </div>
              </form>
            )}
            {/* Profile Details View */}
            {!isEditing && (
              <div className="row g-3 mt-2">
                {user.bio && (
                  <div className="col-md-12">
                    <div className="mb-2">
                      <strong>Bio:</strong> {user.bio}
                    </div>
                  </div>
                )}
                {user.skills && user.skills.length > 0 && (
                  <div className="col-md-12">
                    <div className="mb-2">
                      <strong>Skills:</strong> {user.skills.join(', ')}
                    </div>
                  </div>
                )}
                {user.availability && (
                  <div className="col-md-6">
                    <div className="mb-2">
                      <strong>Availability:</strong> {user.availability}
                    </div>
                  </div>
                )}
                {user.organization?.description && (
                  <div className="col-md-12">
                    <div className="mb-2">
                      <strong>Organization Description:</strong> {user.organization.description}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 