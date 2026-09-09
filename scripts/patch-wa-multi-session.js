const fs = require("fs");
const path = require("path");

const targetFile = path.resolve(__dirname, "../node_modules/wa-multi-session/dist/Socket/index.js");

if (!fs.existsSync(targetFile)) {
  console.log("[patch] wa-multi-session not found, skipping patch");
  process.exit(0);
}

let content = fs.readFileSync(targetFile, "utf8");

if (content.includes("/* WA_GATEWAY_PATCHED_RECONNECT */")) {
  console.log("[patch] wa-multi-session is already patched");
  process.exit(0);
}

const targetBlock = `                    if (connection === "close") {
                        const code = (_f = (_e = lastDisconnect === null || lastDisconnect === void 0 ? void 0 : lastDisconnect.error) === null || _e === void 0 ? void 0 : _e.output) === null || _f === void 0 ? void 0 : _f.statusCode;
                        let retryAttempt = (_g = retryCount.get(sessionId)) !== null && _g !== void 0 ? _g : 0;
                        let shouldRetry;
                        if (code != baileys_1.DisconnectReason.loggedOut && retryAttempt < 10) {
                            shouldRetry = true;
                        }
                        if (shouldRetry) {
                            retryAttempt++;
                            retryCount.set(sessionId, retryAttempt);
                            startSocket();
                        }
                        else {
                            retryCount.delete(sessionId);
                            (0, exports.deleteSession)(sessionId);
                            (_h = callback.get(Defaults_1.CALLBACK_KEY.ON_DISCONNECTED)) === null || _h === void 0 ? void 0 : _h(sessionId);
                            (_j = options.onDisconnected) === null || _j === void 0 ? void 0 : _j.call(options);
                        }
                    }
                    if (connection == "open") {
                        retryCount.delete(sessionId);
                        (_k = callback.get(Defaults_1.CALLBACK_KEY.ON_CONNECTED)) === null || _k === void 0 ? void 0 : _k(sessionId);
                        (_l = options.onConnected) === null || _l === void 0 ? void 0 : _l.call(options);
                    }`;

const patchedBlock = `                    /* WA_GATEWAY_PATCHED_RECONNECT */
                    if (connection === "close") {
                        const error = lastDisconnect === null || lastDisconnect === void 0 ? void 0 : lastDisconnect.error;
                        const code = (_f = (_e = error) === null || _e === void 0 ? void 0 : _e.output) === null || _f === void 0 ? void 0 : _f.statusCode;
                        const reason = (error === null || error === void 0 ? void 0 : error.message) || (code ? ("Status " + code) : "Connection closed");
                        
                        try {
                            const logger = require(path_1.default.resolve("utils/logger"));
                            logger.warn("Session '" + sessionId + "' disconnected. Code: " + (code || "N/A") + ", Reason: " + reason);
                        } catch (e) {
                            console.warn("[WARN] Session '" + sessionId + "' disconnected. Code: " + (code || "N/A") + ", Reason: " + reason);
                        }

                        let retryAttempt = (_g = retryCount.get(sessionId)) !== null && _g !== void 0 ? _g : 0;
                        const isLoggedOut = code === baileys_1.DisconnectReason.loggedOut;
                        const isReplaced = code === baileys_1.DisconnectReason.connectionReplaced;
                        let shouldRetry = !isLoggedOut && !isReplaced && retryAttempt < 5;

                        if (shouldRetry) {
                            retryAttempt++;
                            retryCount.set(sessionId, retryAttempt);
                            const delayMs = Math.min(retryAttempt * 3000, 15000);
                            try {
                                const logger = require(path_1.default.resolve("utils/logger"));
                                logger.info("Reconnecting session '" + sessionId + "' in " + (delayMs / 1000) + "s (attempt " + retryAttempt + "/5)...");
                            } catch (e) {}
                            setTimeout(() => {
                                startSocket();
                            }, delayMs);
                        }
                        else {
                            retryCount.delete(sessionId);
                            (0, exports.deleteSession)(sessionId);
                            (_h = callback.get(Defaults_1.CALLBACK_KEY.ON_DISCONNECTED)) === null || _h === void 0 ? void 0 : _h(sessionId);
                            (_j = options.onDisconnected) === null || _j === void 0 ? void 0 : _j.call(options);
                            try {
                                const logger = require(path_1.default.resolve("utils/logger"));
                                if (isReplaced) {
                                    logger.error("Session '" + sessionId + "' stopped: Terdeteksi dibuka di tempat/perangkat lain (connection replaced).");
                                } else if (isLoggedOut) {
                                    logger.error("Session '" + sessionId + "' stopped: Perangkat telah dikeluarkan/logout dari WhatsApp.");
                                } else {
                                    logger.error("Session '" + sessionId + "' stopped: Mencapai batas maksimal percobaan koneksi (5x).");
                                }
                            } catch (e) {}
                        }
                    }
                    if (connection == "open") {
                        setTimeout(() => {
                            if ((0, exports.getSession)(sessionId)) {
                                retryCount.delete(sessionId);
                            }
                        }, 15000);
                        (_k = callback.get(Defaults_1.CALLBACK_KEY.ON_CONNECTED)) === null || _k === void 0 ? void 0 : _k(sessionId);
                        (_l = options.onConnected) === null || _l === void 0 ? void 0 : _l.call(options);
                    }`;

const normContent = content.replace(/\r\n/g, "\n");
const normTarget = targetBlock.replace(/\r\n/g, "\n");

if (normContent.includes(normTarget)) {
  const newContent = normContent.replace(normTarget, patchedBlock.replace(/\r\n/g, "\n"));
  fs.writeFileSync(targetFile, newContent, "utf8");
  console.log("[patch] Successfully patched wa-multi-session reconnection logic!");
} else {
  console.warn("[patch] Target block not matched in wa-multi-session, skipping automatic patch.");
}
