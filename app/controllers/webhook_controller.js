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
        if (jid.endsWith("@newsletter")) return;

        const sessionId = data.sessionId || "unknown";
        const sender = jid.split("@")[0];
        const message =
            data.message?.conversation ||
            data.message?.extendedTextMessage?.text ||
            "[No text content]";

        // Skip messages from bot itself or system messages
        if (data.key?.fromMe || sender === sessionId) return;

        if (jid.endsWith("@g.us") && message.startsWith('.tagall')) {
            try {
                // Get the session socket to access group members
                const session = whatsapp.getSession(sessionId);
                if (session) {
                    console.log('🔍 Getting group metadata for:', jid);
                    const groupMetadata = await session.groupMetadata(jid);
                    console.log('📊 Group metadata:', {
                        id: groupMetadata.id,
                        subject: groupMetadata.subject,
                        participantsCount: groupMetadata.participants?.length || 0,
                        participants: groupMetadata.participants?.slice(0, 3) // Show first 3 for debug
                    });

                    const groupMembers = groupMetadata.participants || [];

                    if (groupMembers.length === 0) {
                        console.log('❌ No participants found in group metadata');
                        await session.sendMessage(jid, {
                            text: '❌ Tidak dapat mengakses daftar member grup. Pastikan bot memiliki akses admin atau coba lagi.'
                        });
                        return;
                    }

                    // Debug: Show all members structure
                    console.log('👥 All members raw data:', groupMembers.map(m => ({
                        id: m.id,
                        admin: m.admin,
                        isSuperAdmin: m.isSuperAdmin
                    })));

                    // Filter valid members - Accept both @s.whatsapp.net and @lid formats
                    const validMembers = groupMembers.filter(member => {
                        const isValid = member.id &&
                            (member.id.includes('@s.whatsapp.net') || member.id.includes('@lid')) &&
                            member.id !== session.user?.id; // Exclude bot itself

                        console.log(`🔍 Member ${member.id}: valid=${isValid}`);
                        return isValid;
                    }); console.log('✅ Valid members filtered:', validMembers.length);

                    if (validMembers.length === 0) {
                        await session.sendMessage(jid, {
                            text: '❌ Tidak ada member yang dapat di-mention dalam grup ini.'
                        });
                        return;
                    }

                    // Create mention text with proper format
                    let mentionText = '🔔 *Tag All Members*\n\n';
                    validMembers.forEach(member => {
                        const phoneNumber = member.id.split('@')[0];
                        mentionText += `@${phoneNumber} `;
                    });
                    mentionText += '\n\n_Semua member telah di-mention!_';

                    // Use session socket directly to send message with mentions
                    await session.sendMessage(jid, {
                        text: mentionText,
                        mentions: validMembers.map(member => member.id)
                    });

                    console.log('📤 Tag all members message sent to group:', jid);
                    console.log('👥 Total members tagged:', validMembers.length);
                    console.log('📋 Member IDs:', validMembers.map(m => m.id));
                } else {
                    console.log('❌ Session not found for tagall command');
                }
            } catch (error) {
                console.error('❌ Error in tagall command:', error.message);
                console.error('❌ Stack trace:', error.stack);
            }
            return;
        }
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
