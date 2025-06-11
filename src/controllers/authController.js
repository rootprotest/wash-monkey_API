// authController.js
const jwt = require('jsonwebtoken');
const secretKey = process.env.SECRET_KEY || 'mn1f4mfulKNrMZ0aAqbrw';

const generateToken = (user) => {
  const token = jwt.sign(user, secretKey, { expiresIn: '15m' });
  return token;
};

const authenticateUser = (email, password) => {
  if (email === 'sadam' && password === 'password123') {
    const user = { id: 1, email: 'sadam' };
    return generateToken(user);
  }
  return null;
};

const getNewToken = (req, res) => {
  const { email, password } = req.body;

  const token = authenticateUser(email, password);

  if (token) {
    res.status(200).json({ success: true, token });
  } else {
    res.status(401).json({ success: false, error: 'Invalid credentials' });
  }
};

module.exports = {
  getNewToken,
  // Add other authentication-related controller methods here
};
