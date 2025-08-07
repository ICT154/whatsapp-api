# WhatsApp API Gateway with Modern UI

Easy Setup Headless multi session WhatsApp Gateway with NodeJS, featuring a modern web interface built with **Tailwind CSS** and **DaisyUI**.

## ✨ Features

- 🔄 **Multi Device Support** - Connect multiple WhatsApp accounts
- 📱 **Multi Session** - Manage multiple phone numbers simultaneously  
- ⚡ **Anti Delay Message** - Fast message delivery
- 📤 **Bulk Messaging** - Send messages to multiple recipients
- 🖼️ **Image Sending** - Send images with captions
- 📄 **Document Sharing** - Send files and documents
- 🎨 **Modern UI** - Beautiful web interface with Tailwind CSS & DaisyUI
- 🌙 **Dark/Light Mode** - Theme switching with 29+ built-in themes
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- 🔐 **QR Code Authentication** - Easy session setup with QR scanning

#### Based on [wa-multi-session](https://github.com/mimamch/wa-multi-session)

## 🛠️ Tech Stack

- **Backend**: Express.js, Node.js
- **Frontend**: EJS Templates, Tailwind CSS, DaisyUI
- **WhatsApp**: wa-multi-session library
- **Styling**: 29+ themes, responsive design, dark/light mode

## 📋 Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=5001

# Security Key
KEY=mysupersecretkey
```

## 🚀 Installation & Setup

### 1. Clone Repository

```bash
git clone https://github.com/ICT154/whatsapp-api.git
cd whatsapp-api
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create `.env` file:
```env
PORT=5001
KEY=mysupersecretkey
```

### 4. Build CSS (First Time)

```bash
npm run build:css:once
```

### 5. Run Application

#### Development Mode (Recommended)
```bash
npm run dev
```
*Runs server with auto-reload and CSS watch mode*

#### Production Mode
```bash
npm start
```

### 6. Access Dashboard

Open your browser and navigate to:
```
http://localhost:5001
```

## 🎯 Quick Start

1. **Open Dashboard**: Visit `http://localhost:5001`
2. **Create Session**: Click "Create New Session" or use the form
3. **Scan QR Code**: Follow the link to scan QR with your WhatsApp
4. **Start Messaging**: Use the API endpoints or web interface

### 📤 Quick API Examples

```bash
# Send Text Message
curl -X POST http://localhost:5001/send-message \
  -H "Content-Type: application/json" \
  -d '{"session":"main","to":"6281234567890","text":"Hello World!"}'

# Send Image
curl -X POST http://localhost:5001/send-image \
  -H "Content-Type: application/json" \
  -d '{"session":"main","to":"6281234567890","caption":"Nice image!","url":"https://example.com/image.jpg"}'

# Send Document
curl -X POST http://localhost:5001/send-document \
  -H "Content-Type: application/json" \
  -d '{"session":"main","to":"6281234567890","caption":"Document","url":"https://example.com/file.pdf","filename":"file.pdf"}'
```

## 📖 API Reference

### 🔑 Authentication

All secure endpoints require the `KEY` parameter from your `.env` file.

### 📱 Session Management

#### Create New Session & Get QR Code

```http
GET /start-session?session=SESSION_NAME&scan=true
```

| Parameter | Type      | Description                              |
| :-------- | :-------- | :--------------------------------------- |
| `session` | `string`  | **Required**. Your unique session name   |
| `scan`    | `boolean` | **Required**. Set to `true` for QR display |

**Example:**
```bash
http://localhost:5001/start-session?session=main&scan=true
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
