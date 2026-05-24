import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="mx-auto max-w-[1180px] px-6 py-8 pb-16">
      <Skeleton className="h-3 w-32" />
      <Skeleton className="mt-3 h-9 w-64" />
      <Skeleton className="mt-1 h-4 w-80" />
      <Skeleton className="mt-6 h-14 w-full" />
      <div className="mt-6 flex flex-col gap-px overflow-hidden rounded-xl border">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-[68px] w-full" />
        ))}
      </div>
    </main>
  );
}
