import { useState, useEffect } from "react";

const sizes = { sm: "h-8 w-8 text-xs", md: "h-10 w-10 text-sm", lg: "h-14 w-14 text-base" };

const roleColors = {
  A: { background: "#0d9488", color: "#ffffff" },
  B: { background: "#0f766e", color: "#ffffff" },
  default: { background: "#f97316", color: "#ffffff" },
};

export function Avatar({ src, alt = "", fallback, size = "md", className = "", style = {} }) {
  const [imgError, setImgError] = useState(false);

  useEffect(() => { setImgError(false); }, [src]);

  if (src && !imgError) {
    return (
      <img
        src={src}
        alt={alt}
        className={`rounded-full object-cover ${sizes[size] ?? sizes.md} ${className}`}
        onError={() => setImgError(true)}
        style={style}
      />
    );
  }

  const firstChar = (fallback ?? alt?.charAt(0) ?? "?").charAt(0).toUpperCase();
  const colorStyle = roleColors[firstChar] ?? roleColors.default;

  return (
    <div
      className={`flex items-center justify-center rounded-full font-bold ${sizes[size] ?? sizes.md} ${className}`}
      style={{ ...colorStyle, ...style }}
    >
      {fallback ?? alt?.charAt(0)?.toUpperCase() ?? "?"}
    </div>
  );
}
