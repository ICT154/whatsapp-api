const fs = require("fs");
const path = require("path");

// 1. Patch wa-multi-session (Socket/index.js)
const waSocketFile = path.resolve(
  __dirname,
  "../node_modules/wa-multi-session/dist/Socket/index.js",
);

if (fs.existsSync(waSocketFile)) {
  let content = fs.readFileSync(waSocketFile, "utf8");
  let modified = false;

  // Patch 1A: Reconnect logic (prevent infinite reconnect loops on 440 conflict / 401 logout)
  if (!content.includes("/* WA_GATEWAY_PATCHED_RECONNECT */")) {
    const targetReconnect = `                    if (connection === "close") {
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

    const patchedReconnect = `                    /* WA_GATEWAY_PATCHED_RECONNECT */
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
                            if (isLoggedOut) {
                                (0, exports.deleteSession)(sessionId);
                            } else {
                                try {
                                    const sess = (0, exports.getSession)(sessionId);
                                    sess === null || sess === void 0 ? void 0 : sess.end(undefined);
                                } catch (e) {}
                                sessions.delete(sessionId);
                            }
                            (_h = callback.get(Defaults_1.CALLBACK_KEY.ON_DISCONNECTED)) === null || _h === void 0 ? void 0 : _h(sessionId);
                            (_j = options.onDisconnected) === null || _j === void 0 ? void 0 : _j.call(options);
                            try {
                                const logger = require(path_1.default.resolve("utils/logger"));
                                if (isReplaced) {
                                    logger.warn("Session '" + sessionId + "' disconnected: Terdeteksi dibuka di tempat/perangkat lain (connection replaced). Kredensial disimpan.");
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
    const normTarget = targetReconnect.replace(/\r\n/g, "\n");
    if (normContent.includes(normTarget)) {
      content = normContent.replace(
        normTarget,
        patchedReconnect.replace(/\r\n/g, "\n"),
      );
      modified = true;
      console.log(
        "[patch] Patched wa-multi-session reconnect logic successfully.",
      );
    }
  }

  // Patch 1B: Baileys Socket options (keepAliveIntervalMs, defaultQueryTimeoutMs, getMessage retry handler)
  if (!content.includes("getGatewayMessage")) {
    const patchedSocketOpts = `        /* WA_GATEWAY_PATCHED_SOCKET_OPTS */
        const sock = (0, baileys_1.default)({
            version,
            auth: state,
            logger: P,
            markOnlineOnConnect: false,
            browser: baileys_1.Browsers.ubuntu("Chrome"),
            defaultQueryTimeoutMs: 90000,
            keepAliveIntervalMs: 15000,
            connectTimeoutMs: 30000,
            retryRequestDelayMs: 500,
            maxMsgRetryCount: 5,
            getMessage: async (key) => {
                if (typeof global.getGatewayMessage === "function") {
                    return await global.getGatewayMessage(sessionId, key);
                }
                return undefined;
            },
        });`;

    const normContent = content.replace(/\r\n/g, "\n");
    const origTarget = `        const sock = (0, baileys_1.default)({
            version,
            auth: state,
            logger: P,
            markOnlineOnConnect: false,
            browser: baileys_1.Browsers.ubuntu("Chrome"),
        });`.replace(/\r\n/g, "\n");

    const prevPatchedTarget = `        /* WA_GATEWAY_PATCHED_SOCKET_OPTS */
        const sock = (0, baileys_1.default)({
            version,
            auth: state,
            logger: P,
            markOnlineOnConnect: false,
            browser: baileys_1.Browsers.ubuntu("Chrome"),
            defaultQueryTimeoutMs: 90000,
            keepAliveIntervalMs: 15000,
            connectTimeoutMs: 30000,
            retryRequestDelayMs: 500,
            maxMsgRetryCount: 5,
        });`.replace(/\r\n/g, "\n");

    if (normContent.includes(prevPatchedTarget)) {
      content = normContent.replace(
        prevPatchedTarget,
        patchedSocketOpts.replace(/\r\n/g, "\n"),
      );
      modified = true;
      console.log(
        "[patch] Updated wa-multi-session socket options with getMessage retry handler.",
      );
    } else if (normContent.includes(origTarget)) {
      content = normContent.replace(
        origTarget,
        patchedSocketOpts.replace(/\r\n/g, "\n"),
      );
      modified = true;
      console.log(
        "[patch] Patched wa-multi-session socket options with getMessage retry handler.",
      );
    }
  }

  // Patch 1C: messages.upsert message caching for retry decryption (fixes "Waiting for this message")
  if (!content.includes("/* WA_GATEWAY_PATCHED_UPSERT_CACHE */")) {
    const targetUpsert = `                if (events["messages.upsert"]) {
                    const msg = (_p = events["messages.upsert"]
                        .messages) === null || _p === void 0 ? void 0 : _p[0];`;

    const patchedUpsert = `                if (events["messages.upsert"]) {
                    /* WA_GATEWAY_PATCHED_UPSERT_CACHE */
                    try {
                        for (const m of events["messages.upsert"].messages || []) {
                            if (m && m.key && m.key.id && m.message && typeof global.saveGatewayMessage === "function") {
                                global.saveGatewayMessage(m.key.id, m.message);
                            }
                        }
                    } catch (e) {}
                    const msg = (_p = events["messages.upsert"]
                        .messages) === null || _p === void 0 ? void 0 : _p[0];`;

    const normContent = content.replace(/\r\n/g, "\n");
    const normTarget = targetUpsert.replace(/\r\n/g, "\n");
    if (normContent.includes(normTarget)) {
      content = normContent.replace(
        normTarget,
        patchedUpsert.replace(/\r\n/g, "\n"),
      );
      modified = true;
      console.log(
        "[patch] Patched wa-multi-session upsert cache for retry decryption successfully.",
      );
    }
  }

  if (modified) {
    fs.writeFileSync(waSocketFile, content, "utf8");
  } else {
    console.log("[patch] wa-multi-session socket logic is up to date.");
  }
}

// 2. Patch @whiskeysockets/baileys (messages-send.js: refreshMediaConn rejected promise & timeout fix)
const baileysSendFile = path.resolve(
  __dirname,
  "../node_modules/@whiskeysockets/baileys/lib/Socket/messages-send.js",
);

if (fs.existsSync(baileysSendFile)) {
  let bContent = fs.readFileSync(baileysSendFile, "utf8");

  if (!bContent.includes("/* WA_GATEWAY_PATCHED_MEDIA_CONN */")) {
    const targetMediaConn = `    let mediaConn;
    const refreshMediaConn = async (forceGet = false) => {
        const media = await mediaConn;
        if (!media || forceGet || new Date().getTime() - media.fetchDate.getTime() > media.ttl * 1000) {
            mediaConn = (async () => {
                const result = await query({
                    tag: 'iq',
                    attrs: {
                        type: 'set',
                        xmlns: 'w:m',
                        to: S_WHATSAPP_NET
                    },
                    content: [{ tag: 'media_conn', attrs: {} }]
                });
                const mediaConnNode = getBinaryNodeChild(result, 'media_conn');
                const node = {
                    hosts: getBinaryNodeChildren(mediaConnNode, 'host').map(({ attrs }) => ({
                        hostname: attrs.hostname,
                        maxContentLengthBytes: +attrs.maxContentLengthBytes
                    })),
                    auth: mediaConnNode.attrs.auth,
                    ttl: +mediaConnNode.attrs.ttl,
                    fetchDate: new Date()
                };
                logger.debug('fetched media conn');
                return node;
            })();
        }
        return mediaConn;
    };`;

    const patchedMediaConn = `    /* WA_GATEWAY_PATCHED_MEDIA_CONN */
    let mediaConn;
    const refreshMediaConn = async (forceGet = false) => {
        let media;
        try {
            media = await mediaConn;
        } catch {
            mediaConn = undefined;
            media = undefined;
        }
        if (!media || forceGet || new Date().getTime() - media.fetchDate.getTime() > media.ttl * 1000) {
            mediaConn = (async () => {
                try {
                    const result = await query({
                        tag: 'iq',
                        attrs: {
                            type: 'set',
                            xmlns: 'w:m',
                            to: S_WHATSAPP_NET
                        },
                        content: [{ tag: 'media_conn', attrs: {} }]
                    });
                    const mediaConnNode = getBinaryNodeChild(result, 'media_conn');
                    const node = {
                        hosts: getBinaryNodeChildren(mediaConnNode, 'host').map(({ attrs }) => ({
                            hostname: attrs.hostname,
                            maxContentLengthBytes: +attrs.maxContentLengthBytes
                        })),
                        auth: mediaConnNode.attrs.auth,
                        ttl: +mediaConnNode.attrs.ttl,
                        fetchDate: new Date()
                    };
                    logger.debug('fetched media conn');
                    return node;
                } catch (err) {
                    mediaConn = undefined;
                    throw err;
                }
            })();
        }
        return mediaConn;
    };`;

    const normBContent = bContent.replace(/\r\n/g, "\n");
    const normBTarget = targetMediaConn.replace(/\r\n/g, "\n");
    if (normBContent.includes(normBTarget)) {
      bContent = normBContent.replace(
        normBTarget,
        patchedMediaConn.replace(/\r\n/g, "\n"),
      );
      fs.writeFileSync(baileysSendFile, bContent, "utf8");
      console.log(
        "[patch] Patched Baileys refreshMediaConn (timeout recovery) successfully.",
      );
    } else {
      console.warn(
        "[patch] Target block not matched in Baileys messages-send.js, skipping.",
      );
    }
  } else {
    console.log("[patch] Baileys refreshMediaConn is already patched.");
  }
}
