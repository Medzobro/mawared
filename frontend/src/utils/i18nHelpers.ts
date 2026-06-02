import i18next from 'i18next';

export const supportedLngs = ['ar', 'en', 'fr'] as const;
export type SupportedLng = (typeof supportedLngs)[number];

export function detectLanguage(): SupportedLng {
  const lng = i18next.language || 'ar';
  if (supportedLngs.includes(lng as SupportedLng)) return lng as SupportedLng;
  return 'ar';
}

export function isRTL(): boolean {
  return detectLanguage() === 'ar';
}

export function isLTR(): boolean {
  return !isRTL();
}

export function toggleLanguage(): SupportedLng {
  const current = detectLanguage();
  const next = current === 'ar' ? 'en' : current === 'en' ? 'fr' : 'ar';
  i18next.changeLanguage(next);
  return next;
}

export function setLanguage(lng: SupportedLng) {
  i18next.changeLanguage(lng);
}

/**
 * Get direction for current language
 */
export function getDirection(): 'rtl' | 'ltr' {
  return isRTL() ? 'rtl' : 'ltr';
}
