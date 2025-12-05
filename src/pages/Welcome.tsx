import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PixelButton } from '@/components/ui';
import { useSettings, useSettingsOperations } from '@/hooks';
import { cn } from '@/lib/utils';

/**
 * Welcome Page
 * Animated intro screen with pixel art sprite animation
 * Shows on first visit, can be skipped
 */
export function Welcome() {
  const navigate = useNavigate();
  const settings = useSettings();
  const { updateSettings } = useSettingsOperations();
  const [animationFrame, setAnimationFrame] = useState(0);
  const [showSkip, setShowSkip] = useState(false);

  // Skip if user has disabled welcome screen
  useEffect(() => {
    if (settings && !settings.showWelcome) {
      void navigate('/home', { replace: true });
    }
  }, [settings, navigate]);

  // Animate sprite frames
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationFrame((f) => (f + 1) % 4);
    }, 300);

    // Show skip button after a short delay
    const skipTimeout = setTimeout(() => setShowSkip(true), 1000);

    return () => {
      clearInterval(interval);
      clearTimeout(skipTimeout);
    };
  }, []);

  const handleStart = () => {
    void navigate('/home');
  };

  const handleSkipForever = () => {
    void updateSettings({ showWelcome: false });
    void navigate('/home', { replace: true });
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-8 bg-pixel-bg">
      {/* Logo/Title */}
      <div className="text-center">
        <h1 className="font-pixel text-2xl text-pixel-text mb-2">BitTask</h1>
        <p className="font-pixel text-xs text-pixel-text-muted">Pixel Todo</p>
      </div>

      {/* Animated Character */}
      <div className="relative w-32 h-32 flex items-center justify-center">
        {/* Placeholder animated sprite - replace with actual sprite sheet */}
        <div
          className={cn(
            'w-16 h-16 bg-pixel-primary border-4 border-pixel-border',
            'transition-transform duration-100',
            animationFrame === 0 && 'translate-y-0',
            animationFrame === 1 && '-translate-y-1',
            animationFrame === 2 && 'translate-y-0',
            animationFrame === 3 && 'translate-y-1'
          )}
        >
          {/* Simple face placeholder */}
          <div className="grid grid-cols-3 gap-1 p-2 pt-3">
            <div className="w-2 h-2 bg-pixel-darkest" />
            <div />
            <div className="w-2 h-2 bg-pixel-darkest" />
            <div />
            <div />
            <div />
            <div className="col-span-3 flex justify-center">
              <div className="w-4 h-1 bg-pixel-darkest mt-1" />
            </div>
          </div>
        </div>
      </div>

      {/* Start Button */}
      <PixelButton onClick={handleStart} size="lg" className="min-w-[200px]">
        Start
      </PixelButton>

      {/* Skip Option */}
      <div
        className={cn(
          'transition-opacity duration-300',
          showSkip ? 'opacity-100' : 'opacity-0'
        )}
      >
        <button
          onClick={handleSkipForever}
          className="font-pixel text-[10px] text-pixel-text-muted underline hover:text-pixel-text"
        >
          Don't show again
        </button>
      </div>

      {/* Version */}
      <p className="absolute bottom-4 font-pixel text-[8px] text-pixel-text-muted">
        v1.0.0 - Offline Ready
      </p>
    </div>
  );
}
