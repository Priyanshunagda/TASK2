const express = require('express');
const router = express.Router();
const Permission = require('../models/Permission');

router.post('/seed-permissions', async (req, res) => {
  const samplePermissions = [
    { module: 'Projects', actions: ['create', 'read', 'update', 'delete'] },
    { module: 'Employees', actions: ['create', 'read', 'update', 'delete'] },
    { module: 'Teams', actions: ['create', 'read', 'update', 'delete'] },
    { module: 'Settings', actions: ['read', 'update'] }
  ];

  try {
    await Permission.deleteMany(); // clear old data if needed
    await Permission.insertMany(samplePermissions);
    res.status(200).json({ message: 'Permissions seeded' });
  } catch (err) {
    res.status(500).json({ message: 'Seeding failed' });
  }
});

module.exports = router;
