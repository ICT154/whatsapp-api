const whatsapp = require("wa-multi-session");
const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const sharp = require('sharp');
const axios = require('axios');

console.log('⚠️  Webhook functionality has been disabled');

// Safe session getter with error handling
function getSafeSession(sessionId) {
    try {
        const session = whatsapp.getSession(sessionId);
        if (!session) {
            console.warn(`⚠️ Session ${sessionId} not found or disconnected`);
            return null;
        }

        // Check if session is actually connected
        if (session.ws && session.ws.readyState === 1) {
            return session;
        } else {
            console.warn(`⚠️ Session ${sessionId} exists but WebSocket not ready`);
            return null;
        }
    } catch (error) {
        console.error(`❌ Error getting session ${sessionId}:`, error.message);
        return null;
    }
}

// Safe message sender with retry logic and rate limiting
async function safeSendMessage(session, jid, messageContent, retries = 2) {
    // Check if session is ready before sending
    if (typeof global.isSessionReady === 'function') {
        const sessionId = session.user?.id || 'main';
        if (!global.isSessionReady(sessionId)) {
            console.log(`⏳ Session ${sessionId} not ready, skipping message`);
            return false;
        }
    }

    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            // Add small delay to prevent rate limiting
            if (attempt > 1) {
                await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            }

            await session.sendMessage(jid, messageContent);
            return true;
        } catch (error) {
            console.error(`❌ Send attempt ${attempt} failed:`, error.message);

            // Don't retry on certain errors
            if (error.message.includes('Timed Out') || error.message.includes('not-authorized')) {
                console.error(`❌ Non-retryable error, stopping attempts`);
                return false;
            }

            if (attempt === retries) {
                console.error(`❌ All ${retries} send attempts failed for ${jid}`);
                return false;
            }
        }
    }
    return false;
}

function initializeWebhookListeners() {
    console.log('🚫 Webhook listeners are currently disabled.');
    console.log('--------------------------------------------------');
    console.log('Webhook endpoints and listeners will not forward any events.');
    console.log('Only basic logging for incoming messages is enabled.');
    console.log('--------------------------------------------------');

    // Add error handler for WebSocket issues
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
                "[No text content]";

            // Skip messages from bot itself or system messages
            if (data.key?.fromMe || sender === sessionId) return;

            console.log('📩 Incoming Message');
            console.log('-------------------');
            console.log(`Session ID : ${sessionId}`);
            console.log(`Sender     : ${sender}`);
            console.log(`JID        : ${jid}`);
            console.log(`Message    : ${message}`);
            console.log('-------------------\n');

            try {
                const apiUrl = 'https://luxeventplanner.com/api/rsvp/whatsapp/response';
                const payload = {
                    number: sender,
                    response: (message || '').toString().trim().toLowerCase()
                };

                let replyText = null;

                try {
                    const apiRes = await axios.post(apiUrl, payload, {
                        headers: { 'Content-Type': 'application/json' },
                        timeout: 10000
                    });

                    console.log('✅ RSVP API response:', apiRes.status, apiRes.data);

                    if (apiRes.status === 200 && apiRes.data?.status === 'success') {
                        replyText = apiRes.data?.message || '✅ Response saved successfully.';
                    } else {
                        replyText = apiRes.data?.message || '❌ An error occurred while checking in.';
                    }
                } catch (apiErr) {
                    // Handle non-2xx responses and network errors
                    const errResp = apiErr.response;
                    if (errResp) {
                        console.warn('⚠️ RSVP API returned error:', errResp.status, errResp.data);
                        if (errResp.status === 400) {
                            replyText = (errResp.data && errResp.data.message) || '❌ Missing required fields: number or response.';
                        } else if (errResp.status === 404) {
                            replyText = (errResp.data && errResp.data.message) || '❌ Guest not found.';
                        } else {
                            replyText = (errResp.data && errResp.data.message) || '❌ An error occurred while checking in.';
                        }
                    } else {
                        console.error('❌ Network/timeout error calling RSVP API:', apiErr.message);
                        replyText = '❌ An error occurred while checking in.';
                    }
                }

                // const response = await axios.post('https://luxeventplanner.com/api/attendance/check-in', {
                //     contact: sender,
                //     message: message
                // }, {
                //     headers: {
                //         'Content-Type': 'application/json'
                //     }
                // });
                // console.log('✅ Message forwarded to external API');
                // console.log('Response:', response.data);

                // if (response.data?.status === 'success') {
                //     const replyMessage = response.data?.data?.reply;
                //     if (replyMessage && sessionId && sessionId !== "unknown") {
                //         const receiver = sender + "@s.whatsapp.net";
                //         const isGroup = false;
                //         const text = replyMessage;
                //         await whatsapp.sendTextMessage({
                //             sessionId,
                //             to: receiver,
                //             isGroup,
                //             text,
                //         });
                //         console.log('📤 Reply sent to sender:', replyMessage);
                //         console.log('Session ID:', sessionId);
                //     }
                // }
            } catch (err) {
                console.error('❌ Failed to forward message:', err.message);
                console.error('Error details:', err.response ? err.response.data : err);
            }
        } catch (messageError) {
            console.error('🚨 Critical error in message handler:', messageError.message);
            console.error('🚨 Stack trace:', messageError.stack);
            console.error('🚨 Data that caused error:', JSON.stringify(data, null, 2));
        }
    });

    console.log('✅ Basic message listeners initialized (webhooks disabled)');
}

exports.addWebhook = async (req, res, next) => {
    try {
        res.status(200).json({
            status: false,
            message: "Webhook functionality has been disabled"
        });
    } catch (error) {
        next(error);
    }
};


exports.removeWebhook = async (req, res, next) => {
    try {
        res.status(200).json({
            status: false,
            message: "Webhook functionality has been disabled"
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
                totalWebhooks: 0
            }
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
            message: "Webhook functionality has been disabled"
        });
    } catch (error) {
        next(error);
    }
};

exports.testWebhook = async (req, res, next) => {
    try {
        res.status(200).json({
            status: false,
            message: "Webhook functionality has been disabled"
        });
    } catch (error) {
        next(error);
    }
};

exports.clearWebhooks = async (req, res, next) => {
    try {
        res.status(200).json({
            status: false,
            message: "Webhook functionality has been disabled"
        });
    } catch (error) {
        next(error);
    }
};


exports.initializeWebhookListeners = initializeWebhookListeners;
