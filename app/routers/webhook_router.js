const { Router } = require("express");
const {
    addWebhook,
    removeWebhook,
    getWebhooks,
    toggleWebhooks,
    testWebhook,
    clearWebhooks,
} = require("../controllers/webhook_controller");

const WebhookRouter = Router();

// Add webhook URL
WebhookRouter.post("/add", addWebhook);

// Remove webhook URL
WebhookRouter.post("/remove", removeWebhook);

// Get all webhooks
WebhookRouter.get("/list", getWebhooks);

// Enable/Disable webhooks
WebhookRouter.post("/toggle", toggleWebhooks);

// Test webhook
WebhookRouter.post("/test", testWebhook);

// Clear all webhooks
WebhookRouter.post("/clear", clearWebhooks);

module.exports = WebhookRouter;
