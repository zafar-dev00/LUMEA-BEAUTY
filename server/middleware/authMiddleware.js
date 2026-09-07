const { verifyToken } = require('../utils/jwt');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Requires a valid "Authorization: Bearer <token>" header.
 * Attaches the authenticated user (without password) to req.user.
 */
const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization || '';

  if (!authHeader.startsWith('Bearer ')) {
    throw new ApiError(401, 'Authentication required');
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    throw new ApiError(401, 'Authentication required');
  }

  let decoded;
  try {
    decoded = verifyToken(token);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw new ApiError(401, 'Session expired, please log in again');
    }
    throw new ApiError(401, 'Invalid authentication token');
  }

  const user = await User.findById(decoded.id);

  if (!user) {
    throw new ApiError(401, 'User account no longer exists');
  }

  if (!user.isActive) {
    throw new ApiError(403, 'This account has been deactivated');
  }

  req.user = user; // full mongoose doc; password is select:false so it's already excluded
  next();
});

/**
 * Restricts a route to specific roles.
 * Usage: authorizeRoles('ADMIN')
 * Must run after `protect`.
 */
const authorizeRoles =
  (...roles) =>
  (req, res, next) => {
    if (!req.user) {
      throw new ApiError(401, 'Authentication required');
    }
    if (!roles.includes(req.user.role)) {
      throw new ApiError(403, 'You do not have permission to perform this action');
    }
    next();
  };

/**
 * Convenience chain for admin-only routes: requires a valid JWT AND the
 * ADMIN role. The role check always runs against req.user loaded fresh
 * from MongoDB in `protect` — never trusted from anything the client sends.
 * Usage: router.use(adminOnly) or router.get('/x', ...adminOnly, handler)
 */
const adminOnly = [protect, authorizeRoles('ADMIN')];

module.exports = { protect, authorizeRoles, adminOnly };
