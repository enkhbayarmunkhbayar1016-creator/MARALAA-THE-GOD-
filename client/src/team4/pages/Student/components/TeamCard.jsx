export default function TeamCard({ group, onClick }) {
  const teamName = group.groupDetail?.name || "Баг оноогүй";
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col gap-2 rounded-xl border border-teal-100 bg-white p-5 text-left transition-all hover:border-zinc-300 hover:shadow-sm"
    >
      <p className="truncate text-xs font-medium uppercase tracking-wide text-teal-400">
        {group.courseName}
      </p>
      <h3 className="text-base font-bold font-semibold" style={{ color: "#042f2e" }}>{teamName}</h3>
      <p className="text-sm" style={{ color: "#99f6e4" }}>{group.classmates.length} гишүүн</p>
    </button>
  );
}
