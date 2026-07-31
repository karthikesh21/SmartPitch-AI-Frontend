import axios from "axios";


const rawApiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const API_BASE_URL = rawApiUrl.replace(/\/+$/, '').replace(/\/api$/, '');

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
    console.error("API Error:", error.response || error);
    return Promise.reject(error.response?.data || error.message);
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
  getHistory: () => api.get("/api/pitch/history"),
  deleteHistory: (id) => api.delete(`/api/pitch/history/${id}`),
};

export const linkedInAPI = {
  optimize: (payload) => api.post("/api/linkedin/optimize", payload),
};

export default api;