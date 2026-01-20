const { sendError } = require("../utils/response");

const notFound = (req, res) => {
  return sendError(res, 404, "Route not found");
};

const errorHandler = (err, req, res, _next) => {
  // eslint-disable-next-line no-console
  console.error(err);

  const status = err.status || 500;
  const message = err.message || "Internal server error";

  return sendError(res, status, message);
};

module.exports = {
  notFound,
  errorHandler,
};
