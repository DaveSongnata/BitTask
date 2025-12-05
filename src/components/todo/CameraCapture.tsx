import { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import { PixelButton } from '@/components/ui';
import { cn } from '@/lib/utils';

interface CameraCaptureProps {
  onCapture: (blob: Blob) => void;
  onClose: () => void;
}

/**
 * CameraCapture
 * Camera component using react-webcam for capturing photos
 * Compresses output to WebP format
 */
export function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
  const webcamRef = useRef<Webcam>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode,
  };

  const handleUserMedia = useCallback(() => {
    setHasPermission(true);
  }, []);

  const handleUserMediaError = useCallback(() => {
    setHasPermission(false);
  }, []);

  const switchCamera = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  const capture = useCallback(() => {
    const webcam = webcamRef.current;
    if (!webcam) return;

    setIsCapturing(true);

    // Get screenshot as WebP data URL
    const imageSrc = webcam.getScreenshot({
      width: 1280,
      height: 720,
    });

    if (imageSrc) {
      setCapturedImage(imageSrc);
    }

    setIsCapturing(false);
  }, []);

  const retake = () => {
    setCapturedImage(null);
  };

  const confirmCapture = useCallback(async () => {
    if (!capturedImage) return;

    try {
      // Convert data URL to blob
      const response = await fetch(capturedImage);
      const blob = await response.blob();
      onCapture(blob);
    } catch (error) {
      console.error('Failed to process captured image:', error);
    }
  }, [capturedImage, onCapture]);

  return (
    <div className="fixed inset-0 z-50 bg-pixel-darkest flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b-4 border-pixel-border bg-pixel-surface">
        <h2 className="font-pixel text-sm">Camera</h2>
        <PixelButton size="sm" variant="ghost" onClick={onClose}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="square" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </PixelButton>
      </div>

      {/* Camera View */}
      <div className="flex-1 relative overflow-hidden bg-black">
        {hasPermission === false ? (
          // Permission denied
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
            <svg
              className="w-16 h-16 text-pixel-error mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="square"
                strokeWidth={2}
                d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
              />
            </svg>
            <p className="font-pixel text-xs text-pixel-error mb-4">
              Camera access denied
            </p>
            <p className="font-pixel text-[10px] text-pixel-text-muted mb-4">
              Please enable camera permissions in your browser settings.
            </p>
            <PixelButton variant="secondary" onClick={onClose}>
              Close
            </PixelButton>
          </div>
        ) : capturedImage ? (
          // Preview captured image
          <img
            src={capturedImage}
            alt="Captured"
            className="absolute inset-0 w-full h-full object-contain"
          />
        ) : (
          // Live camera feed
          <>
            <Webcam
              ref={webcamRef}
              audio={false}
              screenshotFormat="image/webp"
              screenshotQuality={0.8}
              videoConstraints={videoConstraints}
              onUserMedia={handleUserMedia}
              onUserMediaError={handleUserMediaError}
              className="absolute inset-0 w-full h-full object-cover"
              mirrored={facingMode === 'user'}
            />

            {/* Camera switching button */}
            <button
              onClick={switchCamera}
              className={cn(
                'absolute top-4 right-4',
                'w-12 h-12 flex items-center justify-center',
                'bg-pixel-surface/80 border-4 border-pixel-border',
                'hover:bg-pixel-primary transition-colors'
              )}
              aria-label="Switch camera"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="square"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>

            {/* Capture guide */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-64 h-64 border-4 border-dashed border-pixel-primary/50" />
            </div>
          </>
        )}
      </div>

      {/* Controls */}
      <div className="p-4 border-t-4 border-pixel-border bg-pixel-surface">
        {capturedImage ? (
          // After capture controls
          <div className="flex gap-4 justify-center">
            <PixelButton variant="secondary" onClick={retake} size="lg">
              Retake
            </PixelButton>
            <PixelButton onClick={() => void confirmCapture()} size="lg">
              Use Photo
            </PixelButton>
          </div>
        ) : (
          // Capture button
          <div className="flex justify-center">
            <button
              onClick={capture}
              disabled={!hasPermission || isCapturing}
              className={cn(
                'w-16 h-16 rounded-full',
                'bg-pixel-primary border-4 border-pixel-border',
                'flex items-center justify-center',
                'hover:scale-105 active:scale-95 transition-transform',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
              aria-label="Capture photo"
            >
              <div className="w-12 h-12 rounded-full bg-white/20" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
