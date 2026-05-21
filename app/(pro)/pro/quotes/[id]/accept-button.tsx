"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, ShieldCheck } from "lucide-react";
import { acceptQuote } from "@/actions/pro-quote";

export default function AcceptButton({ quoteId }: { quoteId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  function onConfirm() {
    setError(null);
    startTransition(async () => {
      const result = await acceptQuote(quoteId);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  if (!confirmOpen) {
    return (
      <button
        type="button"
        onClick={() => setConfirmOpen(true)}
        className="inline-flex items-center gap-2 rounded-md bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-800"
      >
        <ShieldCheck className="h-4 w-4" />
        Signer et accepter le devis
      </button>
    );
  }

  return (
    <div className="space-y-3 rounded-md border border-amber-200 bg-amber-50 p-4">
      <div className="text-sm text-amber-900">
        En cliquant sur <strong>« J&apos;accepte »</strong>, vous engagez votre société
        et confirmez le devis. Cette action est définitive. Votre IP et la date
        seront enregistrées comme preuve de signature.
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={onConfirm}
          className="inline-flex items-center gap-2 rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          <Check className="h-4 w-4" />
          {pending ? "Signature en cours..." : "J'accepte le devis"}
        </button>
        <button
          type="button"
          onClick={() => setConfirmOpen(false)}
          disabled={pending}
          className="rounded-md border px-4 py-2 text-sm font-semibold"
        >
          Annuler
        </button>
      </div>
      {error && <div className="text-sm text-red-700">{error}</div>}
    </div>
  );
}
