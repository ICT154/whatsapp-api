const { Router } = require("express");
const {
  createSession,
  deleteSession,
  sessions,
  createSessionByQR,
  createSessionAPI,
  sessionStatus,
} = require("../controllers/session_controller");
const sessionStatusMiddleware = require("../middlewares/session_status_middleware");

const SessionRouter = Router();

// These routes don't need session status check (creating/managing sessions)
SessionRouter.all("/start-session", createSession);
SessionRouter.all("/start-session-api", createSessionAPI);
SessionRouter.all("/start-session-json", createSessionByQR);
SessionRouter.all("/delete-session", deleteSession);
SessionRouter.all("/sessions", sessions);
SessionRouter.all("/session-status", sessionStatus);

module.exports = SessionRouter;
