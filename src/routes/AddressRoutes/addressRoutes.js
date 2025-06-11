// routes/addressRoutes.js
const express = require('express');
const router = express.Router();
const AddressController = require('../../controllers/AddressController/AddressController');

// Create a new address
router.post('/createAddress', AddressController.createAddress);
router.get('/getByIdAddress/:id', AddressController.getByIdAddress);
router.get('/getAddress', AddressController.getAllAddress);
router.put('/EditAddress/:id', AddressController.updateAddressById);
router.delete('/DeleteAddres/:id', AddressController.deleteAddressById);

module.exports = router;
