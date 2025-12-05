import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import ptBR from './locales/pt-BR';
import en from './locales/en';
import es from './locales/es';

/**
 * Supported languages configuration
 */
export const languages = [
  { code: 'pt-BR', name: 'Português (Brasil)', flag: '🇧🇷' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
] as const;

export type LanguageCode = (typeof languages)[number]['code'];

const resources = {
  'pt-BR': { translation: ptBR },
  en: { translation: en },
  es: { translation: es },
};

/**
 * Initialize i18next
 */
void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'pt-BR',
    defaultNS: 'translation',

    // Language detection options
    detection: {
      // Order of language detection
      order: ['localStorage', 'navigator', 'htmlTag'],
      // Cache user language preference
      caches: ['localStorage'],
      // LocalStorage key for language
      lookupLocalStorage: 'bittask-language',
    },

    interpolation: {
      escapeValue: false, // React already escapes
    },

    react: {
      useSuspense: false, // Disable suspense for simpler setup
    },
  });

/**
 * Change language and persist to localStorage
 */
export function changeLanguage(lang: LanguageCode): void {
  void i18n.changeLanguage(lang);
}

/**
 * Get current language
 */
export function getCurrentLanguage(): LanguageCode {
  return (i18n.language || 'pt-BR') as LanguageCode;
}

export default i18n;
