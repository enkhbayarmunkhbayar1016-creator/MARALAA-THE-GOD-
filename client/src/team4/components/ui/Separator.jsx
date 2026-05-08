export function Separator({ orientation = "horizontal", className = "", ...props }) {
  return orientation === "vertical"
    ? <div className={`w-px self-stretch ${className}`} style={{ background: "#ccfbf1" }} {...props} />
    : <div className={`h-px w-full ${className}`} style={{ background: "#ccfbf1" }} {...props} />;
}
