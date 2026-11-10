import { Skeleton } from "@/components/ui/skeleton";

/*
 * Placeholders shaped like the pages they stand in for, so content lands in
 * place instead of pushing the layout around when it arrives.
 */

function CardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-sm border border-[#DDD8CC] bg-white">
      <Skeleton className="h-[140px] w-full rounded-none" />
      <div className="flex flex-1 flex-col gap-2 p-3">
        <Skeleton className="h-2.5 w-14" />
        <Skeleton className="h-3.5 w-11/12" />
        <Skeleton className="h-3.5 w-2/3" />
        <Skeleton className="mt-1 h-2.5 w-24" />
        <div className="mt-auto divide-y divide-[#DDD8CC] rounded-sm border border-[#DDD8CC] pt-0">
          {[0, 1].map((row) => (
            <div key={row} className="flex min-h-12 items-center gap-2 px-2.5 py-1.5">
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-2 w-12" />
                <Skeleton className="h-3.5 w-16" />
              </div>
              <Skeleton className="h-9 w-9 rounded-sm" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ProCatalogSkeleton() {
  return (
    <main
      aria-busy
      className="mx-auto w-full max-w-[1180px] px-5 py-8 pb-16"
    >
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="mt-3 h-3.5 w-24" />
        </div>
        <div className="flex w-full gap-2 sm:w-auto">
          <Skeleton className="h-9 flex-1 sm:w-64" />
          <Skeleton className="h-9 w-36" />
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-[210px_1fr]">
        <div className="flex gap-3 overflow-hidden lg:block">
          <Skeleton className="mb-3 hidden h-3.5 w-28 lg:block" />
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="min-w-[170px] space-y-2.5 rounded-lg border border-[#DDD8CC] bg-white p-3 lg:mb-3"
            >
              <Skeleton className="h-3.5 w-28" />
              <Skeleton className="h-2.5 w-20" />
              <Skeleton className="h-2.5 w-24" />
              <Skeleton className="h-2.5 w-16" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 content-start gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    </main>
  );
}

export function ProProductSkeleton() {
  return (
    <main aria-busy className="mx-auto max-w-[1180px] px-6 py-8 pb-16">
      <Skeleton className="mb-6 h-3 w-56" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
        <Skeleton className="mx-auto aspect-square w-full max-w-[380px] rounded-sm lg:col-span-5 lg:max-w-none" />
        <div className="flex flex-col gap-3 lg:col-span-7">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-7 w-4/5" />
          <Skeleton className="h-3.5 w-40" />
          <div className="mt-6 flex flex-col gap-4">
            <Skeleton className="h-[60px] w-full rounded-sm" />
            <div className="flex items-center justify-between">
              <Skeleton className="h-9 w-32" />
              <Skeleton className="h-11 w-36 rounded-sm" />
            </div>
            <Skeleton className="h-11 w-full rounded-sm" />
            <Skeleton className="h-12 w-full rounded-sm" />
          </div>
        </div>
      </div>
    </main>
  );
}

/** Cart lines only: used inside the cart page while the cart first loads. */
export function ProCartLinesSkeleton() {
  return (
    <div aria-busy className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
      <div className="overflow-hidden rounded-sm border border-[#DDD8CC] bg-white lg:col-span-8">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="flex items-center gap-3 border-t border-[#DDD8CC] px-4 py-4 first:border-t-0"
          >
            <Skeleton className="h-16 w-16 shrink-0 rounded-sm" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3.5 w-3/5" />
              <Skeleton className="h-2.5 w-28" />
            </div>
            <Skeleton className="hidden h-9 w-28 rounded-sm md:block" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
      <div className="space-y-3 rounded-sm border border-[#DDD8CC] bg-white p-5 lg:col-span-4">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-3.5 w-full" />
        <Skeleton className="h-3.5 w-full" />
        <Skeleton className="mt-4 h-6 w-2/3" />
        <Skeleton className="mt-4 h-11 w-full rounded-sm" />
      </div>
    </div>
  );
}

export function ProCartSkeleton() {
  return (
    <main className="mx-auto max-w-[1180px] px-6 py-8 pb-16">
      <Skeleton className="h-3 w-40" />
      <Skeleton className="mt-3 h-8 w-72" />
      <Skeleton className="mt-2 h-3.5 w-48" />
      <ProCartLinesSkeleton />
    </main>
  );
}
