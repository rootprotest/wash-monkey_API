// controllers/EmployeeController/employeeController.js
const Employee = require("../../models/Employees/Employees"); // Assuming your model is in a separate file

const createEmployee = async (req, res) => {
  try {
    const employeeData = req.body;
    const newEmployee = await Employee.create(employeeData);
    res.status(200).json({
      success: true,
      message: 'Employee created successfully',
      data: newEmployee
    });
  } catch (error) {
    console.error('Error creating employee:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

const getEmployee = async (req, res) => {
  try {
    const employeeId = req.params.id;
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ success: false, error: 'Employee not found' });
    }
    res.status(200).json({ success: true, data: employee });
  } catch (error) {
    console.error('Error getting employee:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

const updateEmployee = async (req, res) => {
  try {
    const employeeId = req.params.id;
    const updatedEmployeeData = req.body;
    const updatedEmployee = await Employee.findByIdAndUpdate(employeeId, updatedEmployeeData, { new: true });
    if (!updatedEmployee) {
      return res.status(404).json({ success: false, error: 'Employee not found' });
    }
    res.status(200).json({
      success: true,
      message: 'Employee updated successfully',
      data: updatedEmployee
    });
  } catch (error) {
    console.error('Error updating employee:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

const deleteEmployee = async (req, res) => {
  try {
    const employeeId = req.params.id;
    const deletedEmployee = await Employee.findByIdAndDelete(employeeId);
    if (!deletedEmployee) {
      return res.status(404).json({ success: false, error: 'Employee not found' });
    }
    res.status(200).json({ success: true, message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('Error deleting employee:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

const getAllEmployees = async (req, res) => {
    try {
      const employees = await Employee.find();
      res.status(200).json({ success: true, employees: employees });
    } catch (error) {
      console.error('Error getting all employees:', error);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  };

module.exports = {
  createEmployee,
  getEmployee,
  updateEmployee,
  deleteEmployee,
  getAllEmployees
};
