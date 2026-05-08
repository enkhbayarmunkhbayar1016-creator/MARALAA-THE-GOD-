import { FiChevronLeft, FiChevronRight, FiChevronsLeft, FiChevronsRight } from "react-icons/fi";

export function Pagination({ currentPage, totalPages, onPageChange, siblingCount = 1 }) {
  if (totalPages <= 1) return null;

  const range = [];
  const left = Math.max(2, currentPage - siblingCount);
  const right = Math.min(totalPages - 1, currentPage + siblingCount);

  range.push(1);
  if (left > 2) range.push("...");
  for (let i = left; i <= right; i++) range.push(i);
  if (right < totalPages - 1) range.push("...");
  if (totalPages > 1) range.push(totalPages);

  return (
    <nav className="flex items-center justify-center gap-1 pt-4">
      <PagButton onClick={() => onPageChange(1)} disabled={currentPage === 1} aria-label="Эхний хуудас">
        <FiChevronsLeft className="h-4 w-4" />
      </PagButton>
      <PagButton onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} aria-label="Өмнөх">
        <FiChevronLeft className="h-4 w-4" />
      </PagButton>

      {range.map((page, i) =>
        page === "..." ? (
          <span key={`dots-${i}`} className="px-2 text-sm" style={{ color: "#93c5fd" }}>...</span>
        ) : (
          <PagButton key={page} onClick={() => onPageChange(page)} active={page === currentPage}>
            {page}
          </PagButton>
        )
      )}

      <PagButton onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} aria-label="Дараах">
        <FiChevronRight className="h-4 w-4" />
      </PagButton>
      <PagButton onClick={() => onPageChange(totalPages)} disabled={currentPage === totalPages} aria-label="Сүүлийн хуудас">
        <FiChevronsRight className="h-4 w-4" />
      </PagButton>
    </nav>
  );
}

function PagButton({ children, active, disabled, ...props }) {
  return (
    <button
      disabled={disabled}
      className="inline-flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-sm font-semibold transition-all
        focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
      style={active
        ? { background: "#2563eb", color: "#ffffff" }
        : { color: "#60a5fa" }
      }
      onMouseEnter={e => { if (!active && !disabled) e.currentTarget.style.background = "#eff6ff"; }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = ""; }}
      {...props}
    >
      {children}
    </button>
  );
}
