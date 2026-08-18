import axios from "axios";

export const getSanitizedApiUrl = () => {
  let rawApiUrl = process.env.REACT_APP_API_URL || '';
  if (typeof rawApiUrl === 'string' && rawApiUrl.includes('onrender.com')) {
    rawApiUrl = ''; // Override stale Render URL to use live Vercel serverless API
  }
  return rawApiUrl ? rawApiUrl.replace(/\/+$/, '').replace(/\/api$/, '') : '';
};

const API_BASE_URL = getSanitizedApiUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response && error.response.status >= 500) {
      console.error("API Server Error:", error.response || error);
    }
    return Promise.reject(error.response?.data || error.message || error);
  }
);

export const authAPI = {
  signup: (payload) => api.post("/api/auth/signup", payload),
  login: (payload) => api.post("/api/auth/login", payload),
  forgotPassword: (payload) => api.post("/api/auth/forgot-password", payload),
  verifyOTP: (payload) => api.post("/api/auth/verify-otp", payload),
  resetPassword: (payload) => api.post("/api/auth/reset-password", payload),
};

export const pitchAPI = {
  generate: (payload) => api.post("/api/pitch/generate", payload),
  coldMail: (payload) => api.post("/api/pitch/cold-mail", payload),
  getHistory: () => api.get("/api/pitch/history"),
  deleteHistory: (id) => api.delete(`/api/pitch/history/${id}`),
};

export const linkedInAPI = {
  optimize: (payload) => api.post("/api/linkedin/optimize", payload),
};

export default api;