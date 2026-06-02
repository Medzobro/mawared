/**
 * Convert Western numerals (0-9) to Arabic/Eastern-Arabic numerals (٠-٩)
 */
export function toArabicNumerals(value: number | string): string {
  const str = value.toString();
  return str.replace(/\d/g, (d) => {
    return String.fromCharCode(0x0660 + parseInt(d));
  });
}

/**
 * Convert Arabic/Eastern-Arabic numerals (٠-٩) back to Western numerals (0-9)
 */
export function fromArabicNumerals(value: string): string {
  return value.replace(/[٠-٩]/g, (d) => {
    return String(d.charCodeAt(0) - 0x0660);
  });
}

/**
 * Smart format based on current i18n locale
 */
export function localizeNumber(value: number | string, locale: string = 'ar'): string {
  if (locale === 'ar') return toArabicNumerals(value);
  return value.toString();
}
