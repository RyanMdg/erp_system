const { validationResult } = require("express-validator");
const { sendError } = require("../utils/response");

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, 400, "Validation error", errors.array());
  }
  return next();
};

module.exports = validate;
