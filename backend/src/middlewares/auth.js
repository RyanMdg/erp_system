const jwt = require("jsonwebtoken");
const { sendError } = require("../utils/response");

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;

  if (!token) {
    return sendError(res, 401, "Missing or invalid token");
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    return next();
  } catch (error) {
    return sendError(res, 401, "Invalid or expired token");
  }
};

const requireRole =
  (...roles) =>
  (req, res, next) => {
    const userRole = req.user?.role;
    if (!userRole || !roles.includes(userRole)) {
      return sendError(res, 403, "Forbidden");
    }
    return next();
  };

module.exports = {
  authenticate,
  requireRole,
};
