import { redirect } from "next/navigation";

// /pro has no page of its own — send visitors straight to the catalog.
export default function ProIndexPage() {
  redirect("/pro/products");
}
