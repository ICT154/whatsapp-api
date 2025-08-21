const { WhatsappError } = require("wa-multi-session");
const ValidationError = require("../../utils/error");
const { responseErrorWithMessage } = require("../../utils/response");

module.exports = function errorHandlerMiddleware(error, req, res, next) {
  if (error instanceof ValidationError) {
    return res.status(400).json(responseErrorWithMessage(error.message, error));
  }
  if (error instanceof WhatsappError) {
    return res.status(400).json(responseErrorWithMessage(error.message, error));
  }
  console.log(error);
  return res.status(500).json(responseErrorWithMessage("Internal Server Error", error));
};
