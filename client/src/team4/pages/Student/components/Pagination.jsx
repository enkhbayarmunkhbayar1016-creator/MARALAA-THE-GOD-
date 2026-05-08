import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

export default function Pagination({ page, pageCount, onChange }) {
  const pages = Array.from({ length: pageCount }, (_, i) => i + 1);

  return (
    <div className="flex justify-end gap-1">
      {pages.map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className={`h-8 w-8 rounded-md border text-sm font-medium transition-colors ${
            page === n
              ? "border-teal-900 bg-zinc-900 text-white"
              : "border-teal-100 bg-white text-teal-700 hover:bg-teal-50"
          }`}
        >
          {n}
        </button>
      ))}
      <button
        type="button"
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="flex h-8 w-8 items-center justify-center rounded-md border border-teal-100 bg-white text-teal-600 hover:bg-teal-50 disabled:opacity-40"
      >
        <FiChevronLeft className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => onChange(Math.min(pageCount, page + 1))}
        disabled={page === pageCount}
        className="flex h-8 w-8 items-center justify-center rounded-md border border-teal-100 bg-white text-teal-600 hover:bg-teal-50 disabled:opacity-40"
      >
        <FiChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
