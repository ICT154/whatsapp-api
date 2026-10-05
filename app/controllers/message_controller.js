const axios = require("axios");
const fs = require("fs");
const whatsapp = require("wa-multi-session");
const ValidationError = require("../../utils/error");
const logger = require("../../utils/logger");
const { responseSuccessWithData } = require("../../utils/response");

/**
 * Resolves media input to a Buffer if it is a remote URL, base64 data URI, or local file.
 * Remote URLs are pre-downloaded with an explicit timeout to prevent Baileys stream hangs.
 */
async function resolveMedia(mediaInput) {
  if (!mediaInput) return null;
  if (Buffer.isBuffer(mediaInput)) return mediaInput;

  if (typeof mediaInput === "string") {
    // 1. Base64 Data URI
    if (mediaInput.startsWith("data:")) {
      const parts = mediaInput.split(",");
      if (parts.length > 1) {
        return Buffer.from(parts[1], "base64");
      }
    }

    // 2. Remote HTTP/HTTPS URL -> Download directly into Buffer
    if (mediaInput.startsWith("http://") || mediaInput.startsWith("https://")) {
      try {
        const response = await axios.get(mediaInput, {
          responseType: "arraybuffer",
          timeout: 25000,
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            Accept: "*/*",
          },
        });
        return Buffer.from(response.data);
      } catch (err) {
        throw new Error(`Failed to download media from URL (${err.message})`);
      }
    }

    // 3. Local file path
    try {
      if (fs.existsSync(mediaInput)) {
        return fs.readFileSync(mediaInput);
      }
    } catch (_) {}
  }

  return mediaInput;
}

/**
 * Detects transient network / timeout / socket errors suitable for retry
 */
function isTransientError(err) {
  const msg = (err?.message || String(err)).toLowerCase();
  return (
    msg.includes("timed out") ||
    msg.includes("timeout") ||
    msg.includes("connection closed") ||
    msg.includes("connection lost") ||
    msg.includes("rate-overlimit") ||
    msg.includes("econnreset") ||
    msg.includes("pipe")
  );
}

/**
 * Executes a WhatsApp sending action with automatic retry for transient errors
 */
async function executeWithRetry(action, actionName = "operation") {
  try {
    return await action();
  } catch (error) {
    if (isTransientError(error)) {
      logger.warn(
        `First attempt of ${actionName} failed with '${error.message}'. Retrying in 1.5s...`,
      );
      await new Promise((resolve) => setTimeout(resolve, 1500));
      return await action();
    }
    throw error;
  }
}

exports.sendMessage = async (req, res, next) => {
  try {
    let to = req.body.to || req.query.to;
    let text = req.body.text || req.query.text;
    let isGroup = req.body.isGroup || req.query.isGroup;
    const sessionId =
      req.body.session || req.query.session || req.headers.session;

    if (!to || !text) throw new ValidationError("Missing Parameters");

    const receiver = to;
    if (!sessionId) throw new ValidationError("Session Not Founds");

    const send = await executeWithRetry(
      () =>
        whatsapp.sendTextMessage({
          sessionId,
          to: receiver,
          isGroup: !!isGroup,
          text,
        }),
      "sendMessage",
    );

    if (send?.key?.id && send?.message && typeof global.saveGatewayMessage === "function") {
      global.saveGatewayMessage(send.key.id, send.message);
    }

    res.status(200).json(
      responseSuccessWithData({
        id: send?.key?.id,
        status: send?.status,
        message: send?.message?.extendedTextMessage?.text || "Not Text",
        remoteJid: send?.key?.remoteJid,
      }),
    );
  } catch (error) {
    logger.error("Error sending message:", error);
    res.status(500).json({
      status: false,
      data: {
        error: "Failed to send message",
        details: error.message,
      },
    });
  }
};

///// SEND GAMBAR
exports.sendImage = async (req, res, next) => {
  try {
    const to = req.body.to || req.query.to;
    const caption = req.body.caption || req.query.caption;
    const url = req.body.url || req.query.url;
    const sessionId =
      req.body.session || req.query.session || req.headers.session;

    if (!to || !url) {
      return res.status(400).json({
        status: false,
        data: {
          error: "Missing Parameters",
        },
      });
    }

    const mediaBuffer = await resolveMedia(url);

    const send = await executeWithRetry(
      () =>
        whatsapp.sendImage({
          sessionId: sessionId,
          to: to,
          text: caption,
          media: mediaBuffer || url,
        }),
      "sendImage",
    );

    if (send?.key?.id && send?.message && typeof global.saveGatewayMessage === "function") {
      global.saveGatewayMessage(send.key.id, send.message);
    }

    res.status(200).json({
      status: true,
      data: {
        id: send?.key?.id,
        status: send?.status,
        message: send?.message?.extendedTextMessage?.text || "Not Text",
        remoteJid: send?.key?.remoteJid,
      },
    });
  } catch (error) {
    logger.error("Error sending image:", error);
    res.status(500).json({
      status: false,
      data: {
        error: "Failed to send image",
        details: error.message,
      },
    });
  }
};

exports.sendBulkMessage = async (req, res, next) => {
  try {
    const sessionId =
      req.body.session || req.query.session || req.headers.session;
    const delay = req.body.delay || req.query.delay || req.headers.delay;
    if (!sessionId) {
      return res.status(400).json({
        status: false,
        data: {
          error: "Session Not Found",
        },
      });
    }
    res.status(200).json({
      status: true,
      data: {
        message: "Bulk Message is Processing",
      },
    });
    for (const dt of req.body.data) {
      const to = dt.to;
      const text = dt.text;
      const isGroup = !!dt.isGroup;

      try {
        await executeWithRetry(
          () =>
            whatsapp.sendTextMessage({
              sessionId,
              to: to,
              isGroup: isGroup,
              text: text,
            }),
          `sendBulkMessage for ${to}`,
        );
      } catch (err) {
        logger.error(`Error sending bulk message to ${to}:`, err);
      }
      await whatsapp.createDelay(delay ?? 1000);
    }
    logger.info(`Bulk message completed for session '${sessionId}'`);
  } catch (error) {
    logger.error("Error sending bulk message:", error);
    res.status(500).json({
      status: false,
      data: {
        error: "Failed to send bulk message",
        details: error.message,
      },
    });
  }
};

// SEND DOCUMENT
exports.sendDocument = async (req, res, next) => {
  try {
    const to = req.body.to || req.query.to;
    const caption = req.body.caption || req.query.caption;
    const url = req.body.url || req.query.url;
    const sessionId =
      req.body.session || req.query.session || req.headers.session;
    const filename =
      req.body.filename || req.query.filename || req.headers.filename;

    if (!to || !url) {
      return res.status(400).json({
        status: false,
        data: {
          error: "Missing Parameters",
        },
      });
    }

    const mediaBuffer = await resolveMedia(url);

    const send = await executeWithRetry(
      () =>
        whatsapp.sendDocument({
          sessionId: sessionId,
          to: to,
          filename: filename,
          media: mediaBuffer || url,
          text: caption,
        }),
      "sendDocument",
    );

    if (send?.key?.id && send?.message && typeof global.saveGatewayMessage === "function") {
      global.saveGatewayMessage(send.key.id, send.message);
    }

    res.status(200).json({
      status: true,
      data: {
        id: send?.key?.id,
        status: send?.status,
        message: send?.message?.extendedTextMessage?.text || "Not Text",
        remoteJid: send?.key?.remoteJid,
      },
    });
  } catch (error) {
    logger.error("Error sending document:", error);
    res.status(500).json({
      status: false,
      data: {
        error: "Failed to send document",
        details: error.message,
      },
    });
  }
};

// Send bulk image
exports.sendBulkImage = async (req, res, next) => {
  try {
    const sessionId =
      req.body.session || req.query.session || req.headers.session;
    const delay = req.body.delay || req.query.delay || req.headers.delay;
    if (!sessionId) {
      return res.status(400).json({
        status: false,
        data: {
          error: "Session Not Found",
        },
      });
    }
    res.status(200).json({
      status: true,
      data: {
        message: "Bulk Image is Processing",
      },
    });
    for (const dt of req.body.data) {
      const to = dt.to;
      const url = dt.url;
      const caption = dt.caption;

      try {
        const mediaBuffer = await resolveMedia(url);
        await executeWithRetry(
          () =>
            whatsapp.sendImage({
              sessionId,
              to: to,
              media: mediaBuffer || url,
              text: caption,
            }),
          `sendBulkImage for ${to}`,
        );
      } catch (err) {
        logger.error(`Error sending bulk image to ${to}:`, err);
      }
      await whatsapp.createDelay(delay ?? 1000);
    }
    logger.info(`Bulk image completed for session '${sessionId}'`);
  } catch (error) {
    logger.error("Error sending bulk image:", error);
    res.status(500).json({
      status: false,
      data: {
        error: "Failed to send bulk image",
        details: error.message,
      },
    });
  }
};

// Send bulk document
exports.sendBulkDocument = async (req, res, next) => {
  try {
    const sessionId =
      req.body.session || req.query.session || req.headers.session;
    const delay = req.body.delay || req.query.delay || req.headers.delay;
    if (!sessionId) {
      return res.status(400).json({
        status: false,
        data: {
          error: "Session Not Found",
        },
      });
    }
    res.status(200).json({
      status: true,
      data: {
        message: "Bulk Document is Processing",
      },
    });
    for (const dt of req.body.data) {
      const to = dt.to;
      const url = dt.url;
      const caption = dt.caption;
      const filename = dt.filename;

      try {
        const mediaBuffer = await resolveMedia(url);
        await executeWithRetry(
          () =>
            whatsapp.sendDocument({
              sessionId,
              to: to,
              media: mediaBuffer || url,
              text: caption,
              filename: filename,
            }),
          `sendBulkDocument for ${to}`,
        );
      } catch (err) {
        logger.error(`Error sending bulk document to ${to}:`, err);
      }
      await whatsapp.createDelay(delay ?? 1000);
    }
    logger.info(`Bulk document completed for session '${sessionId}'`);
  } catch (error) {
    logger.error("Error sending bulk document:", error);
    res.status(500).json({
      status: false,
      data: {
        error: "Failed to send bulk document",
        details: error.message,
      },
    });
  }
};
