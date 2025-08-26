const { Router } = require("express");
const {
  sendMessage,
  sendBulkMessage,
  sendImage,
  sendDocument,
  sendBulkImage,
  sendBulkDocument,
} = require("../controllers/message_controller");
const sessionStatusMiddleware = require("../middlewares/session_status_middleware");

const MessageRouter = Router();

// Apply session status middleware to all message routes
MessageRouter.all("/send-message", sessionStatusMiddleware, sendMessage);
MessageRouter.all("/send-bulk-message", sessionStatusMiddleware, sendBulkMessage);
MessageRouter.all("/send-image", sessionStatusMiddleware, sendImage);
MessageRouter.all("/send-document", sessionStatusMiddleware, sendDocument);
MessageRouter.all("/send-bulk-image", sessionStatusMiddleware, sendBulkImage);
MessageRouter.all("/send-bulk-document", sessionStatusMiddleware, sendBulkDocument);

module.exports = MessageRouter;
