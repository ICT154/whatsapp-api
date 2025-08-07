const whatsapp = require("wa-multi-session");

console.log('⚠️  Webhook functionality has been disabled');

function initializeWebhookListeners() {
    console.log('🚫 Webhook listeners are currently disabled.');
    console.log('--------------------------------------------------');
    console.log('Webhook endpoints and listeners will not forward any events.');
    console.log('Only basic logging for incoming messages is enabled.');
    console.log('--------------------------------------------------');

    // Listen for incoming messages and log details
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
