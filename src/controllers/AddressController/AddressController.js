const Address = require('../../models/Address/AddressModel');

// Create a new address
exports.createAddress = async (req, res) => {
  try {
    const { userId, fullName, phone, companyName, street, city, state, pinCode, email, typeAddress,latitude,longitude } = req.body;
    console.log({ userId, fullName, phone, companyName, street, city, state, pinCode, email, typeAddress,longitude,latitude });
    

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
      latitude,
      longitude
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
       const products = await Address.updateMany(
      {}, // Empty filter to match all documents
      {
        $set: {
          latitude:"12.9097456",
         longitude: "77.6231403"
        },
      }
    );

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
// Mark main address
exports.markMainAddress = async (req, res) => {
  try {
    const addressId = req.params.id;

    // Find address
    const address = await Address.findById(addressId);
    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    // Remove previous main address for the same user
    await Address.updateMany(
      { userId: address.userId },
      { $set: { isMain: false } }
    );

    // Mark selected address as main
    address.isMain = true;
    await address.save();

    return res.status(200).json({
      success: true,
      message: "Main address updated successfully",
      data: address,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
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
