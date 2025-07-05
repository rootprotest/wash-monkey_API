// app.js
const express = require("express");
const ExcelJS = require('exceljs');
// const functions = require("firebase-functions");
const path = require("path");
const fs = require("fs");
const axios = require('axios');
const cors = require("cors"); // Import cors middleware
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const multer = require('multer');
const authRoutes = require("./routes/authRoutes");
const UserController = require("./routes/UserRoutes/userRoutes");
const categoryRoutes = require("./routes/categoryRoutes/categoryRoutes");
const brandRoutes = require("./routes/BrandRoutes/brandRoutes");
const SubBrandRoutes = require("./routes/SubBrandRoutes/subBrandRoutes")
const productRoutes = require("./routes/ProductRoutes/productRoutes");
const couponRoutes = require("./routes/couponRoutes/CouponRouter");
const addressRoutes = require("./routes/AddressRoutes/addressRoutes");
const addcartRoutes = require("./routes/AddCartRoutes/addCartRoutes");
const orderRoutes = require("./routes/OrderRoutes/orderRoutes");
const BannerRoutes = require("./routes/BannerRouters/BannerRoutes");
const EmployeeRoutes = require("./routes/AddEmployess/addEmployeesRoutes")
const FAQRoutes = require("./routes/AddFaqRoutes/faqRoutes")
const RatingRoute = require("./routes/AddRatingRoutes/RatingRoutes")
const EventRoute = require("./routes/AddEventRoutes/EventRoutes")
const BlogRoutes = require("./routes/AddBlogsRoutes/BlogRoutes")
const WishlistRoutes = require("./routes/addwishlistRouters/WishlistRoutes")
const User = require("../src/models/UserModel/User");
const ReviewRoutes = require("./routes/AddRatingRoutes/RatingRoutes")

const bcrypt = require("bcrypt");

// const files = fs.readFileSync('./62ACF8182B9E5DCCC1E610CE4B2C525F.txt') 
const cheerio   = require('cheerio');
const app = express();

const nodemailer = require('nodemailer');
const { log } = require("console");
// const json = require('./service-account-name-accountid.json');

const clientId = '1000.UJO1R63JR5AUE9NUK0V1GIJ6A7M7BR';
const clientSecret = '91b46a114cf1db78fa5918b170523d52ab4d9167f3';
const redirectUri = 'https://winter-bear-client.web.app/Allbrand';
const refreshToken = 'your_refresh_token';
let accessToken = 'your_access_token';
// Use cors middleware
app.use(cors());
// Define the upload directory
const uploadDir = path.join(__dirname, 'uploads');

// Create the directory if it doesn't exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const port = process.env.PORT || 4000;



mongoose.connect(
  "mongodb+srv://monkeywashcleans:12Mc5UBGTaJA2BDQ@cluster0.mp1mruh.mongodb.net/monkeywashdb?retryWrites=true&w=majority&appName=Cluster0"
);

// Additional setup, if any

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
// Use routes

app.use("/api/auth", authRoutes);
app.use("/api/user", UserController);
app.use("/api/category", categoryRoutes);
app.use("/api/brand", brandRoutes);
app.use("/api/sub-brand", SubBrandRoutes);
app.use("/api/product", productRoutes);
app.use("/api/coupon", couponRoutes);
app.use("/api/address", addressRoutes);
app.use("/api/addcart", addcartRoutes);
app.use("/api/wishlist", WishlistRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/header", BannerRoutes);
app.use("/api/staff", EmployeeRoutes);
app.use("/api/faq", FAQRoutes);
app.use("/api/review",RatingRoute);
app.use("/api/event",EventRoute); 
app.use("/api/blog",BlogRoutes);
app.use("/api/reviews",ReviewRoutes);

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






// Endpoint for uploading and processing Excel file
app.get('/upload-excel', async (req, res) => {
  try {
    const filePath = "/home/root-mac/Documents/GitHub/winterbear-backend/product-image.xlsx";
    const uploadFolder = path.join(__dirname, 'uploaded_images'); // Folder where images will be uploaded

    // Ensure the upload folder exists, create if not
    if (!fs.existsSync(uploadFolder)) {
      fs.mkdirSync(uploadFolder);
    }

    // Create a new workbook and read the file
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);

    // Get the first worksheet (you can change the index if needed)
    const worksheet = workbook.getWorksheet(1);

    // Define the headers you expect in the Excel file
    const expectedHeaders = [
      'Product Image',
      'SKU No',
      'Product Name',
      'Category',
      'Sub-category',
      'Brand',
      'Basic Description',
      'MRP'
    ];

    // Convert worksheet rows to JSON
    const jsonData = [];
    worksheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
      if (rowNumber === 1) {
        // Assuming first row contains headers
        const headers = row.values;
        headers.shift(); // Remove the first empty element
        if (headers.length !== expectedHeaders.length) {
          throw new Error('Header length does not match expected headers');
        }
      } else {
        let data = {};
        row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
          const header = expectedHeaders[colNumber - 1];
          data[header] = cell.value;
        });

        // If the row contains an image, process it
        const imageCell = row.getCell(1); // Assuming the image is in the first column
        const imageId = imageCell.value;

        if (imageId && workbook.model.media) {
          const media = workbook.model.media.find(item => item.index === imageId);

          if (media) {
            const imageBuffer = Buffer.from(media.buffer, 'base64');
            const imagePath = path.join(uploadFolder, `${data['Product Name']}_${imageId}.${media.extension}`);
            
            // Write image to file
            // fs.writeFileSync(imagePath, imageBuffer);
            console.log(imagePath, imageBuffer);
            
            // Update data with image path
            data['Product Image'] = imagePath;
          }
        }

        jsonData.push(data);
      }
    });

    // Send the JSON response
    res.json(jsonData);
  } catch (error) {
    res.status(500).json({ error: 'Error processing file', details: error.message });
  }
});
// Configure Multer to use disk storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir); // Use the upload directory defined earlier
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB limit
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ['image/png', 'image/jpg', 'image/jpeg', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(null, false);
      const err = new Error('Only .png, .jpg, .jpeg, .pdf, .doc, and .docx formats are allowed!');
      err.name = 'ExtensionError';
      return cb(err);
    }
  }
}).fields([
  { name: 'images', maxCount: 6 },
  { name: 'imageFile', maxCount: 6 },
  { name: 'ImgDesktop', maxCount: 6 },
  { name: 'ImgMobile', maxCount: 6 },
  { name: 'file', maxCount: 1 },
  { name: 'fileatt', maxCount: 1 }
]);

const uploadHandler = (req, res, next) => {
  upload(req, res, (err) => {
    if (err) {
      console.error('Multer error:', err);
      return res.status(400).json({ success: false, error: 'Multer error', details: err.message });
    }

    if (req.files) {
      req.fileUrls = {};
      Object.keys(req.files).forEach(fieldName => {
        req.fileUrls[fieldName] = req.files[fieldName].map(file => {
          const fileUrl = `${req.protocol}://${req.get('host')}/src/uploads/${file.filename}`;
          return fileUrl;
        });
      });
    }

    next();
  });
};

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  auth: {
    user: "noreply@imsolutions.mobi",
    pass: "ssfnuabpmshuhlwj",
  },
});

app.post('/submit-return', uploadHandler, (req, res) => {
  const { name, email, city, phone, post1, experience, msg, additionalRecipients, subjects } = req.body;
  const file = req.files && req.files['fileatt'] && req.files['fileatt'][0];
  
  if (!name || !email || !city || !phone || !post1 || !experience || !msg || !additionalRecipients || !subjects) {
    return res.status(400).send({ message: 'Please fill all details.' });
  }

  if (!file) {
    return res.status(400).send({ message: 'File attachment is missing.' });
  }

  // Check if additionalRecipients exists and is an array
  let allRecipients = [];
  try {
    allRecipients = JSON.parse(additionalRecipients);
    if (!Array.isArray(allRecipients)) {
      allRecipients = [];
    }
  } catch (error) {
    allRecipients = [];
  }

  const mailOptions = {
    from: 'noreply@imsolutions.mobi',
    to: allRecipients,
    subject: `Enquiry From ${subjects}`,
    html: `
      <table cellspacing="0" cellpadding="0" style="width:100%; border-bottom:1px solid #eee; font-size:12px; line-height:135%">
        <tr style="background-color:#f5f5f5">
          <th style="vertical-align:top; color:#222; text-align:left; padding:7px 9px; border-top:1px solid #eee">Name <span style="color:red">*</span></th>
          <td style="vertical-align:top; color:#333; width:60%; padding:7px 9px; border-top:1px solid #eee">${name}</td>
        </tr>
        <tr>
          <th style="vertical-align:top; color:#222; text-align:left; padding:7px 9px; border-top:1px solid #eee">Email <span style="color:red">*</span></th>
          <td style="vertical-align:top; color:#333; width:60%; padding:7px 9px; border-top:1px solid #eee">${email}</td>
        </tr>
        <tr style="background-color:#f5f5f5">
          <th style="vertical-align:top; color:#222; text-align:left; padding:7px 9px; border-top:1px solid #eee">City <span style="color:red">*</span></th>
          <td style="vertical-align:top; color:#333; width:60%; padding:7px 9px; border-top:1px solid #eee">${city}</td>
        </tr>
        <tr>
          <th style="vertical-align:top; color:#222; text-align:left; padding:7px 9px; border-top:1px solid #eee">Phone Number <span style="color:red">*</span></th>
          <td style="vertical-align:top; color:#333; width:60%; padding:7px 9px; border-top:1px solid #eee">${phone}</td>
        </tr>
        <tr style="background-color:#f5f5f5">
          <th style="vertical-align:top; color:#222; text-align:left; padding:7px 9px; border-top:1px solid #eee">Post <span style="color:red">*</span></th>
          <td style="vertical-align:top; color:#333; width:60%; padding:7px 9px; border-top:1px solid #eee">${post1}</td>
        </tr>
        <tr>
          <th style="vertical-align:top; color:#222; text-align:left; padding:7px 9px; border-top:1px solid #eee">Experience <span style="color:red">*</span></th>
          <td style="vertical-align:top; color:#333; width:60%; padding:7px 9px; border-top:1px solid #eee">${experience}</td>
        </tr>
        <tr style="background-color:#f5f5f5">
          <th style="vertical-align:top; color:#222; text-align:left; padding:7px 9px; border-top:1px solid #eee">Message <span style="color:red">*</span></th>
          <td style="vertical-align:top; color:#333; width:60%; padding:7px 9px; border-top:1px solid #eee">${msg}</td>
        </tr>
      </table>
    `,
    attachments: [
      {
        filename: file.originalname,
        path: file.path
      }
    ]
  };

  
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      // Delete the uploaded file in case of error
      fs.unlink(file.path, (err) => {
        if (err) {
          console.error('Error deleting the file:', err);
        }
        return res.status(500).send({ message: error.toString() });
      });
    } else {
      // Delete the uploaded file after sending the email
      fs.unlink(file.path, (err) => {
        if (err) {
          console.error('Error deleting the file:', err);
        }
        res.status(200).send({ message: 'Email sent successfully!' });
      });
    }
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
                                                                                  


