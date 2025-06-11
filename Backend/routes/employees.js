const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const Employee = require('../models/Employee');
const auth = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(auth);

// Predefined permissions for employee routes
const PERMISSIONS = {
  CREATE: { route: 'create-employee', type: 'Create' },
  VIEW: { route: 'employee-list', type: 'View' },
  EDIT: { route: 'edit-employee', type: 'Edit' },
  DELETE: { route: 'delete-employee', type: 'Delete' }
};

// GET /api/employees - Get all employees with pagination and search
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const skip = (page - 1) * limit;

    // Build search query
    const searchQuery = search
      ? {
          $or: [
            { firstName: { $regex: search, $options: 'i' } },
            { lastName: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
          ]
        }
      : {};

    // Get total count for pagination
    const total = await Employee.countDocuments(searchQuery);

    // Get employees with pagination
    const employees = await Employee.find(searchQuery)
      .select('-password') // Exclude password field
      .populate('role', 'name')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    if (!employees) {
      return res.status(404).json({ error: 'No employees found' });
    }

    res.json({
      employees,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ 
      error: 'Failed to fetch employees',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/employees/:id - Get employee by ID
router.get('/:id', async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id)
      .select('-password')
      .populate('role', 'name');

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.json(employee);
  } catch (error) {
    console.error('Error fetching employee:', error);
    res.status(500).json({ 
      error: 'Failed to fetch employee',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST /api/employees - Create new employee
router.post('/', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if employee already exists
    const existingEmployee = await Employee.findOne({ email });
    if (existingEmployee) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create employee with hashed password
    const employee = await Employee.create({
      ...req.body,
      password: hashedPassword
    });

    // Remove password from response
    const employeeResponse = employee.toObject();
    delete employeeResponse.password;

    res.status(201).json(employeeResponse);
  } catch (error) {
    console.error('Error creating employee:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        error: 'Validation error',
        details: Object.values(error.errors).map(err => err.message)
      });
    }
    res.status(500).json({ 
      error: 'Failed to create employee',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// PUT /api/employees/:id - Update employee
router.put('/:id', async (req, res) => {
  try {
    const { email, password, ...updateData } = req.body;

    // If updating email, check if it already exists
    if (email) {
      const existingEmployee = await Employee.findOne({ 
        email, 
        _id: { $ne: req.params.id }
      });
      if (existingEmployee) {
        return res.status(400).json({ error: 'Email already exists' });
      }
      updateData.email = email;
    }

    // If updating password, hash it
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.json(employee);
  } catch (error) {
    console.error('Error updating employee:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        error: 'Validation error',
        details: Object.values(error.errors).map(err => err.message)
      });
    }
    res.status(500).json({ 
      error: 'Failed to update employee',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// DELETE /api/employees/:id - Hard delete employee
router.delete('/:id', async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('Error deleting employee:', error);
    res.status(500).json({ 
      error: 'Failed to delete employee',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router; 