const express = require('express');
const router = express.Router();
const authorization = require('../middleware/authorization');

// Example protected route that requires 'View Employees' permission
router.get('/', authorization.bind(null, 'View Employees'), async (req, res) => {
  try {
    // Your route logic here
    const employees = await models.Employee.findAll();
    res.json({
      success: true,
      data: employees
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching employees"
    });
  }
});

// Example protected route that requires 'Add Employee' permission
router.post('/', authorization.bind(null, 'Add Employee'), async (req, res) => {
  try {
    // Your route logic here
    const newEmployee = await models.Employee.create(req.body);
    res.status(201).json({
      success: true,
      data: newEmployee
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating employee"
    });
  }
});

module.exports = router; 