const { Router } = require("express");
const MessageRouter = require("./message_router");
const SessionRouter = require("./session_router");

const MainRouter = Router();

MainRouter.get("/", (req, res) => {
    res.render("index");
});

MainRouter.use(SessionRouter);
MainRouter.use(MessageRouter);

module.exports = MainRouter;
