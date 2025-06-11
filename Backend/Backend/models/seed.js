// seed.js
const mongoose = require('mongoose');
const SidebarMenu = require('./SideBarMenu');
const Permission = require('./Permission');
const Role = require('./Role');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/admin-dashboard';

// Sample sidebar menu data
const sampleMenuData = [
  {
    title: "Product Management",
    type: "menu-title",
    module_id: "1",
    module_priority: 1
  },
  {
    title: "Products",
    type: "collapsible",
    iconStyle: "<i class='la la-bank'></i>",
    parent_module_id: "1",
    module_menu_priority: 1,
    contents: [
      { title: "Add New", to: "addnewproduct" },
      { title: "List", to: "productlist" },
      { title: "Bulk Import", to: "bulkimport" }
    ]
  },
  {
    title: "Part",
    type: "route",
    to: "part",
    iconStyle: "<i class='la la-arrow'></i>",
    parent_module_id: "1",
    module_menu_priority: 2
  }
];

// Sample permissions data
const samplePermissionsData = [
  { 
    permission_name: "View Products", 
    module_name: "Products", 
    type: "View",
    allowedRoles: ["Admin", "Manager", "Employee"]
  },
  { 
    permission_name: "Create Product", 
    module_name: "Products", 
    type: "Create",
    allowedRoles: ["Admin"]
  },
  { 
    permission_name: "Edit Product", 
    module_name: "Products", 
    type: "Edit",
    allowedRoles: ["Admin"]
  },
  { 
    permission_name: "Delete Product", 
    module_name: "Products", 
    type: "Delete",
    allowedRoles: ["Admin"]
  },
  { 
    permission_name: "View Parts", 
    module_name: "Parts", 
    type: "View",
    allowedRoles: ["Admin", "Manager", "Employee"]
  },
  { 
    permission_name: "Create Part", 
    module_name: "Parts", 
    type: "Create",
    allowedRoles: ["Admin"]
  },
  { 
    permission_name: "Edit Part", 
    module_name: "Parts", 
    type: "Edit",
    allowedRoles: ["Admin"]
  },
  { 
    permission_name: "Delete Part", 
    module_name: "Parts", 
    type: "Delete",
    allowedRoles: ["Admin"]
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB successfully');

    // Clear existing data
    await SidebarMenu.deleteMany({});
    await Permission.deleteMany({});
    await Role.deleteMany({});
    console.log('Cleared existing data');

    // Insert sidebar menus
    const menus = await SidebarMenu.insertMany(sampleMenuData);
    console.log('Inserted sidebar menus');

    // Insert permissions
    const permissions = await Permission.insertMany(samplePermissionsData);
    console.log('Inserted permissions');

    // Create a sample admin role
    await Role.create({
      name: 'Admin',
      selectedMenus: menus.map(menu => menu._id),
      permissions: permissions.map(perm => perm._id)
    });
    console.log('Created sample admin role');

    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the seed function if this file is run directly
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
