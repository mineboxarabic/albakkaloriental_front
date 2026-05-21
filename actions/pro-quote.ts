"use server";

import { ApiClientError, backendFetch } from "@/lib/api-client";

export type QuoteLine = {
  productId: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  taxRate: number;
  subtotal: number;
  tax: number;
  totalPrice: number;
};

export type QuoteDTO = {
  id: string;
  quoteNumber: string;
  subtotal: number;
  taxTotal: number;
  total: number;
  validUntil: string;
  acceptedAt: string | null;
  lines: QuoteLine[];
  order: { orderNumber: string; status: string; customerId?: string };
};

export type GetQuoteResult =
  | { ok: true; quote: QuoteDTO }
  | { ok: false; error: string };

export async function getQuote(quoteId: string): Promise<GetQuoteResult> {
  try {
    const data = await backendFetch<{ quote: QuoteDTO }>(
      `/api/v1/b2b/quotes/${quoteId}`,
      { auth: "required" },
    );
    return { ok: true, quote: data.quote };
  } catch (error) {
    if (error instanceof ApiClientError) {
      return { ok: false, error: error.message };
    }
    return { ok: false, error: "Devis introuvable." };
  }
}

export type AcceptQuoteResult =
  | { ok: true; orderId: string; deliveryCityId: string }
  | { ok: false; error: string };

export async function acceptQuote(quoteId: string): Promise<AcceptQuoteResult> {
  try {
    const data = await backendFetch<{
      quoteId: string;
      orderId: string;
      deliveryCityId: string;
    }>(`/api/v1/b2b/quotes/${quoteId}/accept`, {
      method: "POST",
      auth: "required",
    });
    return { ok: true, orderId: data.orderId, deliveryCityId: data.deliveryCityId };
  } catch (error) {
    if (error instanceof ApiClientError) {
      return { ok: false, error: error.message };
    }
    return { ok: false, error: "Acceptation impossible pour le moment." };
  }
}
