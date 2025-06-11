import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth';

// Configure axios defaults
axios.defaults.headers.post['Content-Type'] = 'application/json';
axios.defaults.baseURL = API_URL;

// Add auth token to all requests
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

// Add response interceptor for error handling
axios.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    // If the error is not 401 or the request was for logout, reject immediately
    if (error.response?.status !== 401 || originalRequest.url.includes('/logout')) {
      return Promise.reject(error);
    }

    // Prevent infinite loops
    if (originalRequest._retry) {
      localStorage.clear();
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // If token expired and we have a refresh token, try to refresh
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      originalRequest._retry = true;
      try {
        const response = await axios.post('/refresh-token', {
          refreshToken
        });
        
        const { accessToken } = response.data;
        localStorage.setItem('accessToken', accessToken);
        
        // Retry the original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return axios(originalRequest);
      } catch (refreshError) {
        // If refresh token is invalid, clear everything and redirect to login
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    } else {
      // No refresh token available, clear and redirect
      localStorage.clear();
      window.location.href = '/login';
      return Promise.reject(error);
    }
  }
);

export const authService = {
  register: async (userData) => {
    try {
      const response = await axios.post('/register', userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  login: async ({ email, password }) => {
    try {
      console.log('Sending login request with:', { email, password: '[REDACTED]' });
      const response = await axios.post('/login', {
        email: email.trim(),
        password: password.trim()
      });
      console.log('Login response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Login error:', error.response?.data || error);
      throw error;
    }
  },

  verifyOTP: async (data) => {
    try {
      console.log('Verifying OTP with data:', data);
      const response = await axios.post('/verify-otp', {
        email: data.email,
        otp: data.otp.toString()
      });
      console.log('OTP verification response:', response.data);
      if (response.data.token) {
        localStorage.setItem('accessToken', response.data.token);
        localStorage.setItem('userRole', response.data.user.role);
        localStorage.setItem('userEmail', response.data.user.email);
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      }
      return response.data;
    } catch (error) {
      console.error('OTP verification error:', error.response?.data || error);
      throw error;
    }
  },

  logout: async () => {
    try {
      await axios.post('/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear local storage and headers on logout
      localStorage.clear();
      delete axios.defaults.headers.common['Authorization'];
    }
  },

  autoLogin: async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token found');
      }

      const response = await axios.post('/refresh-token', {
        refreshToken
      });

      localStorage.setItem('accessToken', response.data.accessToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.accessToken}`;
      return response.data;
    } catch (error) {
      localStorage.clear();
      delete axios.defaults.headers.common['Authorization'];
      throw error.response?.data?.message || 'Auto-login failed';
    }
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return false;
    
    // You could add token expiration check here if your tokens include exp
    try {
      // Basic check if token is a valid JWT
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.exp && payload.exp < Date.now() / 1000) {
        localStorage.clear();
        return false;
      }
      return true;
    } catch {
      return false;
    }
  },

  // Get current user role
  getUserRole: () => {
    return localStorage.getItem('userRole');
  },

  // Get current user email
  getUserEmail: () => {
    return localStorage.getItem('userEmail');
  }
}; 