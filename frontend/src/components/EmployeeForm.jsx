import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { employeeService } from '../services/employeeService';


const initialFormData = {
  firstName: '',
  lastName: '',
  emailAddress: '',
  password: '',
  confirmPassword: '',
  mobileNumber: '',
  address: '',
  role: ''
};

const EmployeeForm = ({ editMode = false }) => {
  const [formData, setFormData] = useState(initialFormData);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    fetchRoles();
    if (editMode && id) {
      fetchEmployee(id);
    }
    const role = localStorage.getItem('userRole');
    setUserRole(role);

    // Redirect non-admin users trying to create new employees
    if (!editMode && role !== 'Admin') {
      toast.error('Only administrators can create new employees');
      navigate('/employees');
      return;
    }
  }, [editMode, id, navigate]);

  const fetchRoles = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/roles');
      const data = await response.json();
      setRoles(data);
    } catch (error) {
      toast.error('Failed to fetch roles');
    }
  };

  const fetchEmployee = async (employeeId) => {
    try {
      const employee = await employeeService.getEmployee(employeeId);
      setFormData({
        ...employee,
        password: '',
        confirmPassword: '',
        role: employee.role?._id || ''
      });
    } catch (error) {
      toast.error(error.toString());
      navigate('/employees');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.firstName || !formData.lastName || !formData.emailAddress || 
        !formData.mobileNumber || !formData.address || !formData.role) {
      toast.error('Please fill in all required fields');
      return false;
    }

    if (!editMode && (!formData.password || !formData.confirmPassword)) {
      toast.error('Password is required for new employees');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.emailAddress)) {
      toast.error('Please enter a valid email address');
      return false;
    }

    const mobileRegex = /^\d{10}$/;
    if (!mobileRegex.test(formData.mobileNumber)) {
      toast.error('Please enter a valid 10-digit mobile number');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const submitData = { ...formData };
      delete submitData.confirmPassword;

      if (editMode) {
        if (!submitData.password) {
          delete submitData.password;
        }
        await employeeService.updateEmployee(id, submitData);
        toast.success('Employee updated successfully');
      } else {
        await employeeService.createEmployee(submitData);
        toast.success('Employee created successfully');
      }
      navigate('/employees');
    } catch (error) {
      toast.error(error.toString());
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="employee-form">
      <h2>{editMode ? 'Edit Employee' : 'Create Employee'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>First Name *</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Last Name *</label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Email Address *</label>
          <input
            type="email"
            name="emailAddress"
            value={formData.emailAddress}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Mobile Number *</label>
          <input
            type="tel"
            name="mobileNumber"
            value={formData.mobileNumber}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Address *</label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Role *</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            required
          >
            <option value="">Select Role</option>
            {roles.map(role => (
              <option key={role._id} value={role._id}>
                {role.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>{editMode ? 'New Password' : 'Password *'}</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required={!editMode}
          />
        </div>

        <div className="form-group">
          <label>{editMode ? 'Confirm New Password' : 'Confirm Password *'}</label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required={!editMode}
          />
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate('/employees')}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Saving...' : (editMode ? 'Update' : 'Create')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EmployeeForm; 