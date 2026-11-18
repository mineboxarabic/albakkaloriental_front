"use client";

import { useState, useTransition, type FormEvent, type ReactNode } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { updateProOrder } from "@/actions/pro-me";
import { useLanguage } from "@/components/language-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatPriceEUR } from "@/lib/catalog-pricing";
import { roundMoney } from "@/lib/order-totals";
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
  discount?: number;
  /** Stored line total, VAT included. */
  totalPrice: number;
};
type LineEdit = { quantity: string; saleUnit?: SaleUnit };

const MAX_LINE_QUANTITY = 999;

/** Whole number from 0 (removes the line) to 999, like the cart. */
function parseLineQuantity(raw: string): number | null {
  if (!/^\d+$/.test(raw.trim())) return null;
  const quantity = Number(raw.trim());
  return quantity <= MAX_LINE_QUANTITY ? quantity : null;
}

function lineTotalHt(unitPrice: number, quantity: number, discount = 0): number {
  const subtotal = unitPrice * quantity;
  return roundMoney(subtotal - roundMoney((subtotal * discount) / 100));
}

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
    const quantities = items.map(({ id }) => parseLineQuantity(edits[id].quantity));
    if (quantities.some(quantity => quantity === null)) {
      // Stay in edit mode so the other changes are kept.
      setError(t("La quantité doit être un nombre entier entre 0 et 999."));
      return;
    }
    const changes = items.map(({ id }, index) => ({
      id, quantity: quantities[index] as number, saleUnit: edits[id].saleUnit,
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
      <form noValidate className={`col-span-12 min-w-0 self-start overflow-hidden rounded-sm border bg-white ${editing ? "" : "lg:col-span-8"}`} onSubmit={submit}>
        {canEdit && (
          <div className="grid grid-cols-2 gap-2 border-b p-3 md:flex md:flex-wrap md:items-center md:justify-end">
            {editing ? (
              <>
                <p className="col-span-2 me-auto text-xs text-muted-foreground">{t("Pour retirer un article, indiquez une quantité de 0.")}</p>
                <Button className="h-11 md:h-8" type="button" variant="outline" disabled={saving} onClick={() => {
                  setError("");
                  setEdits(null);
                }}>{t("Annuler")}</Button>
                <Button className="h-11 md:h-8" type="submit" disabled={saving}>{t("Enregistrer")}</Button>
              </>
            ) : (
              <Button className="col-span-2 h-11 md:h-8" type="button" onClick={() => setEdits(Object.fromEntries(items.map(item => [
                item.id, { quantity: String(item.quantity), saleUnit: item.saleUnit },
              ])))}>{t("Modifier ma commande")}</Button>
            )}
          </div>
        )}
        {error && <p role="alert" className="px-4 py-3 text-sm text-red-700">{error}</p>}
        <div className="md:overflow-x-auto">
          <table role="table" className="block w-full text-start text-[13px] md:table md:min-w-[500px]">
            <thead className="hidden bg-[#FAF8F2] text-[11px] text-muted-foreground md:table-header-group">
              <tr>
                <th scope="col" className="p-3 text-start">{t("PRODUIT")}</th>
                <th scope="col" className="p-3 text-center">{t("QTÉ")}</th>
                <th scope="col" className="p-3 text-start">{t("Conditionnement")}</th>
                <th scope="col" className="p-3 text-end">{t("PU HT")}</th>
                <th scope="col" className="p-3 text-end">{t("TOTAL HT")}</th>
              </tr>
            </thead>
            <tbody role="rowgroup" className="block md:table-row-group">
              {items.map(item => {
                const edit = editing ? edits[item.id] : undefined;
                const saleUnit = edit?.saleUnit ?? item.saleUnit;
                const previousFactor = item.saleUnit === "PACK" ? item.packSize : 1;
                const nextFactor = saleUnit === "PACK" ? item.packSize : 1;
                const factor = nextFactor / previousFactor;
                // HT, like the column header: the stored totalPrice includes VAT.
                const quantity = edit ? parseLineQuantity(edit.quantity) : item.quantity;
                const total = quantity === null ? null : lineTotalHt(item.unitPrice * factor, quantity, item.discount);

                return (
                  <tr role="row" key={item.id} className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-x-3 gap-y-3 border-b p-3 last:border-b-0 md:table-row md:border-b-0 md:border-t md:p-0">
                    <th role="rowheader" scope="row" className="col-span-2 block min-w-0 text-start font-semibold md:table-cell md:p-3">
                      <div className="flex items-center gap-2">
                        <Image src={productImage(item.imageUrl)} alt="" width={40} height={40}
                          className="h-10 w-10 shrink-0 rounded-sm object-cover" />
                        <div className="min-w-0 wrap-anywhere">{item.name}<div className="text-[11px] font-normal text-muted-foreground">{item.sku}</div></div>
                      </div>
                    </th>
                    <td role="cell" className="block min-w-0 md:table-cell md:p-3 md:text-center">
                      <span className="mb-1 block text-xs font-medium text-muted-foreground md:hidden">{t("QTÉ")}</span>
                      {edit ? (
                        <Input aria-label={`${t("QTÉ")} – ${item.name}`} className="h-11 w-full md:mx-auto md:h-8 md:w-[4.5rem]"
                          type="text" inputMode="numeric" value={edit.quantity} disabled={saving}
                          onChange={event => editLine(item.id, { quantity: event.target.value })} />
                      ) : item.quantity}
                    </td>
                    <td role="cell" className="block min-w-0 md:table-cell md:p-3">
                      <span className="mb-1 block text-xs font-medium text-muted-foreground md:hidden">{t("Conditionnement")}</span>
                      {edit && saleUnit && item.packSize > 1 ? (
                        <select aria-label={`${t("Conditionnement")} – ${item.name}`}
                          className="h-11 w-full rounded-lg border bg-white px-2 text-base md:h-8 md:w-auto md:rounded-sm md:text-[13px]" value={saleUnit} disabled={saving}
                          onChange={event => editLine(item.id, { saleUnit: event.target.value === "PACK" ? "PACK" : "UNIT" })}>
                          <option value="PACK">{t("Carton")} ({item.packSize})</option>
                          <option value="UNIT">{t("Unité")}</option>
                        </select>
                      ) : (
                        <span>{saleUnit === "PACK" && item.packSize > 1 ? `${t("Carton")} (${item.packSize})` : t("Unité")}</span>
                      )}
                    </td>
                    <td role="cell" className="block whitespace-nowrap border-t pt-2 md:table-cell md:border-0 md:p-3 md:text-end">
                      <span className="block text-xs text-muted-foreground md:hidden">{t("PU HT")}</span>
                      {formatPriceEUR(item.unitPrice * factor)}
                    </td>
                    <td role="cell" className="block whitespace-nowrap border-t pt-2 text-end font-semibold md:table-cell md:border-0 md:p-3">
                      <span className="block text-xs font-normal text-muted-foreground md:hidden">{t("TOTAL HT")}</span>
                      {total === null ? "—" : formatPriceEUR(total)}
                    </td>
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
