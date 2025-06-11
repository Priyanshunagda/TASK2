// File: routes/auth.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Employee = require('../models/Employee');
const Role = require('../models/Role');
const crypto = require('crypto');

const JWT_SECRET = process.env.JWT_SECRET;
const TOKEN_EXPIRY = '24h';

// Generate OTP
const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

// Register
router.post('/register', async (req, res) => {
  try {
    console.log('Register attempt with data:', { ...req.body, password: '[REDACTED]' });
    const { firstName, lastName, email, password, mobileNumber, address } = req.body;
    
    // Validate input
    if (!firstName || !lastName || !email || !password || !mobileNumber || !address) {
      console.log('Missing required fields:', { firstName, lastName, email, mobileNumber, address });
      return res.status(400).json({ 
        message: 'All fields are required',
        missing: Object.entries({ firstName, lastName, email, password, mobileNumber, address })
          .filter(([_, value]) => !value)
          .map(([key]) => key)
      });
    }

    // Check if employee exists
    const existingEmployee = await Employee.findOne({ email });
    if (existingEmployee) {
      console.log('Employee already exists with email:', email);
      return res.status(400).json({ message: 'Email already in use' });
    }

    // Get default role (User role)
    let userRole = await Role.findOne({ name: 'User' });
    if (!userRole) {
      console.log('User role not found, creating it');
      userRole = await new Role({ name: 'User', status: true }).save();
    }

    // Create new employee (password will be hashed by the pre-save hook)
    const employee = new Employee({
      firstName,
      lastName,
      email,
      password, // Password will be hashed by the pre-save hook
      mobileNumber,
      address,
      role: userRole._id
    });

    await employee.save();
    console.log('New employee registered successfully:', { email: employee.email, role: userRole.name });

    // Generate token
    const token = jwt.sign(
      { 
        employeeId: employee._id,
        role: userRole.name
      }, 
      JWT_SECRET, 
      { expiresIn: TOKEN_EXPIRY }
    );

    res.status(201).json({
      message: 'Employee registered successfully',
      token,
      user: {
        email: employee.email,
        role: userRole.name,
        firstName: employee.firstName,
        lastName: employee.lastName
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ 
      message: 'Server error during registration',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt:', { email });  // Don't log passwords

    // Validate input
    if (!email || !password) {
      console.log('Missing email or password');
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find employee
    const employee = await Employee.findOne({ email }).populate('role');

    if (!employee) {
      console.log('No employee found with email:', email);
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Verify password using the model's comparePassword method
    const isValidPassword = await employee.comparePassword(password);

    if (!isValidPassword) {
      console.log('Invalid password for email:', email);
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Generate OTP
    const otp = generateOTP();
    employee.otp = otp;
    employee.otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiry
    await employee.save();

    console.log('Generated OTP:', otp);

    // In a real application, you would send the OTP via email here
    // For demo purposes, we're sending it in the response
    res.json({
      message: 'OTP sent successfully',
      email: employee.email,
      otp: otp // In production, never send OTP in response
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    console.log('Received verify-otp request:', req.body);
    const { email, otp } = req.body;

    // Validate input
    if (!email || !otp) {
      console.log('Missing required fields:', { email, otp });
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    // Find employee
    const employee = await Employee.findOne({ 
      email,
      otp,
      otpExpiry: { $gt: new Date() }
    }).populate('role');

    console.log('Found employee:', employee);

    if (!employee) {
      console.log('Invalid or expired OTP for email:', email);
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Clear OTP
    employee.otp = undefined;
    employee.otpExpiry = undefined;
    await employee.save();

    // Generate token
    const token = jwt.sign(
      { 
        employeeId: employee._id,
        role: employee.role.name
      }, 
      JWT_SECRET, 
      { expiresIn: TOKEN_EXPIRY }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        email: employee.email,
        role: employee.role.name,
        firstName: employee.firstName,
        lastName: employee.lastName
      }
    });
  } catch (err) {
    console.error('OTP verification error:', err);
    res.status(500).json({ message: 'Server error during OTP verification' });
  }
});

// Logout
router.post('/logout', async (req, res) => {
  try {
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    console.error('Logout error:', err);
    res.status(500).json({ message: 'Server error during logout' });
  }
});

module.exports = router;
