const { Employee } = require('../models');

const createEmployee = async (req, res) => {
  try {
    const newEmployee = await Employee.create(req.body);
    res.status(201).json({
      success: true,
      data: newEmployee
    });
  } catch (error) {
    console.error('Error creating employee:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const getEmployeeList = async (req, res) => {
  try {
    const employees = await Employee.findAll();
    res.json({
      success: true,
      data: employees
    });
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const editEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Employee.update(req.body, {
      where: { id }
    });

    if (updated[0] === 0) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    const updatedEmployee = await Employee.findByPk(id);
    res.json({
      success: true,
      data: updatedEmployee
    });
  } catch (error) {
    console.error('Error updating employee:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Employee.destroy({
      where: { id }
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    res.json({
      success: true,
      message: 'Employee deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting employee:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  createEmployee,
  getEmployeeList,
  editEmployee,
  deleteEmployee
}; 