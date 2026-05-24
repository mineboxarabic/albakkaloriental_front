import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="mx-auto max-w-[1180px] px-6 py-8 pb-16">
      <Skeleton className="h-9 w-56" />
      <Skeleton className="mt-2 h-4 w-72" />
      <Skeleton className="mt-5 h-14 w-full" />
      <div className="mt-6 flex flex-col gap-px overflow-hidden rounded-sm border">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-none" />
        ))}
      </div>
    </main>
  );
}
