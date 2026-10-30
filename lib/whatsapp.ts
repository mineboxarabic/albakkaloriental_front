export function normalizeWhatsappNumber(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const number = value.trim().replace(/[\s().-]/g, '').replace(/^(?:\+|00)/, '');
  return /^[1-9]\d{6,14}$/.test(number) ? number : null;
}

export function buildWhatsappUrl(number: unknown, message?: string): string | null {
  const normalized = normalizeWhatsappNumber(number);
  if (!normalized) return null;
  return `https://wa.me/${normalized}${message ? `?text=${encodeURIComponent(message)}` : ''}`;
}
