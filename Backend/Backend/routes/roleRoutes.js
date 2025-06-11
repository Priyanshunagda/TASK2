// routes/roleRoutes.js
const express = require('express');
const router = express.Router();
const Role = require('../models/Role');
const Permission = require('../models/Permission');
const SidebarMenu = require('../models/SidebarMenu');
const authorization = require('../middleware/authorization');

// GET all sidebar menus - Admin only
router.get('/sidebarmenus', authorization.bind(null, 'Create Role'), async (req, res) => {
  try {
    const menus = await SidebarMenu.find().sort({ name: 1 });
    res.json(menus);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch sidebar menus' });
  }
});

// GET all permissions - Admin only
router.get('/permissions', authorization.bind(null, 'Create Role'), async (req, res) => {
  try {
    const permissions = await Permission.find();
    res.json(permissions);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch permissions' });
  }
});

// POST create new role - Admin only
router.post('/roles', authorization.bind(null, 'Create Role'), async (req, res) => {
  try {
    const { name, sidebarMenus, permissions } = req.body;
    const newRole = new Role({ name, sidebarMenus, permissions });
    await newRole.save();
    res.status(201).json({ message: 'Role created successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create role' });
  }
});

// PUT update role - Admin only
router.put('/roles/:id', authorization.bind(null, 'Edit Role'), async (req, res) => {
  try {
    const { name, sidebarMenus, permissions } = req.body;
    await Role.findByIdAndUpdate(req.params.id, { name, sidebarMenus, permissions });
    res.json({ message: 'Role updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update role' });
  }
});

// GET all roles
router.get('/roles', async (req, res) => {
  try {
    const roles = await Role.find()
      .populate('sidebarMenus', 'name')
      .populate('permissions', 'permission_name type module_name');
    res.json(roles);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch roles' });
  }
});

// DELETE a role
router.delete('/roles/:id', async (req, res) => {
  try {
    await Role.findByIdAndDelete(req.params.id);
    res.json({ message: 'Role deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete role' });
  }
});

module.exports = router;
