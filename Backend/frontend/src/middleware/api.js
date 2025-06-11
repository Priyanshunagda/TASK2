
import axios from 'axios';

// Set base URL for axios
axios.defaults.baseURL = "http://localhost:5000";

export const fetchSidebarMenus = () => axios.get("/api/sidebarmenus");
export const fetchPermissions = () => axios.get("/api/permissions");
export const fetchRoles = () => axios.get("/api/roles");
export const createRole = (roleData) => axios.post("/api/roles", roleData);