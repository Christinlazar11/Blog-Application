import axios from "axios";

const api = axios.create({
  baseURL: "/api", // all requests go to /api/*
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      // if (typeof window !== "undefined") {
      //   localStorage.removeItem("token");
      //   window.location.href = "/login";
      // }
    }else if(error.response.status === 403){
      window.location.href = '/dashboard'
    }
    return Promise.reject(error);
  }
);

export default api;
