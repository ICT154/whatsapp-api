const { Router } = require("express");
const {
  createSession,
  deleteSession,
  sessions,
  createSessionByQR,
} = require("../controllers/session_controller");

const SessionRouter = Router();

SessionRouter.all("/start-session", createSession);
SessionRouter.all("/start-session-json", createSessionByQR);
SessionRouter.all("/delete-session", deleteSession);
SessionRouter.all("/sessions", sessions);

module.exports = SessionRouter;
