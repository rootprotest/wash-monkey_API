const mongoose = require('mongoose');

const EmployeesSchema = new mongoose.Schema({
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  empId: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  location: String,
  joiningDate: { type: Date, required: true },
  jobRoles: { type: String, required: true },
  department: String,
  salary: { type: Number },
  phoneNumber: String,
  emergencyContact: {
    name: String,
    relationship: String,
    phoneNumber: String,
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
  },
  additionalInfo: {
    customField1: String,
    customField2: String,
    // Add more custom fields as needed
  },
});

const Employee = mongoose.model('Employee', EmployeesSchema);

module.exports = Employee;
