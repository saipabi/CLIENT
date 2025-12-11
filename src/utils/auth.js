// src/utils/auth.js

// Get token
export const getAuthToken = () => {
    return localStorage.getItem('auth_token');
  };
  
  // Save token
  export const setAuthToken = (token) => {
    localStorage.setItem('auth_token', token);
  };
  
  // Remove token
  export const removeAuthToken = () => {
    localStorage.removeItem('auth_token');
  };
  
  // Store user info
  export const setUserInfo = (user) => {
    localStorage.setItem('user_info', JSON.stringify(user));
  };
  
  // Get user info
  export const getUserInfo = () => {
    const userInfo = localStorage.getItem('user_info');
    if (!userInfo) return null;
  
    try {
      return JSON.parse(userInfo);
    } catch (err) {
      // Clear corrupted entry to avoid breaking callers
      localStorage.removeItem('user_info');
      return null;
    }
  };
  
  // Remove user info
  export const removeUserInfo = () => {
    localStorage.removeItem('user_info');
  };
  
  // Simple auth check
  export const isAuthenticated = () => {
    return getAuthToken() !== null;
  };
  
  // Logout (client-side)
  export const logout = () => {
    removeAuthToken();
    removeUserInfo();
  };
  