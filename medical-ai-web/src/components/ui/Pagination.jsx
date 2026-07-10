/**
 * Pagination — Reusable glassmorphism pagination component
 */
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  totalItems,
  pageSize,
  className = '',
}) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  const btnBase = 'w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-200';
  const btnActive = 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shadow-glow-cyan/10';
  const btnNormal = 'text-glass-400 hover:text-glass-200 hover:bg-midnight-200/50 border border-transparent';
  const btnDisabled = 'text-glass-600 cursor-not-allowed opacity-40';

  const from = totalItems != null ? (currentPage - 1) * pageSize + 1 : null;
  const to = totalItems != null ? Math.min(currentPage * pageSize, totalItems) : null;

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-3 ${className}`}>
      {/* Info */}
      {totalItems != null && (
        <p className="text-xs text-glass-500">
          Hiển thị <span className="text-glass-300 font-medium">{from}–{to}</span> trong <span className="text-glass-300 font-medium">{totalItems}</span> kết quả
        </p>
      )}

      {/* Buttons */}
      <div className="flex items-center gap-1">
        {/* First */}
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className={`${btnBase} ${currentPage === 1 ? btnDisabled : btnNormal}`}
          aria-label="Trang đầu"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>
        {/* Prev */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`${btnBase} ${currentPage === 1 ? btnDisabled : btnNormal}`}
          aria-label="Trang trước"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Page numbers */}
        {getPageNumbers().map((page, i) =>
          page === '...' ? (
            <span key={`ellipsis-${i}`} className="w-9 h-9 flex items-center justify-center text-glass-500 text-sm">…</span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`${btnBase} ${page === currentPage ? btnActive : btnNormal}`}
              aria-current={page === currentPage ? 'page' : undefined}
            >
              {page}
            </button>
          )
        )}

        {/* Next */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`${btnBase} ${currentPage === totalPages ? btnDisabled : btnNormal}`}
          aria-label="Trang sau"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
        {/* Last */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className={`${btnBase} ${currentPage === totalPages ? btnDisabled : btnNormal}`}
          aria-label="Trang cuối"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
