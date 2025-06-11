// models/Role.js
const mongoose = require('mongoose');

const RoleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Role name is required'],
    unique: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  permissions: [{
    type: String,
    ref: 'Permission'
  }],
  status: {
    type: Boolean,
    default: true
  },
  deleted: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp on save
RoleSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Role = mongoose.model('Role', RoleSchema);

module.exports = Role;
