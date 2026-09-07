/**
 * Wraps an async Express route/controller handler so any thrown/rejected
 * error is passed to next(), letting the centralized error handler manage it.
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
