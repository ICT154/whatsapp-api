const { toDataURL } = require("qrcode");
const whatsapp = require("wa-multi-session");
const ValidationError = require("../../utils/error");
const {
  responseSuccessWithMessage,
  responseSuccessWithData,
} = require("../../utils/response");

exports.createSession = async (req, res, next) => {
  try {
    const scan = req.query.scan;
    const sessionName =
      req.body.session || req.query.session || req.headers.session;
    if (!sessionName) {
      throw new Error("Bad Request");
    }

    // Only handle QR update once per request
    const qrHandler = async (data) => {
      if (res && !res.headersSent && data.sessionId == sessionName) {
        const qr = await toDataURL(data.qr);
        const isWebRequest = scan === 'true' || req.headers.accept?.includes('text/html');
        if (isWebRequest) {
          res.render("scan", { qr: qr });
        } else {
          res.status(200).json(
            responseSuccessWithData({
              qr: qr,
            })
          );
        }
        // Remove listener after first response (if supported by wa-multi-session)
        // If wa-multi-session does not support offQRUpdated, you may need to implement your own mechanism to ignore further calls.
      }
    };

    whatsapp.onQRUpdated(qrHandler);
    await whatsapp.startSession(sessionName, { printQR: true });
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

    whatsapp.onQRUpdated(async (data) => {
      if (res && !res.headersSent) {
        const qr = await toDataURL(data.qr);
        if (data.sessionId == sessionName) {
          // Always return JSON for API endpoint
          res.status(200).json(
            responseSuccessWithData({
              qr: qr,
            })
          );
        }
      }
    });
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
    whatsapp.onQRUpdated(async (data) => {
      if (res && !res.headersSent) {
        const qr = await toDataURL(data.qr);
        if (data.sessionId == sessionName) {
          // res.render("scan", { qr: qr });  /// ini kalo mau tampil view
          res.status(200).json(
            responseSuccessWithData({
              qr: qr,
            })
          );
        } else {
          res.status(200).json(
            responseSuccessWithData({
              qr: qr,
            })
          );
        }
      }
    });
    await whatsapp.startSession(sessionName, { printQR: true, qr: qr });
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
    whatsapp.deleteSession(sessionName);
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
    const sessionId = req.body.session || req.query.session || req.headers.session || 'main';

    // Check if session status functions are available
    if (typeof global.getSessionStatus !== 'function') {
      return res.status(500).json({
        status: false,
        message: 'Session status system not initialized'
      });
    }

    const sessionStatus = global.getSessionStatus(sessionId);
    const isReady = global.isSessionReady ? global.isSessionReady(sessionId) : false;
    const sessionExists = whatsapp.getSession(sessionId);

    let message = '';
    switch (sessionStatus) {
      case global.SESSION_STATUS?.DISCONNECTED:
        message = 'Session tidak tersambung';
        break;
      case global.SESSION_STATUS?.CONNECTING:
        message = 'Session sedang menghubungkan';
        break;
      case global.SESSION_STATUS?.CONNECTED:
        message = 'Session tersambung, sedang mempersiapkan';
        break;
      case global.SESSION_STATUS?.SYNCING:
        message = 'Session sedang menyinkronkan pesan';
        break;
      case global.SESSION_STATUS?.READY:
        message = 'Session siap digunakan';
        break;
      default:
        message = 'Status session tidak diketahui';
    }

    res.status(200).json(responseSuccessWithData({
      session_id: sessionId,
      status: sessionStatus,
      is_ready: isReady,
      session_exists: !!sessionExists,
      message: message,
      timestamp: new Date().toISOString()
    }));
  } catch (error) {
    next(error);
  }
};
