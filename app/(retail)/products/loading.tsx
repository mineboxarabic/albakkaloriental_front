import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="mx-auto max-w-[1180px] px-6 py-8 pb-16">
      <Skeleton className="h-3 w-32" />
      <Skeleton className="mt-3 h-9 w-72" />
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-lg border bg-white">
            <Skeleton className="h-[140px] w-full rounded-none" />
            <div className="space-y-2 p-3">
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="mt-2 h-5 w-20" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
