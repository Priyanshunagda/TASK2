const express = require('express');
const router = express.Router();
const Permission = require('../models/Permission');

// GET /api/permissions - Fetch all permissions grouped by module_name
router.get('/', async (req, res) => {
  try {
    const permissions = await Permission.find()
      .sort({ module_name: 1, type: 1 });

    // Group permissions by module_name
    const groupedPermissions = permissions.reduce((acc, permission) => {
      if (!acc[permission.module_name]) {
        acc[permission.module_name] = [];
      }
      acc[permission.module_name].push(permission);
      return acc;
    }, {});

    res.json(groupedPermissions);
  } catch (error) {
    console.error('Error fetching permissions:', error);
    res.status(500).json({ error: 'Failed to fetch permissions' });
  }
});

// POST /api/permissions
router.post('/', async (req, res) => {
  try {
    const permission = await Permission.create(req.body);
    res.status(201).json(permission);
  } catch (error) {
    console.error('Error creating permission:', error);
    res.status(500).json({ error: 'Failed to create permission' });
  }
});

module.exports = router;
