import { clsx } from 'clsx';

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx(
        'animate-pulse rounded-md bg-[var(--border-subtle)]/60',
        className
      )}
      {...props}
    />
  );
}

export function SwapQuoteSkeleton() {
  return (
    <div className="panel-subtle space-y-3 p-4 animate-pulse">
      <div className="flex justify-between items-center">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-4 w-20" />
      </div>
      <div className="space-y-2 text-xs">
        <div className="flex justify-between">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-24" />
        </div>
        <div className="flex justify-between">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-12" />
        </div>
        <div className="flex justify-between">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
    </div>
  );
}

export function VaultStatsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="stat-card p-4 space-y-2 animate-pulse">
          <Skeleton className="h-7 w-28" />
          <Skeleton className="h-4 w-20" />
        </div>
      ))}
    </div>
  );
}

export function OracleCardsSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="card-gradient p-5 space-y-3 animate-pulse">
          <div className="flex justify-between items-center">
            <Skeleton className="h-5 w-44" />
            <Skeleton className="h-7 w-28" />
          </div>
          <Skeleton className="h-12 w-full" />
          <div className="grid grid-cols-3 gap-4 pt-1">
            <Skeleton className="h-8 rounded" />
            <Skeleton className="h-8 rounded" />
            <Skeleton className="h-8 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function PoolListSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="card-gradient p-4 flex items-center justify-between gap-4 animate-pulse"
        >
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-3.5 w-64" />
          </div>
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      ))}
    </div>
  );
}
