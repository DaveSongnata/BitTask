import { useNavigate } from 'react-router-dom';
import {
  PixelButton,
  PixelToolbar,
  PixelToolbarTitle,
  PixelToolbarGroup,
  PixelCard,
  PixelCardBody,
  PixelCheckbox,
} from '@/components/ui';
import { useTheme, useSettings, useSettingsOperations, usePWAStatus, usePendingOpsCount } from '@/hooks';
import { formatFileSize } from '@/lib/utils';
import type { ThemeName, ThemeMode } from '@/types';

/**
 * Settings Page
 * App configuration including themes, storage, and PWA settings
 */
export function Settings() {
  const navigate = useNavigate();
  const { theme, mode, setTheme, setMode, resolvedMode } = useTheme();
  const settings = useSettings();
  const { updateSettings } = useSettingsOperations();
  const { isInstalled, isInstallable, installApp, isOffline } = usePWAStatus();
  const pendingOps = usePendingOpsCount();

  const handleThemeChange = (newTheme: ThemeName) => {
    setTheme(newTheme);
    void updateSettings({ theme: newTheme });
  };

  const handleModeChange = (newMode: ThemeMode) => {
    setMode(newMode);
    void updateSettings({ mode: newMode });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <PixelToolbar position="top">
        <PixelToolbarGroup>
          <PixelButton size="sm" variant="ghost" onClick={() => navigate('/home')}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="square" strokeWidth={3} d="M15 19l-7-7 7-7" />
            </svg>
          </PixelButton>
          <PixelToolbarTitle>Settings</PixelToolbarTitle>
        </PixelToolbarGroup>
      </PixelToolbar>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pixel-scrollbar p-4 space-y-4">
        {/* Theme */}
        <PixelCard>
          <PixelCardBody>
            <h3 className="font-pixel text-xs mb-4">Theme</h3>
            <div className="space-y-3">
              <div className="flex gap-2">
                <button
                  onClick={() => handleThemeChange('slso8')}
                  className={`flex-1 p-3 border-4 border-pixel-border font-pixel text-[10px] ${
                    theme === 'slso8' ? 'bg-pixel-primary text-pixel-darkest' : 'bg-pixel-surface'
                  }`}
                >
                  SLSO8
                </button>
                <button
                  onClick={() => handleThemeChange('original')}
                  className={`flex-1 p-3 border-4 border-pixel-border font-pixel text-[10px] ${
                    theme === 'original' ? 'bg-pixel-primary text-pixel-darkest' : 'bg-pixel-surface'
                  }`}
                >
                  Original
                </button>
              </div>

              {/* SLSO8 Color Preview */}
              {theme === 'slso8' && (
                <div className="flex gap-1 mt-2">
                  {[
                    '#ffecd6',
                    '#ffd4a3',
                    '#ffaa5e',
                    '#d08159',
                    '#8d697a',
                    '#544e68',
                    '#203c56',
                    '#0d2b45',
                  ].map((color, i) => (
                    <div
                      key={i}
                      className="flex-1 h-4 border border-pixel-border"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              )}
            </div>
          </PixelCardBody>
        </PixelCard>

        {/* Mode (Light/Dark) */}
        <PixelCard>
          <PixelCardBody>
            <h3 className="font-pixel text-xs mb-4">Mode</h3>
            <div className="flex gap-2">
              {(['light', 'dark', 'system'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => handleModeChange(m)}
                  className={`flex-1 p-3 border-4 border-pixel-border font-pixel text-[10px] capitalize ${
                    mode === m ? 'bg-pixel-primary text-pixel-darkest' : 'bg-pixel-surface'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
            <p className="font-pixel text-[8px] text-pixel-text-muted mt-2">
              Current: {resolvedMode}
            </p>
          </PixelCardBody>
        </PixelCard>

        {/* Storage */}
        <PixelCard>
          <PixelCardBody>
            <h3 className="font-pixel text-xs mb-4">Storage</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-pixel text-[10px] text-pixel-text-muted">Max file size</span>
                <span className="font-pixel text-[10px]">
                  {settings ? formatFileSize(settings.maxFileSize) : '...'}
                </span>
              </div>

              <PixelCheckbox
                checked={settings?.compressImages ?? true}
                onChange={(checked) => void updateSettings({ compressImages: checked })}
                label="Compress images"
              />

              <div className="flex justify-between items-center">
                <span className="font-pixel text-[10px] text-pixel-text-muted">Image quality</span>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.1"
                  value={settings?.imageQuality ?? 0.8}
                  onChange={(e) => void updateSettings({ imageQuality: parseFloat(e.target.value) })}
                  className="w-24"
                />
              </div>
            </div>
          </PixelCardBody>
        </PixelCard>

        {/* PWA Status */}
        <PixelCard>
          <PixelCardBody>
            <h3 className="font-pixel text-xs mb-4">App Status</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-pixel text-[10px] text-pixel-text-muted">Installed</span>
                <span className="font-pixel text-[10px]">{isInstalled ? 'Yes' : 'No'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-pixel text-[10px] text-pixel-text-muted">Network</span>
                <span className="font-pixel text-[10px]">{isOffline ? 'Offline' : 'Online'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-pixel text-[10px] text-pixel-text-muted">Pending sync</span>
                <span className="font-pixel text-[10px]">{pendingOps ?? 0} operations</span>
              </div>

              {isInstallable && !isInstalled && (
                <PixelButton
                  size="sm"
                  onClick={() => void installApp()}
                  className="w-full mt-2"
                >
                  Install App
                </PixelButton>
              )}
            </div>
          </PixelCardBody>
        </PixelCard>

        {/* Welcome Screen */}
        <PixelCard>
          <PixelCardBody>
            <PixelCheckbox
              checked={settings?.showWelcome ?? true}
              onChange={(checked) => void updateSettings({ showWelcome: checked })}
              label="Show welcome screen"
            />
          </PixelCardBody>
        </PixelCard>

        {/* About */}
        <PixelCard>
          <PixelCardBody>
            <h3 className="font-pixel text-xs mb-4">About</h3>
            <div className="space-y-2">
              <p className="font-pixel text-[10px]">BitTask v1.0.0</p>
              <p className="font-pixel text-[8px] text-pixel-text-muted">
                A pixel-art PWA todo app with offline-first architecture.
              </p>
              <p className="font-pixel text-[8px] text-pixel-text-muted">
                Built with React, TypeScript, Dexie, and Vite.
              </p>
            </div>
          </PixelCardBody>
        </PixelCard>
      </div>
    </div>
  );
}
