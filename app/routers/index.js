const { Router } = require("express");
const MessageRouter = require("./message_router");
const SessionRouter = require("./session_router");
const AuthRouter = require("./auth_router");
const { requireUIAuth } = require("../middlewares/auth_middleware");
// const WebhookRouter = require("./webhook_router"); // Disabled

const MainRouter = Router();

MainRouter.use(AuthRouter);

MainRouter.get("/", requireUIAuth, (req, res) => {
  res.render("index", { user: req.user, apiKey: process.env.KEY || "" });
});

MainRouter.use(SessionRouter);
MainRouter.use(MessageRouter);
// MainRouter.use("/webhook", WebhookRouter); // Webhook disabled

module.exports = MainRouter;
