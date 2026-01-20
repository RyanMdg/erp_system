const sendSuccess = (res, data = null, message = null, status = 200) => {
  return res.status(status).json({
    success: true,
    data,
    message,
  });
};

const sendError = (res, status, message, errors = null) => {
  return res.status(status).json({
    success: false,
    data: null,
    message,
    errors,
  });
};

module.exports = {
  sendSuccess,
  sendError,
};
