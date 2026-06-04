"use client";

import { useState } from "react";
import { Minus, Plus, ShoppingCart, Check, Lock } from "lucide-react";
import { useCart, type AddCartItem } from "@/components/cart-context";
import { useSession } from "@/components/session-provider";
import { useAuthModal } from "@/components/auth-modal";
import { COLORS } from "@/lib/ui";
import { MAX_QTY_PER_PRODUCT } from "@/lib/order-rules";

export function AddToCartButton({
  item,
}: {
  item: AddCartItem;
}) {
  const { addItem, items } = useCart();
  const { isConnected } = useSession();
  const { open } = useAuthModal();
  const [qty, setQty] = useState(1);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const existingQty = items.find((i) => i.productId === item.productId)?.quantity ?? 0;
  const remainingQty = Math.max(0, MAX_QTY_PER_PRODUCT - existingQty);
  const effectiveQty = Math.min(qty, remainingQty);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div
          className="flex items-center overflow-hidden rounded-md border"
          style={{ borderColor: COLORS.border }}
        >
          <button
            type="button"
            aria-label="Diminuer la quantité"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="grid h-11 w-11 place-items-center transition hover:bg-[#FAF8F2]"
            style={{ color: COLORS.text }}
          >
            <Minus className="h-4 w-4" strokeWidth={2.2} />
          </button>
          <div
            aria-live="polite"
            className="grid h-11 w-12 place-items-center text-[15px] font-bold"
            style={{ color: COLORS.text }}
          >
            {effectiveQty}
          </div>
          <button
            type="button"
            aria-label="Augmenter la quantité"
            onClick={() => setQty((q) => Math.min(remainingQty, q + 1))}
            disabled={effectiveQty >= remainingQty}
            className="grid h-11 w-11 place-items-center transition hover:bg-[#FAF8F2] disabled:cursor-not-allowed disabled:opacity-40"
            style={{ color: COLORS.text }}
          >
            <Plus className="h-4 w-4" strokeWidth={2.2} />
          </button>
        </div>

        <button
          type="button"
          onClick={async () => {
            if (!isConnected) {
              open({ ...item, quantity: effectiveQty });
              return;
            }
            setError(null);
            const res = await addItem(item, effectiveQty);
            if (res.ok) {
              setConfirmed(true);
              window.setTimeout(() => setConfirmed(false), 1400);
            } else {
              setError(res.error || "Une erreur est survenue.");
            }
          }}
          disabled={remainingQty === 0}
          className="flex h-11 flex-1 items-center justify-center gap-2 rounded-md text-[14px] font-semibold text-white shadow-sm transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
          style={{ background: confirmed ? "#2E3F17" : COLORS.primary }}
        >
          {remainingQty === 0 ? (
            "Quantité maximale atteinte"
          ) : !isConnected ? (
            <>
              <Lock className="h-4 w-4" strokeWidth={2} />
              Se connecter pour ajouter
            </>
          ) : confirmed ? (
            <>
              <Check className="h-4 w-4" strokeWidth={2.4} />
              Ajouté au panier
            </>
          ) : (
            <>
              <ShoppingCart className="h-4 w-4" strokeWidth={2} />
              Ajouter au panier
            </>
          )}
        </button>
      </div>
      {error && (
        <div
          className="text-[12.5px] font-medium text-center"
          style={{ color: COLORS.red }}
        >
          {error}
        </div>
      )}
    </div>
  );
}
