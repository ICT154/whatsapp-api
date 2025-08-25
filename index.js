const { config } = require("dotenv");
const express = require("express");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const http = require("http");
const path = require("path");
const MainRouter = require("./app/routers");
const errorHandlerMiddleware = require("./app/middlewares/error_middleware");
const whatsapp = require("wa-multi-session");
const { initializeWebhookListeners } = require("./app/controllers/webhook_controller");

config();

// Global error handlers to prevent crashes
process.on('uncaughtException', (error) => {
  console.error('🚨 Uncaught Exception:', error.message);
  console.error('🚨 Stack trace:', error.stack);
  // Don't exit the process, just log the error
});

process.on('unhandledRejection', (reason, promise) => {
  // Filter common WhatsApp/libsignal errors that are not critical
  if (reason && reason.message && (
    reason.message.includes('Connection Closed') ||
    reason.message.includes('Socket timeout') ||
    reason.message.includes('Bad MAC Error') ||
    reason.message.includes('Key used already or never filled') ||
    reason.message.includes('Failed to decrypt message')
  )) {
    return; // Skip logging these common non-critical errors
  }

  console.error('🚨 Unhandled Rejection at:', promise);
  console.error('🚨 Reason:', reason);
  // Don't exit the process, just log the error

  // Specifically handle Baileys timeout errors
  if (reason && reason.message && reason.message.includes('Timed Out')) {
    console.log('⏰ WhatsApp timeout detected - this is normal and will be handled automatically');
    return; // Don't log full stack for normal timeouts
  }
});

// Handle SIGTERM gracefully
process.on('SIGTERM', () => {
  console.log('📴 SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

// Handle SIGINT gracefully (Ctrl+C)
process.on('SIGINT', () => {
  console.log('📴 SIGINT received, shutting down gracefully...');
  process.exit(0);
});

var app = express();
app.use(morgan("dev"));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.set("view engine", "ejs");
// Public Path
app.use("/p", express.static(path.resolve("public")));
app.use("/p/*", (req, res) => res.status(404).send("Media Not Found"));

app.use(MainRouter);

app.use(errorHandlerMiddleware);

const PORT = process.env.PORT || "5000";
app.set("port", PORT);
var server = http.createServer(app);
server.on("listening", () => console.log("APP IS RUNNING ON PORT " + PORT));

server.listen(PORT);

whatsapp.onConnected((session) => {
  try {
    console.log("✅ Connected => ", session);
  } catch (error) {
    console.error("❌ Error in onConnected handler:", error.message);
  }
});

whatsapp.onDisconnected((session) => {
  try {
    console.log("❌ Disconnected => ", session);
    console.log("ℹ️ Session will need to be manually restarted if needed");
  } catch (error) {
    console.error("❌ Error in onDisconnected handler:", error.message);
  }
});

whatsapp.onConnecting((session) => {
  try {
    console.log("🔄 Connecting => ", session);
  } catch (error) {
    console.error("❌ Error in onConnecting handler:", error.message);
  }
});// Initialize webhook listeners
initializeWebhookListeners();

whatsapp.loadSessionsFromStorage();
