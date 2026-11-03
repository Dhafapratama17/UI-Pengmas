import { Skeleton } from "@/components/ui/empty-state";

export default function VolunteerDashboardLoading() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-20 w-full" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-44 w-full" />
        <Skeleton className="h-44 w-full" />
      </div>
      <Skeleton className="h-32 w-full" />
    </div>
  );
}
