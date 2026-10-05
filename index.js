const { config } = require("dotenv");
const express = require("express");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const http = require("http");
const path = require("path");
const fs = require("fs");
const MainRouter = require("./app/routers");
const errorHandlerMiddleware = require("./app/middlewares/error_middleware");
const whatsapp = require("wa-multi-session");
const {
  initializeWebhookListeners,
} = require("./app/controllers/webhook_controller");

config();

const logger = require("./utils/logger");

// Global state tracking for sessions
const sessionStates = new Map();
const syncTimers = new Map();

// Session status constants
const SESSION_STATUS = {
  DISCONNECTED: "disconnected",
  CONNECTING: "connecting",
  CONNECTED: "connected",
  SYNCING: "syncing",
  READY: "ready",
};

// Function to get session status
function getSessionStatus(sessionId) {
  return sessionStates.get(sessionId) || SESSION_STATUS.DISCONNECTED;
}

// Function to set session status (with deduplication to prevent log spamming)
function setSessionStatus(sessionId, status) {
  const previous = sessionStates.get(sessionId);
  if (previous === status) {
    return; // Don't log if status hasn't changed
  }
  sessionStates.set(sessionId, status);
  logger.info(`Session '${sessionId}' status: [${status.toUpperCase()}]`);
}

// Function to check if session is ready for operations
function isSessionReady(sessionId) {
  const status = getSessionStatus(sessionId);
  return status === SESSION_STATUS.READY;
}

// Export functions for use in other modules
global.getSessionStatus = getSessionStatus;
global.setSessionStatus = setSessionStatus;
global.isSessionReady = isSessionReady;
global.SESSION_STATUS = SESSION_STATUS;

// In-memory message store for satisfying Baileys retry decryption requests (fixes "Waiting for this message")
const gatewayMessageStore = new Map();
global.saveGatewayMessage = function (keyId, message) {
  if (!keyId || !message) return;
  if (gatewayMessageStore.size > 2000) {
    const oldestKey = gatewayMessageStore.keys().next().value;
    gatewayMessageStore.delete(oldestKey);
  }
  gatewayMessageStore.set(keyId, message);
};

global.getGatewayMessage = async function (sessionId, key) {
  if (!key || !key.id) return undefined;
  return gatewayMessageStore.get(key.id) || undefined;
};

// Global error handlers to prevent crashes
process.on("uncaughtException", (error) => {
  logger.error(`Uncaught Exception: ${error.message}`, error);
});

process.on("unhandledRejection", (reason, promise) => {
  // Filter common non-critical WhatsApp socket/crypto noise
  if (
    reason &&
    reason.message &&
    (reason.message.includes("Connection Closed") ||
      reason.message.includes("Socket timeout") ||
      reason.message.includes("Bad MAC Error") ||
      reason.message.includes("Key used already or never filled") ||
      reason.message.includes("Failed to decrypt message") ||
      reason.message.includes("Timed Out"))
  ) {
    logger.debug(`Ignored non-critical socket notice: ${reason.message}`);
    return;
  }

  logger.warn(`Unhandled Rejection: ${reason?.message || reason}`);
});

// Handle SIGTERM gracefully
process.on("SIGTERM", () => {
  logger.info("SIGTERM received, shutting down gracefully...");
  process.exit(0);
});

// Handle SIGINT gracefully (Ctrl+C)
process.on("SIGINT", () => {
  logger.info("SIGINT received, shutting down gracefully...");
  process.exit(0);
});

var app = express();
app.use(morgan("dev"));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  cookieParser(
    process.env.SESSION_SECRET || "wa_gateway_secure_session_secret_2026",
  ),
);
app.set("view engine", "ejs");
// Public Path
app.use("/p", express.static(path.resolve("public")));
app.use("/p/*", (req, res) => res.status(404).send("Media Not Found"));

app.use(MainRouter);

app.use(errorHandlerMiddleware);

const PORT = process.env.PORT || "5000";
app.set("port", PORT);
var server = http.createServer(app);
server.on("listening", () =>
  logger.info(`WhatsApp API Gateway is running on port ${PORT}`),
);

server.listen(PORT);

whatsapp.onConnected((session) => {
  try {
    setSessionStatus(session, SESSION_STATUS.CONNECTED);

    // Batalkan sync timer yang sudah ada jika ada reconnect cepat
    if (syncTimers.has(session)) {
      clearTimeout(syncTimers.get(session));
    }

    // Beri waktu 5 detik untuk sinkronisasi pesan Baileys sebelum menandai siap
    const timer = setTimeout(() => {
      // Pastikan status sesi masih CONNECTED sebelum diubah menjadi READY
      if (getSessionStatus(session) === SESSION_STATUS.CONNECTED) {
        setSessionStatus(session, SESSION_STATUS.READY);
      }
      syncTimers.delete(session);
    }, 5000);

    syncTimers.set(session, timer);
  } catch (error) {
    logger.error(`Error in onConnected handler for '${session}':`, error);
  }
});

whatsapp.onDisconnected((session) => {
  try {
    // Bersihkan sync timer jika koneksi terputus saat sync
    if (syncTimers.has(session)) {
      clearTimeout(syncTimers.get(session));
      syncTimers.delete(session);
    }
    setSessionStatus(session, SESSION_STATUS.DISCONNECTED);
  } catch (error) {
    logger.error(`Error in onDisconnected handler for '${session}':`, error);
  }
});

whatsapp.onConnecting((session) => {
  try {
    setSessionStatus(session, SESSION_STATUS.CONNECTING);
  } catch (error) {
    logger.error(`Error in onConnecting handler for '${session}':`, error);
  }
});

// Initialize webhook listeners
initializeWebhookListeners();

function loadSafeSessionsFromStorage() {
  const credDir = path.resolve("wa_credentials");
  if (!fs.existsSync(credDir)) {
    fs.mkdirSync(credDir, { recursive: true });
    return;
  }
  const dirs = fs.readdirSync(credDir);
  for (const dir of dirs) {
    if (!dir.endsWith("_credentials")) continue;
    const sessionId = dir.replace(/_credentials$/, "");
    const sessionPath = path.join(credDir, dir);
    try {
      const files = fs.readdirSync(sessionPath);
      // Only restore session if directory contains creds.json and is not already active
      if (
        files.length > 0 &&
        files.includes("creds.json") &&
        !whatsapp.getSession(sessionId)
      ) {
        logger.info(`Restoring saved session '${sessionId}' from storage...`);
        whatsapp.startSession(sessionId, { printQR: false });
      }
    } catch (e) {
      logger.error(`Failed to inspect credential directory '${dir}':`, e);
    }
  }
}

loadSafeSessionsFromStorage();
