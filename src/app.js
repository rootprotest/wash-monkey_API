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
  if (!token) return res.status(400).send("Token is required");

  try {
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiration: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).send("Invalid or expired token");
    }

    // Serve HTML form with hidden token field
    res.send(`
      <html>
        <head>
          <title>Reset Password</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 50px; }
            input { padding: 8px; margin: 5px 0; width: 100%; }
            button { padding: 10px; background-color: #28a745; color: white; border: none; cursor: pointer; }
            form { max-width: 400px; margin: auto; }
          </style>
        </head>
        <body>
          <h2>Reset Your Password</h2>
          <form method="POST" action="/reset">
            <input type="hidden" name="token" value="${token}" />
            <label>New Password:</label>
            <input type="password" name="password" required />
            <label>Confirm Password:</label>
            <input type="password" name="confirmPassword" required />
            <button type="submit">Submit</button>
          </form>
        </body>
      </html>
    `);
  } catch (err) {
    console.error(err);
    res.status(500).send("Something went wrong");
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

  try {
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiration: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).send("Invalid or expired token.");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiration = undefined;

    await user.save();

    // ✅ Redirect to Gmail after successful password reset
    res.redirect("https://mail.google.com/");
  } catch (err) {
    console.error(err);
    res.status(500).send("Something went wrong");
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
