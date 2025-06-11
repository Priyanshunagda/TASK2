import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import '../styles/CreateRole.css';


// Mock data for development
const mockSidebarMenus = [
  { _id: '1', title: 'Dashboard', path: '/dashboard' },
  { _id: '2', title: 'Employee Management', path: '/employees' },
  { _id: '3', title: 'Role Management', path: '/roles' },
  { _id: '4', title: 'Product Management', path: '/products' }
];

const mockPermissions = {
  'Employee Management': [
    { _id: '1', permission_name: 'View Employees' },
    { _id: '2', permission_name: 'Add Employee' },
    { _id: '3', permission_name: 'Edit Employee' },
    { _id: '4', permission_name: 'Delete Employee' }
  ],
  'Role Management': [
    { _id: '5', permission_name: 'View Roles' },
    { _id: '6', permission_name: 'Create Role' },
    { _id: '7', permission_name: 'Edit Role' },
    { _id: '8', permission_name: 'Delete Role' }
  ],
  'Product Management': [
    { _id: '9', permission_name: 'View Products' },
    { _id: '10', permission_name: 'Add Product' },
    { _id: '11', permission_name: 'Edit Product' },
    { _id: '12', permission_name: 'Delete Product' }
  ]
};

const API_BASE_URL = 'http://localhost:5000/api';

const CreateRole = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [sidebarMenus, setSidebarMenus] = useState([]);
  const [permissions, setPermissions] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    sidebarMenus: [],
    permissions: []
  });

  useEffect(() => {
    // Check if user is admin
    const userRole = localStorage.getItem('userRole');
    if (userRole !== 'Admin') {
      toast.error('Only administrators can create roles');
      navigate('/roles');
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Try to fetch from API first
        try {
          const [menusResponse, permissionsResponse] = await Promise.all([
            axios.get(`${API_BASE_URL}/sidebar-menus`),
            axios.get(`${API_BASE_URL}/permissions`)
          ]);

          // If API calls are successful, use the response data
          const menusData = Array.isArray(menusResponse.data) 
            ? menusResponse.data 
            : menusResponse.data.menus || mockSidebarMenus;

          const permissionsData = typeof permissionsResponse.data === 'object' 
            ? permissionsResponse.data 
            : mockPermissions;

          setSidebarMenus(menusData);
          setPermissions(permissionsData);
        } catch (apiError) {
          console.warn('API not available, using mock data:', apiError);
          // If API calls fail, use mock data
          setSidebarMenus(mockSidebarMenus);
          setPermissions(mockPermissions);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load menus and permissions. Using default options.');
        // Use mock data as fallback
        setSidebarMenus(mockSidebarMenus);
        setPermissions(mockPermissions);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMenuSelect = (menuId) => {
    setFormData(prev => ({
      ...prev,
      sidebarMenus: prev.sidebarMenus.includes(menuId)
        ? prev.sidebarMenus.filter(id => id !== menuId)
        : [...prev.sidebarMenus, menuId]
    }));
  };

  const handlePermissionSelect = (permId) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permId)
        ? prev.permissions.filter(id => id !== permId)
        : [...prev.permissions, permId]
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error('Role name is required');
      return false;
    }
    if (formData.sidebarMenus.length === 0 && formData.permissions.length === 0) {
      toast.error('At least one menu or permission must be selected');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      await axios.post(`${API_BASE_URL}/roles`, formData);
      toast.success('Role created successfully');
      navigate('/roles/list');
    } catch (error) {
      console.error('Error creating role:', error);
      toast.error(error.response?.data?.message || 'Failed to create role');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 bg-gradient-to-r from-indigo-600 to-indigo-800">
            <h2 className="text-2xl font-bold text-white">Create New Role</h2>
            <p className="mt-1 text-indigo-100">Define role permissions and access levels</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            {/* Role Name Section */}
            <div className="space-y-6">
              <div className="text-lg font-medium text-gray-900 pb-2 border-b">
                Basic Information
              </div>
              <div className="max-w-md">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Role Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter role name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                  required
                />
              </div>
            </div>

            {/* Sidebar Menus Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-2 border-b">
                <div className="text-lg font-medium text-gray-900">Menu Access</div>
                <div className="text-sm text-gray-500">
                  {formData.sidebarMenus.length} menu(s) selected
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.isArray(sidebarMenus) && sidebarMenus.map(menu => (
                  <label
                    key={menu._id}
                    className={`flex items-center p-4 border rounded-lg transition-all cursor-pointer ${
                      formData.sidebarMenus.includes(menu._id)
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.sidebarMenus.includes(menu._id)}
                      onChange={() => handleMenuSelect(menu._id)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <span className="ml-3 text-gray-700">{menu.title}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Permissions Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-2 border-b">
                <div className="text-lg font-medium text-gray-900">Permissions</div>
                <div className="text-sm text-gray-500">
                  {formData.permissions.length} permission(s) selected
                </div>
              </div>
              <div className="space-y-8">
                {Object.entries(permissions).map(([moduleName, modulePermissions]) => (
                  <div key={moduleName} className="bg-gray-50 rounded-lg p-6">
                    <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
                      <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
                      {moduleName}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {Array.isArray(modulePermissions) && modulePermissions.map(permission => (
                        <label
                          key={permission._id}
                          className={`flex items-center p-3 border rounded-md transition-all cursor-pointer ${
                            formData.permissions.includes(permission._id)
                              ? 'border-indigo-500 bg-white'
                              : 'border-gray-200 hover:border-indigo-300 bg-white'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={formData.permissions.includes(permission._id)}
                            onChange={() => handlePermissionSelect(permission._id)}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          />
                          <span className="ml-3 text-sm text-gray-700">
                            {permission.permission_name}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t">
              <button
                type="button"
                onClick={() => navigate('/roles')}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-2 animate-spin" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Creating Role...
                  </span>
                ) : (
                  'Create Role'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateRole;