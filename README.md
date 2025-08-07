# 📱 WhatsApp API Gateway

Simple and elegant WhatsApp API Gateway with modern web interface. Send messages, images, and documents programmatically with ease.

## ✨ Features

- 🔄 **Multi Session Support** - Connect multiple WhatsApp accounts
- 📱 **Multi Device** - Support for WhatsApp multi-device
- 📤 **Message Sending** - Text, images, documents, and media
- 🎨 **Modern UI** - Clean interface with Tailwind CSS & DaisyUI  
- 🌙 **Dark/Light Mode** - Beautiful themes
- 📱 **Responsive Design** - Works on all devices
- 🔐 **QR Authentication** - Easy setup with QR scanning
- ⚡ **Fast & Reliable** - Built for performance

## 🚀 Quick Start

### 1. Installation

```bash
git clone https://github.com/ICT154/whatsapp-api.git
cd whatsapp-api
npm install
```

### 2. Environment Setup

Create `.env` file:
```env
PORT=5001
KEY=mysupersecretkey
```

### 3. Run Application

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

### 4. Access Dashboard

Open: `http://localhost:5001`

## 📖 API Reference

### 🔑 Authentication

Use the `KEY` from your `.env` file for protected endpoints.

### 📱 Session Management

#### Create Session & Get QR Code

```http
GET /start-session?session=SESSION_NAME&scan=true
```

#### Delete Session

```http
GET /delete-session?session=SESSION_NAME&key=YOUR_KEY
```

#### Get All Sessions

```http
GET /sessions?key=YOUR_KEY
```

### 📤 Send Messages

#### Send Text Message

```http
POST /send-message
Content-Type: application/json

{
  "session": "main",
  "to": "6281234567890",
  "text": "Hello World!"
}
```

#### Send Image

```http
POST /send-image
Content-Type: application/json

{
  "session": "main", 
  "to": "6281234567890",
  "caption": "Check this image!",
  "url": "https://example.com/image.jpg"
}
```

#### Send Document

```http
POST /send-document
Content-Type: application/json

{
  "session": "main",
  "to": "6281234567890", 
  "caption": "Important document",
  "url": "https://example.com/file.pdf",
  "filename": "document.pdf"
}
```

## � Quick Examples

```bash
# Create new session
curl "http://localhost:5001/start-session?session=main&scan=true"

# Send text message  
curl -X POST http://localhost:5001/send-message \
  -H "Content-Type: application/json" \
  -d '{"session":"main","to":"6281234567890","text":"Hello!"}'

# Check sessions
curl "http://localhost:5001/sessions?key=mysupersecretkey"
```

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js
- **Frontend**: EJS, Tailwind CSS, DaisyUI
- **WhatsApp**: wa-multi-session
- **Styling**: Modern responsive design

## 📱 Phone Number Format

Use international format without '+' sign:
- ✅ `6281234567890` (Indonesia)
- ✅ `14155552671` (US)
- ❌ `+62812345678901`
- ❌ `081234567890`

## 🔧 Development

```bash
# Install dependencies
npm install

# Build CSS (first time)
npm run build:css:once

# Development with auto-reload
npm run dev

# Build production CSS
npm run build:css:dev
```

## 📂 Project Structure

```
whatsapp-api/
├── app/
│   ├── controllers/     # API logic
│   ├── routers/         # Route definitions  
│   └── middlewares/     # Custom middlewares
├── public/             # Static assets
├── views/              # EJS templates
├── wa_credentials/     # WhatsApp session data
└── utils/              # Helper functions
```

## ⚠️ Important Notes

- **Session Data**: Stored in `wa_credentials/` directory
- **Security**: Change the default `KEY` in production
- **Webhooks**: Currently disabled for simplicity
- **Rate Limiting**: Be mindful of WhatsApp's rate limits
- **Phone Format**: Always use international format

## 📄 License

This project is licensed under the ISC License.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 💬 Support

- 📧 Email: [Your Email]
- 🐛 Issues: [GitHub Issues](https://github.com/ICT154/whatsapp-api/issues)
- 📖 Docs: This README

---

**Built with ❤️ for the developer community**
  "status": true,
  "data": {
    "qr": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAARQAAAEUCAYAAADqcMl5..."
  }
}
```

**Example:**
```bash
curl -X GET "http://localhost:5001/start-session-api?session=main"
```

#### Delete Session

```http
GET /delete-session?session=SESSION_NAME
```

| Parameter | Type     | Description                              |
| :-------- | :------- | :--------------------------------------- |
| `session` | `string` | **Required**. Session name to delete     |

#### Get All Sessions

```http
GET /sessions?key=YOUR_SECRET_KEY
```

| Parameter | Type     | Description                      |
| :-------- | :------- | :------------------------------- |
| `key`     | `string` | **Required**. Secret key from `.env` |

### 💬 Messaging

#### Send Text Message

```http
POST /send-message
Content-Type: application/json
```

```json
{
  "session": "main",
  "to": "6281234567890",
  "text": "Hello from WhatsApp API!"
}
```

| Body      | Type     | Description                                                              |
| :-------- | :------- | :----------------------------------------------------------------------- |
| `session` | `string` | **Required**. Session name                                               |
| `to`      | `string` | **Required**. Phone number with country code (e.g: 6281234567890)       |
| `text`    | `string` | **Required**. Message content                                            |

#### Send Bulk Messages

```http
POST /send-bulk-message
Content-Type: application/json
```

```json
{
  "session": "main",
  "data": [
    {
      "to": "6281234567890",
      "text": "Hello User 1!"
    },
    {
      "to": "6289876543210", 
      "text": "Hello User 2!"
    }
  ],
  "delay": 3000
}
```

| Body      | Type     | Description                                         |
| :-------- | :------- | :-------------------------------------------------- |
| `session` | `string` | **Required**. Session name                          |
| `data`    | `array`  | **Required**. Array of message objects             |
| `delay`   | `number` | Delay between messages (ms), default: 5000         |

#### Send Document/File

```http
POST /send-document
Content-Type: application/json
```

```json
{
  "session": "main",
  "to": "6281234567890",
  "caption": "Please check this document",
  "url": "https://example.com/document.pdf",
  "filename": "document.pdf"
}
```

| Body       | Type     | Description                                                              |
| :--------- | :------- | :----------------------------------------------------------------------- |
| `session`  | `string` | **Required**. Session name                                               |
| `to`       | `string` | **Required**. Phone number with country code                             |
| `caption`  | `string` | **Required**. Message caption                                            |
| `url`      | `string` | **Required**. Direct URL to the file                                     |
| `filename` | `string` | **Required**. Filename with extension (e.g: .pdf, .docx, .xlsx)         |

#### Send Image

```http
POST /send-image
Content-Type: application/json
```

```json
{
  "session": "main",
  "to": "6281234567890",
  "caption": "Check out this image!",
  "url": "https://example.com/image.jpg"
}
```

| Body      | Type     | Description                                                              |
| :-------- | :------- | :----------------------------------------------------------------------- |
| `session` | `string` | **Required**. Session name                                               |
| `to`      | `string` | **Required**. Phone number with country code                             |
| `caption` | `string` | **Optional**. Image caption/description                                  |
| `url`     | `string` | **Required**. Direct URL to the image file                               |

## 🎨 UI Features

### Modern Dashboard
- **Statistics Overview**: Active sessions, messages sent, API calls
- **Session Management**: Create, view, and delete sessions easily
- **Quick Actions**: Send test messages, create sessions from UI
- **API Examples**: Built-in code examples for easy integration

### Theme System
- **29+ Themes Available**: Light, dark, cyberpunk, forest, and many more
- **Theme Toggle**: Easy switching between light and dark modes
- **Persistent Settings**: Theme preferences saved in localStorage
- **Responsive Design**: Works perfectly on all device sizes

### Available Themes
`light`, `dark`, `cupcake`, `bumblebee`, `emerald`, `corporate`, `synthwave`, `retro`, `cyberpunk`, `valentine`, `halloween`, `garden`, `forest`, `aqua`, `lofi`, `pastel`, `fantasy`, `wireframe`, `black`, `luxury`, `dracula`, `cmyk`, `autumn`, `business`, `acid`, `lemonade`, `night`, `coffee`, `winter`

## 🎣 Webhooks

Webhooks allow you to receive real-time notifications when events occur in your WhatsApp sessions.

### Supported Events
- `message` - New message received
- `qr` - QR code updated  
- `ready` - Session connected
- `authenticated` - Session authenticated
- `auth_failure` - Authentication failed
- `disconnected` - Session disconnected

### Add Webhook URL

```http
POST /webhook/add
Content-Type: application/json
```

```json
{
  "url": "https://your-server.com/webhook",
  "events": ["message", "qr", "ready", "disconnected"]
}
```

### Remove Webhook URL

```http
POST /webhook/remove
Content-Type: application/json
```

```json
{
  "url": "https://your-server.com/webhook"
}
```

### Get All Webhooks

```http
GET /webhook/list
```

**Response:**
```json
{
  "status": true,
  "data": {
    "webhooks": ["https://your-server.com/webhook"],
    "isEnabled": true,
    "supportedEvents": ["message", "qr", "ready", "disconnected"],
    "totalWebhooks": 1
  }
}
```

### Enable/Disable Webhooks

```http
POST /webhook/toggle
Content-Type: application/json
```

```json
{
  "enabled": true
}
```

### Test Webhook

```http
POST /webhook/test
Content-Type: application/json
```

```json
{
  "url": "https://your-server.com/webhook"
}
```

### Clear All Webhooks

```http
POST /webhook/clear
```

### Webhook Payload Format

When an event occurs, your webhook URL will receive a POST request with this payload:

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

#### Message Event Data
```json
{
  "event": "message",
  "timestamp": "2025-01-15T10:30:00.000Z", 
  "data": {
    "sessionId": "main",
    "key": {...},
    "message": {...},
    "from": "6281234567890@s.whatsapp.net",
    "timestamp": 1642234200,
    "messageType": "conversation",
    "body": "Hello World!"
  }
}
```

#### QR Code Event Data
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

#### Session Ready Event Data
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

## 🛠️ Development

### NPM Scripts

```bash
# Development with hot reload (recommended)
npm run dev

# Build CSS for production
npm run build:css:once

# Build CSS for development
npm run build:css:dev

# Watch CSS changes
npm run build:css

# Run server only
npm run serve

# Production start
npm start
```

### File Structure

```
whatsapp-api/
├── 📁 app/
│   ├── controllers/     # API route handlers
│   ├── middlewares/     # Express middlewares
│   └── routers/         # Route definitions
├── 📁 public/
│   ├── css/            # Compiled CSS files
│   └── js/             # Frontend JavaScript
├── 📁 src/
│   └── style.css       # Tailwind CSS source
├── 📁 views/
│   ├── index.ejs       # Dashboard page
│   ├── scan.ejs        # QR scanning page
│   └── error.ejs       # Error page
├── 📁 utils/           # Utility functions
├── 📁 storage/         # File storage
├── 📁 wa_credentials/  # WhatsApp session data
├── tailwind.config.js  # Tailwind configuration
├── package.json        # Dependencies and scripts
└── README.md          # This file
```

### Customization

#### Adding Custom Styles
Edit `src/style.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer components {
  .custom-button {
    @apply btn btn-primary;
  }
}
```

#### Adding New Themes
Edit `tailwind.config.js`:
```javascript
daisyui: {
  themes: ["light", "dark", "cyberpunk"] // Limit themes
}
```

## 🔧 Troubleshooting

### CSS Not Loading
```bash
# Clear and rebuild CSS
rm public/css/style.css
npm run build:css:dev
```

### Session Issues
```bash
# Check active sessions
curl "http://localhost:5001/sessions?key=mysupersecretkey"

# Delete problematic session
curl "http://localhost:5001/delete-session?session=SESSION_NAME"
```

### Port Already in Use
```bash
# Kill existing processes
taskkill /F /IM node.exe
# Or change PORT in .env file
```

## 📚 Documentation

- **[Tailwind Guide](TAILWIND_GUIDE.md)** - Complete Tailwind CSS & DaisyUI guide
- **[CSS Troubleshooting](CSS_TROUBLESHOOTING.md)** - Common CSS issues and solutions
- **[Contributing](CONTRIBUTING.md)** - Contribution guidelines
- **[wa-multi-session](https://github.com/mimamch/wa-multi-session)** - Core WhatsApp library

## 📝 Changelog

### V3.2.2 (Current)
- ✨ **NEW**: Modern UI with Tailwind CSS & DaisyUI
- ✨ **NEW**: 29+ theme support with dark/light mode
- ✨ **NEW**: Responsive dashboard design
- ✨ **NEW**: QR scanning page with improved UX
- ✨ **NEW**: Theme persistence with localStorage
- ✨ **NEW**: Enhanced error pages
- 🔧 **FIX**: CSS compilation issues
- 🔧 **FIX**: DaisyUI compatibility
- 📚 **DOCS**: Updated documentation and guides

### V3.2.0
- ➕ Add Get All Session ID endpoint
- ➕ Add security key for protected data
- 📚 Update README.md

## 🤝 Contributing

Contributions are welcome! Please check out the [Contributing Guidelines](CONTRIBUTING.md).

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- [wa-multi-session](https://github.com/mimamch/wa-multi-session) - Core WhatsApp functionality
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [DaisyUI](https://daisyui.com/) - Beautiful component library
- [Express.js](https://expressjs.com/) - Web framework for Node.js

---

<div align="center">

**Made with ❤️ for the WhatsApp API community**

[⭐ Star this repo](https://github.com/ICT154/whatsapp-api) • [🐛 Report Bug](https://github.com/ICT154/whatsapp-api/issues) • [💡 Request Feature](https://github.com/ICT154/whatsapp-api/issues)

</div>
