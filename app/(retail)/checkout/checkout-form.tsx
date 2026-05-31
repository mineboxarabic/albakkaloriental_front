"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/components/cart-context";
import { checkoutRetail } from "@/actions/retail-order";
import { formatPriceEUR } from "@/lib/catalog-pricing";
import { COLORS } from "@/lib/ui";
import { MIN_ORDER_EUR, deliveryFee } from "@/lib/order-rules";

export function CheckoutForm({
  defaultDelivery,
}: {
  defaultDelivery: {
    name: string;
    phone: string;
    city: string;
    postalCode: string;
    address: string;
  };
}) {
  const { items, total, clearCart } = useCart();
  const fee = deliveryFee(total);
  const grandTotal = total + fee;
  const belowMinimum = total > 0 && total < MIN_ORDER_EUR;
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [delivery, setDelivery] = useState(defaultDelivery);
  const [notes, setNotes] = useState("");

  const onChange =
    (k: keyof typeof delivery) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setDelivery((d) => ({ ...d, [k]: e.target.value }));

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (items.length === 0) {
      setError("Votre panier est vide.");
      return;
    }
    if (belowMinimum) {
      setError(`Commande minimum de ${MIN_ORDER_EUR} €.`);
      return;
    }
    startTransition(async () => {
      const res = await checkoutRetail({
        deliveryName: delivery.name,
        deliveryPhone: delivery.phone,
        deliveryCity: delivery.city,
        deliveryPostalCode: delivery.postalCode || undefined,
        deliveryAddress: delivery.address,
        notes: notes || undefined,
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      clearCart();
      router.push(`/orders/${res.orderId}`);
    });
  };

  if (items.length === 0) {
    return (
      <div
        className="rounded-xl border bg-white px-6 py-10 text-center"
        style={{ borderColor: COLORS.border }}
      >
        <p className="text-[14px]" style={{ color: COLORS.muted }}>
          Votre panier est vide.
        </p>
        <Link
          href="/products"
          className="mt-4 inline-flex items-center rounded-md px-5 py-2.5 text-[13px] font-semibold text-white shadow-sm"
          style={{ background: COLORS.primary }}
        >
          Voir les produits
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid grid-cols-1 gap-6 md:grid-cols-12">
      <section className="md:col-span-7 flex flex-col gap-4">
        <div
          className="rounded-xl border bg-white p-6"
          style={{ borderColor: COLORS.border }}
        >
          <h2 className="text-[15px] font-bold" style={{ color: COLORS.text }}>
            Informations de livraison
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-3">
            <Field label="Nom du destinataire" name="deliveryName" value={delivery.name} onChange={onChange("name")} required />
            <Field label="Téléphone" name="deliveryPhone" type="tel" value={delivery.phone} onChange={onChange("phone")} required />
            <div className="grid grid-cols-3 gap-3">
              <Field label="Code postal" name="deliveryPostalCode" value={delivery.postalCode} onChange={onChange("postalCode")} />
              <div className="col-span-2">
                <Field label="Ville" name="deliveryCity" value={delivery.city} onChange={onChange("city")} required />
              </div>
            </div>
            <Field label="Adresse complète" name="deliveryAddress" value={delivery.address} onChange={onChange("address")} required />
          </div>
        </div>

        <div
          className="rounded-xl border bg-white p-6"
          style={{ borderColor: COLORS.border }}
        >
          <h2 className="text-[15px] font-bold" style={{ color: COLORS.text }}>
            Note pour le livreur (optionnel)
          </h2>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            maxLength={500}
            rows={3}
            placeholder="Code d'entrée, étage, instructions..."
            className="mt-3 w-full rounded-md border p-3 text-[13.5px] outline-none focus:border-[#3F561F]"
            style={{
              borderColor: COLORS.border,
              color: COLORS.text,
            }}
          />
        </div>

        <div
          className="rounded-xl border bg-white p-6"
          style={{ borderColor: COLORS.border }}
        >
          <h2 className="text-[15px] font-bold" style={{ color: COLORS.text }}>
            Mode de paiement
          </h2>
          <p
            className="mt-2 inline-flex items-center rounded-md border px-3 py-1.5 text-[12.5px]"
            style={{ borderColor: COLORS.border, color: COLORS.text, background: COLORS.beige }}
          >
            Paiement à la livraison
          </p>
        </div>
      </section>

      <aside className="md:col-span-5">
        <div
          className="rounded-xl border bg-white p-5"
          style={{ borderColor: COLORS.border }}
        >
          <div className="text-[12px] font-bold tracking-wide" style={{ color: COLORS.text }}>
            RÉCAPITULATIF
          </div>

          <ul className="mt-4 space-y-2.5 text-[13px]" style={{ color: COLORS.text }}>
            {items.map((it) => (
              <li key={it.productId} className="flex items-start justify-between gap-3">
                <span className="line-clamp-2 flex-1">
                  {it.quantity} × {it.name}
                </span>
                <span className="font-semibold whitespace-nowrap">
                  {formatPriceEUR(it.unitPrice * it.quantity)}
                </span>
              </li>
            ))}
          </ul>

          <dl className="mt-4 space-y-2 border-t pt-4 text-[13px]" style={{ borderColor: COLORS.border }}>
            <div className="flex items-center justify-between">
              <dt style={{ color: COLORS.muted }}>Sous-total</dt>
              <dd className="font-semibold">{formatPriceEUR(total)}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt style={{ color: COLORS.muted }}>Livraison</dt>
              <dd
                className="font-semibold"
                style={{ color: fee === 0 ? COLORS.primary : COLORS.text }}
              >
                {fee === 0 ? "Gratuite" : formatPriceEUR(fee)}
              </dd>
            </div>
          </dl>

          <div
            className="mt-4 flex items-center justify-between border-t pt-4"
            style={{ borderColor: COLORS.border }}
          >
            <span className="text-[14px] font-bold" style={{ color: COLORS.text }}>
              Total
            </span>
            <span className="text-[20px] font-extrabold" style={{ color: COLORS.primary }}>
              {formatPriceEUR(grandTotal)}
            </span>
          </div>

          {error && (
            <div
              className="mt-4 rounded-md border-l-4 px-3 py-2 text-[12.5px]"
              style={{ background: "#FCE9E5", borderColor: COLORS.red, color: "#7A1709" }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={pending || belowMinimum}
            className="mt-5 grid h-11 w-full place-items-center rounded-md text-[14px] font-semibold text-white shadow-sm disabled:opacity-70"
            style={{ background: COLORS.primary }}
          >
            {pending ? "Envoi de la commande..." : "Confirmer ma commande"}
          </button>

          <p className="mt-3 text-center text-[11.5px]" style={{ color: COLORS.muted }}>
            Vous serez recontacté pour confirmer la commande et la livraison.
          </p>
        </div>
      </aside>
    </form>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  type = "text",
  required,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[12.5px] font-semibold" style={{ color: COLORS.text }}>
        {label}
      </span>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        className="h-11 rounded-md border px-3 text-[13.5px] outline-none focus:border-[#3F561F]"
        style={{
          borderColor: COLORS.border,
          background: "#FFFFFF",
          color: COLORS.text,
        }}
      />
    </label>
  );
}
