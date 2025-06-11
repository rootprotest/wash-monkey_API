const Address = require('../../models/Address/AddressModel');

// Create a new address
exports.createAddress = async (req, res) => {
  try {
    const { userId, fullName, phone, companyName, street, city, state, pinCode, email, typeAddress } = req.body;

    const newAddress = await Address.create({
      userId,
      fullName,
      phone,
      companyName,
      street,
      city,
      state,
      pinCode,
      email,
      typeAddress,
    });

    res.status(200).json({ success: true, address: newAddress });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Get all Address
exports.getAllAddress = async (req, res) => {
    try {
      const Addresslist = await Address.find();
      res.status(200).json({ success: true, Addresslist });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: "Server error" });
    }
  };

  // Get all Address
exports.getByIdAddress = async (req, res) => {
    try {
      const userId = req.params.id;
      const Addresslist = await Address.find({ userId });
      res.status(200).json({ success: true, Addresslist });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: "Server error" });
    }
  };
// Update a specific address by ID
exports.updateAddressById = async (req, res) => {
  try {
    const addressId = req.params.id;
    const { fullName, phone, companyName, street, city, state, pinCode, email, typeAddress } = req.body;

    // Check if the address exists
    const existingAddress = await Address.findById(addressId);

    if (!existingAddress) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    // Update the address fields
    existingAddress.fullName = fullName;
    existingAddress.phone = phone;
    existingAddress.companyName = companyName;
    existingAddress.street = street;
    existingAddress.city = city;
    existingAddress.state = state;
    existingAddress.pinCode = pinCode;
    existingAddress.email = email;
    existingAddress.typeAddress = typeAddress;

    // Save the updated address
    const updatedAddress = await existingAddress.save();

    res.status(200).json({ success: true, address: updatedAddress });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Delete a specific address by ID
exports.deleteAddressById = async (req, res) => {
  try {
    const addressId = req.params.id;

    // Check if the address exists
    const existingAddress = await Address.findById(addressId);

    if (!existingAddress) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }
c
    // Remove the address from the database
    await Address.deleteOne({ _id: addressId });

    res.status(200).json({ success: true, message: 'Address deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};
