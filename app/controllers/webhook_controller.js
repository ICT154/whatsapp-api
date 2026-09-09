const whatsapp = require("wa-multi-session");
const { downloadMediaMessage } = require("@whiskeysockets/baileys");
const sharp = require("sharp");
const axios = require("axios");
const logger = require("../../utils/logger");

// Safe session getter with error handling
function getSafeSession(sessionId) {
  try {
    const session = whatsapp.getSession(sessionId);
    if (!session) {
      logger.warn(`Session '${sessionId}' not found or disconnected`);
      return null;
    }

    // Check if session is actually connected
    if (session.ws && session.ws.readyState === 1) {
      return session;
    } else {
      logger.warn(`Session '${sessionId}' exists but WebSocket is not ready`);
      return null;
    }
  } catch (error) {
    logger.error(`Error getting session '${sessionId}':`, error);
    return null;
  }
}

// Safe message sender with retry logic and rate limiting
async function safeSendMessage(session, jid, messageContent, retries = 2) {
  if (typeof global.isSessionReady === "function") {
    const sessionId = session.user?.id || "main";
    if (!global.isSessionReady(sessionId)) {
      logger.debug(
        `Session '${sessionId}' not ready, skipping message delivery`,
      );
      return false;
    }
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      if (attempt > 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
      }

      await session.sendMessage(jid, messageContent);
      return true;
    } catch (error) {
      logger.warn(
        `Send attempt ${attempt} failed for ${jid}: ${error.message}`,
      );

      if (
        error.message.includes("Timed Out") ||
        error.message.includes("not-authorized")
      ) {
        return false;
      }

      if (attempt === retries) {
        logger.error(`All ${retries} send attempts failed for ${jid}`, error);
        return false;
      }
    }
  }
  return false;
}

function initializeWebhookListeners() {
  logger.info("Initializing WhatsApp incoming message listeners...");

  whatsapp.onMessageReceived(async (data) => {
    try {
      const jid = data.key?.remoteJid || "";
      if (jid.endsWith("@g.us") || jid.endsWith("@newsletter")) return;
      if (data.key?.fromMe) return;

      const sessionId = data.sessionId || "unknown";
      const sender = jid.split("@")[0];
      const message =
        data.message?.conversation ||
        data.message?.extendedTextMessage?.text ||
        "";

      // Skip messages from bot itself or system messages
      if (data.key?.fromMe || sender === sessionId) return;

      const preview = message.replace(/\n/g, " ").substring(0, 60);
      logger.info(
        `Incoming message | Session: ${sessionId} | Sender: ${sender} | Text: "${preview}${message.length > 60 ? "..." : ""}"`,
      );

      try {
        const apiUrl = "https://luxeventplanner.com/api/rsvp/whatsapp/response";
        const payload = {
          number: sender,
          response: (message || "").toString().trim().toLowerCase(),
        };

        try {
          const apiRes = await axios.post(apiUrl, payload, {
            headers: { "Content-Type": "application/json" },
            timeout: 10000,
          });

          logger.info(
            `RSVP API forwarded | Sender: ${sender} | HTTP Status: ${apiRes.status}`,
          );
        } catch (apiErr) {
          const errResp = apiErr.response;
          if (errResp) {
            logger.warn(
              `RSVP API error response | Sender: ${sender} | HTTP Status: ${errResp.status}`,
            );
          } else {
            logger.warn(
              `RSVP API network timeout/error | Sender: ${sender}: ${apiErr.message}`,
            );
          }
        }
      } catch (err) {
        logger.error(`Failed to forward message for sender ${sender}:`, err);
      }
    } catch (messageError) {
      logger.error(`Critical error in message receiver:`, messageError);
    }
  });

  logger.info("WhatsApp incoming message listeners initialized successfully");
}

exports.addWebhook = async (req, res, next) => {
  try {
    res.status(200).json({
      status: false,
      message: "Webhook functionality has been disabled",
    });
  } catch (error) {
    next(error);
  }
};

exports.removeWebhook = async (req, res, next) => {
  try {
    res.status(200).json({
      status: false,
      message: "Webhook functionality has been disabled",
    });
  } catch (error) {
    next(error);
  }
};

exports.getWebhooks = async (req, res, next) => {
  try {
    res.status(200).json({
      status: false,
      message: "Webhook functionality has been disabled",
      data: {
        webhooks: [],
        isEnabled: false,
        supportedEvents: [],
        totalWebhooks: 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Enable/Disable webhooks (disabled)
exports.toggleWebhooks = async (req, res, next) => {
  try {
    res.status(200).json({
      status: false,
      message: "Webhook functionality has been disabled",
    });
  } catch (error) {
    next(error);
  }
};

exports.testWebhook = async (req, res, next) => {
  try {
    res.status(200).json({
      status: false,
      message: "Webhook functionality has been disabled",
    });
  } catch (error) {
    next(error);
  }
};

exports.clearWebhooks = async (req, res, next) => {
  try {
    res.status(200).json({
      status: false,
      message: "Webhook functionality has been disabled",
    });
  } catch (error) {
    next(error);
  }
};

exports.initializeWebhookListeners = initializeWebhookListeners;
