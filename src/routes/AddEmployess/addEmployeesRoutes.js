// routes/EmployeeRoutes.js
const express = require('express');
const router = express.Router();
const EmployeeController = require('../../controllers/AddEmployeeController/EmployeeController');

// Create a new employee
router.post('/createEmployee', EmployeeController.createEmployee);

// Get details of a specific employee by ID
router.get('/getEmployee/:id', EmployeeController.getEmployee);

// Update details of an employee
router.put('/updateEmployee/:id', EmployeeController.updateEmployee);

// Delete an employee
router.delete('/deleteEmployee/:id', EmployeeController.deleteEmployee);

router.get('/getAllEmployees', EmployeeController.getAllEmployees);


module.exports = router;
