import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: "https://task2-hn0y.onrender.com",
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Add request interceptor to log requests
api.interceptors.request.use(
  (config) => {
    console.log('Making request to:', config.url, config.data);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Response error:', error);
    return Promise.reject(error);
  }
);

// Auth endpoints
export const login = (credentials) => api.post("/api/auth/login", credentials);
export const register = (userData) => api.post("/api/auth/register", userData);
export const verifyOTP = (data) => api.post("/api/auth/verify-otp", data);

// Other endpoints
export const fetchSidebarMenus = () => api.get("/api/sidebar-menus");
export const fetchPermissions = () => api.get("/api/permissions");
export const fetchRoles = () => api.get("/api/roles");
export const createRole = (roleData) => api.post("/api/roles", roleData);