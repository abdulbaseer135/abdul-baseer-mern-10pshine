const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/env');
const { findById } = require('../dal/users.dal');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

// ✅ Protect route — verify JWT token and attach user to request
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // ✅ Extract token from Authorization header
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw new ApiError(401, 'Not authorized, no token provided');
  }

  let decoded;
  try {
    // ✅ Verify JWT token
    decoded = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    // Sonar: handle caught exception - specific JWT error messages
    const errorMessage = 
      err.name === 'TokenExpiredError' ? 'Token has expired' :
      err.name === 'JsonWebTokenError' ? 'Invalid token' :
      'Token verification failed';
    
    console.error('[Auth Middleware] Token verification failed:', {
      error: err.name,
      message: errorMessage,
      ip: req.ip,
    });
    
    throw new ApiError(401, errorMessage);
  }

  if (!decoded?.id) {
    throw new ApiError(401, 'Invalid token structure');
  }

  // ✅ Fetch user from database
  let user;
  try {
    user = await findById(decoded.id);
  } catch (err) {
    // Sonar: handle caught exception - database errors
    console.error('[Auth Middleware] User lookup failed:', {
      userId: decoded.id,
      error: err?.message,
    });
    throw new ApiError(500, 'Failed to retrieve user information');
  }

  if (!user) {
    console.error('[Auth Middleware] User not found:', {
      userId: decoded.id,
    });
    throw new ApiError(401, 'User no longer exists');
  }

  req.user = user;
  next();
});

module.exports = { protect };