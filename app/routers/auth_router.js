const { Router } = require("express");
const {
  showLoginForm,
  handleLogin,
  handleLogout,
} = require("../controllers/auth_controller");

const AuthRouter = Router();

AuthRouter.get("/login", showLoginForm);
AuthRouter.post("/login", handleLogin);
AuthRouter.get("/logout", handleLogout);
AuthRouter.post("/logout", handleLogout);

module.exports = AuthRouter;
