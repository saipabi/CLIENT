// // src/utils/api.js
// import axios from 'axios';
// import { getAuthToken, removeAuthToken, removeUserInfo } from './auth';

// const api = axios.create({
//   baseURL: 'http://localhost:5000/api',   
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// api.interceptors.request.use(
//   (config) => {
//     const token = getAuthToken();
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response && error.response.status === 401) {
//       removeAuthToken();
//       removeUserInfo();
//       window.location.href = '/login';
//     }
//     return Promise.reject(error);
//   }
// );

// export default api;

// src/utils/api.js
import axios from 'axios';
import { getAuthToken, removeAuthToken, removeUserInfo } from './auth';

// const api = axios.create({
//   baseURL: 'http://localhost:5000/api',  
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

const api = axios.create({
  baseURL: "https://server-d274.onrender.com/api",
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
