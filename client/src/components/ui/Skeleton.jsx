export default function Skeleton({ className = "" }) {
  return <div className={`animate-pulse bg-cream ${className}`} />;
}

export function ProductGridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i}>
          <Skeleton className="aspect-[4/5] w-full" />
          <Skeleton className="h-3 w-16 mt-4" />
          <Skeleton className="h-4 w-3/4 mt-2" />
          <Skeleton className="h-3 w-20 mt-2" />
        </div>
      ))}
    </div>
  );
}
