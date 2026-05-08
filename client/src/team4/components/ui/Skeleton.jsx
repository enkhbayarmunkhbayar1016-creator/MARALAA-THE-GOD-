export function Skeleton({ className = "", ...props }) {
  return <div className={`animate-pulse rounded-xl ${className}`} style={{ background: "#f0fdfa" }} {...props} />;
}
