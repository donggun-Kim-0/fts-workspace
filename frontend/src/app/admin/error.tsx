'use client';

/**
 * /admin 하위 에러 바운더리 — 에러 시 전체 앱 리로드 대신 이 화면만 표시
 */
export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-lg p-8">
      <h2 className="text-lg font-semibold text-slate-900">관리자 화면 오류</h2>
      <p className="mt-2 text-sm text-slate-600">{error.message}</p>
      <button
        type="button"
        onClick={() => reset()}
        className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white"
      >
        다시 시도
      </button>
    </div>
  );
}
