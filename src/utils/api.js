
import axios from 'axios';
import { getAuthToken, removeAuthToken, removeUserInfo } from './auth';

const api = axios.create({

  baseURL:
    process.env.REACT_APP_API_URL?.replace(/\/$/, '') ||
    'https://server-d274.onrender.com/api',
});

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
