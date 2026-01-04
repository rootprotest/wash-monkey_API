// app.js
const express = require("express");
const path = require("path");
const fs = require("fs");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const csrf = require("csurf");
const cookieParser = require("cookie-parser");
require("dotenv").config({
  path: process.env.NODE_ENV === "production" ? ".env.production" : ".env"
});

const PORT = process.env.PORT || 4000;
const FRONTEND_URL = process.env.FRONTEND_URL;
const NODE_ENV = process.env.NODE_ENV;

// Import routes
const authRoutes = require("./routes/authRoutes");
const UserController = require("./routes/UserRoutes/userRoutes");
const categoryRoutes = require("./routes/categoryRoutes/categoryRoutes");
const productRoutes = require("./routes/ProductRoutes/productRoutes");
const couponRoutes = require("./routes/couponRoutes/CouponRouter");
const addressRoutes = require("./routes/AddressRoutes/addressRoutes");
const orderRoutes = require("./routes/OrderRoutes/orderRoutes");
const BannerRoutes = require("./routes/BannerRouters/BannerRoutes");
const EmployeeRoutes = require("./routes/AddEmployess/addEmployeesRoutes");
const FAQRoutes = require("./routes/AddFaqRoutes/faqRoutes");
const RatingRoute = require("./routes/AddRatingRoutes/RatingRoutes");
const EventRoute = require("./routes/AddEventRoutes/EventRoutes");
const BlogRoutes = require("./routes/AddBlogsRoutes/BlogRoutes");
const ReviewRoutes = require("./routes/AddRatingRoutes/RatingRoutes");
const VehicleRoutes = require("./routes/AddVehicleRoutes/VehicleRoutes");
const helpSupportRoutes = require("./routes/AddHelpSupport/helpSupportRoutes");
const activityList = require("./routes/AddActivity/activity");
const User = require("../src/models/UserModel/User");

const app = express();

// ------------------- MIDDLEWARE -------------------
const allowedOrigins = [
  "https://washmonkey.in",
  "https://washmonkeyclean.web.app",
];
app.use(cors());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());

// Helmet security
if (NODE_ENV === "production") {
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);  app.use(
    helmet.contentSecurityPolicy({
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:"],
        objectSrc: ["'none'"],
        connectSrc: ["'self'"],
        upgradeInsecureRequests: [],
      },
    })
  );
  app.use(helmet.hsts({ maxAge: 31536000, includeSubDomains: true, preload: true }));
  app.use(helmet.frameguard({ action: "deny" }));
  app.use(helmet.xssFilter());
}

// Rate limiter for password resets
const resetLimiter =
  NODE_ENV === "production"
    ? rateLimit({ windowMs: 15 * 60 * 1000, max: 5, message: "Too many attempts, try later." })
    : (req, res, next) => next();

// CSRF protection
const csrfProtection = NODE_ENV === "production" ?  csrf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  },
}) : (req, res, next) => next();

// Enforce HTTPS in production
if (NODE_ENV === "production") {
  app.use((req, res, next) => {
    if (req.headers["x-forwarded-proto"] !== "https") {
      return res.redirect(`https://${req.headers.host}${req.url}`);
    }
    next();
  });
}


// ------------------- MONGOOSE -------------------
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

// ------------------- ROOT ROUTE -------------------
app.get("/", (req, res) => {
  if (NODE_ENV === "production") {
    return res.redirect(FRONTEND_URL);
  } else {
    res.send("Server running in development mode!");
  }
});
const resetCsp = (req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'"
  );
  next();
};
// ------------------- ROUTES -------------------
app.use("/api/auth", authRoutes);
app.use("/api/user", UserController);
app.use("/api/category", categoryRoutes);
app.use("/api/product", productRoutes);
app.use("/api/coupon", couponRoutes);
app.use("/api/address", addressRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/header", BannerRoutes);
app.use("/api/staff", EmployeeRoutes);
app.use("/api/faq", FAQRoutes);
app.use("/api/review", RatingRoute);
app.use("/api/event", EventRoute);
app.use("/api/blog", BlogRoutes);
app.use("/api/reviews", ReviewRoutes);
app.use("/api/vehicles", VehicleRoutes);
app.use("/api/support", helpSupportRoutes);
app.use("/api/activity", activityList);


app.get("/reset", async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).send("Reset token is required.");
  }

  try {
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiration: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).send("Reset link is invalid or has expired.");
    }

    res.setHeader("Content-Type", "text/html");

    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Reset Password</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: Arial, sans-serif;
            background: #f4f6f8;
            padding: 40px;
          }
          form {
            background: #ffffff;
            padding: 25px;
            max-width: 420px;
            margin: auto;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          }
          h2 {
            text-align: center;
            margin-bottom: 20px;
          }
          label {
            font-weight: bold;
            display: block;
            margin-top: 12px;
          }
          input {
            width: 100%;
            padding: 10px;
            margin-top: 6px;
            border: 1px solid #ccc;
            border-radius: 5px;
          }
          button {
            margin-top: 20px;
            width: 100%;
            padding: 12px;
            background: #28a745;
            color: #fff;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
          }
          button:hover {
            background: #218838;
          }
          .hint {
            font-size: 12px;
            color: #666;
            margin-top: 5px;
          }
        </style>
      </head>
      <body>
        <form method="POST" action="/reset">
          <h2>Reset Your Password</h2>

          <input type="hidden" name="token" value="${token}" />

          <label>New Password</label>
          <input type="password" name="password" required />
          <div class="hint">
            Must be at least 8 characters, include uppercase, lowercase, number & symbol.
          </div>

          <label>Confirm Password</label>
          <input type="password" name="confirmPassword" required />

          <button type="submit">Reset Password</button>
        </form>
      </body>
      </html>
    `);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error.");
  }
});



app.post("/reset", async (req, res) => {
  const { token, password, confirmPassword } = req.body;

  if (!token || !password || !confirmPassword) {
    return res.status(400).send("All fields are required.");
  }

  if (password !== confirmPassword) {
    return res.status(400).send("Passwords do not match.");
  }

  // 🔐 Password strength check
  if (password.length < 8) {
    return res.status(400).send("Password must be at least 8 characters.");
  }

  try {
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiration: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).send("Reset token is invalid or expired.");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiration = undefined;

    await user.save();

    // ✅ Success page instead of blind redirect
    res.send(`
      <html>
        <head>
          <title>Password Reset Successful</title>
          <style>
            body {
              font-family: Arial;
              background: #f4f6f8;
              text-align: center;
              padding-top: 80px;
            }
            a {
              display: inline-block;
              margin-top: 20px;
              padding: 12px 20px;
              background: #007bff;
              color: white;
              text-decoration: none;
              border-radius: 5px;
            }
            a:hover {
              background: #0056b3;
            }
          </style>
        </head>
        <body>
          <h2>✅ Password Reset Successful</h2>
          <p>You can now log in with your new password.</p>
          <a href="https://mail.google.com/">Open Gmail</a>
        </body>
      </html>
    `);
  } catch (error) {
    console.error("RESET POST ERROR:", error);
    res.status(500).send("Internal server error.");
  }
});





// ------------------- GLOBAL 404 -------------------
app.use((req, res) => {
  res.status(404).send("Page not found");
});

// ------------------- START SERVER -------------------
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${NODE_ENV} mode`);
});
