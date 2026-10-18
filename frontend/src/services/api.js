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

// --- Lightweight GET cache ---------------------------------------------------
// Every page fetches its data on mount, and the backend is remote, so moving
// between tabs re-waited on the network each time. Successful GETs are cached
// briefly and identical concurrent GETs share one request. Any write
// (POST/PUT/PATCH/DELETE) clears the cache so edits are reflected immediately.
const GET_CACHE_TTL_MS = 60 * 1000;
const responseCache = new Map();
const inflightRequests = new Map();
const baseAdapter = axios.getAdapter(axios.defaults.adapter);
let cacheGeneration = 0;

export const clearApiCache = () => {
  cacheGeneration += 1;
  responseCache.clear();
  inflightRequests.clear();
};

api.defaults.adapter = async (config) => {
  const method = (config.method || 'get').toLowerCase();

  if (method !== 'get') {
    clearApiCache();
    try {
      return await baseAdapter(config);
    } finally {
      clearApiCache();
    }
  }

  const key = `${config.headers?.Authorization || ''}|${axios.getUri(config)}`;
  const cached = responseCache.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    return { ...cached.response, config };
  }

  if (inflightRequests.has(key)) {
    const shared = await inflightRequests.get(key);
    return { ...shared, config };
  }

  const generation = cacheGeneration;
  const request = baseAdapter(config)
    .then((response) => {
      if (generation === cacheGeneration) {
        responseCache.set(key, { response, expiresAt: Date.now() + GET_CACHE_TTL_MS });
      }
      return response;
    })
    .finally(() => inflightRequests.delete(key));

  inflightRequests.set(key, request);
  return request;
};

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
      clearApiCache();
      localStorage.removeItem('slg_token');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
