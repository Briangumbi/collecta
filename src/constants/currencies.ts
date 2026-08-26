/** Curated list, not every ISO 4217 code — common currencies for freelance billing. */
export const CURRENCIES = [
  { code: 'usd', label: 'US Dollar' },
  { code: 'eur', label: 'Euro' },
  { code: 'gbp', label: 'British Pound' },
  { code: 'cad', label: 'Canadian Dollar' },
  { code: 'aud', label: 'Australian Dollar' },
  { code: 'kes', label: 'Kenyan Shilling' },
  { code: 'ngn', label: 'Nigerian Naira' },
  { code: 'zar', label: 'South African Rand' },
  { code: 'tzs', label: 'Tanzanian Shilling' },
  { code: 'inr', label: 'Indian Rupee' },
] as const;

export type CurrencyCode = (typeof CURRENCIES)[number]['code'];
