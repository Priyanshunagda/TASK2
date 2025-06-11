import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to all requests
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Clear local storage and redirect to login
      localStorage.clear();
      window.location.href = '/login';
      return Promise.reject(new Error('Session expired. Please login again.'));
    }
    
    // Handle validation errors
    if (error.response?.status === 400) {
      const errorMessage = error.response.data.details
        ? Array.isArray(error.response.data.details)
          ? error.response.data.details.join(', ')
          : error.response.data.details
        : error.response.data.error || 'Validation error';
      return Promise.reject(new Error(errorMessage));
    }
    
    return Promise.reject(
      new Error(error.response?.data?.error || error.message || 'An unexpected error occurred')
    );
  }
);

export const employeeService = {
  // Get all employees with pagination and search
  getEmployees: async ({ page = 1, limit = 10, search = '' } = {}) => {
    try {
      const response = await api.get('/employees', {
        params: {
          page,
          limit,
          search
        }
      });
      return {
        data: response.data.employees,
        total: response.data.total,
        currentPage: response.data.currentPage,
        totalPages: response.data.totalPages
      };
    } catch (error) {
      console.error('Error fetching employees:', error);
      throw error;
    }
  },

  // Get employee by ID
  getEmployee: async (id) => {
    try {
      const response = await api.get(`/employees/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching employee:', error);
      throw error;
    }
  },

  // Create new employee
  createEmployee: async (employeeData) => {
    try {
      // Validate required fields
      const requiredFields = ['firstName', 'lastName', 'email', 'password', 'mobileNumber', 'role'];
      const missingFields = requiredFields.filter(field => !employeeData[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      // Validate email format
      const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
      if (!emailRegex.test(employeeData.email)) {
        throw new Error('Invalid email format');
      }

      // Validate password length
      if (employeeData.password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      const response = await api.post('/employees', employeeData);
      return response.data;
    } catch (error) {
      console.error('Error creating employee:', error);
      throw error;
    }
  },

  // Update employee
  updateEmployee: async (id, employeeData) => {
    try {
      const response = await api.put(`/employees/${id}`, employeeData);
      return response.data;
    } catch (error) {
      console.error('Error updating employee:', error);
      throw error;
    }
  },

  // Delete employee
  deleteEmployee: async (id) => {
    try {
      const response = await api.delete(`/employees/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting employee:', error);
      throw error;
    }
  }
}; 