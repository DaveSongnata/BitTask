import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

// Check if Speech Recognition is available
const SpeechRecognition = typeof window !== 'undefined'
  ? (window.SpeechRecognition || window.webkitSpeechRecognition)
  : null;

interface SpeechInputProps {
  /** Current value of the text field */
  value: string;
  /** Callback when text changes */
  onChange: (value: string) => void;
  /** Placeholder text for textarea */
  placeholder?: string;
  /** Number of rows for textarea */
  rows?: number;
  /** Max length for textarea */
  maxLength?: number;
  /** Additional class names for container */
  className?: string;
  /** Disable editing */
  disabled?: boolean;
}

type SpeechState = 'idle' | 'listening' | 'error';

/**
 * SpeechInput
 * A textarea with speech-to-text capability
 */
export function SpeechInput({
  value,
  onChange,
  placeholder,
  rows = 4,
  maxLength,
  className,
  disabled = false,
}: SpeechInputProps) {
  const { t, i18n } = useTranslation();
  const [speechState, setSpeechState] = useState<SpeechState>('idle');
  const [interimText, setInterimText] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Map app language to speech recognition language
  const getSpeechLang = useCallback(() => {
    const lang = i18n.language;
    if (lang.startsWith('pt')) return 'pt-BR';
    if (lang.startsWith('es')) return 'es-ES';
    return 'en-US';
  }, [i18n.language]);

  // Clean up recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
        recognitionRef.current = null;
      }
    };
  }, []);

  const startListening = useCallback(() => {
    if (!SpeechRecognition || disabled) return;

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;

      recognition.lang = getSpeechLang();
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setSpeechState('listening');
        setInterimText('');
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (!result || !result[0]) continue;
          const transcript = result[0].transcript;
          if (result.isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        if (finalTranscript) {
          // Append final transcript to value
          const newValue = value ? `${value} ${finalTranscript}` : finalTranscript;
          onChange(newValue.trim());
          setInterimText('');
        } else {
          setInterimText(interimTranscript);
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        setSpeechState('error');
        setTimeout(() => setSpeechState('idle'), 2000);
      };

      recognition.onend = () => {
        setSpeechState('idle');
        setInterimText('');
        recognitionRef.current = null;
      };

      recognition.start();
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
      setSpeechState('error');
      setTimeout(() => setSpeechState('idle'), 2000);
    }
  }, [disabled, getSpeechLang, onChange, value]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  const toggleListening = useCallback(() => {
    if (speechState === 'listening') {
      stopListening();
    } else {
      startListening();
    }
  }, [speechState, startListening, stopListening]);

  // Check if speech recognition is supported
  const isSupported = !!SpeechRecognition;

  return (
    <div className={cn('relative', className)}>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        disabled={disabled}
        className={cn(
          'pixel-input w-full resize-none',
          isSupported && 'pr-10'
        )}
      />

      {/* Interim text preview */}
      {interimText && (
        <div className="fixed inset-x-4 bottom-20 z-50 px-3 py-2 bg-pixel-darkest border-4 border-pixel-border font-pixel text-[10px] text-white shadow-lg">
          {interimText}...
        </div>
      )}

      {/* Microphone button */}
      {isSupported && (
        <button
          type="button"
          onClick={toggleListening}
          disabled={disabled}
          title={speechState === 'listening' ? t('speech.stop') : t('speech.start')}
          className={cn(
            'absolute right-2 top-2 p-1',
            'border-2 border-pixel-border',
            'font-pixel text-[10px]',
            'transition-colors',
            disabled && 'opacity-50 cursor-not-allowed',
            speechState === 'idle' && 'bg-pixel-surface hover:bg-pixel-surface-alt',
            speechState === 'listening' && 'bg-[var(--priority-high)] text-white animate-pulse',
            speechState === 'error' && 'bg-[var(--pixel-error)] text-white'
          )}
        >
          {speechState === 'listening' ? (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="6" width="12" height="12" />
            </svg>
          ) : speechState === 'error' ? (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="square" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 14a3 3 0 003-3V5a3 3 0 00-6 0v6a3 3 0 003 3z" />
              <path d="M19 11a1 1 0 10-2 0 5 5 0 01-10 0 1 1 0 10-2 0 7 7 0 006 6.92V21h-3a1 1 0 100 2h8a1 1 0 100-2h-3v-3.08A7 7 0 0019 11z" />
            </svg>
          )}
        </button>
      )}
    </div>
  );
}

/**
 * Check if speech recognition is supported
 */
export function isSpeechSupported(): boolean {
  return typeof window !== 'undefined' &&
    !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}
