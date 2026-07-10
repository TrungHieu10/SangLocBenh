/**
 * Skeleton — Animated placeholder loading component
 * Replaces Spinner for content areas (cards, tables, lists)
 */

// Base skeleton block
export const Skeleton = ({ className = '', rounded = 'rounded-lg' }) => (
  <div className={`animate-pulse bg-midnight-200/60 ${rounded} ${className}`} />
);

// Card skeleton
export const SkeletonCard = ({ lines = 3, className = '' }) => (
  <div className={`glass-card rounded-2xl p-5 space-y-3 ${className}`}>
    <div className="flex items-center gap-3">
      <Skeleton className="w-10 h-10" rounded="rounded-xl" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton key={i} className={`h-3 ${i === lines - 1 ? 'w-2/3' : 'w-full'}`} />
    ))}
  </div>
);

// Stat card skeleton (for dashboards)
export const SkeletonStatCard = ({ className = '' }) => (
  <div className={`glass-card rounded-2xl border-t-2 border-t-midnight-300 p-5 ${className}`}>
    <div className="flex items-center gap-4">
      <Skeleton className="w-10 h-10" rounded="rounded-xl" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-7 w-12" />
      </div>
    </div>
  </div>
);

// Table row skeleton
export const SkeletonTableRow = ({ cols = 4 }) => (
  <tr className="border-b border-cyan-500/6">
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="py-4 pr-4">
        <Skeleton className={`h-4 ${i === 0 ? 'w-32' : 'w-20'}`} />
        {i === 0 && <Skeleton className="h-3 w-20 mt-1.5" />}
      </td>
    ))}
  </tr>
);

// Table skeleton (thead + tbody rows)
export const SkeletonTable = ({ rows = 5, cols = 4, className = '' }) => (
  <div className={`overflow-x-auto ${className}`}>
    <table className="w-full">
      <tbody>
        {Array.from({ length: rows }).map((_, i) => (
          <SkeletonTableRow key={i} cols={cols} />
        ))}
      </tbody>
    </table>
  </div>
);

// Dashboard chart skeleton
export const SkeletonChart = ({ className = '' }) => (
  <div className={`glass-card rounded-2xl p-5 ${className}`}>
    <div className="flex items-center justify-between mb-4">
      <Skeleton className="h-5 w-32" />
      <Skeleton className="h-4 w-16" rounded="rounded-full" />
    </div>
    <div className="flex items-end gap-2 h-32">
      {[60, 85, 45, 70, 95, 55, 75, 40, 80, 65, 90, 50].map((h, i) => (
        <div key={i} className="flex-1 flex flex-col justify-end">
          <Skeleton className={`w-full`} style={{ height: `${h}%` }} rounded="rounded-t-sm" />
        </div>
      ))}
    </div>
  </div>
);

// Profile skeleton
export const SkeletonProfile = () => (
  <div className="max-w-4xl mx-auto space-y-6">
    <div className="glass-card-elevated rounded-2xl overflow-hidden">
      <Skeleton className="h-32" rounded="rounded-none" />
      <div className="px-6 pb-8 -mt-10 flex flex-col items-center gap-3">
        <Skeleton className="w-20 h-20" rounded="rounded-2xl" />
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-6 w-24" rounded="rounded-full" />
      </div>
    </div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map(i => <SkeletonStatCard key={i} />)}
    </div>
  </div>
);

export default Skeleton;
