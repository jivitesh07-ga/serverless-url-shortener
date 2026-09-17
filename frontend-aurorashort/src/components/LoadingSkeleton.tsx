import './LoadingSkeleton.css';

interface LoadingSkeletonProps {
  count?: number;
}

export function LoadingSkeleton({ count = 3 }: LoadingSkeletonProps) {
  return (
    <div className="skeleton-list" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div className="skeleton-card" key={i}>
          <div className="skeleton-row">
            <div className="skeleton-bar skeleton-bar-lg" />
            <div className="skeleton-bar skeleton-bar-sm" />
          </div>
          <div className="skeleton-bar skeleton-bar-md" />
          <div className="skeleton-chips">
            <div className="skeleton-chip" />
            <div className="skeleton-chip" />
            <div className="skeleton-chip" />
          </div>
        </div>
      ))}
    </div>
  );
}
