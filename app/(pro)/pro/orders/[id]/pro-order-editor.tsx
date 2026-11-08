"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { updateProOrder } from "@/actions/pro-me";
import { useLanguage } from "@/components/language-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ProOrderEditor({ orderId, updatedAt, items }: {
  orderId: string;
  updatedAt: string;
  items: { id: string; name: string; quantity: number }[];
}) {
  const router = useRouter();
  const { t } = useLanguage();
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [saving, startTransition] = useTransition();

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const changes = items.map(({ id }) => ({ id, quantity: Number(form.get(id)) }));
    setError("");
    startTransition(async () => {
      const result = await updateProOrder(orderId, updatedAt, changes);
      if (!result.ok) {
        setError(t(result.error));
        return;
      }
      setEditing(false);
      router.refresh();
    });
  }

  if (!editing) {
    return <Button className="mt-4" type="button" onClick={() => setEditing(true)}>{t("Modifier ma commande")}</Button>;
  }

  return (
    <form className="my-4 space-y-3 rounded-sm border bg-white p-4" onSubmit={submit}>
      <p className="text-sm">{t("Pour retirer un article, indiquez une quantité de 0.")}</p>
      {items.map(item => (
        <label key={item.id} className="flex items-center justify-between gap-4 text-sm">
          {item.name}
          <Input className="w-24" name={item.id} type="number" min={0} max={2147483647}
            step={1} defaultValue={item.quantity} required disabled={saving} />
        </label>
      ))}
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      <div className="flex gap-2">
        <Button type="submit" disabled={saving}>{t("Enregistrer")}</Button>
        <Button type="button" variant="outline" disabled={saving} onClick={() => {
          setError("");
          setEditing(false);
        }}>{t("Annuler")}</Button>
      </div>
    </form>
  );
}
