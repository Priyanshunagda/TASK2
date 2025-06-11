const express = require('express');
const router = express.Router();
const authorization = require('../../../middleware/authorization');
const { Employee, Role, Permission } = require('../../../models');

// Get dashboard statistics (requires View Dashboard permission)
router.get('/stats', authorization.bind(null, 'View Dashboard'), async (req, res) => {
  try {
    // Get counts for various entities
    const [employeeCount, roleCount, permissionCount] = await Promise.all([
      Employee.count(),
      Role.count(),
      Permission.count()
    ]);

    res.json({
      success: true,
      data: {
        employeeCount,
        roleCount,
        permissionCount
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get recent activities (requires View Dashboard permission)
router.get('/recent-activities', authorization.bind(null, 'View Dashboard'), async (req, res) => {
  try {
    // Get recent employees (as an example of activity)
    const recentEmployees = await Employee.findAll({
      order: [['createdAt', 'DESC']],
      limit: 5
    });

    res.json({
      success: true,
      data: recentEmployees
    });
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router; 