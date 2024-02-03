const { Router } = require("express");
const {
  sendMessage,
  sendBulkMessage,
  sendImage,
} = require("../controllers/message_controller");
const MessageRouter = Router();

MessageRouter.all("/send-message", sendMessage);
MessageRouter.all("/send-bulk-message", sendBulkMessage);
MessageRouter.all("/send-image", sendImage);
module.exports = MessageRouter;
