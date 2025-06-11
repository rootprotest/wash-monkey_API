const functions = require("firebase-functions");
const express = require("express");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();



app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));




// Email configuration
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  auth: {
    user: "noreply@imsolutions.mobi",
    pass: "ssfnuabpmshuhlwj",
  },
});

// Function to validate email
function validateEmail(email) {
  // Using a more comprehensive regular expression for email validation
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

// Function to validate mobile number
function validateMobile(phone) {
  // Assuming phone number should contain only digits and be of a certain length
  const regex = /^\d{10}$/;
  return regex.test(phone);
}


app.post("/submit-form", (req, res) => {
  const { name, email, phone, message, subject, additionalRecipients } = req.body;

  const subjects = `Enquiry from ${subject}`;

  // Validate email and phone number
  if (!validateEmail(email)) {
    return res.status(400).send("Invalid email address");
  }

  if (!validateMobile(phone)) {
    return res.status(400).send("Invalid phone number");
  }

  const emailContent = `
    <p>Name: ${name}</p>
    <p>Email: ${email}</p>
    <p>Phone: ${phone}</p>
    <p>Message: ${message}</p>
    <table cellspacing="0" cellpadding="0" style="width:100%; border-bottom:1px solid #eee; font-size:12px; line-height:135%">
        <!-- ... (same as PHP code) ... -->
    </table>
    `;


      // Initialize array to hold all recipients
  let allRecipients = [
   // "sadamdon4752@gmail.com",
      "atul@imsolutions.mobi",
      "aqib@imsolutions.mobi",
      "info@imsolutions.mobi"
  ];

  // Check if additionalRecipients exists and is an array
  if (Array.isArray(additionalRecipients)) {
    // Include additional recipients if present
    allRecipients = allRecipients.concat(additionalRecipients);
  }

  const mailOptions = {
    from: `${subjects} <noreply@ims.a2hosted.com>`,
    // to: [
    //   "atul@imsolutions.mobi",
    //   "aqib@imsolutions.mobi",
    //   // "digital.myspacerealty@gmail.com",
    //   // "nageshmyspacerealty@gmail.com",
    // ],
    to: allRecipients,
    subject: subjects,
    html: emailContent,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    } else {
      console.log("Email sent: " + info.response);
      res.status(200).send("Email sent successfully");
    }
  });
});

app.post("/local-heros-submit-form", (req, res) => {
  const { name, email, pinCode, phone, productName, quantity ,message} = req.body;

  const subjects = pinCode !== undefined ? `Bulk Order for ${productName}` :"";

  // Validate email and phone number
  if (!validateEmail(email)) {
    return res.status(400).send("Invalid email address");
  }

  if (!validateMobile(phone)) {
    return res.status(400).send("Invalid phone number");
  }

  const emailContent = pinCode !== undefined ?  `
    <p>Name: ${name}</p>
    <p>Email: ${email}</p>
    <p>Pin Code: ${pinCode}</p>
    <p>Phone: ${phone}</p>
    <p>Product Name: ${productName}</p>
    <p>Quantity: ${quantity}</p>
    <table cellspacing="0" cellpadding="0" style="width:100%; border-bottom:1px solid #eee; font-size:12px; line-height:135%">
        <!-- ... (same as PHP code) ... -->
    </table>
  ` :  `
  <p>Name: ${name}</p>
  <p>Email: ${email}</p>
  <p>Phone: ${phone}</p>
  <p>Message: ${message}</p>
  <table cellspacing="0" cellpadding="0" style="width:100%; border-bottom:1px solid #eee; font-size:12px; line-height:135%">
      <!-- ... (same as PHP code) ... -->
  </table>
`;

  const mailOptions = {
    from: `${subjects} <noreply@ims.a2hosted.com>`,
    to: [
      "info@imsolutions.mobi",
      "shashi@localheros.in"
    ],
    subject: subjects,
    html: emailContent,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    } else {
      console.log("Email sent: " + info.response);
      res.status(200).send("Email sent successfully");
    }
  });
});


exports.emailjs = functions.https.onRequest(app);





// {
//     "name": "functions",
//     "description": "Cloud Functions for Firebase",
//     "scripts": {
//       "serve": "firebase emulators:start --only functions",
//       "shell": "firebase functions:shell",
//       "start": "npm run shell",
//       "deploy": "firebase deploy --only functions",
//       "logs": "firebase functions:log"
//     },
//     "engines": {
//       "node": "18"
//     },
//     "main": "index.js",
//     "dependencies": {
//       "axios": "^0.24.0",
//       "bcrypt": "^5.1.1",
//       "body-parser": "^1.19.0",
//       "cors": "^2.8.5",
//       "express": "^4.17.1",
//       "express-validator": "^7.0.1",
//       "firebase-admin": "^11.8.0",
//       "firebase-functions": "^4.3.1",
//       "nodemailer": "^6.9.1",
//       "nodemon": "^3.0.3"
//     },
//     "devDependencies": {
//       "firebase-functions-test": "^3.1.0"
//     },
//     "private": true
//   }
  