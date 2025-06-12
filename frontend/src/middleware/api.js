import axios from 'axios';

// Set base URL for axios
axios.defaults.baseURL = "https://task2-hn0y.onrender.com";
axios.defaults.withCredentials = true;

// Auth endpoints
export const login = (credentials) => axios.post("/api/auth/login", credentials);
export const register = (userData) => axios.post("/api/auth/register", userData);
export const verifyOTP = (data) => axios.post("/api/auth/verify-otp", data);

// Other endpoints
export const fetchSidebarMenus = () => axios.get("/api/sidebar-menus");
export const fetchPermissions = () => axios.get("/api/permissions");
export const fetchRoles = () => axios.get("/api/roles");
export const createRole = (roleData) => axios.post("/api/roles", roleData);