const express = require('express');
const router = express.Router();
const Role = require('../models/Role');

// Default roles
const defaultRoles = [
  { name: 'Admin', description: 'Full system access' },
  { name: 'Manager', description: 'Department management access' },
  { name: 'Employee', description: 'Basic employee access' }
];

// Initialize default roles
const initializeRoles = async () => {
  try {
    for (const role of defaultRoles) {
      await Role.findOneAndUpdate(
        { name: role.name },
        { ...role, status: true },
        { upsert: true, new: true }
      );
    }
    console.log('Default roles initialized');
  } catch (error) {
    console.error('Error initializing roles:', error);
  }
};

// Initialize roles when the server starts
initializeRoles();

// GET /api/roles - Get all active roles
router.get('/', async (req, res) => {
  try {
    const roles = await Role.find({ 
      status: true,
      deleted: { $ne: true }
    }).select('_id name description');

    if (!roles || roles.length === 0) {
      // If no roles found, try to initialize them
      await initializeRoles();
      const defaultRolesData = await Role.find({ 
        status: true,
        deleted: { $ne: true }
      }).select('_id name description');
      
      return res.json(defaultRolesData);
    }

    res.json(roles);
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({ error: 'Failed to fetch roles' });
  }
});

// POST /api/roles - Create new role
router.post('/', async (req, res) => {
  try {
    const { name, description } = req.body;
    
    // Check if role already exists
    const existingRole = await Role.findOne({ name, deleted: { $ne: true } });
    if (existingRole) {
      return res.status(400).json({ error: 'Role with this name already exists' });
    }

    const role = await Role.create({
      name,
      description,
      status: true
    });

    res.status(201).json(role);
  } catch (error) {
    console.error('Error creating role:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        error: 'Validation error',
        details: Object.values(error.errors).map(err => err.message)
      });
    }
    res.status(500).json({ error: 'Failed to create role' });
  }
});

// GET /api/roles/:id - Get role by ID
router.get('/:id', async (req, res) => {
  try {
    const role = await Role.findOne({
      _id: req.params.id,
      status: true,
      deleted: { $ne: true }
    });

    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }
    res.json(role);
  } catch (error) {
    console.error('Error fetching role:', error);
    res.status(500).json({ error: 'Failed to fetch role' });
  }
});

// PUT /api/roles/:id - Update role
router.put('/:id', async (req, res) => {
  try {
    const { name, description } = req.body;

    // Check if role with new name already exists
    if (name) {
      const existingRole = await Role.findOne({
        name,
        _id: { $ne: req.params.id },
        deleted: { $ne: true }
      });
      if (existingRole) {
        return res.status(400).json({ error: 'Role with this name already exists' });
      }
    }

    const role = await Role.findOneAndUpdate(
      { _id: req.params.id, deleted: { $ne: true } },
      { name, description },
      { new: true, runValidators: true }
    );

    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }
    res.json(role);
  } catch (error) {
    console.error('Error updating role:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        error: 'Validation error',
        details: Object.values(error.errors).map(err => err.message)
      });
    }
    res.status(500).json({ error: 'Failed to update role' });
  }
});

// DELETE /api/roles/:id - Soft delete role
router.delete('/:id', async (req, res) => {
  try {
    const role = await Role.findOneAndUpdate(
      { _id: req.params.id, deleted: { $ne: true } },
      { deleted: true },
      { new: true }
    );

    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }
    res.json({ message: 'Role deleted successfully' });
  } catch (error) {
    console.error('Error deleting role:', error);
    res.status(500).json({ error: 'Failed to delete role' });
  }
});

// Predefined sidebar menus
const sidebarMenus = [
  { _id: '1', title: 'Dashboard', path: '/dashboard' },
  { _id: '2', title: 'Employee Management', path: '/employees' },
  { _id: '3', title: 'Role Management', path: '/roles' },
  { _id: '4', title: 'Product Management', path: '/products' }
];

// Predefined permissions
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

// Get all sidebar menus
router.get('/sidebar-menus', (req, res) => {
  res.json(sidebarMenus);
});

// Get all permissions
router.get('/permissions', (req, res) => {
  res.json(permissions);
});

module.exports = router; 