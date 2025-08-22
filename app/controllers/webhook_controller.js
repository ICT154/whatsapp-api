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
        return session;
    } catch (error) {
        console.error(`❌ Error getting session ${sessionId}:`, error.message);
        return null;
    }
}

// Safe message sender with retry logic
async function safeSendMessage(session, jid, messageContent, retries = 3) {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            await session.sendMessage(jid, messageContent);
            return true;
        } catch (error) {
            console.error(`❌ Send attempt ${attempt} failed:`, error.message);
            if (attempt === retries) {
                console.error(`❌ All ${retries} send attempts failed for ${jid}`);
                return false;
            }
            // Wait before retry (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
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
            if (jid.endsWith("@newsletter")) return;

            const sessionId = data.sessionId || "unknown";
            const sender = jid.split("@")[0];
            const message =
                data.message?.conversation ||
                data.message?.extendedTextMessage?.text ||
                "[No text content]";

            // Skip messages from bot itself or system messages
            if (data.key?.fromMe || sender === sessionId) return;

            // Handle image to sticker conversion
            if (data.message?.imageMessage && (message === '.sticker' || data.message?.imageMessage?.caption === '.sticker')) {
                try {
                    const session = getSafeSession(sessionId);
                    if (session) {
                        console.log('🎨 Converting image to sticker for:', sender);

                        try {
                            // Download the image using baileys downloadMediaMessage with session
                            const imageBuffer = await downloadMediaMessage(
                                data,
                                'buffer',
                                {},
                                {
                                    logger: console,
                                    reuploadRequest: session.updateMediaMessage
                                }
                            );

                            if (imageBuffer && Buffer.isBuffer(imageBuffer)) {
                                console.log('📥 Image downloaded successfully, size:', imageBuffer.length, 'bytes');

                                try {
                                    // Convert image to WebP sticker format using sharp
                                    console.log('🔄 Converting image to WebP sticker format...');
                                    const stickerBuffer = await sharp(imageBuffer)
                                        .webp({
                                            quality: 50,
                                            effort: 4
                                        })
                                        .resize(512, 512, {
                                            fit: 'contain',
                                            background: { r: 0, g: 0, b: 0, alpha: 0 }
                                        })
                                        .toBuffer();

                                    console.log('✅ Image converted to WebP, new size:', stickerBuffer.length, 'bytes');

                                    // Send as sticker back to sender
                                    const receiver = jid.endsWith("@g.us") ? jid : sender + "@s.whatsapp.net";

                                    // Send sticker with converted WebP buffer
                                    const stickerSent = await safeSendMessage(session, receiver, {
                                        sticker: stickerBuffer
                                    });

                                    if (stickerSent) {
                                        console.log('✅ Sticker sent successfully to:', receiver);
                                        console.log('📱 Original sender:', sender);
                                        console.log('🏷️ Sticker created from image with .sticker caption');
                                    } else {
                                        console.log('❌ Failed to send sticker after retries');
                                    }
                                } catch (conversionError) {
                                    console.error('❌ Error converting image to WebP:', conversionError.message);
                                    console.error('❌ Conversion stack trace:', conversionError.stack);
                                }
                            } else {
                                console.log('❌ Failed to download image or invalid buffer format');
                                console.log('❌ Buffer type:', typeof imageBuffer);
                                console.log('❌ Is Buffer:', Buffer.isBuffer(imageBuffer));
                            }
                        } catch (downloadError) {
                            console.error('❌ Error downloading media:', downloadError.message);
                            console.error('❌ Download stack trace:', downloadError.stack);
                        }
                    } else {
                        console.log('❌ Session not found for sticker conversion');
                    }
                } catch (error) {
                    console.error('❌ Error converting image to sticker:', error.message);
                    console.error('❌ Stack trace:', error.stack);
                }
                return;
            }

            if (jid.endsWith("@g.us") && message.startsWith('.tagall')) {
                try {
                    // Get the session socket to access group members
                    const session = getSafeSession(sessionId);
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

                        console.log('👥 All members raw data:', groupMembers.map(m => ({
                            id: m.id,
                            admin: m.admin,
                            isSuperAdmin: m.isSuperAdmin
                        })));

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

                        let mentionText = '🔔 *Tag All Members*\n\n';
                        validMembers.forEach(member => {
                            const phoneNumber = member.id.split('@')[0];
                            mentionText += `@${phoneNumber} `;
                        });
                        mentionText += '\n\n_Semua member telah di-mention!_';

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
