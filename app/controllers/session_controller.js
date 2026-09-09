const { toDataURL } = require("qrcode");
const whatsapp = require("wa-multi-session");
const ValidationError = require("../../utils/error");
const logger = require("../../utils/logger");
const {
  responseSuccessWithMessage,
  responseSuccessWithData,
} = require("../../utils/response");
const { verifyAuthToken } = require("../middlewares/auth_middleware");

// Global registry for pending QR requests per session (prevents listener memory leak & event looping)
const pendingQRRequests = new Map();

let qrListenerInitialized = false;
function ensureQRListener() {
  if (qrListenerInitialized) return;
  qrListenerInitialized = true;

  whatsapp.onQRUpdated(async (data) => {
    try {
      const sessionId = data.sessionId;
      const waiters = pendingQRRequests.get(sessionId) || [];
      if (waiters.length === 0) return;

      const qr = await toDataURL(data.qr);
      pendingQRRequests.delete(sessionId);

      logger.info(
        `QR code generated and dispatched for session '${sessionId}'`,
      );

      for (const waiter of waiters) {
        if (waiter.timeout) clearTimeout(waiter.timeout);
        if (waiter.res && !waiter.res.headersSent) {
          if (waiter.isWebRequest) {
            waiter.res.render("scan", {
              qr: qr,
              user: waiter.req.user,
              session: sessionId,
              alreadyConnected: false,
              error: null,
            });
          } else {
            waiter.res.status(200).json(
              responseSuccessWithData({
                qr: qr,
              }),
            );
          }
        }
      }
    } catch (err) {
      logger.error(`Error processing QR update for '${data?.sessionId}':`, err);
    }
  });
}

function registerPendingQR(sessionName, isWebRequest, req, res, next) {
  ensureQRListener();

  if (!pendingQRRequests.has(sessionName)) {
    pendingQRRequests.set(sessionName, []);
  }

  const waiterEntry = { isWebRequest, req, res };

  // Timeout guard (40 detik)
  waiterEntry.timeout = setTimeout(() => {
    const list = pendingQRRequests.get(sessionName) || [];
    pendingQRRequests.set(
      sessionName,
      list.filter((w) => w !== waiterEntry),
    );

    if (res && !res.headersSent) {
      if (isWebRequest) {
        res.render("scan", {
          qr: null,
          user: req.user,
          session: sessionName,
          alreadyConnected: false,
          error: "Waktu permintaan QR habis. Silakan muat ulang halaman.",
        });
      } else {
        res.status(408).json({
          status: false,
          message: "QR Generation Timeout",
        });
      }
    }
  }, 40000);

  // Clean up if client disconnected before response
  req.on("close", () => {
    clearTimeout(waiterEntry.timeout);
    const list = pendingQRRequests.get(sessionName) || [];
    pendingQRRequests.set(
      sessionName,
      list.filter((w) => w !== waiterEntry),
    );
  });

  pendingQRRequests.get(sessionName).push(waiterEntry);
}

exports.createSession = async (req, res, next) => {
  try {
    const scan = req.query.scan;
    const sessionName =
      req.body.session || req.query.session || req.headers.session;
    if (!sessionName) {
      throw new Error("Bad Request");
    }

    const isWebRequest =
      scan === "true" || req.headers.accept?.includes("text/html");
    if (isWebRequest) {
      const token = req.cookies?.auth_session;
      if (!verifyAuthToken(token)) {
        return res.redirect("/login");
      }
    }

    // Jika sesi sudah terhubung dan aktif, jangan start ulang agar tidak memicu reconnect loop
    const existingSession = whatsapp.getSession(sessionName);
    const currentStatus =
      typeof global.getSessionStatus === "function"
        ? global.getSessionStatus(sessionName)
        : null;
    const isReady =
      typeof global.isSessionReady === "function"
        ? global.isSessionReady(sessionName)
        : false;

    if (
      existingSession &&
      (isReady || currentStatus === global.SESSION_STATUS?.CONNECTED)
    ) {
      logger.info(
        `Session '${sessionName}' is already active, skipping startSession`,
      );
      if (isWebRequest) {
        return res.render("scan", {
          qr: null,
          user: req.user,
          session: sessionName,
          alreadyConnected: true,
          error: null,
        });
      } else {
        return res.status(200).json(
          responseSuccessWithData({
            qr: null,
            status: "already_connected",
            session: sessionName,
          }),
        );
      }
    }

    registerPendingQR(sessionName, isWebRequest, req, res, next);
    await whatsapp.startSession(sessionName, { printQR: false });
  } catch (error) {
    next(error);
  }
};

///// create session with pure JSON response for API calls
exports.createSessionAPI = async (req, res, next) => {
  try {
    const sessionName =
      req.body.session || req.query.session || req.headers.session;
    if (!sessionName) {
      throw new Error("Bad Request");
    }

    const existingSession = whatsapp.getSession(sessionName);
    const isReady =
      typeof global.isSessionReady === "function"
        ? global.isSessionReady(sessionName)
        : false;
    if (existingSession && isReady) {
      return res.status(200).json(
        responseSuccessWithData({
          qr: null,
          status: "already_connected",
          session: sessionName,
        }),
      );
    }

    registerPendingQR(sessionName, false, req, res, next);
    await whatsapp.startSession(sessionName, { printQR: false });
  } catch (error) {
    next(error);
  }
};

///// create session by qr json
exports.createSessionByQR = async (req, res, next) => {
  try {
    const qr = req.body.qr || req.query.qr || req.headers.qr;
    const sessionName =
      req.body.session || req.query.session || req.headers.session;
    if (!sessionName) {
      throw new Error("Bad Request");
    }

    const existingSession = whatsapp.getSession(sessionName);
    const isReady =
      typeof global.isSessionReady === "function"
        ? global.isSessionReady(sessionName)
        : false;
    if (existingSession && isReady) {
      return res.status(200).json(
        responseSuccessWithData({
          qr: null,
          status: "already_connected",
          session: sessionName,
        }),
      );
    }

    registerPendingQR(sessionName, false, req, res, next);
    await whatsapp.startSession(sessionName, { printQR: false, qr: qr });
  } catch (error) {
    next(error);
  }
};

exports.deleteSession = async (req, res, next) => {
  try {
    const sessionName =
      req.body.session || req.query.session || req.headers.session;
    if (!sessionName) {
      throw new ValidationError("session Required");
    }

    // Bersihkan pending QR request untuk sesi ini jika ada
    if (pendingQRRequests.has(sessionName)) {
      const waiters = pendingQRRequests.get(sessionName) || [];
      for (const waiter of waiters) {
        if (waiter.timeout) clearTimeout(waiter.timeout);
      }
      pendingQRRequests.delete(sessionName);
    }

    await whatsapp.deleteSession(sessionName);
    if (typeof global.setSessionStatus === "function") {
      global.setSessionStatus(
        sessionName,
        global.SESSION_STATUS?.DISCONNECTED || "disconnected",
      );
    }
    logger.info(`Session '${sessionName}' deleted successfully`);

    res
      .status(200)
      .json(responseSuccessWithMessage("Success Deleted " + sessionName));
  } catch (error) {
    next(error);
  }
};
exports.sessions = async (req, res, next) => {
  try {
    const key = req.body.key || req.query.key || req.headers.key;

    // is KEY provided and secured
    if (process.env.KEY && process.env.KEY != key) {
      throw new ValidationError("Invalid Key");
    }

    res.status(200).json(responseSuccessWithData(whatsapp.getAllSession()));
  } catch (error) {
    next(error);
  }
};

exports.sessionStatus = async (req, res, next) => {
  try {
    const sessionId =
      req.body.session || req.query.session || req.headers.session || "main";

    // Check if session status functions are available
    if (typeof global.getSessionStatus !== "function") {
      return res.status(500).json({
        status: false,
        message: "Session status system not initialized",
      });
    }

    const sessionStatus = global.getSessionStatus(sessionId);
    const isReady = global.isSessionReady
      ? global.isSessionReady(sessionId)
      : false;
    const sessionExists = whatsapp.getSession(sessionId);

    let message = "";
    switch (sessionStatus) {
      case global.SESSION_STATUS?.DISCONNECTED:
        message = "Session tidak tersambung";
        break;
      case global.SESSION_STATUS?.CONNECTING:
        message = "Session sedang menghubungkan";
        break;
      case global.SESSION_STATUS?.CONNECTED:
        message = "Session tersambung, sedang mempersiapkan";
        break;
      case global.SESSION_STATUS?.SYNCING:
        message = "Session sedang menyinkronkan pesan";
        break;
      case global.SESSION_STATUS?.READY:
        message = "Session siap digunakan";
        break;
      default:
        message = "Status session tidak diketahui";
    }

    res.status(200).json(
      responseSuccessWithData({
        session_id: sessionId,
        status: sessionStatus,
        is_ready: isReady,
        session_exists: !!sessionExists,
        message: message,
        timestamp: new Date().toISOString(),
      }),
    );
  } catch (error) {
    next(error);
  }
};
