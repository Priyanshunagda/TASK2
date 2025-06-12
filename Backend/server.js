const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const path = require('path');

// Configure port for Render deployment
const PORT = parseInt(process.env.PORT || '10000');
console.log('Starting server with PORT:', PORT);

// Set environment variables if not set
if (!process.env.JWT_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    console.error('JWT_SECRET must be set in production environment!');
    process.exit(1);
  } else {
    console.warn('JWT_SECRET not set, using development secret. DO NOT USE IN PRODUCTION!');
    process.env.JWT_SECRET = crypto.randomBytes(64).toString('hex');
  }
}

// Import routes
const employeesRouter = require('./routes/employees');
const rolesRouter = require('./routes/roles');
const authRoutes = require('./routes/auth');
const app = express();

// Configure CORS
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://task-2-priyanshu-nagdas-projects-007c85ca.vercel.app', 'http://localhost:5173'] 
    : 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Serve static files from multiple possible locations
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static('/opt/render/project/src/public'));

// Root route handler - API status
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'Backend API server is running',
    version: '1.0.0',
    documentation: '/api-docs'
  });
});

// API Documentation route
app.get('/api-docs', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log('-------------------------');
  console.log('Request Details:');
  console.log(`Method: ${req.method}`);
  console.log(`Path: ${req.path}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  console.log('-------------------------');
  next();
});

// Seed initial data
const seedData = async () => {
  try {
    const Employee = require('./models/Employee');
    const Role = require('./models/Role');
    
    // Create admin role if it doesn't exist
    let adminRole = await Role.findOne({ name: 'Admin' });
    if (!adminRole) {
      adminRole = await new Role({ name: 'Admin' }).save();
    }

    // Create user role if it doesn't exist
    let userRole = await Role.findOne({ name: 'User' });
    if (!userRole) {
      userRole = await new Role({ name: 'User' }).save();
    }

    // Create admin user if doesn't exist
    const adminExists = await Employee.findOne({ email: 'admin@gmail.com' });
    if (!adminExists) {
      const adminEmployee = new Employee({
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@gmail.com',
        password: '123456',
        mobileNumber: '1234567890',
        address: 'Admin Address',
        role: adminRole._id
      });
      await adminEmployee.save();
    }

    console.log('Initial data seeded successfully');
  } catch (error) {
    console.error('Error seeding data:', error);
  }
};

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeesRouter);
app.use('/api/roles', rolesRouter);

// Add routes for sidebar menus and permissions
app.get('/api/sidebar-menus', (req, res) => {
  const sidebarMenus = [
    { _id: '1', title: 'Dashboard', path: '/dashboard' },
    { _id: '2', title: 'Employee Management', path: '/employees' },
    { _id: '3', title: 'Role Management', path: '/roles' },
    { _id: '4', title: 'Product Management', path: '/products' }
  ];
  res.json(sidebarMenus);
});

app.get('/api/permissions', (req, res) => {
  const permissions = {
    'Employee Management': [
      { _id: '1', permission_name: 'View Employees' },
      { _id: '2', permission_name: 'Add Employee' },
      { _id: '3', permission_name: 'Edit Employee' },
      { _id: '4', permission_name: 'Delete Employee' }
    ],
    'Role Management': [
      { _id: '5', permission_name: 'View Roles' },
      { _id: '6', permission_name: 'Create Role' },
      { _id: '7', permission_name: 'Edit Role' },
      { _id: '8', permission_name: 'Delete Role' }
    ],
    'Product Management': [
      { _id: '9', permission_name: 'View Products' },
      { _id: '10', permission_name: 'Add Product' },
      { _id: '11', permission_name: 'Edit Product' },
      { _id: '12', permission_name: 'Delete Product' }
    ]
  };
  res.json(permissions);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: process.env.NODE_ENV === 'production' ? 'Something went wrong!' : err.message,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
  });
});

// Handle 404 errors
app.use((req, res) => {
  res.status(404).json({ error: `Cannot ${req.method} ${req.path}` });
});

// Connect to MongoDB and start server
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://priyanshudexterdigi22:Priyansh205@cluster0.hcb44kv.mongodb.net/';
mongoose.connect(MONGODB_URI)
.then(async () => {
  console.log('Connected to MongoDB');
  await seedData();
  
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Server is listening at: http://0.0.0.0:${PORT}`);
  });
  
  // Handle server errors
  server.on('error', (error) => {
    console.error('Server error:', error);
    if (error.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use`);
    }
    process.exit(1);
  });
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});