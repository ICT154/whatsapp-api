const { Router } = require("express");
const {
  sendMessage,
  sendBulkMessage,
  sendImage,
  sendDocument,
  sendBulkImage,
  sendBulkDocument,
} = require("../controllers/message_controller");
const MessageRouter = Router();

MessageRouter.all("/send-message", sendMessage);
MessageRouter.all("/send-bulk-message", sendBulkMessage);
MessageRouter.all("/send-image", sendImage);
MessageRouter.all("/send-document", sendDocument);
MessageRouter.all("/send-bulk-image", sendBulkImage);
MessageRouter.all("/send-bulk-document", sendBulkDocument);

module.exports = MessageRouter;
