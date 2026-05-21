"use server";

import { ApiClientError, backendFetch } from "@/lib/api-client";

export type RetailMe = {
  user: {
    id: string;
    email: string;
    name: string | null;
    isActive: boolean;
    emailVerified: string | null;
  };
  customer: {
    id: string;
    name: string;
    phone: string;
    city: string;
    address: string;
    latitude: number | null;
    longitude: number | null;
    isActive: boolean;
  };
};

export type RetailOrderSummary = {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  deliveryName: string;
  deliveryPhone?: string;
  deliveryCity: string;
  deliveryAddress: string;
  paymentMethod?: string;
  notes?: string | null;
  createdAt: string;
  lockedAt: string | null;
  _count: { items: number };
};

export type RetailOrderDetail = RetailOrderSummary & {
  items: Array<{
    id: string;
    productId: string;
    productName: string;
    unitPrice: number;
    quantity: number;
    totalPrice: number;
  }>;
  deliveryCityRef: {
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

export async function getRetailMe(): Promise<Ok<RetailMe> | Err> {
  try {
    const data = await backendFetch<RetailMe>("/api/v1/retail/me", {
      auth: "required",
    });
    return { ok: true, ...data };
  } catch (error) {
    return fail(error);
  }
}

export async function getRetailOrders(): Promise<
  Ok<{ orders: RetailOrderSummary[] }> | Err
> {
  try {
    const data = await backendFetch<{ orders: RetailOrderSummary[] }>(
      "/api/v1/retail/orders/me",
      { auth: "required" },
    );
    return { ok: true, orders: data.orders };
  } catch (error) {
    return fail(error);
  }
}

export async function getRetailOrderById(
  orderId: string,
): Promise<Ok<{ order: RetailOrderDetail }> | Err> {
  try {
    const data = await backendFetch<{ order: RetailOrderDetail }>(
      `/api/v1/retail/orders/me/${orderId}`,
      { auth: "required" },
    );
    return { ok: true, order: data.order };
  } catch (error) {
    return fail(error);
  }
}
