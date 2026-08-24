// Purely cosmetic formatting/validation for the simulated card-entry form —
// no real card network checks (Luhn, BIN ranges, etc.), since no card data
// is ever transmitted anywhere. See src/hooks/use-simulated-payment.ts.

export function formatCardNumber(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 16);
  return (digits.match(/.{1,4}/g) ?? []).join(' ');
}

export function formatExpiry(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

export function isCardNumberValid(value: string) {
  return value.replace(/\s/g, '').length === 16;
}

export function isExpiryValid(value: string) {
  const match = value.match(/^(\d{2})\/(\d{2})$/);
  if (!match) return false;
  const month = Number(match[1]);
  return month >= 1 && month <= 12;
}

export function isCvcValid(value: string) {
  return /^\d{3}$/.test(value);
}
