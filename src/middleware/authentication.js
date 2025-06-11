// authentication.js
const jwt = require('jsonwebtoken');

const secretKey = process.env.SECRET_KEY || 'mn1f4mfulKNrMZ0aAqbrw';

const authenticateToken = (req, res, next) => {
  const token = req.header('Authorization');
  console.log('Received token:', token);

  if (!token) return res.sendStatus(401);

  jwt.verify(token.split(' ')[1], secretKey, (err, user) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token has expired' });
      }
      console.error(err);
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

module.exports = authenticateToken;
