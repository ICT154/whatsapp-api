# WhatsApp API - Tailwind CSS & DaisyUI Integration

## Overview
Project WhatsApp API ini telah dikonfigurasi dengan **Tailwind CSS** dan **DaisyUI** untuk styling yang modern dan responsif.

## Teknologi Yang Digunakan
- **Express.js** - Backend framework
- **Tailwind CSS** - Utility-first CSS framework
- **DaisyUI** - Component library untuk Tailwind CSS
- **EJS** - Template engine

## Struktur File

```
whatsapp-api/
├── tailwind.config.js      # Konfigurasi Tailwind CSS & DaisyUI
├── postcss.config.js       # PostCSS configuration
├── src/style.css           # Input CSS file
├── public/
│   ├── css/style.css       # Generated CSS output
│   └── js/theme-toggle.js  # Theme switching functionality
└── views/
    ├── index.ejs           # Homepage dengan dashboard UI
    ├── scan.ejs            # QR Code scanning page
    └── error.ejs           # Error page
```

## Scripts NPM

```bash
# Development mode (watch CSS + server)
npm run dev

# Build CSS once (production)
npm run build:css:once

# Build CSS dengan watch mode
npm run build:css

# Run server saja
npm run serve
```

## Tema Yang Tersedia

DaisyUI mendukung 30+ tema built-in:
- `light` (default)
- `dark`
- `cupcake`
- `bumblebee`
- `emerald`
- `corporate`
- `synthwave`
- `retro`
- `cyberpunk`
- `valentine`
- `halloween`
- `garden`
- `forest`
- `aqua`
- `lofi`
- `pastel`
- `fantasy`
- `wireframe`
- `black`
- `luxury`
- `dracula`
- `cmyk`
- `autumn`
- `business`
- `acid`
- `lemonade`
- `night`
- `coffee`
- `winter`

## Fitur UI Yang Sudah Diimplementasi

### 1. Navigation Bar
- Responsive navbar dengan dropdown menu
- Theme toggle button
- Status badges
- Search dan notification icons

### 2. Hero Section
- Gradient background
- Call-to-action buttons
- Responsive text sizing

### 3. Dashboard Components
- Statistics cards dengan icons
- Feature cards dengan hover effects
- Quick action forms
- API example code block

### 4. QR Scanner Page
- Centered QR code display
- Loading states
- Instruction alerts
- Clean, focused layout

### 5. Error Page
- User-friendly error display
- Stack trace collapse (development mode)
- Navigation buttons
- Consistent styling

### 6. Theme System
- Light/dark mode toggle
- Theme persistence dengan localStorage
- Smooth transitions
- JavaScript API untuk theme management

## Komponen DaisyUI Yang Digunakan

### Layout Components
- `navbar` - Navigation bar
- `hero` - Hero sections
- `footer` - Page footer
- `divider` - Section dividers

### Data Display
- `card` - Content cards
- `badge` - Status indicators
- `stats` - Statistics display
- `alert` - Notification messages

### Actions
- `btn` - Buttons dengan berbagai varian
- `dropdown` - Dropdown menus
- `toggle` - Theme toggle

### Form Elements
- `input` - Text inputs
- `form-control` - Form containers
- `label` - Form labels

### Feedback
- `loading` - Loading indicators
- `mockup-code` - Code examples
- `collapse` - Collapsible content

## Customization

### Menambah Komponen Baru
1. Edit file view (`.ejs`)
2. Gunakan utility classes Tailwind atau komponen DaisyUI
3. Jalankan `npm run build:css:once` untuk compile

### Mengubah Tema Default
Edit `tailwind.config.js`:
```javascript
daisyui: {
    themes: ["light", "dark", "cupcake"], // Batasi tema
    darkTheme: "dark", // Tema default untuk dark mode
}
```

### Menambah Custom Styles
Edit `src/style.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom styles */
.custom-class {
    @apply bg-primary text-white;
}
```

## JavaScript Theme API

Theme toggle tersedia secara global:

```javascript
// Get current theme
ThemeManager.getCurrentTheme();

// Set specific theme
ThemeManager.setTheme('dark');

// Toggle between light/dark
ThemeManager.toggleTheme();

// Get all available themes
ThemeManager.themes;
```

## Development Tips

1. **Hot Reload**: Gunakan `npm run dev` untuk auto-reload CSS dan server
2. **Production Build**: Gunakan `npm run build:css:once` untuk minified CSS
3. **Debugging**: Buka DevTools untuk melihat applied classes
4. **Theme Testing**: Gunakan theme toggle untuk test di berbagai tema

## Troubleshooting

### CSS Tidak Update
```bash
# Clear cache dan rebuild
npm run build:css:once
```

### Theme Tidak Tersimpan
Pastikan browser mendukung localStorage dan tidak dalam mode private/incognito.

### Komponen Tidak Muncul
1. Periksa apakah class ada di `safelist` dalam `tailwind.config.js`
2. Pastikan CSS sudah di-rebuild setelah perubahan

## Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [DaisyUI Components](https://daisyui.com/components/)
- [DaisyUI Themes](https://daisyui.com/docs/themes/)
- [Express.js Documentation](https://expressjs.com/)

---

**Note**: Project ini sudah dikonfigurasi dengan optimal untuk development dan production. Semua komponen responsive dan mendukung dark/light mode.
