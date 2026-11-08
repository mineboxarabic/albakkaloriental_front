"use client";

import { useState, useTransition, type FormEvent, type ReactNode } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { updateProOrder } from "@/actions/pro-me";
import { useLanguage } from "@/components/language-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatPriceEUR } from "@/lib/catalog-pricing";
import { productImage } from "@/lib/ui";

type SaleUnit = "PACK" | "UNIT";
type Line = {
  id: string;
  name: string;
  sku: string;
  imageUrl: string | null;
  quantity: number;
  saleUnit?: SaleUnit;
  packSize: number;
  unitPrice: number;
  totalPrice: number;
};
type LineEdit = { quantity: string; saleUnit?: SaleUnit };

export function ProOrderEditor({ orderId, updatedAt, items, canEdit, children }: {
  orderId: string;
  updatedAt: string;
  items: Line[];
  canEdit: boolean;
  children: ReactNode;
}) {
  const router = useRouter();
  const { t } = useLanguage();
  const [edits, setEdits] = useState<Record<string, LineEdit> | null>(null);
  const [error, setError] = useState("");
  const [saving, startTransition] = useTransition();
  const editing = canEdit && edits !== null;

  function editLine(id: string, change: Partial<LineEdit>) {
    setEdits(previous => previous && { ...previous, [id]: { ...previous[id], ...change } });
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) return;
    const changes = items.map(({ id }) => ({
      id, quantity: Number(edits[id].quantity), saleUnit: edits[id].saleUnit,
    }));
    setError("");
    startTransition(async () => {
      const result = await updateProOrder(orderId, updatedAt, changes);
      if (!result.ok) {
        setError(t(result.error));
        return;
      }
      setEdits(null);
      router.refresh();
    });
  }

  return (
    <>
      <form className={`col-span-12 self-start overflow-hidden rounded-sm border bg-white ${editing ? "" : "lg:col-span-8"}`} onSubmit={submit}>
        {canEdit && (
          <div className="flex flex-wrap items-center justify-end gap-2 border-b p-3">
            {editing ? (
              <>
                <p className="me-auto text-xs text-muted-foreground">{t("Pour retirer un article, indiquez une quantité de 0.")}</p>
                <Button type="button" variant="outline" disabled={saving} onClick={() => {
                  setError("");
                  setEdits(null);
                }}>{t("Annuler")}</Button>
                <Button type="submit" disabled={saving}>{t("Enregistrer")}</Button>
              </>
            ) : (
              <Button type="button" onClick={() => setEdits(Object.fromEntries(items.map(item => [
                item.id, { quantity: String(item.quantity), saleUnit: item.saleUnit },
              ])))}>{t("Modifier ma commande")}</Button>
            )}
          </div>
        )}
        {error && <p role="alert" className="px-4 py-3 text-sm text-red-700">{error}</p>}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[500px] text-start text-[13px]">
            <thead className="bg-[#FAF8F2] text-[11px] text-muted-foreground">
              <tr>
                <th scope="col" className="p-3 text-start">{t("PRODUIT")}</th>
                <th scope="col" className="p-3 text-center">{t("QTÉ")}</th>
                <th scope="col" className="p-3 text-start">{t("Conditionnement")}</th>
                <th scope="col" className="p-3 text-end">{t("PU HT")}</th>
                <th scope="col" className="p-3 text-end">{t("TOTAL HT")}</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => {
                const edit = editing ? edits[item.id] : undefined;
                const saleUnit = edit?.saleUnit ?? item.saleUnit;
                const previousFactor = item.saleUnit === "PACK" ? item.packSize : 1;
                const nextFactor = saleUnit === "PACK" ? item.packSize : 1;
                const factor = nextFactor / previousFactor;
                const total = edit
                  ? Math.round((item.totalPrice * factor * Number(edit.quantity) / item.quantity + Number.EPSILON) * 100) / 100
                  : item.totalPrice;

                return (
                  <tr key={item.id} className="border-t">
                    <th scope="row" className="p-3 text-start font-semibold">
                      <div className="flex items-center gap-2">
                        <Image src={productImage(item.imageUrl)} alt="" width={40} height={40}
                          className="h-10 w-10 shrink-0 rounded-sm object-cover" />
                        <div>{item.name}<div className="text-[11px] font-normal text-muted-foreground">{item.sku}</div></div>
                      </div>
                    </th>
                    <td className="p-3 text-center">
                      {edit ? (
                        <Input aria-label={`${t("QTÉ")} – ${item.name}`} className="mx-auto h-8 w-[4.5rem]"
                          type="number" min={0} max={2147483647} step={1} value={edit.quantity} required disabled={saving}
                          onChange={event => editLine(item.id, { quantity: event.target.value })} />
                      ) : item.quantity}
                    </td>
                    <td className="p-3">
                      {edit && saleUnit && item.packSize > 1 ? (
                        <select aria-label={`${t("Conditionnement")} – ${item.name}`}
                          className="h-8 rounded-sm border bg-white px-2" value={saleUnit} disabled={saving}
                          onChange={event => editLine(item.id, { saleUnit: event.target.value === "PACK" ? "PACK" : "UNIT" })}>
                          <option value="PACK">{t("Carton")} ({item.packSize})</option>
                          <option value="UNIT">{t("Unité")}</option>
                        </select>
                      ) : saleUnit === "PACK" && item.packSize > 1 ? `${t("Carton")} (${item.packSize})` : t("Unité")}
                    </td>
                    <td className="whitespace-nowrap p-3 text-end">{formatPriceEUR(item.unitPrice * factor)}</td>
                    <td className="whitespace-nowrap p-3 text-end font-semibold">{formatPriceEUR(total)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </form>
      {!editing && children}
    </>
  );
}
