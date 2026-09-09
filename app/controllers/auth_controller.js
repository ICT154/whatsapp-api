const {
  createAuthToken,
  verifyAuthToken,
} = require("../middlewares/auth_middleware");

exports.showLoginForm = (req, res) => {
  const token = req.cookies?.auth_session;
  if (verifyAuthToken(token)) {
    return res.redirect("/");
  }

  res.render("login", {
    error: null,
    username: "",
  });
};

exports.handleLogin = (req, res) => {
  const { username, password } = req.body;

  const validUsername = process.env.ADMIN_USERNAME || "admin";
  const validPassword = process.env.ADMIN_PASSWORD || "adminpassword";

  if (username === validUsername && password === validPassword) {
    const token = createAuthToken(username);

    // Set cookie HTTP-only (durasi 7 hari)
    res.cookie("auth_session", token, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.redirect("/");
  }

  return res.status(401).render("login", {
    error: "Username atau password salah.",
    username: username || "",
  });
};

exports.handleLogout = (req, res) => {
  res.clearCookie("auth_session");
  return res.redirect("/login");
};
