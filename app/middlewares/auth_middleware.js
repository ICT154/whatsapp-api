const crypto = require("crypto");

function getSecret() {
  return process.env.SESSION_SECRET || "wa_gateway_secure_session_secret_2026";
}

/**
 * Buat signed token format: base64(payload).signature
 */
function createAuthToken(username) {
  const payload = JSON.stringify({
    username,
    createdAt: Date.now(),
  });
  const encoded = Buffer.from(payload).toString("base64");
  const signature = crypto
    .createHmac("sha256", getSecret())
    .update(encoded)
    .digest("hex");
  return `${encoded}.${signature}`;
}

/**
 * Verifikasi token
 */
function verifyAuthToken(token) {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;

  const [encoded, signature] = parts;
  const expectedSignature = crypto
    .createHmac("sha256", getSecret())
    .update(encoded)
    .digest("hex");

  // Gunakan timingSafeEqual untuk mencegah timing attack
  const sigBuffer = Buffer.from(signature);
  const expBuffer = Buffer.from(expectedSignature);
  if (
    sigBuffer.length !== expBuffer.length ||
    !crypto.timingSafeEqual(sigBuffer, expBuffer)
  ) {
    return null;
  }

  try {
    const payloadStr = Buffer.from(encoded, "base64").toString("utf8");
    const payload = JSON.parse(payloadStr);

    // Validasi masa berlaku (contoh 7 hari)
    const maxAge = 7 * 24 * 60 * 60 * 1000;
    if (Date.now() - payload.createdAt > maxAge) {
      return null;
    }

    return payload;
  } catch (e) {
    return null;
  }
}

function requireUIAuth(req, res, next) {
  const token = req.cookies?.auth_session;
  const session = verifyAuthToken(token);

  if (session) {
    req.user = session;
    return next();
  }

  // Support direct browser authentication via URL query parameters
  // e.g. /?user=admin&pass=adminpassword or /?username=admin&password=adminpassword or /?key=mysupersecretkey
  const queryUser = req.query?.username || req.query?.user;
  const queryPass = req.query?.password || req.query?.pass;
  const queryKey = req.query?.key;

  const validUsername = process.env.ADMIN_USERNAME || "admin";
  const validPassword = process.env.ADMIN_PASSWORD || "adminpassword";
  const validKey = process.env.KEY;

  if (
    (queryUser && queryPass && queryUser === validUsername && queryPass === validPassword) ||
    (queryKey && validKey && queryKey === validKey)
  ) {
    const userToAuth = queryUser || "admin";
    const newToken = createAuthToken(userToAuth);
    res.cookie("auth_session", newToken, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    req.user = { username: userToAuth };
    return next();
  }

  // Default: Return 200 OK JSON like an API (hides login page from Netcraft & public crawlers)
  return res.status(200).json({
    status: true,
    message: "WhatsApp API Gateway is running",
  });
}

module.exports = {
  createAuthToken,
  verifyAuthToken,
  requireUIAuth,
};
