const express = require("express");
const UserController = require("../../controllers/UserController/UserController");
const { body } = require("express-validator");
const { uploadHandler } = require("../../Image/multerSetup")

const router = express.Router();

// Login endpoint
router.post("/login", UserController.login);

// Register user endpoint
router.post(
  "/register",
  [
    body("email").isEmail().withMessage("Invalid email"),
    body("password").isLength({ min: 6 }).withMessage("Password too short"),
  ],
  UserController.register
);

// Get all users endpoint
router.get("/list", UserController.listUsers);

router.get("/userGetById/:id", UserController.userGetById);

// Get all users endpoint
router.get("/getUser", UserController.getUsers);

// Forgot Password Endpoint
router.post("/forgot-password", UserController.forgotPassword);

// Get all admins endpoint
router.get("/admins", UserController.listAdmins);

// Get all admins endpoint
router.post("/verify-otp", UserController.verifyUser);

// Get all admins endpoint
router.get("/request-otp", UserController.requestUser);

router.get("/adminUser", UserController.AdminsListDes);

// DELETE an admin by ID
router.delete("/admins/:id", UserController.deleteAdmin);

// DELETE an User by Id
router.delete("/deleteUser/:id", UserController.deleteUser);


// Update an admin by ID
router.put("/admins/:id", UserController.updateAdmin);

// Update an admin by ID
router.put("/User/:id", UserController.updateUsers);

router.post("/UserImage/:id",uploadHandler,UserController.userImageGetById);


router.post("/verify-email-otp", UserController.verifyEmailOTP);


module.exports = router;