"use client";

import { useEffect, useRef } from "react";
import { useCart } from "@/components/cart-context";
import { useSession } from "@/components/session-provider";
import { consumePendingCartIntent } from "@/components/auth-modal";

/**
 * After login, if the user had requested an add-to-cart while a guest,
 * the intent was stored in sessionStorage. Consume and replay it once.
 */
export function PendingCartIntentConsumer() {
  const { addItem } = useCart();
  const { isConnected } = useSession();
  const consumed = useRef(false);

  useEffect(() => {
    if (!isConnected || consumed.current) return;
    const intent = consumePendingCartIntent();
    if (!intent) return;
    consumed.current = true;
    addItem(
      {
        productId: intent.productId,
        name: intent.name,
        unitPrice: intent.unitPrice,
        imageUrl: intent.imageUrl ?? null,
      },
      intent.quantity,
    );
  }, [isConnected, addItem]);

  return null;
}
