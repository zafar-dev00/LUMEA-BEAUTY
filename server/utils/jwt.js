const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/env');

const TOKEN_EXPIRY = '7d';

const signToken = (user) => {
  return jwt.sign({ id: user._id.toString(), role: user.role }, jwtSecret, {
    expiresIn: TOKEN_EXPIRY,
  });
};

const verifyToken = (token) => jwt.verify(token, jwtSecret);

module.exports = { signToken, verifyToken, TOKEN_EXPIRY };
