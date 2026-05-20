"use client";

import { Plus, Check, Lock } from "lucide-react";
import { useState } from "react";
import { useCart, type CartItem } from "@/components/cart-context";
import { useSession } from "@/components/session-provider";
import { useAuthModal } from "@/components/auth-modal";
import { COLORS } from "@/lib/ui";

export function QuickAddButton({ item }: { item: Omit<CartItem, "quantity"> }) {
  const { addItem } = useCart();
  const { isConnected } = useSession();
  const { open } = useAuthModal();
  const [added, setAdded] = useState(false);

  return (
    <button
      type="button"
      aria-label={
        isConnected
          ? `Ajouter ${item.name} au panier`
          : "Connectez-vous pour ajouter au panier"
      }
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isConnected) {
          open();
          return;
        }
        addItem(item);
        setAdded(true);
        window.setTimeout(() => setAdded(false), 900);
      }}
      className="grid h-7 w-7 place-items-center rounded-full text-white shadow-sm transition-transform active:scale-90"
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
