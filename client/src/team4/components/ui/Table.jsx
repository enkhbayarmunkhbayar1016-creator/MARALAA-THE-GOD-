export function Table({ className = "", children, ...props }) {
  return (
    <div className="w-full overflow-auto">
      <table className={`w-full caption-bottom text-sm ${className}`} {...props}>
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ className = "", children, ...props }) {
  return (
    <thead className={`${className}`} style={{ borderBottom: "1px solid #e2e8f0" }} {...props}>
      {children}
    </thead>
  );
}

export function TableBody({ className = "", children, ...props }) {
  return (
    <tbody className={`${className}`} {...props}>
      {children}
    </tbody>
  );
}

export function TableRow({ className = "", children, ...props }) {
  return (
    <tr
      className={`transition-colors ${className}`}
      style={{ borderBottom: "1px solid #f1f5f9" }}
      onMouseEnter={e => e.currentTarget.style.background = "#f0fdfa"}
      onMouseLeave={e => e.currentTarget.style.background = ""}
      {...props}
    >
      {children}
    </tr>
  );
}

export function TableHead({ className = "", children, ...props }) {
  return (
    <th
      className={`h-10 px-4 text-left align-middle font-bold text-xs uppercase tracking-wider ${className}`}
      style={{ color: "#99f6e4" }}
      {...props}
    >
      {children}
    </th>
  );
}

export function TableCell({ className = "", children, ...props }) {
  return (
    <td className={`px-4 py-3 align-middle ${className}`} style={{ color: "#134e4a" }} {...props}>
      {children}
    </td>
  );
}

export function TableCaption({ className = "", children, ...props }) {
  return (
    <caption className={`mt-4 text-sm ${className}`} style={{ color: "#99f6e4" }} {...props}>
      {children}
    </caption>
  );
}
