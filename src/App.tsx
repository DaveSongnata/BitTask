import { BrowserRouter } from 'react-router-dom';
import { Router } from './Router';
import { ThemeProvider } from './hooks/useTheme';
import { SafeAreaContainer } from './components/ui/SafeAreaContainer';
import { PixelLoader } from './components/ui/PixelLoader';
import { useInitDatabase } from './hooks/useIndexedDB';

function AppContent() {
  const dbInitialized = useInitDatabase();

  if (!dbInitialized) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-pixel-bg">
        <PixelLoader size="lg" />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <SafeAreaContainer>
        <Router />
      </SafeAreaContainer>
    </BrowserRouter>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
