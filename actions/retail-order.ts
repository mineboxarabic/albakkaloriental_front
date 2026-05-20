"use server";

import { z } from "zod";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";

const itemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive().max(99),
});

const orderSchema = z.object({
  deliveryName: z.string().trim().min(1, "Nom requis."),
  deliveryPhone: z
    .string()
    .trim()
    .min(8, "Téléphone requis.")
    .regex(/^[0-9 +().-]+$/, "Téléphone invalide."),
  deliveryCity: z.string().trim().min(1, "Ville requise."),
  deliveryAddress: z.string().trim().min(5, "Adresse requise."),
  notes: z.string().trim().max(500).optional(),
  items: z.array(itemSchema).min(1, "Le panier est vide."),
});

export type RetailOrderInput = z.infer<typeof orderSchema>;

export type CreateOrderResult =
  | { ok: true; orderId: string; orderNumber: string }
  | { ok: false; error: string };

function nextOrderNumber(count: number): string {
  return `RET-${String(count + 1).padStart(5, "0")}`;
}

export async function createRetailOrder(
  input: RetailOrderInput,
): Promise<CreateOrderResult> {
  const session = await getSession();
  if (!session || session.type !== "retail") {
    return { ok: false, error: "Veuillez vous connecter pour valider votre commande." };
  }

  const parsed = orderSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Données invalides.",
    };
  }
  const data = parsed.data;

  const productIds = data.items.map((i) => i.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: {
      id: true,
      name: true,
      sellingPrice: true,
      visibility: true,
    },
  });

  const productMap = new Map(products.map((p) => [p.id, p]));
  const missing = data.items.filter((i) => !productMap.has(i.productId));
  if (missing.length > 0) {
    return { ok: false, error: "Un ou plusieurs produits ne sont plus disponibles." };
  }
  const wholesaleOnly = data.items.find((i) => {
    const p = productMap.get(i.productId);
    return p?.visibility === "WHOLESALE";
  });
  if (wholesaleOnly) {
    return { ok: false, error: "Un produit du panier n'est pas vendu aux particuliers." };
  }

  const itemsToCreate = data.items.map((i) => {
    const p = productMap.get(i.productId)!;
    const unitPrice = p.sellingPrice;
    return {
      productId: p.id,
      productName: p.name,
      unitPrice,
      quantity: i.quantity,
      totalPrice: Number((unitPrice * i.quantity).toFixed(2)),
    };
  });
  const totalAmount = Number(
    itemsToCreate.reduce((s, it) => s + it.totalPrice, 0).toFixed(2),
  );

  const existingCount = await prisma.retailOrder.count();
  const orderNumber = nextOrderNumber(existingCount);

  const order = await prisma.retailOrder.create({
    data: {
      orderNumber,
      customerId: session.customerId,
      deliveryName: data.deliveryName,
      deliveryPhone: data.deliveryPhone,
      deliveryCity: data.deliveryCity,
      deliveryAddress: data.deliveryAddress,
      notes: data.notes ?? null,
      totalAmount,
      items: { create: itemsToCreate },
    },
    select: { id: true, orderNumber: true },
  });

  return { ok: true, orderId: order.id, orderNumber: order.orderNumber };
}
