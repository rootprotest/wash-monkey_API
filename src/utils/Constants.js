const RESPONSE_MESSAGES = {
    EMAIL_TAKEN: "Email is already taken",
    MOBILE_TAKEN: "Mobile number is already taken",
    USERNAME_TAKEN: "Username is already taken",
    SERVER_ERROR: "Server error",
  };

  const BASEURL = {
    // baseUrl: "http://localhost:5000/image/",
    baseUrl: "http://ec2-13-48-245-166.eu-north-1.compute.amazonaws.com:5000/",
   
  };

  
  module.exports = { RESPONSE_MESSAGES,BASEURL };
