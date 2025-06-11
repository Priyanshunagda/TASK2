const express = require('express');
const router = express.Router();
const SidebarMenu = require('../models/SidebarMenu');

// GET /api/sidebarmenus - Fetch all sidebar menus (sorted)
router.get('/', async (req, res) => {
  try {
    const menus = await SidebarMenu.find()
      .sort({ order: 1 })
      .populate({
        path: 'children',
        options: { sort: { order: 1 } }
      });
    res.json(menus);
  } catch (error) {
    console.error('Error fetching sidebar menus:', error);
    res.status(500).json({ error: 'Failed to fetch sidebar menus' });
  }
});

module.exports = router; 