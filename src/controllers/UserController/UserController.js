const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const User = require("../../models/UserModel/User");
const Admin = require("../../models/UserModel/Admin");
const Order = require("../../models/OrderModel/OrderModel");

const transporter = require("../../utils/emailConfig");
const { v4: uuidv4 } = require("uuid");
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');


// Load client secrets from a local file.
const CREDENTIALS_PATH = 'path/to/credentials.json'; // Update this path to your credentials file
const TOKEN_PATH = 'path/to/token.json'; // Update this path to where you want to store the token


const RESPONSE_MESSAGES = {
  EMAIL_TAKEN: "Email is already taken",
  MOBILE_TAKEN: "Mobile number is already taken",
  USERNAME_TAKEN: "Username is already taken",
  SERVER_ERROR: "Server error",
};

// Generate a unique token using uuid
const generateToken = () => {
  return uuidv4();
};

// Function to check if a field is already taken
const isFieldTaken = async (field, value, errorMessage) => {
  const existingUser = await User.findOne({ [field]: value });
  if (existingUser) {
    return { success: false, error: errorMessage };
  }
  return null;
};

// Send reset email
const sendResetEmail = async (userEmail, resetToken) => {
  const resetLink = `https://apis.washmonkey.in/reset?token=${resetToken}`;

  const mailOptions = {
    from: `"Support" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: "🔐 Password Reset Request",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Password Reset Requested</h2>
        <p>We received a request to reset your password.</p>

        

        <p>
          <a href="${resetLink}" 
             style="padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">
            Reset Password
          </a>
        </p>
        <p>If you did not request this, please ignore this email.</p>
        <p style="margin-top: 20px;">Thanks,<br/>Wash Monkey Team</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};


// Send reset email
const sendVerificationEmail = async (email, otp) => {
  const mailOptions = {
    from: "sadamimsolutions@gmail.com",
    to: email,
    subject: "Account Verification",
    html: `<p>Thank you for registering! Please click the link to verify your account OTP ${otp}.</p>`,
  };
  await transporter.sendMail(mailOptions);
};
const updateUser = async (userId, updateData) => {
  try {
    return await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    });
  } catch (error) {
    console.error(`Error updating user: ${error.message}`);
    throw error;
  }
};

const updateAdmin = async (adminId, updateData) => {
  try {
    return await Admin.findOneAndUpdate({ admin_id: adminId }, updateData, {
      new: true,
      runValidators: true,
    });
  } catch (error) {
    console.error(`Error updating admin: ${error.message}`);
    throw error;
  }
};


async function sendVerificationSMS(phoneNumber) {
  const apiKey = "07a81cfd6463953ac8e5f3a9d43c1985";
  const sender = "LHEROS";
  const templateId = "1607100000000307605";
  const verificationCode = generateVerificationCode(); // Implement your own function to generate a verification code

  const smsData = {
    key: apiKey,
    route: 2,
    sender: sender,
    number: phoneNumber,
    sms: `One time verification code for buy back is : ${verificationCode} -LOCAL HEROS`,
    templateid: templateId
  };

  try {
    const response = await axios.get('http://site.ping4sms.com/api/smsapi', {
      params: smsData
    });

    // Assuming the response provides some confirmation of successful SMS delivery,
    // you can handle it here based on the structure of the response.
    console.log("SMS Sent Successfully:", response.data);

    return verificationCode;
  } catch (error) {
    console.error("Error sending verification SMS:", error);
  }
}

// Function to generate a random verification code (replace this with your own logic)
function generateVerificationCode() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}


const sendEmail = async (email, otp) => {
  try {

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      auth: {
        user: "monkeywashclean@gmail.com",
        pass: "oqvciwgddvzeecxm",
      },
    });

    await transporter.verify();

    await transporter.sendMail({
      from: "monkeywashclean@gmail.com",
      to: email,
      subject: "Account Verification",
      html: `<p>Thank you for registering! Please click the link to verify your account OTP ${otp}.</p>`,
    });

    console.log('Email sent successfully!');
    return {
      status: 200
    };

  } catch (error) {
    console.error('Error sending email:', error);
    return {
      status: 500,
      error
    };
  }
};

const sendOTP = async (mobileNumber, name = "User", appName = "MyApp", otp) => {
  const apiKey = "6FlAGamNys0B4OxZ";
  const senderId = "WASHMO";
  const message = `Dear ${name}, Your One Time Password ${otp} is valid for 10 minutes. Do not share this code with anyone. Visit https://washmonkey.in - WASHIMONKI`;

  const url = `http://app.mydreamstechnology.in/vb/apikey.php?apikey=${apiKey}&senderid=${senderId}&number=${mobileNumber}&message=${encodeURIComponent(message)}`;

  try {
    const response = await axios.get(url);
    console.log("SMS Sent:", response.data);
    console.log("Url:", url);

    return response.data;
  } catch (error) {
    console.error("SMS sending failed:", error.message);
    throw new Error("Failed to send OTP");
  }
};

module.exports = {
  login: async (req, res) => {
    const { email, password, mobilenumber, google_signin, fcm_token, isMobileLogin } = req.body;

    console.log(req.body, "req.body");

    try {
      // Find user by username
      const errors = validationResult(req);
      if (mobilenumber) {
        if (!errors.isEmpty()) {
          return res
            .status(400)
            .json({ success: false, errors: errors.array() });
        }
      }

      let user;
      if (google_signin) {
        user = await User.findOne(
          mobilenumber ? { mobilenumber } : { email }
        );
        res
          .status(200)
          .json({
            success: true,
            userId: user._id,
            UserType: user.UserType,
          });
      } else {
        user = await User.findOne(
          mobilenumber ? { mobilenumber } : { email }
        );

        // Check if user exists
     if (!user) {
  return res.status(404).json({
    success: false,
    message: "Account not found. Please sign up before logging in.",
  });
}

        console.log(!user.verified, user.UserType === "3");
        // Check if user exists
        if (user.UserType === "3") {
          if (!user.verified || isMobileLogin) {
            // Generate OTP (6-digit)
            const otp = Math.floor(100000 + Math.random() * 900000).toString();

            // Save OTP in user record (if you're storing it)
            user.OTPNumber = otp;
            await user.save();
            console.log(otp, "otp");

            // Send OTP via SMS
            await sendOTP(user.mobilenumber, user.name || "User", "My Dreams Technology", otp);

            return res.status(200).json({
              success: true,
              message: "OTP sent to your mobile number",
              userId: user._id,
              UserType: user.UserType,
            });
          }
          if (!mobilenumber) {
            const isPasswordValid = await bcrypt.compare(password, user.password);
            console.log(isPasswordValid, "isPasswordValid");

            if (!isPasswordValid) {
              return res
                .status(401)
                .json({ success: false, message: "Password Invalid" });
            }
          }

          // If already verified
          return res.status(200).json({
            success: true,
            userId: user._id,
            UserType: user.UserType,
          });
        }


        if (user.UserType === "1" && fcm_token) {
          user.fcm_token = fcm_token;
          // Save the updated Product
          const updateduser = await user.save();
        }

        // Check password
        if (!mobilenumber) {
          const isPasswordValid = await bcrypt.compare(password, user.password);
          if (!isPasswordValid) {
            return res
              .status(401)
              .json({ success: false, message: "Invalid credentials" });
          }
        }

        // Generate JWT token
        const token = jwt.sign(
          { email: user.email, userId: user._id, UserType: user.UserType },
          "your-secret-key",
          { expiresIn: "1h" }
        );

        res
          .status(200)
          .json({
            success: true,
            userId: user._id,
            UserType: user.UserType,
          });
      }

    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: "Server error" });
    }
  },


  register: async (req, res,) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const {
        firstname,
        lastname,
        email,
        password,
        mobilenumber,
        UserType,
        lang,
        google_signin
      } = req.body;

      const emailTaken = await isFieldTaken(
        "email",
        email,
        RESPONSE_MESSAGES.EMAIL_TAKEN
      );
      if (emailTaken) return res.status(400).json(emailTaken);

      const mobileTaken = await isFieldTaken(
        "mobilenumber",
        mobilenumber,
        RESPONSE_MESSAGES.MOBILE_TAKEN
      );
      if (mobileTaken) return res.status(400).json(mobileTaken);

      const usernameTaken = await isFieldTaken(
        "firstname",
        firstname,
        RESPONSE_MESSAGES.USERNAME_TAKEN
      );
      if (usernameTaken) return res.status(400).json(usernameTaken);

      const hashedPassword = await bcrypt.hash(password, 10);
      const otp = generateVerificationCode();
      const otpExpiry = Date.now() + 3600000; // OTP expires in 1 hour

      const newUser = await User.create({
        firstname,
        lastname,
        UserType,
        mobilenumber,
        email,
        password: hashedPassword,
        username: firstname,
        lang,
        OTPNumber: otp,
        OTPExpiry: otpExpiry,
        verified: true,
      });

      if (google_signin) {
        const response = {
          success: true,
          user: newUser,
          userId: newUser._id,
          UserType: newUser.UserType,
        };
        return res.status(200).json(response);
      }



      await sendEmail(email, otp);

      const response = {
        success: true,
        user: newUser,
      };




      res.status(200).json(response);
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: RESPONSE_MESSAGES.SERVER_ERROR });
    }
  },

  listUsers: async (req, res) => {
    try {
      // Fetch all users
      const users = await User.find();
      res.status(200).json({ success: true, users });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: "Server error" });
    }
  },

  listgetUsers: async (req, res) => {
    try {
      const { userType } = req.query;

      // Build filter condition
      const filter = {};
      if (userType) {
        filter.UserType = userType;
      }

      // Fetch users with optional filter
      const users = await User.find(filter);

      return res.status(200).json({
        success: true,
        users,
      });
    } catch (error) {
      console.error("listUsers error:", error);
      return res.status(500).json({
        success: false,
        error: "Server error",
      });
    }
  },


  getUsers: async (req, res) => {
    try {
      // Extract usertype and lang from query parameters
      const { UserType, lang } = req.query;

      // Construct the filter object based on provided parameters
      const filter = {};
      if (UserType) filter.UserType = UserType;
      if (lang) filter.lang = lang;

      // Fetch users based on the filter
      const users = await User.find(filter);

      res.status(200).json({ success: true, users });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: "Server error" });
    }
  },

  forgotPassword: async (req, res) => {
    const { email } = req.body;

    try {
      // Find user by email
      const user = await User.findOne({ email });

      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      // Generate a unique reset token
      const resetToken = generateToken();

      // Save the reset token and its expiration time in the user document
      user.resetToken = resetToken;
      user.resetTokenExpiration = Date.now() + 3600000; // Token expires in 1 hour
      await user.save();

      // Send reset email
      await sendResetEmail(user.email, resetToken, "root1223");

      res
        .status(200)
        .json({ success: true, message: "Password reset email sent" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: "Server error" });
    }
  },

  listAdmins: async (req, res) => {
    try {
      const admins = await Admin.find();
      res.status(200).json({ success: true, admins });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: "Server error" });
    }
  },
  requestUser: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { mobilenumber } = req.body;
      const user = await User.findOne({ mobilenumber });

      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      // Send verification code via Twilio SMS
      // const updateOTP = await sendVerificationSMS(`${user.mobilenumber}`);
      // Save the OTP in the user document
      user.OTPNumber = 1234;
      await user.save();

      return res
        .status(200)
        .json({ success: true, message: "Verification SMS sent successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: "Server error" });
    }
  },
  verifyUser: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { email, mobilenumber, otp } = req.body;
      const user = await User.findOne(
        mobilenumber ? { mobilenumber } : { email }
      );

      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      if (user.OTPNumber !== Number(otp)) {
        return res.status(401).json({ success: false, message: "Invalid OTP" });
      }

      // Reset the OTP after successful verification
      user.OTPNumber = null;
      user.verified = true;
      await user.save();

      return res
        .status(200)
        .json({
          success: true,
          message: "OTP verified successfully",
          userId: user._id,
          UserType: user.UserType,
        });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: "Server error" });
    }
  },
  AdminsListDes: async (req, res) => {
    try {
      const admins = await Admin.find();

      var adminsWithData = await Promise.all(
        admins.map(async (admin) => {
          const userData = await User.findById(admin.admin_id);
          admin["admin_id"] = userData;
          console.log(userData);
          return admin;
        })
      );

      res.status(200).json({ success: true, admins: adminsWithData });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: "Server error" });
    }
  },

  deleteAdmin: async (req, res) => {
    try {
      const adminId = req.params.id;

      // Check if the admin with the given ID exists
      const adminToDelete = await Admin.findById(adminId);

      if (!adminToDelete) {
        return res
          .status(404)
          .json({ success: false, error: "Admin not found" });
      }

      // Check if the associated user with the given ID exists
      const userToDelete = await User.findById(adminToDelete.admin_id);

      if (!userToDelete) {
        return res
          .status(404)
          .json({ success: false, error: "User not found" });
      }

      // Delete the admin and associated user
      await Admin.deleteOne({ _id: adminId });
      await User.deleteOne({ _id: adminToDelete.admin_id });

      res.status(200).json({
        success: true,
        message: "Admin and associated user deleted successfully",
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: "Server error" });
    }
  },

  deleteUser: async (req, res) => {
    try {
      const adminId = req.params.id;

      // Check if the admin with the given ID exists
      const adminToDelete = await User.findById(adminId);

      if (!adminToDelete) {
        return res
          .status(404)
          .json({ success: false, error: "User not found" });
      }

      // Delete the admin and associated user
      await User.deleteOne({ _id: adminId });

      res.status(200).json({
        success: true,
        message: "User and associated user deleted successfully",
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: "Server error" });
    }
  },
  deleteUsers: async (req, res) => {
    try {
      const adminId = req.params.id;

      // Check if user exists
      const adminToDelete = await User.findById(adminId);

      if (!adminToDelete) {
        return res.status(404).json({
          success: false,
          error: "User not found",
        });
      }

      // Soft delete: mark user as unverified
      adminToDelete.verified = false;
      await adminToDelete.save();

      res.status(200).json({
        success: true,
        message: "User soft deleted successfully",
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        error: "Server error",
      });
    }
  },

  userGetById: async (req, res) => {
    try {
      const userId = req.params.id;

      // 1️⃣ Fetch user
      const userData = await User.findById(userId).populate("mainAddress");

      if (!userData) {
        return res.status(404).json({
          success: false,
          error: "User not found",
        });
      }

      // 2️⃣ Check verification
      if (!userData.verified) {
        return res.status(401).json({
          success: false,
          message: "Account not Verified",
        });
      }

      // // 3️⃣ Fetch order counts
      // const [
      //   totalOrders,
      //   completedOrders,
      //   inProgressOrders,
      //   confirmedOrders,
      //   ordersWithTasks,
      // ] = await Promise.all([
      //   // 🔢 TOTAL ORDERS
      //   Order.countDocuments({ userId }),

      //   // ✅ COMPLETED ORDERS
      //   Order.countDocuments({
      //     userId,
      //     paymentStatus: "Completed",
      //   }),

      //   // 🔄 IN PROGRESS
      //   Order.countDocuments({
      //     userId,
      //     paymentStatus: "In Progress",
      //   }),

      //   // ⏳ CONFIRMED (Pending start)
      //   Order.countDocuments({
      //     userId,
      //     paymentStatus: "Confirmed",
      //   }),

      //   // Fetch all orders for servicedays calculation
      //   Order.find({ userId }),
      // ]);

      // // 4️⃣ Pending = Confirmed + InProgress
      // const pendingOrders = confirmedOrders + inProgressOrders;

      // // 5️⃣ Calculate servicedays based on completed tasks only
      // let servicedays = 0;
      // ordersWithTasks.forEach((order) => {
      //   servicedays += order.tasks.filter((task) => task.is_done).length;
      // });

      // 6️⃣ Attach orders summary + servicedays to user
      const userObj = userData.toObject();
      // userObj.orders = {
      //   total: totalOrders,
      //   completed: completedOrders,
      //   inProgress: inProgressOrders,
      //   pending: pendingOrders,
      // };
      // userObj.servicedays = servicedays;

      // 7️⃣ Send response
      return res.status(200).json({
        success: true,
        User: userObj,
      });
    } catch (error) {
      console.error("userGetById error:", error);
      return res.status(500).json({
        success: false,
        error: "Server error",
      });
    }
  },


  updateAdmin: async (req, res) => {
    try {
      const adminId = req.params.id;
      const updateData = req.body;

      const userToUpdate = await User.findById(adminId);

      if (!userToUpdate) {
        return res
          .status(404)
          .json({ success: false, error: "User not found" });
      }

      if (userToUpdate.UserType === "2") {
        const updatedAdmin = await updateAdmin(adminId, updateData);

        if (!updatedAdmin) {
          return res
            .status(404)
            .json({ success: false, error: "Admin not found" });
        }

        const updatedUser = await updateUser(adminId, updateData);

        const response = {
          success: true,
          user: updatedUser,
        };

        if (updatedAdmin) {
          response.admin = updatedAdmin;
        }

        res.status(200).json(response);
      } else {
        const updatedUser = await updateUser(adminId, updateData);
        res.status(200).json({ success: true, user: updatedUser });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: "Server error" });
    }
  },

  updateUsers: async (req, res) => {
    try {
      const UserId = req.params.id;
      const updateData = req.body;

      const userToUpdate = await User.findById(UserId);

      if (!userToUpdate) {
        return res
          .status(404)
          .json({ success: false, error: "User not found" });
      }

      if (userToUpdate.UserType === "2") {
        const updatedAdmin = await updateAdmin(UserId, updateData);

        if (!updatedAdmin) {
          return res
            .status(404)
            .json({ success: false, error: "User not found" });
        }

        const updatedUser = await updateUser(UserId, updateData);

        const response = {
          success: true,
          user: updatedUser,
        };

        if (updatedAdmin) {
          response.admin = updatedAdmin;
        }

        res.status(200).json(response);
      } else {
        const updatedUser = await updateUser(UserId, updateData);
        res.status(200).json({ success: true, user: updatedUser });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: "Server error" });
    }
  },
  userImageGetById: async (req, res) => {
    try {
      const userId = req.params.id;
      const { profile_img, firstName, lastName } = req.body;
      const imageUrl = req.fileUrls ? req.fileUrls['file'] : null;

      // Check if the user with the given ID exists
      const userData = await User.findById(userId);

      if (!userData) {
        return res.status(404).json({ success: false, error: "User not found" });
      }

      // Update the profile_img if provided
      if (profile_img !== undefined && profile_img !== null) {
        userData.profile_img = profile_img;
      }
      // Update the profile_img if provided
      if (firstName !== undefined && firstName !== null) {
        userData.firstname = firstName;
      }
      // Update the profile_img if provided
      if (lastName !== undefined && lastName !== null) {
        userData.lastname = lastName;
      }

      // Update the profile_img if provided
      if (imageUrl !== undefined && imageUrl !== null) {
        userData.profile_img = imageUrl[0];
      }

      // Save the updated user
      await userData.save();

      res.status(200).json({
        success: true,
        user: userData,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: "Server error" });
    }
  },
  verifyEmailOTP: async (req, res) => {
    try {
      const { email, otp } = req.body;
      const user = await User.findOne({ email });

      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }

      if (user.OTPNumber !== otp || user.OTPExpiry < Date.now()) {
        return res.status(401).json({ success: false, message: "Invalid or expired OTP" });
      }

      // Reset the OTP and mark the user as verified
      user.OTPNumber = null;
      user.OTPExpiry = null;
      user.verified = true;
      await user.save();

      res.status(200).json({ success: true, message: "Email verified successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: "Server error" });
    }
  },
  createEmployee: async (req, res) => {
    try {
      const data = req.body;

      // ✅ Check existing email
      const existingEmail = await User.findOne({ email: data.email });
      if (existingEmail) {
        return res.status(400).json({ success: false, message: "Email already exists" });
      }

      // ✅ Hash password
      const hashedPassword = await bcrypt.hash(data.password, 10);

      const employeeData = {
        firstname: data.firstname,
        lastname: data.lastname,
        email: data.email,
        mobilenumber: data.mobilenumber,
        password: hashedPassword,
        UserType: "2",

        employee: {
          role: data.role || "",
          salary: data.salary || 0,
          joining_date: data.joining_date || new Date(),
        },

        vehicle: {
          vehicle_type: data.vehicle_type || "",
          vehicle_number: data.vehicle_number || "",
          vehicle_name: data.vehicle_name || "",
        },

        documents: {
          driving_license: req.files?.driving_license?.[0]?.filename || "",
          aadhar_card: req.files?.aadhar_card?.[0]?.filename || "",
          vehicle_rc: req.files?.vehicle_rc?.[0]?.filename || "",
        },

        bank_details: {
          bank_name: data.bank_name || "",
          account_number: data.account_number || "",
          ifsc_code: data.ifsc_code || "",
        },

        location: {
          address: data.address || "",
          city: data.city || "",
          state: data.state || "",
        },
      };

      const user = await User.create(employeeData);

      res.status(201).json({ success: true, data: user });

    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, error: err.message });
    }
  }
  ,
  updateEmployee: async (req, res) => {
    try {
      const data = req.body;

      const updateData = {
        firstname: data.firstname,
        lastname: data.lastname,
        mobilenumber: data.mobilenumber,

        "employee.role": data.role,
        "employee.salary": data.salary,

        "vehicle.vehicle_type": data.vehicle_type,
        "vehicle.vehicle_number": data.vehicle_number,
        "vehicle.vehicle_name": data.vehicle_name,

        "bank_details.bank_name": data.bank_name,
        "bank_details.account_number": data.account_number,
        "bank_details.ifsc_code": data.ifsc_code,

        "location.address": data.address,
        "location.city": data.city,
        "location.state": data.state,
      };

      // ✅ File updates
      if (req.files?.driving_license) {
        updateData["documents.driving_license"] = req.files.driving_license[0].filename;
      }
      if (req.files?.aadhar_card) {
        updateData["documents.aadhar_card"] = req.files.aadhar_card[0].filename;
      }
      if (req.files?.vehicle_rc) {
        updateData["documents.vehicle_rc"] = req.files.vehicle_rc[0].filename;
      }

      const user = await User.findByIdAndUpdate(
        req.params.id,
        { $set: updateData },
        { new: true }
      );

      res.json({ success: true, data: user });

    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, error: err.message });
    }
  },
  listEmployees: async (req, res) => {
    try {
      const users = await User.find({ UserType: "2" })
        .select("-password")
        .sort({ created_at: -1 });

      res.json({ success: true, users });

    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },
  getEmployeeById: async (req, res) => {
    try {
      const user = await User.findById(req.params.id).select("-password");

      if (!user) {
        return res.status(404).json({ success: false, message: "Employee not found" });
      }

      res.json({ success: true, user });

    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  getEmployeeById: async (req, res) => {
    try {
      const user = await User.findById(req.params.id).select("-password");

      if (!user) {
        return res.status(404).json({ success: false, message: "Employee not found" });
      }

      res.json({ success: true, user });

    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  }, deleteEmployee: async (req, res) => {
    try {
      const user = await User.findByIdAndDelete(req.params.id);

      if (!user) {
        return res.status(404).json({ success: false, message: "Employee not found" });
      }

      res.json({ success: true, message: "Employee deleted successfully" });

    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

};