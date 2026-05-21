"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, ShieldCheck } from "lucide-react";
import { confirmProforma } from "@/actions/pro-order";
import { COLORS } from "@/lib/ui";

export function ConfirmProformaButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => {
          setError(null);
          startTransition(async () => {
            const res = await confirmProforma(orderId);
            if (!res.ok) {
              setError(res.error);
              return;
            }
            router.refresh();
          });
        }}
        disabled={pending}
        className="grid h-12 place-items-center rounded-sm text-[13px] font-bold uppercase tracking-[0.12em] text-white shadow-md disabled:opacity-70"
        style={{ background: COLORS.primary }}
      >
        {pending ? (
          "Validation en cours..."
        ) : (
          <span className="inline-flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" strokeWidth={2.2} />
            Valider la commande
          </span>
        )}
      </button>
      {error && (
        <p
          className="rounded-sm border-l-4 px-3 py-2 text-[12px]"
          style={{
            background: "#FCE9E5",
            borderColor: COLORS.red,
            color: "#7A1709",
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
}

export function ConfirmedBadge() {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-sm px-3 py-1.5 text-[12px] font-bold uppercase tracking-[0.12em]"
      style={{ background: "#E5F0D9", color: COLORS.primary }}
    >
      <Check className="h-3.5 w-3.5" strokeWidth={2.4} />
      Commande confirmée
    </span>
  );
}
