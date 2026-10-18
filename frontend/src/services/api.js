import axios from 'axios';

let resolvedBaseURL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://slg-rooms.onrender.com/api' : 'http://localhost:5001/api');

// If VITE_API_URL was set to the defunct slg-rooms-o35e URL, point to the live Render backend
if (resolvedBaseURL.includes('slg-rooms-o35e')) {
  resolvedBaseURL = 'https://slg-rooms.onrender.com/api';
}

// Ensure baseURL ends with /api
if (!resolvedBaseURL.endsWith('/api') && !resolvedBaseURL.endsWith('/api/')) {
  resolvedBaseURL = resolvedBaseURL.replace(/\/+$/, '') + '/api';
}

const api = axios.create({
  baseURL: resolvedBaseURL
});

// Attach the logged-in session token to every request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('slg_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If the session is missing/expired, clear it and send the user back to login.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !error.config?.url?.includes('/auth/login')) {
      localStorage.removeItem('slg_token');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
