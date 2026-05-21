"use server";

import { ApiClientError, backendFetch } from "@/lib/api-client";

export type ProMe = {
  user: {
    id: string;
    email: string;
    name: string | null;
    role: string;
    isActive: boolean;
    mustChangePassword: boolean;
    emailVerified: string | null;
  };
  customer: {
    id: string;
    companyName: string;
    companyType: string | null;
    siret: string | null;
    vatNumber: string | null;
    contactName: string;
    managerFirstName: string | null;
    managerLastName: string | null;
    email: string | null;
    phone: string;
    mobilePhone: string | null;
    address: string;
    addressLine2: string | null;
    city: string;
    postalCode: string;
    country: string;
    pricingLevel: "C" | "D" | "E" | "F" | null;
    shareCapital: number | null;
    incorporationDate: string | null;
    apeCode: string | null;
    rcsCity: string | null;
    outstandingBalance: number;
  };
};

export type ProOrderSummary = {
  id: string;
  orderNumber: string;
  orderDate: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
  lockedAt: string | null;
  createdAt: string;
  _count: { items: number };
  quote: { id: string; acceptedAt: string | null; validUntil: string } | null;
};

export type ProOrderDetail = ProOrderSummary & {
  items: Array<{
    id: string;
    productId: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    taxRate: number;
    totalPrice: number;
    product: { name: string; sku: string; imageUrl: string | null };
  }>;
  deliveryCity: {
    name: string;
    delivery: { scheduledDate: string; status: string };
  } | null;
};

type Ok<T> = { ok: true } & T;
type Err = { ok: false; error: string };

function fail(error: unknown): Err {
  if (error instanceof ApiClientError) return { ok: false, error: error.message };
  return { ok: false, error: "Requête impossible pour le moment." };
}

export async function getProMe(): Promise<Ok<ProMe> | Err> {
  try {
    const data = await backendFetch<ProMe>("/api/v1/b2b/me", { auth: "required" });
    return { ok: true, ...data };
  } catch (error) {
    return fail(error);
  }
}

export async function getProOrders(): Promise<Ok<{ orders: ProOrderSummary[] }> | Err> {
  try {
    const data = await backendFetch<{ orders: ProOrderSummary[] }>(
      "/api/v1/b2b/orders",
      { auth: "required" },
    );
    return { ok: true, orders: data.orders };
  } catch (error) {
    return fail(error);
  }
}

export async function getProOrderById(
  orderId: string,
): Promise<Ok<{ order: ProOrderDetail }> | Err> {
  try {
    const data = await backendFetch<{ order: ProOrderDetail }>(
      `/api/v1/b2b/orders/${orderId}`,
      { auth: "required" },
    );
    return { ok: true, order: data.order };
  } catch (error) {
    return fail(error);
  }
}
