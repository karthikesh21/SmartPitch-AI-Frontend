import axios from "axios";


const API_BASE_URL = process.env.REACT_APP_API_URL;


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


export const pitchAPI = {
  generate: (payload) => api.post("/pitch/generate", payload),
  getHistory: () => api.get("/pitch/history"),
  deleteHistory: (id) => api.delete(`/pitch/history/${id}`),
};

export const linkedInAPI = {
  optimize: (payload) => api.post("/linkedin/optimize", payload),
};

export default api;