/**
 * Custom error class for predictable, operational API errors.
 * Usage: throw new ApiError(404, 'Resource not found');
 */
class ApiError extends Error {
  constructor(statusCode = 500, message = 'Something went wrong') {
    super(message);
    this.statusCode = statusCode;
    this.success = false;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ApiError;
