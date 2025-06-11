const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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