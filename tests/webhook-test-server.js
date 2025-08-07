const express = require('express');
const app = express();

// Middleware untuk parsing JSON
app.use(express.json());

// Array untuk menyimpan webhook yang diterima
let receivedWebhooks = [];

// Endpoint untuk menerima webhook
app.post('/webhook', (req, res) => {
    const webhook = {
        timestamp: new Date().toISOString(),
        payload: req.body,
        headers: req.headers
    };

    receivedWebhooks.push(webhook);

    console.log('🎣 Webhook received:');
    console.log('━'.repeat(50));
    console.log('Event:', req.body.event);
    console.log('Timestamp:', req.body.timestamp);
    console.log('Data:', JSON.stringify(req.body.data, null, 2));
    console.log('━'.repeat(50));

    // Response sukses
    res.status(200).json({
        status: 'success',
        message: 'Webhook received successfully',
        receivedAt: webhook.timestamp
    });
});

// Endpoint untuk melihat semua webhook yang diterima
app.get('/webhooks', (req, res) => {
    res.json({
        total: receivedWebhooks.length,
        webhooks: receivedWebhooks
    });
});

// Endpoint untuk clear webhook history
app.delete('/webhooks', (req, res) => {
    const count = receivedWebhooks.length;
    receivedWebhooks = [];
    res.json({
        message: `Cleared ${count} webhook records`
    });
});

// Endpoint untuk testing (health check)
app.get('/test', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Webhook test server is running',
        uptime: process.uptime(),
        receivedWebhooks: receivedWebhooks.length
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.send(`
        <html>
        <head>
            <title>Webhook Test Server</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 40px; }
                .container { max-width: 800px; margin: 0 auto; }
                .endpoint { background: #f5f5f5; padding: 10px; margin: 10px 0; border-radius: 5px; }
                .method { color: #007acc; font-weight: bold; }
                .url { color: #d73527; }
                h1 { color: #333; }
                h2 { color: #666; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>🎣 Webhook Test Server</h1>
                <p>Server untuk menerima dan menampilkan webhook dari WhatsApp API Gateway</p>
                
                <h2>Available Endpoints:</h2>
                
                <div class="endpoint">
                    <span class="method">POST</span> <span class="url">/webhook</span><br>
                    Menerima webhook dari WhatsApp API
                </div>
                
                <div class="endpoint">
                    <span class="method">GET</span> <span class="url">/webhooks</span><br>
                    Melihat semua webhook yang diterima
                </div>
                
                <div class="endpoint">
                    <span class="method">DELETE</span> <span class="url">/webhooks</span><br>
                    Menghapus history webhook
                </div>
                
                <div class="endpoint">
                    <span class="method">GET</span> <span class="url">/test</span><br>
                    Health check endpoint
                </div>
                
                <h2>Status:</h2>
                <p>✅ Server is running on port 3001</p>
                <p>📊 Total webhooks received: ${receivedWebhooks.length}</p>
                
                <h2>Usage:</h2>
                <p>Tambahkan URL berikut ke WhatsApp API Gateway:</p>
                <code>http://localhost:3001/webhook</code>
            </div>
        </body>
        </html>
    `);
});

const PORT = 3001;

app.listen(PORT, () => {
    console.log('🎣 Webhook Test Server Started');
    console.log('━'.repeat(50));
    console.log(`🌐 Server running on: http://localhost:${PORT}`);
    console.log(`📡 Webhook endpoint: http://localhost:${PORT}/webhook`);
    console.log(`📊 View webhooks: http://localhost:${PORT}/webhooks`);
    console.log(`🧪 Health check: http://localhost:${PORT}/test`);
    console.log('━'.repeat(50));
    console.log('✅ Ready to receive webhooks!');
    console.log('');
});

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down webhook test server...');
    process.exit(0);
});
