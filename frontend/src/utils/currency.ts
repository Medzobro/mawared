import { localizeNumber } from './arabicNumerals';

export const CURRENCY_SYMBOL = 'MRU';
export const CURRENCY_LABEL = 'أوقية';
export const CURRENCY_LABEL_FR = 'Ouguiya';
export const CURRENCY_LABEL_EN = 'Ouguiya';

interface FormatCurrencyOptions {
  locale?: string;
  showSymbol?: boolean;
  decimals?: number;
}

/**
 * Format a number to MRU currency string.
 * Default behavior: Arabic numerals + أوقية when locale is 'ar'.
 */
export function formatMRU(
  amount: number,
  options: FormatCurrencyOptions = {}
): string {
  const { locale = 'ar', showSymbol = true, decimals = 2 } = options;

  const num = amount.toLocaleString(locale === 'ar' ? 'ar-SA' : locale === 'fr' ? 'fr-FR' : 'en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  if (!showSymbol) return num;

  let label = CURRENCY_SYMBOL;
  if (locale === 'ar') label = CURRENCY_LABEL;
  else if (locale === 'fr') label = CURRENCY_LABEL_FR;
  else label = CURRENCY_LABEL_EN;

  // For Arabic RTL, place currency after the number
  if (locale === 'ar') {
    return `${localizeNumber(num)} ${label}`;
  }
  // For LTR languages, keep standard pattern
  return `${num} ${label}`;
}

/**
 * Shorthand for MRU without symbol
 */
export function formatMRUCompact(amount: number, locale: string = 'ar'): string {
  return formatMRU(amount, { locale, showSymbol: false });
}
