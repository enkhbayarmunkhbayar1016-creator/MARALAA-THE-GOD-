export default function GradeTable({ title, rows, resolveName }) {
  return (
    <div className="rounded-xl border border-teal-100 bg-white p-5">
      <h3 className="mb-3 text-sm font-semibold " style={{ color: "#0f766e" }}>{title}</h3>
      {rows.length === 0 ? (
        <p className="text-sm" style={{ color: "#99f6e4" }}>Дүн бүртгэгдээгүй.</p>
      ) : (
        <ul className="divide-y divide-zinc-100">
          {rows.map((row) => (
            <li key={row.id} className="flex items-center justify-between py-2 text-sm">
              <span className="truncate " style={{ color: "#0f766e" }}>{resolveName(row)}</span>
              <span className="font-semibold font-semibold" style={{ color: "#042f2e" }}>{row.grade_point ?? 0}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
