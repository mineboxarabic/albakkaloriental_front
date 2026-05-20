"use client";

import { Plus, Check } from "lucide-react";
import { useState } from "react";
import { useCart, type CartItem } from "@/components/cart-context";
import { COLORS } from "@/lib/ui";

export function QuickAddButton({ item }: { item: Omit<CartItem, "quantity"> }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  return (
    <button
      type="button"
      aria-label={`Ajouter ${item.name} au panier`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        addItem(item);
        setAdded(true);
        window.setTimeout(() => setAdded(false), 900);
      }}
      className="grid h-7 w-7 place-items-center rounded-full text-white shadow-sm transition-transform active:scale-90"
      style={{ background: added ? "#2E3F17" : COLORS.primary }}
    >
      {added ? (
        <Check className="h-4 w-4" strokeWidth={2.6} />
      ) : (
        <Plus className="h-4 w-4" strokeWidth={2.6} />
      )}
    </button>
  );
}
