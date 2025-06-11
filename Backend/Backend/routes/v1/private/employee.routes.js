const express = require('express');
const router = express.Router();
const authorization = require('../../../middleware/authorization');
const employeeController = require('../../../controllers/employee.controller');

// Protected routes - only users with permissions can access
router.post('/create-employee', authorization.bind(null, 'Add Employee'), employeeController.createEmployee);
router.get('/employee-list', authorization.bind(null, 'View Employees'), employeeController.getEmployeeList);
router.put('/edit-employee/:id', authorization.bind(null, 'Edit Employee'), employeeController.editEmployee);
router.delete('/delete-employee/:id', authorization.bind(null, 'Delete Employee'), employeeController.deleteEmployee);

module.exports = router; 