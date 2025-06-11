// utils/emailConfig.js
const nodemailer = require('nodemailer');

// const transporter = nodemailer.createTransport({
//   host: "sandbox.smtp.mailtrap.io",
//     port: 2525,
//     auth: {
//       user: "52e457dc9e0503",
//       pass: "8858da8e33ed5d"
//     }
// });
const transporter = nodemailer.createTransport({
  host: "email-smtp.eu-north-1.amazonaws.com",
    port: 587,
    auth: {
      user: "AKIA5FTY6PUG2AGWDY56",
      pass: "BA+HXUGZU5tkiOZhLxyHKF33tNZf2/dByo/y3OUnCpVV"
    }
});

module.exports = transporter;
