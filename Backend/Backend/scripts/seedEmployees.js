const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Employee = require('../models/Employee');
const Permission = require('../models/Permission');
const Role = require('../models/Role');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/admin-dashboard';

// Predefined permissions
const permissions = [
  {
    permission_name: 'Create Employee',
    route: 'create-employee',
    module_name: 'Employee Management',
    type: 'Create',
    allowedRoles: ['Admin'] // Only admin can create employees
  },
  {
    permission_name: 'View Employees',
    route: 'employee-list',
    module_name: 'Employee Management',
    type: 'View',
    allowedRoles: ['Admin', 'Manager', 'Employee']
  },
  {
    permission_name: 'Edit Employee',
    route: 'edit-employee',
    module_name: 'Employee Management',
    type: 'Edit',
    allowedRoles: ['Admin']
  },
  {
    permission_name: 'Delete Employee',
    route: 'delete-employee',
    module_name: 'Employee Management',
    type: 'Delete',
    allowedRoles: ['Admin']
  }
];

// Initial employees with roles
const employees = [
  {
    firstName: 'Admin',
    lastName: 'User',
    emailAddress: 'admin@gmail.com',
    password: '123456',
    mobileNumber: '1234567890',
    address: 'Admin Address',
    roleName: 'Admin'
  },
  {
    firstName: 'Manager',
    lastName: 'User',
    emailAddress: 'manager@gmail.com',
    password: '123456',
    mobileNumber: '9876543210',
    address: 'Manager Address',
    roleName: 'Manager'
  }
];

async function seedDatabase() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      Permission.deleteMany({}),
      Role.deleteMany({}),
      Employee.deleteMany({})
    ]);

    // Create permissions
    const createdPermissions = await Permission.create(permissions);
    console.log('Permissions seeded');

    // Create roles with appropriate permissions
    const adminRole = await Role.create({
      name: 'Admin',
      permissions: createdPermissions.map(p => p._id), // All permissions
      status: true
    });

    const managerRole = await Role.create({
      name: 'Manager',
      permissions: [
        createdPermissions.find(p => p.route === 'employee-list')._id
      ], // Only view permission
      status: true
    });
    console.log('Roles seeded');

    // Create employees with hashed passwords
    const employeePromises = employees.map(async emp => {
      const hashedPassword = await bcrypt.hash(emp.password, 10);
      return Employee.create({
        ...emp,
        password: hashedPassword,
        role: emp.roleName === 'Admin' ? adminRole._id : managerRole._id
      });
    });

    await Promise.all(employeePromises);
    console.log('Employees seeded');

    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase(); 