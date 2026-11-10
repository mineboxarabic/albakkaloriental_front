"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useTransition,
  type ComponentProps,
  type ReactNode,
} from "react";

type CatalogNavigation = {
  isPending: boolean;
  navigate: (href: string) => void;
};

const CatalogTransitionContext = createContext<CatalogNavigation | null>(null);

/**
 * Search, sort, filters and pagination all change the URL of the same page.
 * Next keeps the old results on screen while the new ones load, so this
 * shares one pending state between them and lets the results show it.
 */
export function CatalogTransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const navigate = useCallback(
    (href: string) => startTransition(() => router.push(href)),
    [router],
  );
  const value = useMemo(() => ({ isPending, navigate }), [isPending, navigate]);
  return (
    <CatalogTransitionContext.Provider value={value}>
      {children}
    </CatalogTransitionContext.Provider>
  );
}

/** The shared catalogue transition, or a local one outside a catalogue page. */
export function useCatalogNavigation(): CatalogNavigation {
  const shared = useContext(CatalogTransitionContext);
  const router = useRouter();
  const [localPending, startLocal] = useTransition();
  const localNavigate = useCallback(
    (href: string) => startLocal(() => router.push(href)),
    [router],
  );
  return shared ?? { isPending: localPending, navigate: localNavigate };
}

/** Dims the current results while the next ones load. */
export function CatalogResults({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const pending = useContext(CatalogTransitionContext)?.isPending ?? false;
  return (
    <div
      aria-busy={pending || undefined}
      data-pending={pending ? "" : undefined}
      className={`catalog-results ${className}`}
    >
      {children}
    </div>
  );
}

/** A Link whose navigation counts as a catalogue update. */
export function CatalogLink({
  href,
  onClick,
  ...props
}: Omit<ComponentProps<typeof Link>, "href"> & { href: string }) {
  const shared = useContext(CatalogTransitionContext);
  return (
    <Link
      href={href}
      {...props}
      onClick={(event) => {
        onClick?.(event);
        if (
          !shared ||
          event.defaultPrevented ||
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey ||
          props.target === "_blank"
        ) {
          return;
        }
        event.preventDefault();
        shared.navigate(href);
      }}
    />
  );
}
