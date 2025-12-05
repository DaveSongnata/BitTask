import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';

// Import all CSS files directly (more reliable with Vite)
import './styles/theme.css';
import './styles/pixel.css';
import './styles/safe-area.css';
import './styles/index.css';

// Initialize i18n before app loads
import './i18n';

// Register service worker
import { registerSW } from './pwa/sw-register';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);

// Register service worker after app loads
registerSW();
