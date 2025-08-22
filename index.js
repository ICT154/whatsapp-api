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
  console.error('🚨 Unhandled Rejection at:', promise);
  console.error('🚨 Reason:', reason);
  // Don't exit the process, just log the error
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

    // Optional: Auto-reconnect with exponential backoff
    setTimeout(() => {
      try {
        console.log("🔄 Attempting to reconnect session:", session);
        whatsapp.startSession(session);
      } catch (reconnectError) {
        console.error("❌ Failed to reconnect:", reconnectError.message);
      }
    }, 5000); // Wait 5 seconds before reconnecting

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
});

// Initialize webhook listeners
initializeWebhookListeners();

whatsapp.loadSessionsFromStorage();
