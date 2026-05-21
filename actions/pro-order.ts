"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { ProductVisibility, SaleUnit } from "@prisma/client";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { resolveProPrice } from "@/lib/catalog-pricing";

const itemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive().max(999),
  saleUnit: z.enum(["PACK", "UNIT"]),
});

const proformaSchema = z.object({
  notes: z.string().trim().max(500).optional(),
  items: z.array(itemSchema).min(1, "Le panier est vide."),
});

export type ProformaInput = z.infer<typeof proformaSchema>;

export type CreateProformaResult =
  | { ok: true; orderId: string; orderNumber: string }
  | { ok: false; error: string };

const TAX_RATE = 20;

function nextOrderNumber(count: number): string {
  return `PRO-${String(count + 1).padStart(5, "0")}`;
}

export async function createProforma(
  input: ProformaInput,
): Promise<CreateProformaResult> {
  const session = await getSession();
  if (!session || session.type !== "pro") {
    return { ok: false, error: "Session professionnelle requise." };
  }

  const parsed = proformaSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Données invalides.",
    };
  }
  const data = parsed.data;

  const productIds = Array.from(new Set(data.items.map((i) => i.productId)));
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: {
      id: true,
      name: true,
      visibility: true,
      sellingPrice: true,
      unitSellingPrice: true,
      unitsPerPack: true,
      priceLevelC: true,
      priceLevelD: true,
      priceLevelE: true,
      priceLevelF: true,
    },
  });
  const productMap = new Map(products.map((p) => [p.id, p]));

  if (data.items.some((i) => !productMap.has(i.productId))) {
    return {
      ok: false,
      error: "Un ou plusieurs produits ne sont plus disponibles.",
    };
  }
  const retailOnly = data.items.find(
    (i) => productMap.get(i.productId)!.visibility === ProductVisibility.RETAIL,
  );
  if (retailOnly) {
    return {
      ok: false,
      error: "Un produit du panier n'est pas vendu aux professionnels.",
    };
  }

  // Recompute every unit price server-side from the source of truth.
  const lines = data.items.map((i) => {
    const p = productMap.get(i.productId)!;
    const unitPrice = resolveProPrice(
      {
        sellingPrice: p.sellingPrice,
        unitSellingPrice: p.unitSellingPrice,
        unitsPerPack: p.unitsPerPack,
        priceLevelC: p.priceLevelC,
        priceLevelD: p.priceLevelD,
        priceLevelE: p.priceLevelE,
        priceLevelF: p.priceLevelF,
      },
      i.saleUnit,
      session.pricingLevel,
    );
    const totalPrice = Number((unitPrice * i.quantity).toFixed(2));
    return {
      productId: p.id,
      saleUnit: i.saleUnit as SaleUnit,
      quantity: i.quantity,
      unitPrice,
      taxRate: TAX_RATE,
      discount: 0,
      totalPrice,
    };
  });
  const totalAmount = Number(
    lines.reduce((s, it) => s + it.totalPrice, 0).toFixed(2),
  );

  const existingCount = await prisma.order.count();
  const orderNumber = nextOrderNumber(existingCount);

  const order = await prisma.order.create({
    data: {
      orderNumber,
      customerId: session.customerId,
      orderDate: new Date(),
      // PENDING = devis / proforma (per CLAUDE.md business rules)
      status: "PENDING",
      totalAmount,
      notes: data.notes ?? null,
      items: { create: lines },
    },
    select: { id: true, orderNumber: true },
  });

  revalidatePath("/pro/orders");
  return { ok: true, orderId: order.id, orderNumber: order.orderNumber };
}

export type ConfirmProformaResult =
  | { ok: true }
  | { ok: false; error: string };

export async function confirmProforma(
  orderId: string,
): Promise<ConfirmProformaResult> {
  const session = await getSession();
  if (!session || session.type !== "pro") {
    return { ok: false, error: "Session professionnelle requise." };
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { id: true, customerId: true, status: true },
  });
  if (!order || order.customerId !== session.customerId) {
    return { ok: false, error: "Devis introuvable." };
  }
  if (order.status !== "PENDING") {
    return {
      ok: false,
      error: "Ce devis ne peut plus être confirmé.",
    };
  }

  await prisma.order.update({
    where: { id: orderId },
    // CONFIRMED = commande ferme
    data: { status: "CONFIRMED" },
  });

  revalidatePath(`/pro/proforma/${orderId}`);
  revalidatePath("/pro/orders");
  return { ok: true };
}
