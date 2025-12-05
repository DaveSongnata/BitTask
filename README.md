# BitTask - Pixel Art Todo PWA

[![CI](https://github.com/yourusername/bittask/actions/workflows/ci.yml/badge.svg)](https://github.com/yourusername/bittask/actions/workflows/ci.yml)

A pixel-art styled Progressive Web App (PWA) todo application with offline-first architecture. Built with React, TypeScript, Dexie (IndexedDB), and Vite.

## Features

- **Pixel Art Aesthetic**: SLSO8 color palette with retro 8-bit styling
- **Offline First**: Full functionality without internet connection
- **PWA Ready**: Installable on mobile and desktop
- **Rich Attachments**: Images, audio, PDF, and links with previews
- **Camera Capture**: Built-in camera for quick photo attachments
- **Safe Area Support**: Proper handling of notches and home indicators
- **Theme System**: SLSO8 (default) and Original themes with light/dark modes
- **Sync Ready**: Offline queue architecture for future cloud sync

## Tech Stack

- **Framework**: React 18 + TypeScript
- **Build**: Vite 6
- **Styling**: Tailwind CSS + CSS Variables
- **Database**: Dexie.js (IndexedDB)
- **PWA**: vite-plugin-pwa + Workbox
- **PDF**: react-pdf
- **Camera**: react-webcam
- **Testing**: Vitest + React Testing Library

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/bittask.git
cd bittask

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

### Build for Production

```bash
pnpm build
pnpm preview  # Preview production build locally
```

### Deploy to Vercel

```bash
# Install Vercel CLI
pnpm add -g vercel

# Deploy
vercel
```

Or connect your GitHub repository to Vercel for automatic deployments.

## Project Structure

```
src/
├── assets/
│   ├── pixel/          # Pixel art assets
│   └── AI_PROMPTS.md   # Prompts for generating assets
├── components/
│   ├── ui/             # Reusable UI components
│   └── todo/           # Todo-specific components
├── hooks/              # Custom React hooks
├── pages/              # Page components
├── services/           # Business logic & data services
├── styles/             # CSS files
├── pwa/                # Service worker & PWA utilities
├── types/              # TypeScript type definitions
├── lib/                # Utility functions
└── __tests__/          # Test files
```

## Architecture

### Data Flow

```
UI Components
     ↓
Custom Hooks (useTasks, useAttachments, etc.)
     ↓
Services (taskService, fileService)
     ↓
Dexie Database (IndexedDB)
     ↓
Offline Queue (for future sync)
```

### Database Schema

- **tasks**: Task records with title, description, priority, tags
- **attachments**: File blobs and metadata linked to tasks
- **offlineOps**: Queue of operations for future synchronization
- **settings**: User preferences (theme, file limits, etc.)

### PWA Caching Strategy

- **App Shell**: Cache-first for HTML, CSS, JS
- **Static Assets**: Cache-first for images, fonts
- **Attachments**: Stored in IndexedDB, not service worker cache
- **API Calls**: Network-first (placeholder for sync endpoints)

## Theme System

### SLSO8 Palette (Default)

| Variable | Hex | Usage |
|----------|-----|-------|
| slso8-0 | #ffecd6 | Light background |
| slso8-1 | #ffd4a3 | Light accent |
| slso8-2 | #ffaa5e | Primary/CTA |
| slso8-3 | #d08159 | Secondary |
| slso8-4 | #8d697a | Muted |
| slso8-5 | #544e68 | Borders |
| slso8-6 | #203c56 | Dark |
| slso8-7 | #0d2b45 | Dark background |

### Switching Themes

Themes can be switched in Settings. The app supports:
- **SLSO8**: Custom pixel art palette (default)
- **Original**: PixelActUI default colors

Each theme supports light, dark, and system modes.

## Replacing Assets

1. See `src/assets/AI_PROMPTS.md` for detailed generation prompts
2. Place generated assets in appropriate directories:
   - `src/assets/pixel/icons/` - Icons
   - `src/assets/pixel/sprites/` - Animations
   - `public/icons/` - PWA icons
3. Update `public/manifest.json` if changing PWA icons
4. Run `pnpm build` to verify assets

## Future Sync Integration

The app includes an offline queue architecture ready for sync:

### Expected API Endpoints

```
POST /api/sync
  - Push offline operations
  - Body: { operations: OfflineOp[] }
  - Response: { synced: string[], conflicts: Conflict[] }

GET /api/sync?since={timestamp}
  - Pull remote changes
  - Response: { tasks: Task[], attachments: AttachmentMeta[] }
```

### Authentication

Add bearer token via environment variable:

```env
VITE_SYNC_API_TOKEN=your-auth-token
```

### Conflict Resolution

Default strategy: **Last Write Wins**

The `reconcileConflict` function in `useOfflineQueue.ts` compares timestamps and can be extended for more sophisticated merge strategies.

## Security

- **File Size Limit**: 20MB per attachment (configurable)
- **MIME Type Validation**: Whitelist of allowed types
- **URL Sanitization**: Links validated before use
- **Camera Permissions**: Requested only when needed
- **No Raw HTML**: Link previews show parsed text only

## Testing

```bash
# Run tests
pnpm test

# Run tests once
pnpm test:run

# Run with coverage
pnpm test:coverage
```

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm preview` | Preview production build |
| `pnpm test` | Run tests in watch mode |
| `pnpm test:run` | Run tests once |
| `pnpm lint` | Run ESLint |
| `pnpm format` | Format code with Prettier |
| `pnpm typecheck` | TypeScript type checking |

## Browser Support

- Chrome/Edge 90+
- Firefox 90+
- Safari 15+
- iOS Safari 15+
- Chrome for Android 90+

## License

MIT

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## Acknowledgments

- [SLSO8 Palette](https://lospec.com/palette-list/slso8) by Luis Miguel Maldonado
- [PixelActUI](https://pixelactui.com) for pixel component inspiration
- [Dexie.js](https://dexie.org) for IndexedDB wrapper
- [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) for PWA support
