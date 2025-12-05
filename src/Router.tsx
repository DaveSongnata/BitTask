import { Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { PixelLoader } from './components/ui/PixelLoader';

// Lazy load pages for code splitting
const Welcome = lazy(() => import('./pages/Welcome').then((m) => ({ default: m.Welcome })));
const Home = lazy(() => import('./pages/Home').then((m) => ({ default: m.Home })));
const Editor = lazy(() => import('./pages/Editor').then((m) => ({ default: m.Editor })));
const Settings = lazy(() => import('./pages/Settings').then((m) => ({ default: m.Settings })));
const Attachments = lazy(() =>
  import('./pages/Attachments').then((m) => ({ default: m.Attachments }))
);
const BoardManager = lazy(() =>
  import('./pages/BoardManager').then((m) => ({ default: m.BoardManager }))
);
const ShareTarget = lazy(() =>
  import('./pages/ShareTarget').then((m) => ({ default: m.ShareTarget }))
);

function PageLoader() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-pixel-surface">
      <PixelLoader size="lg" />
    </div>
  );
}

export function Router() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/home" element={<Home />} />
        <Route path="/task/:id" element={<Editor />} />
        <Route path="/task/:id/attachments" element={<Attachments />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/boards" element={<BoardManager />} />
        <Route path="/share-target" element={<ShareTarget />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
