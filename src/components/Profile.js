// src/components/Profile.js
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { logout as authLogout } from '../utils/auth';

const Profile = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    age: '',
    dob: '',
    contact: '',
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [memberSince, setMemberSince] = useState('');

  const loadProfile = useCallback(async () => {
    setProfileLoading(true);
    try {
      const response = await api.get('/profile');
      if (response.data.success && response.data.user) {
        const user = response.data.user;
        setFormData({
          name: user.name || '',
          email: user.email || '',
          age: user.age ? String(user.age) : '',
          dob: user.dob
            ? (() => {
                try {
                  if (typeof user.dob === 'string') {
                    return user.dob.split('T')[0];
                  }
                  const date = new Date(user.dob);
                  return isNaN(date.getTime())
                    ? ''
                    : date.toISOString().split('T')[0];
                } catch {
                  return '';
                }
              })()
            : '',
          contact: user.contact || '',
        });

        if (user.createdAt) {
          const date = new Date(user.createdAt);
          setMemberSince(
            date.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })
          );
        }
      }
    } catch (error) {
      if (error.response) {
        if (error.response.status === 401) {
          // Token expired or invalid - redirect to login
          authLogout();
          navigate('/login', { replace: true });
          return;
        }
        setMessage({
          type: 'danger',
          text: error.response.data?.message || 'Failed to load profile',
        });
      } else {
        setMessage({
          type: 'danger',
          text: 'Failed to load profile. Please try again.',
        });
      }
    } finally {
      setProfileLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (formData.age && formData.age.trim() !== '') {
      const ageNum = parseInt(formData.age, 10);
      if (isNaN(ageNum) || ageNum < 1 || ageNum > 150) {
        newErrors.age = 'Age must be between 1 and 150';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (!validateForm()) return;

    setLoading(true);

    try {
      const updateData = {
        name: formData.name.trim(),
        age:
          formData.age && formData.age.trim() !== ''
            ? parseInt(formData.age, 10)
            : undefined,
        dob:
          formData.dob && formData.dob.trim() !== '' ? formData.dob : undefined,
        contact:
          formData.contact && formData.contact.trim() !== ''
            ? formData.contact.trim()
            : undefined,
      };

      // Remove undefined values and check for NaN
      Object.keys(updateData).forEach((key) => {
        if (
          updateData[key] === undefined ||
          (key === 'age' && isNaN(updateData[key]))
        ) {
          delete updateData[key];
        }
      });

      const response = await api.put('/profile', updateData);

      if (response.data.success) {
        setMessage({
          type: 'success',
          text: 'Profile updated successfully!',
        });
        // refresh profile after successful update
        await loadProfile();
        setTimeout(() => {
          setMessage({ type: '', text: '' });
        }, 3000);
      }
    } catch (error) {
      if (error.response) {
        if (error.response.status === 401) {
          // Token expired or invalid - redirect to login
          authLogout();
          navigate('/login', { replace: true });
          return;
        }
        const errorData = error.response.data;
        setMessage({
          type: 'danger',
          text: errorData?.message || 'Failed to update profile',
        });
        // Handle validation errors
        if (
          error.response.status === 400 &&
          errorData.errors &&
          Array.isArray(errorData.errors)
        ) {
          const validationErrors = {};
          errorData.errors.forEach((err) => {
            if (err.param) {
              validationErrors[err.param] = err.msg;
            }
          });
          setErrors((prev) => ({ ...prev, ...validationErrors }));
        }
      } else {
        setMessage({
          type: 'danger',
          text: 'Failed to update profile. Please try again.',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    authLogout();
    navigate('/login');
  };

  if (profileLoading) {
    return (
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="card">
              <div className="card-body text-center">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3">Loading profile...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
        <div className="container">
          <span className="navbar-brand">User Profile</span>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <button
                  className="btn btn-outline-light btn-sm"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-7">
            <div className="card shadow-lg">
              <div className="card-header bg-primary text-white">
                <h4 className="mb-0">User Profile</h4>
              </div>
              <div className="card-body p-4">
                {message.text && (
                  <div
                    className={`alert ${
                      message.type === 'success' ? 'alert-success' : 'alert-danger'
                    }`}
                    role="alert"
                  >
                    {message.text}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="name" className="form-label">
                        Full Name
                      </label>
                      <input
                        type="text"
                        className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                      {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                    </div>

                    <div className="col-md-6 mb-3">
                      <label htmlFor="email" className="form-label">
                        Email Address
                      </label>
                      <input
                        type="email"
                        className="form-control"
                        id="email"
                        name="email"
                        value={formData.email}
                        disabled
                      />
                      <small className="text-muted">Email cannot be changed</small>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="age" className="form-label">
                        Age
                      </label>
                      <input
                        type="number"
                        className={`form-control ${errors.age ? 'is-invalid' : ''}`}
                        id="age"
                        name="age"
                        value={formData.age}
                        onChange={handleChange}
                        min="1"
                        max="150"
                        placeholder="Enter your age"
                      />
                      {errors.age && <div className="invalid-feedback">{errors.age}</div>}
                      <small className="text-muted">Age must be between 1 and 150 (optional)</small>
                    </div>

                    <div className="col-md-6 mb-3">
                      <label htmlFor="dob" className="form-label">
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        className="form-control"
                        id="dob"
                        name="dob"
                        value={formData.dob}
                        onChange={handleChange}
                      />
                      <small className="text-muted">Select your date of birth (optional)</small>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="contact" className="form-label">
                      Contact Number
                    </label>
                    <input
                      type="tel"
                      className="form-control"
                      id="contact"
                      name="contact"
                      value={formData.contact}
                      onChange={handleChange}
                      placeholder="e.g., +919876543210"
                    />
                    <small className="text-muted">Enter your phone number (optional)</small>
                  </div>

                  <div className="d-grid gap-2">
                    <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                      {loading ? 'Updating...' : 'Update Profile'}
                    </button>
                  </div>
                </form>

                <div className="mt-4 pt-4 border-top">
                  <h6>Account Information</h6>
                  <p className="text-muted mb-0">
                    <small>Member since: {memberSince}</small>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
