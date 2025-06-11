// middleware/checkPermission.js
const Employee = require('../models/Employee');

const checkPermission = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      // Get employee ID from authenticated user (assuming it's set by auth middleware)
      const employeeId = req.user?.id;
      if (!employeeId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Get employee with populated role and permissions
      const employee = await Employee.findById(employeeId)
        .populate({
          path: 'role',
          populate: {
            path: 'permissions'
          }
        });

      if (!employee) {
        return res.status(404).json({ error: 'Employee not found' });
      }

      // If employee is Admin, allow all actions
      if (employee.role.name === 'Admin') {
        return next();
      }

      // For Manager and Employee roles, only allow view operations
      if (employee.role.name === 'Manager' || employee.role.name === 'Employee') {
        if (requiredPermission.type !== 'View') {
          return res.status(403).json({ error: 'Access denied. You can only perform view operations.' });
        }
      }

      // Check if employee's role has the required permission
      const hasPermission = employee.role.permissions.some(permission => 
        permission.route === requiredPermission.route && 
        permission.type === requiredPermission.type &&
        permission.allowedRoles.includes(employee.role.name)
      );

      if (!hasPermission) {
        return res.status(403).json({ error: 'Access denied' });
      }

      next();
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({ error: 'Failed to verify permissions' });
    }
  };
};

module.exports = checkPermission;
