// EmployeeRoles.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const EmployeeRoles = () => {
  // State management
  const [roleName, setRoleName] = useState('');
  const [sidebarMenus, setSidebarMenus] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [selectedMenus, setSelectedMenus] = useState([]);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [isMenusOpen, setIsMenusOpen] = useState(true);
  const [isPermissionsOpen, setIsPermissionsOpen] = useState(true);

  // Fetch sidebar menus and permissions on component mount
  useEffect(() => {
    fetchSidebarMenus();
    fetchPermissions();
  }, []);

  // Fetch sidebar menus from API
  const fetchSidebarMenus = async () => {
    try {
      const { data } = await axios.get('/api/sidebarmenus');
      setSidebarMenus(data);
    } catch (error) {
      toast.error('Failed to fetch sidebar menus');
    }
  };

  // Fetch permissions from API
  const fetchPermissions = async () => {
    try {
      const { data } = await axios.get('/api/permissions');
      setPermissions(data);
    } catch (error) {
      toast.error('Failed to fetch permissions');
    }
  };

  // Group permissions by module_name
  const groupedPermissions = permissions.reduce((acc, permission) => {
    if (!acc[permission.module_name]) {
      acc[permission.module_name] = [];
    }
    acc[permission.module_name].push(permission);
    return acc;
  }, {});

  // Handle menu selection
  const handleMenuSelect = (menuId) => {
    setSelectedMenus(prev => {
      if (prev.includes(menuId)) {
        return prev.filter(id => id !== menuId);
      }
      return [...prev, menuId];
    });
  };

  // Handle permission selection
  const handlePermissionSelect = (permissionId) => {
    setSelectedPermissions(prev => {
      if (prev.includes(permissionId)) {
        return prev.filter(id => id !== permissionId);
      }
      return [...prev, permissionId];
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!roleName || selectedMenus.length === 0 || selectedPermissions.length === 0) {
      toast.warning('Please complete all required fields');
      return;
    }

    const roleData = {
      name: roleName,
      selectedMenus,
      permissions: selectedPermissions
    };

    try {
      await axios.post('/api/roles', roleData);
      // Reset form
      setRoleName('');
      setSelectedMenus([]);
      setSelectedPermissions([]);
      toast.success('Role created successfully');
    } catch (error) {
      console.error('Error creating role:', error);
      toast.error('Failed to create role');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Create Employee Role</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Role Name Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Role Name
          </label>
          <input
            type="text"
            value={roleName}
            onChange={(e) => setRoleName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </div>

        {/* Sidebar Menus Collapsible */}
        <div className="border rounded-md">
          <button
            type="button"
            onClick={() => setIsMenusOpen(!isMenusOpen)}
            className="w-full px-4 py-2 text-left font-medium flex justify-between items-center"
          >
            <span>Sidebar Menus</span>
            <span>{isMenusOpen ? '−' : '+'}</span>
          </button>
          {isMenusOpen && (
            <div className="p-4 border-t">
              {sidebarMenus.map(menu => (
                <label key={menu._id} className="flex items-center space-x-2 py-1">
                  <input
                    type="checkbox"
                    checked={selectedMenus.includes(menu._id)}
                    onChange={() => handleMenuSelect(menu._id)}
                    className="rounded text-indigo-600"
                  />
                  <span>{menu.title}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Permissions Collapsible */}
        <div className="border rounded-md">
          <button
            type="button"
            onClick={() => setIsPermissionsOpen(!isPermissionsOpen)}
            className="w-full px-4 py-2 text-left font-medium flex justify-between items-center"
          >
            <span>Permissions</span>
            <span>{isPermissionsOpen ? '−' : '+'}</span>
          </button>
          {isPermissionsOpen && (
            <div className="p-4 border-t">
              {Object.entries(groupedPermissions).map(([moduleName, modulePermissions]) => (
                <div key={moduleName} className="mb-4">
                  <h3 className="font-medium text-gray-700 mb-2">{moduleName}</h3>
                  <div className="ml-4 space-y-1">
                    {modulePermissions.map(permission => (
                      <label key={permission._id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={selectedPermissions.includes(permission._id)}
                          onChange={() => handlePermissionSelect(permission._id)}
                          className="rounded text-indigo-600"
                        />
                        <span>{permission.permission_name} ({permission.type})</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Create Role
        </button>

        {/* Selected Items Summary */}
        <div className="mt-4 p-4 bg-gray-50 rounded-md">
          <h3 className="font-medium text-gray-700 mb-2">Selected Items:</h3>
          <div className="space-y-2">
            <p><strong>Role Name:</strong> {roleName}</p>
            <p><strong>Selected Menus:</strong> {selectedMenus.length} items</p>
            <p><strong>Selected Permissions:</strong> {selectedPermissions.length} items</p>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EmployeeRoles;
