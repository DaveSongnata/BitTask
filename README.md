<p align="center">
  <video src="https://www.youtube.com/watch?v=nDPo6DWLiAQ" alt="BitTask Logo" width="120" height="120">
</p>

<h1 align="center">BitTask</h1>

<p align="center">
  <strong>A pixel-art PWA todo app with offline-first architecture</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#demo">Demo</a> •
  <a href="#installation">Installation</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#contributing">Contributing</a> •
  <a href="#license">License</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18.x-61DAFB?style=flat-square&logo=react" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Vite-6.x-646CFF?style=flat-square&logo=vite" alt="Vite">
  <img src="https://img.shields.io/badge/PWA-Ready-5A0FC8?style=flat-square&logo=pwa" alt="PWA">
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="License">
</p>

---

## Overview

BitTask is a modern, offline-first Progressive Web App (PWA) for task management, featuring a unique retro pixel-art aesthetic inspired by the [SLSO8 color palette](https://lospec.com/palette-list/slso8). Built with React and TypeScript, it works seamlessly across all devices and continues to function without an internet connection.

## Features

### Core Functionality
- ✅ **Task Management** - Create, edit, delete, and organize your tasks
- 📋 **Boards System** - Organize tasks into customizable boards with hamburger menu navigation
- ☑️ **Subtasks/Checklists** - Break down tasks into smaller, trackable items with progress indicators
- 🔢 **Sequential IDs** - Reference tasks easily with unique \`#ID\` identifiers (e.g., \`#42\`)
- 🎯 **Priority Levels** - Assign Low, Medium, or High priority to tasks
- 🏷️ **Tags** - Categorize tasks with custom tags

### Attachments
- 🖼️ **Image Upload** - Attach images with automatic compression
- 📷 **Camera Capture** - Take photos directly from the app
- 🎵 **Audio Files** - Attach audio recordings
- 📄 **PDF Documents** - Attach and preview PDF files
- 🔗 **Web Links** - Save URLs with automatic favicon fetching

### Progressive Web App
- 📴 **Offline-First** - Full functionality without internet connection
- 📲 **Installable** - Add to home screen on any device
- 📤 **Share Target** - Receive shared content from other apps (Android/Chrome)
- 🔄 **Background Sync** - Automatic sync when connection is restored

### Accessibility & i18n
- 🌍 **Multi-language** - English, Portuguese (Brazil), and Spanish
- 🎤 **Speech-to-Text** - Voice input for task descriptions
- 🌓 **Dark/Light Mode** - System-aware theme switching
- 📱 **Responsive Design** - Works on mobile, tablet, and desktop

## Demo

🌐 **Live Demo:** [https://bittask.vercel.app](https://bittask.vercel.app)

## Installation

### Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher

### Quick Start

\`\`\`bash
# Clone the repository
git clone https://github.com/yourusername/bittask.git
cd bittask

# Install dependencies
npm install

# Start development server
npm run dev
\`\`\`

The app will be available at \`http://localhost:3000\`.

### Build for Production

\`\`\`bash
# Create production build
npm run build

# Preview production build
npm run preview
\`\`\`

### Available Scripts

| Script | Description |
|--------|-------------|
| \`npm run dev\` | Start development server |
| \`npm run build\` | Build for production |
| \`npm run preview\` | Preview production build |
| \`npm run typecheck\` | Run TypeScript type checking |
| \`npm run lint\` | Run ESLint |
| \`npm run test\` | Run tests |

## Tech Stack

### Frontend
- **[React 18](https://react.dev/)** - UI library with hooks
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[Vite](https://vitejs.dev/)** - Next-generation build tool
- **[React Router v6](https://reactrouter.com/)** - Client-side routing
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework

### Data & Storage
- **[Dexie.js](https://dexie.org/)** - IndexedDB wrapper for offline storage
- **[i18next](https://www.i18next.com/)** - Internationalization framework

### PWA
- **[Vite PWA Plugin](https://vite-pwa-org.netlify.app/)** - PWA integration
- **[Workbox](https://developer.chrome.com/docs/workbox/)** - Service worker libraries

### PDF Support
- **[React PDF](https://react-pdf.org/)** - PDF rendering

## Project Structure

\`\`\`
src/
├── components/
│   ├── todo/          # Task-related components
│   │   ├── TodoList.tsx
│   │   ├── TodoItem.tsx
│   │   ├── TodoForm.tsx
│   │   ├── SubtaskList.tsx
│   │   └── ...
│   └── ui/            # Reusable UI components
│       ├── PixelButton.tsx
│       ├── PixelCard.tsx
│       ├── PixelModal.tsx
│       ├── SpeechInput.tsx
│       └── ...
├── hooks/             # Custom React hooks
├── i18n/              # Translations
│   └── locales/
│       ├── en.ts
│       ├── es.ts
│       └── pt-BR.ts
├── pages/             # Route pages
│   ├── Home.tsx
│   ├── Editor.tsx
│   ├── Settings.tsx
│   ├── BoardManager.tsx
│   └── ShareTarget.tsx
├── services/          # Business logic & data access
│   ├── idb.ts         # IndexedDB schema
│   ├── taskService.ts
│   ├── boardService.ts
│   └── subtaskService.ts
├── types/             # TypeScript definitions
├── lib/               # Utility functions
├── styles/            # Global styles & themes
├── sw.ts              # Service Worker
└── main.tsx           # App entry point
\`\`\`

## Color Palette

BitTask uses the **SLSO8** palette, an 8-color pixel art palette:

| Color | Hex | Usage |
|-------|-----|-------|
| 🟫 | \`#0d2b45\` | Darkest / Background |
| 🟫 | \`#203c56\` | Dark |
| 🟣 | \`#544e68\` | Muted |
| 🟤 | \`#8d697a\` | Border |
| 🟠 | \`#d08159\` | Warning / Medium Priority |
| 🟡 | \`#ffaa5e\` | Primary / Accent |
| 🟨 | \`#ffd4a3\` | Light |
| ⬜ | \`#ffecd6\` | Lightest / Text |

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Guidelines

1. **Fork the repository** and create your branch from \`main\`
2. **Install dependencies** with \`npm install\`
3. **Make your changes** and ensure they follow the existing code style
4. **Run type checking** with \`npm run typecheck\`
5. **Run linting** with \`npm run lint\`
6. **Test your changes** thoroughly
7. **Create a Pull Request** with a clear description of your changes

### Commit Messages

We follow conventional commits:

- \`feat:\` New features
- \`fix:\` Bug fixes
- \`docs:\` Documentation changes
- \`style:\` Code style changes (formatting, etc.)
- \`refactor:\` Code refactoring
- \`test:\` Adding or updating tests
- \`chore:\` Maintenance tasks

## Roadmap

- [ ] Cloud sync with optional backend
- [ ] Task reminders and notifications
- [ ] Drag-and-drop task reordering
- [ ] Recurring tasks
- [ ] Task templates
- [ ] Data export/import (JSON, CSV)
- [ ] Keyboard shortcuts
- [ ] Widget support (Android)

## Browser Support

| Browser | Support |
|---------|---------|
| Chrome | ✅ Full |
| Edge | ✅ Full |
| Firefox | ✅ Partial (no Speech-to-Text) |
| Safari | ✅ Partial (limited PWA features) |
| Mobile Chrome | ✅ Full |
| Mobile Safari | ✅ Partial |

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [SLSO8 Palette](https://lospec.com/palette-list/slso8) by Luis Miguel Maldonado
- [Press Start 2P Font](https://fonts.google.com/specimen/Press+Start+2P) by CodeMan38
- Built with [Claude Code](https://claude.ai/claude-code)

---

<p align="center">
  Made with ❤️ and pixels
</p>
