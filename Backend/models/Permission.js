// models/Permission.js
const mongoose = require('mongoose');

const PermissionSchema = new mongoose.Schema({
  permission_name: String,
  route: String,
  module_name: String,
  type: {
    type: String,
    enum: ['View', 'Create', 'Edit', 'Delete']
  },
  allowedRoles: {
    type: [String],
    enum: ['Admin', 'Manager', 'Employee'],
    default: ['Admin']  // By default, only admin has access
  }
}, { timestamps: true });

module.exports = mongoose.model('Permission', PermissionSchema);
