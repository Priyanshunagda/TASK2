const mongoose = require('mongoose');
const SidebarMenu = require('./models/SidebarMenu');
const Permission = require('./models/Permission');
const Role = require('./models/Role');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/admin-dashboard';

// Sample sidebar menu data
const sidebarMenuData = [
  {
    title: 'Dashboard',
    type: 'route',
    icon: 'home',
    route: '/dashboard',
    order: 1
  },
  {
    title: 'User Management',
    type: 'collapsible',
    icon: 'users',
    order: 2,
    children: [] // Will be populated with submenu IDs
  }
];

// Sample permission data
const permissionData = [
  {
    permission_name: 'View Users',
    route: '/users',
    module_name: 'User Management',
    type: 'View'
  },
  {
    permission_name: 'Create User',
    route: '/users/create',
    module_name: 'User Management',
    type: 'Create'
  },
  {
    permission_name: 'Edit User',
    route: '/users/edit',
    module_name: 'User Management',
    type: 'Edit'
  }
];

// Sample role data
const roleData = [
  {
    name: 'Admin',
    status: true
  },
  {
    name: 'User',
    status: true
  }
];

async function seedDatabase() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      SidebarMenu.deleteMany({}),
      Permission.deleteMany({}),
      Role.deleteMany({})
    ]);

    // Seed sidebar menus
    const menus = await SidebarMenu.create(sidebarMenuData);
    console.log('Sidebar menus seeded');

    // Seed permissions
    const permissions = await Permission.create(permissionData);
    console.log('Permissions seeded');

    // Seed roles with references
    const roles = roleData.map(role => ({
      ...role,
      sidebarMenus: menus.map(menu => menu._id),
      permissions: permissions.map(perm => perm._id)
    }));
    await Role.create(roles);
    console.log('Roles seeded');

    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase(); 