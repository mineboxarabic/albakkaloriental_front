import type { ReactNode } from "react";
import { CatalogAvailabilityNotice } from "@/components/catalog-availability-notice";

export default function ProCartLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <CatalogAvailabilityNotice audience="pro" />
      {children}
    </>
  );
}
