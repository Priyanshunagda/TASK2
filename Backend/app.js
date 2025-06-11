const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();

// CORS configuration
const corsOptions = {
  origin: ['https://task-2-priyanshu-nagdas-projects-007c85ca.vercel.app/', 'http://localhost:5173', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Import routes
const authRoutes = require('./routes/v1/public/auth.routes');
const employeeRoutes = require('./routes/v1/private/employee.routes');
const dashboardRoutes = require('./routes/v1/private/dashboard.routes');

// Public routes (no authentication needed)
app.use('/api/v1/auth', authRoutes);

// JWT Authentication middleware
const authenticateToken = require('./middleware/auth');

// Private routes (require authentication)
app.use('/api/v1/employees', authenticateToken, employeeRoutes);
app.use('/api/v1/dashboard', authenticateToken, dashboardRoutes);

// Serve index.html for all other routes to support client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app; 