import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  PixelButton,
  PixelToolbar,
  PixelToolbarTitle,
  PixelToolbarGroup,
  PixelCard,
  PixelCardBody,
  PixelCheckbox,
  LanguageSelector,
} from '@/components/ui';
import { useTheme, useSettings, useSettingsOperations, usePWAStatus, usePendingOpsCount } from '@/hooks';
import { formatFileSize } from '@/lib/utils';
import type { ThemeName, ThemeMode } from '@/types';

/**
 * Settings Page
 * App configuration including themes, storage, language, and PWA settings
 */
export function Settings() {
  const { t } = useTranslation();
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

  const modeLabels: Record<ThemeMode, string> = {
    light: t('settings.modeLight'),
    dark: t('settings.modeDark'),
    system: t('settings.modeSystem'),
  };

  return (
    <div className="flex flex-col h-full overflow-x-hidden">
      {/* Header */}
      <PixelToolbar position="top">
        <PixelToolbarGroup>
          <PixelButton size="sm" variant="ghost" onClick={() => navigate('/home')}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="square" strokeWidth={3} d="M15 19l-7-7 7-7" />
            </svg>
          </PixelButton>
          <PixelToolbarTitle>{t('settings.title')}</PixelToolbarTitle>
        </PixelToolbarGroup>
      </PixelToolbar>

      {/* Content */}
      <div className="flex-1 overflow-x-hidden overflow-y-auto pixel-scrollbar p-4 space-y-4">
        {/* Language */}
        <PixelCard>
          <PixelCardBody>
            <h3 className="font-pixel text-xs mb-4">{t('settings.language')}</h3>
            <LanguageSelector />
          </PixelCardBody>
        </PixelCard>

        {/* Theme */}
        <PixelCard>
          <PixelCardBody>
            <h3 className="font-pixel text-xs mb-4">{t('settings.theme')}</h3>
            <div className="space-y-3">
              <div className="flex gap-2 overflow-hidden">
                <button
                  onClick={() => handleThemeChange('slso8')}
                  className={`flex-1 min-w-0 p-3 border-4 border-pixel-border font-pixel text-[10px] truncate ${
                    theme === 'slso8' ? 'bg-pixel-primary text-pixel-darkest' : 'bg-pixel-surface'
                  }`}
                >
                  {t('settings.themeSlso8')}
                </button>
                <button
                  onClick={() => handleThemeChange('original')}
                  className={`flex-1 min-w-0 p-3 border-4 border-pixel-border font-pixel text-[10px] truncate ${
                    theme === 'original' ? 'bg-pixel-primary text-pixel-darkest' : 'bg-pixel-surface'
                  }`}
                >
                  {t('settings.themeOriginal')}
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
            <h3 className="font-pixel text-xs mb-4">{t('settings.mode')}</h3>
            <div className="flex gap-2 overflow-hidden">
              {(['light', 'dark', 'system'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => handleModeChange(m)}
                  className={`flex-1 min-w-0 p-3 border-4 border-pixel-border font-pixel text-[10px] truncate ${
                    mode === m ? 'bg-pixel-primary text-pixel-darkest' : 'bg-pixel-surface'
                  }`}
                >
                  {modeLabels[m]}
                </button>
              ))}
            </div>
            <p className="font-pixel text-[8px] text-pixel-text-muted mt-2">
              {t('settings.currentMode', { mode: resolvedMode })}
            </p>
          </PixelCardBody>
        </PixelCard>

        {/* Storage */}
        <PixelCard>
          <PixelCardBody>
            <h3 className="font-pixel text-xs mb-4">{t('settings.storage')}</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-pixel text-[10px] text-pixel-text-muted">
                  {t('settings.maxFileSize')}
                </span>
                <span className="font-pixel text-[10px]">
                  {settings ? formatFileSize(settings.maxFileSize) : '...'}
                </span>
              </div>

              <PixelCheckbox
                checked={settings?.compressImages ?? true}
                onChange={(checked) => void updateSettings({ compressImages: checked })}
                label={t('settings.compressImages')}
              />

              <div className="flex justify-between items-center">
                <span className="font-pixel text-[10px] text-pixel-text-muted">
                  {t('settings.imageQuality')}
                </span>
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
            <h3 className="font-pixel text-xs mb-4">{t('settings.appStatus')}</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-pixel text-[10px] text-pixel-text-muted">
                  {t('settings.installed')}
                </span>
                <span className="font-pixel text-[10px]">
                  {isInstalled ? t('common.yes') : t('common.no')}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-pixel text-[10px] text-pixel-text-muted">
                  {t('settings.network')}
                </span>
                <span className="font-pixel text-[10px]">
                  {isOffline ? t('settings.offline') : t('settings.online')}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-pixel text-[10px] text-pixel-text-muted">
                  {t('settings.pendingSync')}
                </span>
                <span className="font-pixel text-[10px]">
                  {pendingOps ?? 0} {t('settings.operations')}
                </span>
              </div>

              {isInstallable && !isInstalled && (
                <PixelButton
                  size="sm"
                  onClick={() => void installApp()}
                  className="w-full mt-2"
                >
                  {t('settings.installApp')}
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
              label={t('settings.showWelcome')}
            />
          </PixelCardBody>
        </PixelCard>

        {/* About */}
        <PixelCard>
          <PixelCardBody>
            <h3 className="font-pixel text-xs mb-4">{t('settings.about')}</h3>
            <div className="space-y-2">
              <p className="font-pixel text-[10px]">{t('settings.version')}</p>
              <p className="font-pixel text-[8px] text-pixel-text-muted">
                {t('settings.aboutDescription')}
              </p>
              <p className="font-pixel text-[8px] text-pixel-text-muted">
                {t('settings.builtWith')}
              </p>
            </div>
          </PixelCardBody>
        </PixelCard>
      </div>
    </div>
  );
}
