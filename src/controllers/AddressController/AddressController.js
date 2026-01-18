const Address = require('../../models/Address/AddressModel');
const User = require("../../models/UserModel/User");


const nodemailer = require("nodemailer");

const sendPinCodeAlertEmail = async (address) => {
  const {
    fullName,
    phone,
    email,
    companyName,
    street,
    city,
    state,
    pinCode,
    typeAddress,
    latitude,
    longitude,
    userId,
  } = address;

const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: "monkeywashclean@gmail.com",
        pass: "oqvciwgddvzeecxm",
      },
    });
  const mailOptions = {
    from: `"Booking Alert" <${process.env.EMAIL_USER}>`,
    to: "support@washmonkey.in", // 🔁 admin email
    subject: `🚨 Booking Attempt – Unsupported Pin Code (${pinCode})`,
    html: `
      <h3>Unsupported Area Booking Attempt</h3>
      <table border="1" cellpadding="8" cellspacing="0">
        <tr><td><b>Full Name</b></td><td>${fullName}</td></tr>
        <tr><td><b>Phone</b></td><td>${phone}</td></tr>
        <tr><td><b>Email</b></td><td>${email || "N/A"}</td></tr>
        <tr><td><b>Company</b></td><td>${companyName || "N/A"}</td></tr>
        <tr><td><b>Street</b></td><td>${street}</td></tr>
        <tr><td><b>City</b></td><td>${city}</td></tr>
        <tr><td><b>State</b></td><td>${state}</td></tr>
        <tr><td><b>Pin Code</b></td><td>${pinCode}</td></tr>
        <tr><td><b>Address Type</b></td><td>${typeAddress}</td></tr>
        <tr><td><b>Latitude</b></td><td>${latitude}</td></tr>
        <tr><td><b>Longitude</b></td><td>${longitude}</td></tr>
        <tr><td><b>User ID</b></td><td>${userId}</td></tr>
      </table>

      <p>Please contact the customer manually.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};

const ALLOWED_PIN_CODES = [
  "600020", // Adyar
  "600041", // Thiruvanmiyur
  "600096", // OMR
  "600097",
  "600119",
  "600130"
];


// Create a new address
exports.createAddress = async (req, res) => {
  try {
    const {
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
      longitude,
    } = req.body;

    const isAllowedPin = ALLOWED_PIN_CODES.includes(String(pinCode));

    // ❌ Pin not allowed → send FULL address details
    if (!isAllowedPin) {
      await sendPinCodeAlertEmail({
        userId,
        fullName,
        phone,
        email,
        companyName,
        street,
        city,
        state,
        pinCode,
        typeAddress,
        latitude,
        longitude,
      });

      return res.status(400).json({
        success: false,
        message:
          "Currently our service is not available in your area. Our team will contact you shortly.",
      });
    }

    // ✅ Allowed → save address
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
      longitude,
    });

    return res.status(200).json({
      success: true,
      address: newAddress,
    });
  } catch (error) {
    console.error("createAddress error:", error);
    return res.status(500).json({
      success: false,
      error: "Server error",
    });
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
    const { userId } = req.body; // OR req.user._id if using JWT
    const addressId = req.params.id;

    // 1️⃣ Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // 2️⃣ Find address (must belong to user)
    const address = await Address.findOne({
      _id: addressId,
      userId: user._id,
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found for this user",
      });
    }

    // 3️⃣ Unmark previous main address
    await Address.updateMany(
      { userId: user._id },
      { $set: { isMain: false } }
    );

    // 4️⃣ Mark selected address as main
    address.isMain = true;
    await address.save();

    // 5️⃣ Save main address in User
    user.mainAddress = address._id;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Main address updated successfully",
      data: address,
    });
  } catch (error) {
    console.error("markMainAddress error:", error);
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
