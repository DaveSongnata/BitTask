import { useTranslation } from 'react-i18next';
import { languages, changeLanguage, type LanguageCode } from '@/i18n';
import { cn } from '@/lib/utils';

interface LanguageSelectorProps {
  className?: string;
}

/**
 * LanguageSelector
 * Component to switch between available languages
 *
 * NOTE: To add custom flag icons, replace the emoji flags in src/i18n/index.ts
 * with image components or import flag icons from a library like:
 * - react-country-flag
 * - country-flag-icons
 * Or add SVG/PNG flag images to src/assets/flags/ and import them here.
 */
export function LanguageSelector({ className }: LanguageSelectorProps) {
  const { i18n } = useTranslation();
  const currentLang = i18n.language as LanguageCode;

  const handleLanguageChange = (lang: LanguageCode) => {
    changeLanguage(lang);
  };

  return (
    <div className={cn('flex gap-2', className)}>
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => handleLanguageChange(lang.code)}
          className={cn(
            'flex-1 p-3 border-4 border-pixel-border font-pixel text-[10px]',
            'transition-colors',
            currentLang === lang.code
              ? 'bg-pixel-primary text-pixel-darkest'
              : 'bg-pixel-surface hover:bg-pixel-surface-alt'
          )}
          title={lang.name}
        >
          {/*
            FLAG ICONS: Replace with custom flag components here
            Example: <FlagIcon code={lang.code} className="w-4 h-4 mr-1" />
          */}
          <span className="mr-1">{lang.flag}</span>
          <span className="hidden sm:inline">{lang.code.toUpperCase()}</span>
        </button>
      ))}
    </div>
  );
}
