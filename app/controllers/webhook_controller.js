const whatsapp = require("wa-multi-session");
const axios = require('axios');

console.log('⚠️  Webhook functionality has been disabled');

function initializeWebhookListeners() {
    console.log('🚫 Webhook listeners are currently disabled.');
    console.log('--------------------------------------------------');
    console.log('Webhook endpoints and listeners will not forward any events.');
    console.log('Only basic logging for incoming messages is enabled.');
    console.log('--------------------------------------------------');

    whatsapp.onMessageReceived(async (data) => {
        const jid = data.key?.remoteJid || "";
        if (jid.endsWith("@newsletter") || jid.endsWith("@g.us")) return;

        const sessionId = data.sessionId || "unknown";
        const sender = jid.split("@")[0];
        const message =
            data.message?.conversation ||
            data.message?.extendedTextMessage?.text ||
            "[No text content]";

        console.log('📩 Incoming Message');
        console.log('-------------------');
        console.log(`Session ID : ${sessionId}`);
        console.log(`Sender     : ${sender}`);
        console.log(`JID        : ${jid}`);
        console.log(`Message    : ${message}`);
        console.log('-------------------\n');

        try {
            const response = await axios.post('https://luxeventplanner.com/api/attendace/check-in', {
                contact: sender,
                message: message
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            console.log('✅ Message forwarded to external API');
            console.log('Response:', response.data);



            if (response.data?.status === 'success') {
                const replyMessage = response.data?.data?.reply;
                if (replyMessage && sessionId && sessionId !== "unknown") {
                    const receiver = sender + "@s.whatsapp.net";
                    const isGroup = false;
                    const text = replyMessage;
                    await whatsapp.sendTextMessage({
                        sessionId,
                        to: receiver,
                        isGroup,
                        text,
                    });
                    console.log('📤 Reply sent to sender:', replyMessage);
                    console.log('Session ID:', sessionId);
                }
            }
        } catch (err) {
            console.error('❌ Failed to forward message:', err.message);
            console.error('Error details:', err.response ? err.response.data : err);
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
