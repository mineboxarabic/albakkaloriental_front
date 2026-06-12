"use client";

import { Plus, Check, Lock } from "lucide-react";
import { useState } from "react";
import { useCart, type AddCartItem } from "@/components/cart-context";
import { useSession } from "@/components/session-provider";
import { useAuthModal } from "@/components/auth-modal";
import { COLORS } from "@/lib/ui";
import { MAX_QTY_PER_PRODUCT } from "@/lib/order-rules";

export function QuickAddButton({ item }: { item: AddCartItem }) {
  const { addItem, items } = useCart();
  const { isConnected } = useSession();
  const { open } = useAuthModal();
  const [added, setAdded] = useState(false);

  const existingQty = items.find((i) => i.productId === item.productId)?.quantity ?? 0;
  const atMax = existingQty >= MAX_QTY_PER_PRODUCT;

  return (
    <button
      type="button"
      aria-label={
        atMax
          ? "Quantité maximale atteinte"
          : isConnected
            ? `Ajouter ${item.name} au panier`
            : "Connectez-vous pour ajouter au panier"
      }
      disabled={atMax}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isConnected) {
          open({ ...item, quantity: 1 });
          return;
        }
        addItem(item);
        setAdded(true);
        window.setTimeout(() => setAdded(false), 900);
      }}
      className="grid h-9 w-9 place-items-center rounded-full text-white shadow-sm transition-transform active:scale-90 disabled:cursor-not-allowed disabled:opacity-40"
      style={{ background: added ? "#2E3F17" : COLORS.primary }}
    >
      {!isConnected ? (
        <Lock className="h-3.5 w-3.5" strokeWidth={2.4} />
      ) : added ? (
        <Check className="h-4 w-4" strokeWidth={2.6} />
      ) : (
        <Plus className="h-4 w-4" strokeWidth={2.6} />
      )}
    </button>
  );
}
