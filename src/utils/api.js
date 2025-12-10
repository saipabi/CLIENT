// src/utils/api.js
import axios from 'axios';
import { getAuthToken, removeAuthToken, removeUserInfo } from './auth';

// Use your Render backend here
const api = axios.create({
  baseURL: 'https://server-d274.onrender.com/api',   // ⭐ UPDATED
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 60 seconds timeout (Render free tier can take time to wake up)
});

// Add token automatically to requests
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auto logout on 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      removeAuthToken();
      removeUserInfo();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
