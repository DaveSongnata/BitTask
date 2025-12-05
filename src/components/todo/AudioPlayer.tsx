import { useState, useRef, useEffect } from 'react';
import { useFilePreview } from '@/hooks';
import { cn } from '@/lib/utils';
import type { Attachment } from '@/types';

interface AudioPlayerProps {
  attachment: Attachment;
  className?: string;
}

/**
 * AudioPlayer
 * Custom pixel-art styled audio player
 */
export function AudioPlayer({ attachment, className }: AudioPlayerProps) {
  const { previewUrl } = useFilePreview(attachment);
  const audioRef = useRef<HTMLAudioElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleDurationChange = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [previewUrl]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      void audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const time = parseFloat(e.target.value);
    audio.currentTime = time;
    setCurrentTime(time);
  };

  const formatTime = (time: number): string => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!previewUrl) return null;

  return (
    <div
      className={cn(
        'bg-pixel-surface border-4 border-pixel-border p-4',
        className
      )}
    >
      <audio ref={audioRef} src={previewUrl} preload="metadata" />

      {/* Filename */}
      <p className="font-pixel text-[10px] mb-3 truncate">{attachment.filename}</p>

      {/* Controls */}
      <div className="flex items-center gap-3">
        {/* Play/Pause Button */}
        <button
          onClick={togglePlay}
          className={cn(
            'w-10 h-10 flex items-center justify-center',
            'bg-pixel-primary border-4 border-pixel-border',
            'hover:bg-pixel-secondary transition-colors'
          )}
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            // Pause icon
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            // Play icon
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </button>

        {/* Progress */}
        <div className="flex-1">
          <input
            type="range"
            min={0}
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-2 bg-pixel-surface-alt appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, var(--pixel-primary) ${(currentTime / duration) * 100}%, var(--pixel-surface-alt) ${(currentTime / duration) * 100}%)`,
            }}
          />
          <div className="flex justify-between mt-1">
            <span className="font-pixel text-[8px] text-pixel-text-muted">
              {formatTime(currentTime)}
            </span>
            <span className="font-pixel text-[8px] text-pixel-text-muted">
              {formatTime(duration)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
