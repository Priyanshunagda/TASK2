const models = require('../models');

const authorization = async (requiredPermission, req, res, next) => {
  try {
    // Get user from request (assuming it's set by previous middleware)
    const user = await models.Admin.findByPk(req.user.id);
    
    // Get user's role
    const userRole = await models.Role.findByPk(user.role);
    
    // If user is Admin, allow all actions
    if (userRole.name === 'Admin') {
      return next();
    }

    // Get role permissions
    const role_permissions = await models.RolePermission.findAll({
      where: { role_id: userRole.id }
    });

    if (!role_permissions || role_permissions.length == 0) {
      return res.status(403).json({
        success: false,
        message: "You do not have sufficient permissions to perform this action."
      });
    }

    // Get all permissions for the role
    const allRolePermissions = await models.Permission.findAll({
      where: {
        id: role_permissions.map(permission => permission.permission_id)
      }
    });

    // For non-admin roles, only allow view operations if they have the permission
    const hasPermission = allRolePermissions.some(permission => {
      if (userRole.name === 'Manager' || userRole.name === 'Employee') {
        return permission.permission_name === requiredPermission && permission.type === 'View';
      }
      return permission.permission_name === requiredPermission;
    });

    if (hasPermission) {
      next();
    } else {
      return res.status(403).json({
        success: false,
        message: "You are not authorized for this action"
      });
    }

  } catch (error) {
    console.error("Authorization error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

module.exports = authorization; 