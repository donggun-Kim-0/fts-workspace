'use client';

import { useCallback, useRef, useState } from 'react';
import {
  bulkCreateStores,
  type BulkImportReport,
} from '@/lib/api/stores';
import { downloadBulkUploadTemplate } from './utils/download-bulk-template';
import { parseBulkExcelBuffer } from './utils/parse-bulk-excel';
import { translateApiError } from './utils/translate-api-error';

type BulkUploadModalProps = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onComplete?: (report: BulkImportReport) => void;
};

type UploadPhase = 'idle' | 'uploading';

export function BulkUploadModal({ open, onClose, onSuccess, onComplete }: BulkUploadModalProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [phase, setPhase] = useState<UploadPhase>('idle');
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [report, setReport] = useState<BulkImportReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  const resetState = useCallback(() => {
    setPhase('idle');
    setDragOver(false);
    setFileName(null);
    setParseErrors([]);
    setReport(null);
    setError(null);
  }, []);

  const handleClose = () => {
    if (phase === 'uploading') return;
    resetState();
    onClose();
  };

  const processFile = async (file: File) => {
    if (!file.name.match(/\.xlsx?$|\.csv$/i)) {
      setError('엑셀 파일(.xlsx, .xls)만 업로드할 수 있습니다.');
      return;
    }

    setError(null);
    setReport(null);
    setParseErrors([]);
    setFileName(file.name);
    setPhase('uploading');

    try {
      const buffer = await file.arrayBuffer();
      const { items, errors } = parseBulkExcelBuffer(buffer);

      if (errors.length > 0) {
        setParseErrors(errors.map((e) => `${e.row}행: ${e.message}`));
      }

      if (items.length === 0) {
        setError(
          errors.length > 0
            ? '업로드 가능한 유효 행이 없습니다.'
            : '등록할 데이터가 없습니다. 양식을 확인해 주세요.',
        );
        setPhase('idle');
        return;
      }

      const result = await bulkCreateStores(items);
      setReport(result);
      onComplete?.(result);

      if (result.successCount > 0) {
        onSuccess();
      }
    } catch (err) {
      setError(translateApiError(err));
    } finally {
      setPhase('idle');
    }
  };

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) void processFile(file);
    event.target.value = '';
  };

  const onDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
    const file = event.dataTransfer.files?.[0];
    if (file) void processFile(file);
  };

  if (!open) return null;

  const uploading = phase === 'uploading';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="flex max-h-[90vh] w-full max-w-lg flex-col rounded-xl bg-white shadow-xl">
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">엑셀 일괄 등록</h2>
          <p className="mt-1 text-xs text-slate-500">
            양식을 다운로드한 뒤 데이터를 입력하고 파일을 업로드하세요.
          </p>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-6 py-4">
          <button
            type="button"
            onClick={downloadBulkUploadTemplate}
            disabled={uploading}
            className="w-full rounded-lg border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-100 disabled:opacity-60"
          >
            엑셀 양식 다운로드
          </button>

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => !uploading && inputRef.current?.click()}
            className={`cursor-pointer rounded-xl border-2 border-dashed px-4 py-10 text-center transition-colors ${
              dragOver
                ? 'border-blue-400 bg-blue-50'
                : 'border-slate-300 bg-slate-50 hover:border-slate-400'
            } ${uploading ? 'pointer-events-none opacity-60' : ''}`}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={onFileChange}
            />
            {uploading ? (
              <div className="flex flex-col items-center gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />
                <p className="text-sm font-medium text-slate-700">업로드 및 등록 중...</p>
                {fileName && <p className="text-xs text-slate-500">{fileName}</p>}
              </div>
            ) : (
              <>
                <p className="text-sm font-medium text-slate-800">
                  파일을 드래그하거나 클릭하여 선택
                </p>
                <p className="mt-1 text-xs text-slate-500">.xlsx, .xls 형식 지원</p>
                {fileName && !report && (
                  <p className="mt-2 text-xs text-blue-600">선택됨: {fileName}</p>
                )}
              </>
            )}
          </div>

          {error && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
              {error}
            </div>
          )}

          {parseErrors.length > 0 && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
              <p className="font-medium">파일 파싱 경고</p>
              <ul className="mt-1 list-inside list-disc text-xs">
                {parseErrors.slice(0, 5).map((msg) => (
                  <li key={msg}>{msg}</li>
                ))}
                {parseErrors.length > 5 && (
                  <li>외 {parseErrors.length - 5}건...</li>
                )}
              </ul>
            </div>
          )}

          {report && (
            <div
              className={`rounded-lg border px-3 py-3 text-sm ${
                report.failureCount === 0
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                  : 'border-slate-200 bg-slate-50 text-slate-800'
              }`}
            >
              <p className="font-semibold">
                총 {report.total}건 중 {report.successCount}건 성공, {report.failureCount}건
                실패
              </p>
              {report.errors.length > 0 && (
                <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto text-xs">
                  {report.errors.slice(0, 10).map((err, idx) => (
                    <li key={`${err.row}-${idx}`}>
                      {err.row}행{err.field ? ` (${err.field})` : ''}: {err.message}
                    </li>
                  ))}
                  {report.errors.length > 10 && (
                    <li>외 {report.errors.length - 10}건의 오류...</li>
                  )}
                </ul>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end border-t border-slate-200 px-6 py-4">
          <button
            type="button"
            onClick={handleClose}
            disabled={uploading}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
