/**
 * Utility logger terstruktur dan profesional untuk WhatsApp API Gateway
 */

function formatTime(date = new Date()) {
  const pad = (n) => String(n).padStart(2, "0");
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

const logger = {
  info(message, meta = null) {
    const time = formatTime();
    if (meta) {
      console.log(`[${time}] [INFO]  ${message}`, meta);
    } else {
      console.log(`[${time}] [INFO]  ${message}`);
    }
  },

  warn(message, meta = null) {
    const time = formatTime();
    if (meta) {
      console.warn(`[${time}] [WARN]  ${message}`, meta);
    } else {
      console.warn(`[${time}] [WARN]  ${message}`);
    }
  },

  error(message, error = null) {
    const time = formatTime();
    if (error && error.stack) {
      console.error(
        `[${time}] [ERROR] ${message} - Details: ${error.message}\n${error.stack}`,
      );
    } else if (error) {
      console.error(`[${time}] [ERROR] ${message}`, error);
    } else {
      console.error(`[${time}] [ERROR] ${message}`);
    }
  },

  debug(message, meta = null) {
    if (process.env.DEBUG || process.env.NODE_ENV === "development") {
      const time = formatTime();
      if (meta) {
        console.log(`[${time}] [DEBUG] ${message}`, meta);
      } else {
        console.log(`[${time}] [DEBUG] ${message}`);
      }
    }
  },
};

module.exports = logger;
