'use client';

type StoresPaginationProps = {
  page: number;
  lastPage: number;
  total: number;
  onPageChange: (page: number) => void;
};

function buildPageNumbers(current: number, lastPage: number, windowSize = 5): number[] {
  if (lastPage <= windowSize) {
    return Array.from({ length: lastPage }, (_, i) => i + 1);
  }

  let start = Math.max(1, current - Math.floor(windowSize / 2));
  let end = start + windowSize - 1;

  if (end > lastPage) {
    end = lastPage;
    start = end - windowSize + 1;
  }

  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

export function StoresPagination({
  page,
  lastPage,
  total,
  onPageChange,
}: StoresPaginationProps) {
  if (total === 0) return null;

  const pages = buildPageNumbers(page, lastPage);

  return (
    <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-slate-500">
        전체 {total.toLocaleString()}건 · {page} / {lastPage} 페이지
      </p>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          이전
        </button>
        {pages.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            className={`min-w-[2.25rem] rounded-lg border px-3 py-1.5 text-sm font-medium ${
              p === page
                ? 'border-blue-600 bg-blue-600 text-white'
                : 'border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {p}
          </button>
        ))}
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= lastPage}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          다음
        </button>
      </div>
    </div>
  );
}
