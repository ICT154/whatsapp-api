const whatsapp = require("wa-multi-session");
const axios = require("axios");
const {
    responseSuccessWithMessage,
    responseSuccessWithData,
} = require("../../utils/response");

// Store webhook URLs in memory (in production, use database)
let webhookConfig = {
    urls: [],
    isEnabled: false,
    events: ['message', 'qr', 'ready', 'authenticated', 'auth_failure', 'disconnected']
};

// Function to send webhook notification
async function sendWebhook(event, data) {
    if (!webhookConfig.isEnabled || webhookConfig.urls.length === 0) {
        return;
    }

    const payload = {
        event: event,
        timestamp: new Date().toISOString(),
        data: data
    };

    for (const webhookUrl of webhookConfig.urls) {
        try {
            await axios.post(webhookUrl, payload, {
                timeout: 5000,
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'WhatsApp-API-Webhook/1.0'
                }
            });
            console.log(`✅ Webhook sent to ${webhookUrl} for event: ${event}`);
        } catch (error) {
            console.error(`❌ Failed to send webhook to ${webhookUrl}:`, error.message);
        }
    }
}

// Initialize webhook listeners
function initializeWebhookListeners() {
    console.log('🎣 Initializing webhook listeners...');

    // Message received webhook
    whatsapp.onMessageReceived(async (data) => {
        await sendWebhook('message', {
            sessionId: data.sessionId,
            key: data.key,
            message: data.message,
            from: data.message.key.remoteJid,
            timestamp: data.message.messageTimestamp,
            messageType: Object.keys(data.message.message)[0],
            body: data.message.message.conversation ||
                data.message.message.extendedTextMessage?.text ||
                '[Media/Other]'
        });
    });

    // QR Code updated webhook
    whatsapp.onQRUpdated(async (data) => {
        await sendWebhook('qr', {
            sessionId: data.sessionId,
            qr: data.qr,
            status: 'qr_updated'
        });
    });

    // Session connected webhook
    whatsapp.onConnected(async (data) => {
        await sendWebhook('ready', {
            sessionId: data.sessionId,
            status: 'connected',
            info: data
        });
    });

    // Session disconnected webhook
    whatsapp.onDisconnected(async (data) => {
        await sendWebhook('disconnected', {
            sessionId: data.sessionId,
            status: 'disconnected',
            reason: data.reason || 'unknown'
        });
    });

    console.log('✅ Webhook listeners initialized');
}

// Add webhook URL
exports.addWebhook = async (req, res, next) => {
    try {
        const { url, events } = req.body;

        if (!url) {
            return res.status(400).json({
                status: false,
                message: "Webhook URL is required"
            });
        }

        // Validate URL format
        try {
            new URL(url);
        } catch (error) {
            return res.status(400).json({
                status: false,
                message: "Invalid URL format"
            });
        }

        // Check if URL already exists
        if (webhookConfig.urls.includes(url)) {
            return res.status(400).json({
                status: false,
                message: "Webhook URL already exists"
            });
        }

        webhookConfig.urls.push(url);

        // Update events if provided
        if (events && Array.isArray(events)) {
            webhookConfig.events = events;
        }

        res.status(200).json(responseSuccessWithMessage(`Webhook URL added successfully: ${url}`));
    } catch (error) {
        next(error);
    }
};

// Remove webhook URL
exports.removeWebhook = async (req, res, next) => {
    try {
        const { url } = req.body;

        if (!url) {
            return res.status(400).json({
                status: false,
                message: "Webhook URL is required"
            });
        }

        const index = webhookConfig.urls.indexOf(url);
        if (index === -1) {
            return res.status(404).json({
                status: false,
                message: "Webhook URL not found"
            });
        }

        webhookConfig.urls.splice(index, 1);

        res.status(200).json(responseSuccessWithMessage(`Webhook URL removed successfully: ${url}`));
    } catch (error) {
        next(error);
    }
};

// Get all webhook URLs
exports.getWebhooks = async (req, res, next) => {
    try {
        res.status(200).json(responseSuccessWithData({
            webhooks: webhookConfig.urls,
            isEnabled: webhookConfig.isEnabled,
            supportedEvents: webhookConfig.events,
            totalWebhooks: webhookConfig.urls.length
        }));
    } catch (error) {
        next(error);
    }
};

// Enable/Disable webhooks
exports.toggleWebhooks = async (req, res, next) => {
    try {
        const { enabled } = req.body;

        if (typeof enabled !== 'boolean') {
            return res.status(400).json({
                status: false,
                message: "Enabled parameter must be boolean (true/false)"
            });
        }

        webhookConfig.isEnabled = enabled;

        const status = enabled ? 'enabled' : 'disabled';
        res.status(200).json(responseSuccessWithMessage(`Webhooks ${status} successfully`));
    } catch (error) {
        next(error);
    }
};

// Test webhook
exports.testWebhook = async (req, res, next) => {
    try {
        const { url } = req.body;

        if (!url) {
            return res.status(400).json({
                status: false,
                message: "Webhook URL is required for testing"
            });
        }

        const testPayload = {
            event: 'test',
            timestamp: new Date().toISOString(),
            data: {
                message: 'This is a test webhook from WhatsApp API',
                source: 'webhook_test_endpoint'
            }
        };

        try {
            await axios.post(url, testPayload, {
                timeout: 5000,
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'WhatsApp-API-Webhook/1.0'
                }
            });

            res.status(200).json(responseSuccessWithMessage(`Test webhook sent successfully to ${url}`));
        } catch (error) {
            res.status(400).json({
                status: false,
                message: `Failed to send test webhook: ${error.message}`
            });
        }
    } catch (error) {
        next(error);
    }
};

// Clear all webhooks
exports.clearWebhooks = async (req, res, next) => {
    try {
        const count = webhookConfig.urls.length;
        webhookConfig.urls = [];

        res.status(200).json(responseSuccessWithMessage(`Cleared ${count} webhook URLs`));
    } catch (error) {
        next(error);
    }
};

// Export webhook config for other modules
exports.webhookConfig = webhookConfig;
exports.sendWebhook = sendWebhook;
exports.initializeWebhookListeners = initializeWebhookListeners;
