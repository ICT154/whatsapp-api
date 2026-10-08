const {
  createAuthToken,
  verifyAuthToken,
} = require("../middlewares/auth_middleware");

/**
 * Netcraft anti-phishing mitigation:
 * Do not render any HTML login page or brand credential harvesting form.
 * Returns clean 200 OK JSON like an API.
 */
exports.showLoginForm = (req, res) => {
  const token = req.cookies?.auth_session;
  if (verifyAuthToken(token)) {
    return res.redirect("/");
  }

  return res.status(200).json({
    status: true,
    message: "WhatsApp API Gateway is running",
  });
};

exports.handleLogin = (req, res) => {
  const username =
    req.body?.username || req.query?.username || req.body?.user || req.query?.user;
  const password =
    req.body?.password || req.query?.password || req.body?.pass || req.query?.pass;

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

    const isJson =
      req.headers.accept?.includes("application/json") ||
      req.is("application/json");

    if (isJson) {
      return res.status(200).json({
        status: true,
        message: "Login successful",
      });
    }

    return res.redirect("/");
  }

  return res.status(401).json({
    status: false,
    message: "Username atau password salah.",
  });
};

exports.handleLogout = (req, res) => {
  res.clearCookie("auth_session");
  return res.redirect("/");
};
