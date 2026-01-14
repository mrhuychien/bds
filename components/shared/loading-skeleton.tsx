import { cn } from '@/lib/utils'

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-muted', className)}
      {...props}
    />
  )
}

export function PropertyCardSkeleton() {
  return (
    <div className="bg-card border rounded-lg overflow-hidden">
      <Skeleton className="aspect-video" />
      <div className="p-3 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex justify-between">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    </div>
  )
}

export function CustomerCardSkeleton() {
  return (
    <div className="bg-card border rounded-lg p-4">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-4 w-16" />
      </div>
    </div>
  )
}

export function PageSkeleton() {
  return (
    <div className="p-4 space-y-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-32" />
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <PropertyCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}
