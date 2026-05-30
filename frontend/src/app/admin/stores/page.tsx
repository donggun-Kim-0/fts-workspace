'use client';

import axios from 'axios';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError, getApiBase } from '@/lib/api/client';
import {
  createStore,
  deleteStore,
  listStores,
  updateStore,
  type BulkImportReport,
  type Store,
  type StoreFormPayload,
  type StoresListMeta,
} from '@/lib/api/stores';
import { StoreFormModal } from '@/app/admin/stores/StoreFormModal';
import { BulkUploadModal } from '@/app/admin/stores/BulkUploadModal';
import { StoresPagination } from '@/app/admin/stores/components/StoresPagination';
import { useMasterConfigFormOptions } from '@/hooks/useMasterConfigFormOptions';
import { buildStatusLabelMap, pickOptions } from '@/lib/api/master-config';
import { statusBadgeClass } from '@/app/admin/stores/constants/select-options';
import { STATUS_LABEL } from '@/app/admin/stores/constants/select-options';
import {
  defaultStoreFormValues,
} from '@/app/admin/stores/schemas/store-form.schema';
import {
  formatDisplayDate,
  storeToFormValues,
} from '@/app/admin/stores/utils/store-form-mapper';
import { translateApiError } from '@/app/admin/stores/utils/translate-api-error';
import { useDebounce } from '@/hooks/useDebounce';

const PAGE_LIMIT = 10;

export default function AdminStoresPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [meta, setMeta] = useState<StoresListMeta>({ total: 0, page: 1, lastPage: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(searchInput, 500);
  const { options: formOptions, loading: optionsLoading } = useMasterConfigFormOptions(true);
  const statusLabels = buildStatusLabelMap(formOptions);
  const statusFilterOptions = pickOptions(formOptions, 'STORE_STATUS', [...Object.entries(STATUS_LABEL).map(([value, label]) => ({ value, label }))]);

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formInitial, setFormInitial] = useState(defaultStoreFormValues);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkToast, setBulkToast] = useState<string | null>(null);

  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchStores = useCallback(
    async (options?: { silent?: boolean; signal?: AbortSignal }) => {
      if (!options?.silent) setIsLoading(true);

      try {
        const result = await listStores(
          {
            search: debouncedSearch || undefined,
            status: statusFilter || undefined,
            page,
            limit: PAGE_LIMIT,
          },
          options?.signal,
        );
        setStores(result.data);
        setMeta(result.meta);
        setListError(null);
      } catch (err) {
        if (axios.isCancel(err) || (err instanceof Error && err.name === 'AbortError')) {
          return;
        }
        setListError(
          err instanceof Error
            ? err.message
            : '가맹점 목록을 불러오지 못했습니다.',
        );
      } finally {
        if (!options?.silent) setIsLoading(false);
      }
    },
    [debouncedSearch, statusFilter, page],
  );

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const showBulkToast = useCallback((report: BulkImportReport) => {
    setBulkToast(
      `총 ${report.total}건 중 ${report.successCount}건 성공, ${report.failureCount}건 실패`,
    );
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setBulkToast(null), 6000);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    (async () => {
      setIsLoading(true);
      setListError(null);
      try {
        const result = await listStores(
          {
            search: debouncedSearch || undefined,
            status: statusFilter || undefined,
            page,
            limit: PAGE_LIMIT,
          },
          controller.signal,
        );
        if (cancelled) return;
        setStores(result.data);
        setMeta(result.meta);
      } catch (err) {
        if (cancelled || axios.isCancel(err) || (err instanceof Error && err.name === 'AbortError')) {
          return;
        }
        setListError(
          err instanceof Error
            ? err.message
            : '가맹점 목록을 불러오지 못했습니다.',
        );
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [debouncedSearch, statusFilter, page]);

  const openCreate = () => {
    setEditingId(null);
    setFormInitial(defaultStoreFormValues);
    setFormError(null);
    setFormOpen(true);
  };

  const openEdit = (store: Store) => {
    setEditingId(store.id);
    setFormInitial(storeToFormValues(store));
    setFormError(null);
    setFormOpen(true);
  };

  const closeForm = () => {
    if (submitting) return;
    setFormOpen(false);
    setFormError(null);
    setEditingId(null);
  };

  const handleFormSubmit = async (payload: StoreFormPayload) => {
    setSubmitting(true);
    setFormError(null);

    try {
      if (editingId) {
        await updateStore(editingId, payload);
      } else {
        await createStore(payload);
      }
      setFormOpen(false);
      setEditingId(null);
      await fetchStores({ silent: true });
    } catch (err) {
      setFormError(translateApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('이 가맹점을 삭제할까요?')) return;
    try {
      await deleteStore(id);
      if (stores.length === 1 && page > 1) {
        setPage((p) => p - 1);
      } else {
        await fetchStores({ silent: true });
      }
    } catch (err) {
      setListError(translateApiError(err));
    }
  };

  const hasActiveFilter = Boolean(debouncedSearch || statusFilter);

  return (
    <div className="p-6 sm:p-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">가맹점 MDM</h1>
            <p className="mt-1 text-sm text-slate-500">
              마스터 데이터 등록 · 조회 · 수정 · 삭제
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setBulkOpen(true)}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              엑셀 일괄 등록
            </button>
            <button
              type="button"
              onClick={openCreate}
              className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              + 가맹점 등록
            </button>
          </div>
        </header>

        {listError && (
          <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            {listError}
            <p className="mt-1 text-xs text-rose-600">API: {getApiBase()}/stores</p>
          </div>
        )}

        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <input
              type="search"
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                setPage(1);
              }}
              placeholder="지점명 또는 지점코드 검색"
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {searchInput !== debouncedSearch && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                검색 중...
              </span>
            )}
          </div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:w-44"
          >
            <option value="">전체 상태</option>
            {statusFilterOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center gap-3 p-12">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />
              <p className="text-sm text-slate-500">데이터를 불러오는 중...</p>
            </div>
          ) : stores.length === 0 ? (
            <div className="flex flex-col items-center gap-4 p-12 text-center">
              <p className="text-slate-500">
                {hasActiveFilter
                  ? '검색 조건에 맞는 가맹점이 없습니다.'
                  : '데이터가 없습니다.'}
              </p>
              {!hasActiveFilter && (
                <button
                  type="button"
                  onClick={openCreate}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
                >
                  + 가맹점 등록
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
                    <tr>
                      <th className="px-4 py-3">지점코드</th>
                      <th className="px-4 py-3">지점명</th>
                      <th className="px-4 py-3">운영상태</th>
                      <th className="px-4 py-3">담당 SV</th>
                      <th className="px-4 py-3">대표자명</th>
                      <th className="px-4 py-3">매장 연락처</th>
                      <th className="px-4 py-3">계약만료일</th>
                      <th className="px-4 py-3 text-right">관리</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {stores.map((store) => (
                      <tr key={store.id} className="hover:bg-slate-50/80">
                        <td className="px-4 py-3 font-mono text-xs">{store.branchCode}</td>
                        <td className="px-4 py-3 font-medium">{store.branchName}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusBadgeClass(store.status)}`}
                          >
                            {statusLabels[store.status] ?? STATUS_LABEL[store.status] ?? store.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-600">{store.supervisor ?? '-'}</td>
                        <td className="px-4 py-3">{store.ownerName}</td>
                        <td className="px-4 py-3">{store.storePhone ?? store.contact ?? '-'}</td>
                        <td className="px-4 py-3 text-slate-600">
                          {formatDisplayDate(store.expireDate)}
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => openEdit(store)}
                            className="mr-2 text-blue-600 hover:underline"
                          >
                            수정
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(store.id)}
                            className="text-rose-600 hover:underline"
                          >
                            삭제
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <StoresPagination
                page={meta.page}
                lastPage={meta.lastPage}
                total={meta.total}
                onPageChange={setPage}
              />
            </>
          )}
        </div>
      </div>

      <BulkUploadModal
        open={bulkOpen}
        onClose={() => setBulkOpen(false)}
        onSuccess={() => void fetchStores({ silent: true })}
        onComplete={showBulkToast}
      />

      {bulkToast && (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 z-[70] -translate-x-1/2 rounded-lg bg-slate-900 px-5 py-3 text-sm font-medium text-white shadow-lg"
        >
          {bulkToast}
        </div>
      )}

      <StoreFormModal
        open={formOpen}
        title={editingId ? '가맹점 수정' : '가맹점 등록'}
        initialValues={formInitial}
        submitting={submitting}
        formError={formError}
        branchCodeDisabled={editingId !== null}
        formOptions={formOptions}
        optionsLoading={optionsLoading}
        onClose={closeForm}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
}
