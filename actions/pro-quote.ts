"use server";

import { headers } from "next/headers";
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
  product: { name: string; sku: string; category: string };
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
  order: {
    id: string;
    orderNumber: string;
    status: string;
    customerId?: string;
    lockedAt: string | null;
  };
};

export type QuoteSummary = {
  id: string;
  quoteNumber: string;
  subtotal: number;
  taxTotal: number;
  total: number;
  validUntil: string;
  acceptedAt: string | null;
  createdAt: string;
  order: {
    id: string;
    orderNumber: string;
    status: string;
    lockedAt: string | null;
  };
};

export type ListQuotesResult =
  | { ok: true; quotes: QuoteSummary[] }
  | { ok: false; error: string; isUnauthorized?: boolean };

export async function listQuotes(): Promise<ListQuotesResult> {
  try {
    const data = await backendFetch<{ quotes: QuoteSummary[] }>(
      "/api/v1/b2b/quotes",
      { auth: "required" },
    );
    return { ok: true, quotes: data.quotes };
  } catch (error) {
    if (error instanceof ApiClientError) {
      return { ok: false, error: error.message, isUnauthorized: error.status === 401 };
    }
    return { ok: false, error: "Devis introuvables." };
  }
}

export type GetQuoteResult =
  | { ok: true; quote: QuoteDTO }
  | { ok: false; error: string; isUnauthorized?: boolean };

export async function getQuote(quoteId: string): Promise<GetQuoteResult> {
  try {
    const data = await backendFetch<{ quote: QuoteDTO }>(
      `/api/v1/b2b/quotes/${quoteId}`,
      { auth: "required" },
    );
    return { ok: true, quote: data.quote };
  } catch (error) {
    if (error instanceof ApiClientError) {
      return { ok: false, error: error.message, isUnauthorized: error.status === 401 };
    }
    return { ok: false, error: "Devis introuvable." };
  }
}

export type AcceptQuoteResult =
  | { ok: true; orderId: string; deliveryCityId: string | null }
  | { ok: false; error: string; isUnauthorized?: boolean };

export async function acceptQuote(quoteId: string): Promise<AcceptQuoteResult> {
  try {
    const incoming = await headers();
    const forwardHeaders: Record<string, string> = {};
    const ua = incoming.get("user-agent");
    if (ua) forwardHeaders["user-agent"] = ua;
    const xff = incoming.get("x-forwarded-for");
    if (xff) forwardHeaders["x-forwarded-for"] = xff;
    const realIp = incoming.get("x-real-ip");
    if (realIp) forwardHeaders["x-real-ip"] = realIp;

    const data = await backendFetch<{
      quoteId: string;
      orderId: string;
      deliveryCityId: string | null;
    }>(`/api/v1/b2b/quotes/${quoteId}/accept`, {
      method: "POST",
      auth: "required",
      forwardHeaders,
    });
    return { ok: true, orderId: data.orderId, deliveryCityId: data.deliveryCityId };
  } catch (error) {
    if (error instanceof ApiClientError) {
      return { ok: false, error: error.message, isUnauthorized: error.status === 401 };
    }
    return { ok: false, error: "Acceptation impossible pour le moment." };
  }
}
