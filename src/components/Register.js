// src/components/Register.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

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

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (!validateForm()) return;

    setLoading(true);

    
    let success = false;

    while (retries >= 0 && !success) {
      try {
        const response = await api.post('/auth/register', {
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
        });

        // Log the response for debugging
        console.log('Registration response:', response);
        console.log('Response status:', response.status);
        console.log('Response data:', response.data);

        // Check if registration was successful
        // Backend returns: { success: true, message: 'Registration successful', ... } with status 201
        const status = response.status;
        const isSuccess = (status === 200 || status === 201) && response.data?.success === true;
        
        if (isSuccess) {
          // Registration successful
          success = true;
          setMessage({
            type: 'success',
            text: 'Registration successful! Redirecting to login...',
          });

          setTimeout(() => {
            navigate('/login', { replace: true });
          }, 1200);
          break; // Exit retry loop on success
        } else {
          // Registration failed - show backend message or default
          const errorMsg = response.data?.message || 'Registration failed. Please try again.';
          setMessage({
            type: 'danger',
            text: errorMsg,
          });
          break; // Exit retry loop on non-timeout error
        }
      } catch (error) {
        console.error('Registration error:', error);
        console.error('Error response:', error.response);
        console.error('Error data:', error.response?.data);
        
        if (error.response) {
          // Server responded with error status - don't retry
          const errorData = error.response.data;
          const status = error.response.status;
          
          if (status === 409) {
            // Duplicate email
            setErrors((prev) => ({
              ...prev,
              email: 'Email already registered',
            }));
            setMessage({
              type: 'danger',
              text: 'Email already registered. Please use a different email.',
            });
          } else if (status === 400) {
            // Validation errors from backend
            if (errorData.errors && Array.isArray(errorData.errors)) {
              // Map validation errors to form fields
              const validationErrors = {};
              errorData.errors.forEach((err) => {
                if (err.param) {
                  validationErrors[err.param] = err.msg;
                }
              });
              setErrors((prev) => ({ ...prev, ...validationErrors }));
            }
            setMessage({
              type: 'danger',
              text: errorData.message || 'Please check your input and try again.',
            });
          } else if (errorData && errorData.message) {
            setMessage({
              type: 'danger',
              text: errorData.message,
            });
          } else {
            setMessage({
              type: 'danger',
              text: 'Registration failed. Please try again.',
            });
          }
          break; // Exit retry loop on server error
        } else if (error.request) {
          // Request was made but no response received
          if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
            // Timeout error - retry if we have retries left
            if (retries > 0) {
              retries--;
              setMessage({
                type: 'warning',
                text: `Server is waking up... Retrying (${2 - retries}/2)...`,
              });
              // Wait 3 seconds before retry to give server time to wake up
              await new Promise(resolve => setTimeout(resolve, 3000));
              continue; // Retry the request
            } else {
              setMessage({
                type: 'danger',
                text: 'Server is taking too long to respond. The server may be waking up from sleep. Please wait a moment and try again, or refresh the page.',
              });
              break; // Exit retry loop after all retries exhausted
            }
          } else {
            setMessage({
              type: 'danger',
              text: 'Unable to connect to server. Please check your internet connection and try again.',
            });
            break; // Exit retry loop on connection error
          }
        } else {
          // Error setting up the request
          setMessage({
            type: 'danger',
            text: error.message || 'Registration failed. Please try again.',
          });
          break; // Exit retry loop on setup error
        }
      }
    }

    setLoading(false);
  };

  return (
    <div className="container">
      <div className="row justify-content-center align-items-center min-vh-100">
        <div className="col-md-6 col-lg-5">
          <div className="card shadow-lg">
            <div className="card-body p-5">
              <h2 className="card-title text-center mb-4">Create Account</h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
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
                  {errors.name && (
                    <div className="invalid-feedback">{errors.name}</div>
                  )}
                </div>

                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    Email Address
                  </label>
                  <input
                    type="email"
                    className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                  {errors.email && (
                    <div className="invalid-feedback">{errors.email}</div>
                  )}
                </div>

                <div className="mb-3">
                  <label htmlFor="password" className="form-label">
                    Password
                  </label>
                  <input
                    type="password"
                    className={`form-control ${
                      errors.password ? 'is-invalid' : ''
                    }`}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength="6"
                  />
                  {errors.password && (
                    <div className="invalid-feedback">{errors.password}</div>
                  )}
                  <small className="text-muted">
                    Password must be at least 6 characters
                  </small>
                </div>

                <div className="mb-3">
                  <label htmlFor="confirmPassword" className="form-label">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    className={`form-control ${
                      errors.confirmPassword ? 'is-invalid' : ''
                    }`}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                  {errors.confirmPassword && (
                    <div className="invalid-feedback">
                      {errors.confirmPassword}
                    </div>
                  )}
                </div>

                {message.text && (
                  <div
                    className={`alert ${
                      message.type === 'success'
                        ? 'alert-success'
                        : 'alert-danger'
                    }`}
                    role="alert"
                  >
                    {message.text}
                  </div>
                )}

                <button
                  type="submit"
                  className="btn btn-primary w-100 mb-3"
                  disabled={loading}
                >
                  {loading ? 'Creating Account...' : 'Sign Up'}
                </button>
              </form>

              <div className="text-center mt-3">
                <p>
                  Already have an account? <Link to="/login">Login here</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
