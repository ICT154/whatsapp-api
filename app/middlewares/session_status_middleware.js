/**
 * Middleware to check session status before allowing operations
 */

function sessionStatusMiddleware(req, res, next) {
    try {
        const sessionId = req.body.session || req.params.session || 'main';

        // Check if session status functions are available
        if (typeof global.getSessionStatus !== 'function' ||
            typeof global.isSessionReady !== 'function') {
            return res.status(500).json({
                status: false,
                message: 'Session status system not initialized'
            });
        }

        const sessionStatus = global.getSessionStatus(sessionId);
        const isReady = global.isSessionReady(sessionId);

        // If session is not ready, return appropriate message
        if (!isReady) {
            let message = '';
            let statusCode = 503; // Service Unavailable

            switch (sessionStatus) {
                case global.SESSION_STATUS.DISCONNECTED:
                    message = 'Session belum tersambung. Silakan scan QR code terlebih dahulu.';
                    statusCode = 400;
                    break;
                case global.SESSION_STATUS.CONNECTING:
                    message = 'Session sedang menghubungkan ke WhatsApp. Harap tunggu beberapa saat.';
                    break;
                case global.SESSION_STATUS.CONNECTED:
                    message = 'Session baru saja tersambung, sedang mempersiapkan sistem. Harap tunggu sebentar.';
                    break;
                case global.SESSION_STATUS.SYNCING:
                    message = 'Session sedang menyinkronkan pesan. Harap tunggu hingga proses selesai.';
                    break;
                default:
                    message = 'Session belum siap untuk operasi. Harap tunggu beberapa saat.';
            }

            return res.status(statusCode).json({
                status: false,
                message: message,
                session_status: sessionStatus,
                retry_after: 5 // seconds
            });
        }

        // Session is ready, proceed to next middleware
        next();

    } catch (error) {
        console.error('❌ Error in session status middleware:', error.message);
        return res.status(500).json({
            status: false,
            message: 'Error checking session status: ' + error.message
        });
    }
}

module.exports = sessionStatusMiddleware;
