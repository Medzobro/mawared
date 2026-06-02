import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { ar } from './ar';
import { en } from './en';
import { fr } from './fr';

export const supportedLngs = ['ar', 'en', 'fr'];
export const defaultLng = 'ar';

const resources = {
  ar: ar,
  en: en,
  fr: fr,
};

i18next
  .use(initReactI18next)
  .use(LanguageDetector)
  .init({
    resources,
    fallbackLng: defaultLng,
    supportedLngs,
    lng: defaultLng,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
  });

export default i18next;

export function getLanguageDirection(): 'rtl' | 'ltr' {
  const lng = i18next.language || defaultLng;
  return lng === 'ar' ? 'rtl' : 'ltr';
}
