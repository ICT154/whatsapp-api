# 🧪 Webhook Testing Guide

Panduan lengkap untuk testing fitur webhook WhatsApp API Gateway.

## 📋 Overview

Webhook testing mencakup:
- ✅ Test server untuk menerima webhook
- 🧪 Automated testing script  
- 🌐 HTML interface untuk testing via browser
- 📊 Monitoring dan logging

## 🚀 Quick Start

### 1. Start Main API Server
```bash
npm run dev
```

### 2. Start Webhook Test Server
```bash
# Terminal baru
npm run test:webhook-server
```

### 3. Run Automated Tests
```bash
# Terminal baru  
npm run test:webhook
```

### 4. Open Browser Tester
Buka file: `tests/webhook-tester.html` di browser

## 📁 File Structure

```
tests/
├── webhook-test-server.js     # Test server untuk menerima webhook
├── webhook-test.js           # Automated testing script
├── webhook-tester.html       # Browser-based testing interface
└── WEBHOOK_TESTING.md        # Documentation (file ini)
```

## 🎯 Test Server (webhook-test-server.js)

Server sederhana untuk menerima dan menampilkan webhook dari WhatsApp API.

### Features:
- 📡 Menerima webhook di `/webhook`
- 📊 Melihat history di `/webhooks`  
- 🧹 Clear history di `/webhooks` (DELETE)
- ❤️ Health check di `/test`
- 🌐 Web interface di `/`

### Usage:
```bash
npm run test:webhook-server
```

Server akan berjalan di: http://localhost:3001

### Endpoints:
- `POST /webhook` - Terima webhook
- `GET /webhooks` - Lihat semua webhook yang diterima
- `DELETE /webhooks` - Hapus history webhook
- `GET /test` - Health check
- `GET /` - Web interface

## 🧪 Automated Testing (webhook-test.js)

Script untuk testing otomatis semua endpoint webhook API.

### Tests yang dilakukan:
1. ✅ Add webhook URL
2. 📋 Get all webhooks  
3. 🔛 Enable webhooks
4. 🧪 Test webhook endpoint
5. 🚫 Prevent duplicate webhooks
6. ❌ Reject invalid URLs
7. ❌ Fail to remove non-existent webhook
8. 🗑️ Remove webhook

### Usage:
```bash
npm run test:webhook
```

### Prerequisites:
- WhatsApp API server running (localhost:5001)
- Webhook test server running (localhost:3001)

## 🌐 Browser Tester (webhook-tester.html)

Interface web untuk testing webhook secara interaktif.

### Features:
- ⚙️ Configuration panel
- 🟢 Server status indicators
- ➕ Add webhook interface
- 📋 Get webhooks list
- 🧪 Test webhook sending
- 🔄 Toggle webhook status
- 🗑️ Remove webhook
- 🧹 Clear all webhooks
- 📄 Activity logs
- 🚀 Run all tests button

### Usage:
1. Pastikan kedua server berjalan
2. Buka `tests/webhook-tester.html` di browser
3. Gunakan interface untuk testing

## 📡 Webhook Events

Event yang didukung:
- `message` - Pesan masuk
- `qr` - QR code updated
- `ready` - Session connected
- `authenticated` - Session authenticated  
- `auth_failure` - Authentication gagal
- `disconnected` - Session disconnected

## 📊 Webhook Payload Format

### Message Event:
```json
{
  "event": "message",
  "timestamp": "2025-01-15T10:30:00.000Z",
  "data": {
    "sessionId": "main",
    "from": "6281234567890@s.whatsapp.net",
    "messageType": "conversation",
    "body": "Hello World!",
    "timestamp": 1642234200,
    "key": {...},
    "message": {...}
  }
}
```

### QR Event:
```json
{
  "event": "qr", 
  "timestamp": "2025-01-15T10:30:00.000Z",
  "data": {
    "sessionId": "main",
    "qr": "data:image/png;base64,iVBORw...",
    "status": "qr_updated"
  }
}
```

### Ready Event:
```json
{
  "event": "ready",
  "timestamp": "2025-01-15T10:30:00.000Z", 
  "data": {
    "sessionId": "main",
    "status": "connected",
    "info": {...}
  }
}
```

## 🔧 Testing Scenarios

### 1. Basic Webhook Flow
```bash
# Terminal 1: Start main API
npm run dev

# Terminal 2: Start test server  
npm run test:webhook-server

# Terminal 3: Run tests
npm run test:webhook
```

### 2. Manual Testing
```bash
# Add webhook
curl -X POST http://localhost:5001/webhook/add \
  -H "Content-Type: application/json" \
  -d '{"url": "http://localhost:3001/webhook"}'

# Test webhook
curl -X POST http://localhost:5001/webhook/test \
  -H "Content-Type: application/json" \
  -d '{"url": "http://localhost:3001/webhook"}'

# Check received webhooks
curl http://localhost:3001/webhooks
```

### 3. Browser Testing
1. Buka `tests/webhook-tester.html`
2. Check server status (harus hijau)
3. Add webhook URL
4. Test webhook
5. Monitor logs

## 🐛 Troubleshooting

### Server tidak bisa diakses
- Pastikan port 5001 dan 3001 tidak digunakan
- Check firewall settings
- Pastikan process node.js berjalan

### Webhook tidak diterima
- Check webhook URL format (http/https)
- Pastikan webhook server running
- Check network connectivity
- Lihat console logs

### Test gagal
- Restart kedua server
- Check dependencies (npm install)
- Pastikan axios terpasang
- Check port conflicts

## 📈 Advanced Testing

### Load Testing
```javascript
// Test multiple webhooks
for(let i = 0; i < 100; i++) {
  await sendWebhook('test', {iteration: i});
}
```

### Error Simulation
```javascript
// Test with invalid URL
await addWebhook('invalid-url');

// Test with non-existent server
await addWebhook('http://localhost:9999/webhook');
```

### Event Simulation
```javascript
// Simulate message event
await sendWebhook('message', {
  sessionId: 'test',
  from: '628123456789@s.whatsapp.net',
  body: 'Test message'
});
```

## 📚 References

- [Webhook API Documentation](../README.md#-webhooks)
- [Express.js Documentation](https://expressjs.com/)
- [Axios Documentation](https://axios-http.com/)

---

🎉 **Happy Testing!** 

Jika ada pertanyaan atau masalah, silakan buat issue di repository atau hubungi tim development.
