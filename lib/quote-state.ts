export type QuoteState = "pending" | "signed" | "expired" | "locked" | "superseded";

interface QuoteStateInput {
  isActive: boolean;
  acceptedAt: string | null;
  validUntil: string;
  lockedAt: string | null;
}

export function getQuoteState(quote: QuoteStateInput): QuoteState {
  if (!quote.isActive) return "superseded";
  if (quote.acceptedAt) return "signed";
  if (quote.lockedAt) return "locked";
  if (new Date(quote.validUntil).getTime() <= Date.now()) return "expired";
  return "pending";
}
