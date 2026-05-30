'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  createMasterConfig,
  deleteMasterConfig,
  getMasterConfigUsage,
  listMasterConfigCategories,
  listMasterConfigs,
  updateMasterConfig,
  type MasterConfig,
  type MasterConfigCategory,
} from '@/lib/api/master-config';
import { invalidateMasterConfigCache } from '@/hooks/useMasterConfigFormOptions';
import { translateApiError } from '@/app/admin/stores/utils/translate-api-error';

type FormState = {
  category: string;
  key: string;
  value: string;
  isActive: boolean;
};

const emptyForm: FormState = {
  category: 'BRAND',
  key: '',
  value: '',
  isActive: true,
};

export default function MasterConfigPage() {
  const [categories, setCategories] = useState<MasterConfigCategory[]>([]);
  const [rows, setRows] = useState<MasterConfig[]>([]);
  const [filterCategory, setFilterCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<MasterConfig | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [cats, data] = await Promise.all([
        listMasterConfigCategories(),
        listMasterConfigs({
          category: filterCategory || undefined,
          activeOnly: false,
        }),
      ]);
      setCategories(cats);
      setRows(data);
      setError(null);
    } catch (e) {
      setError(translateApiError(e));
    } finally {
      setLoading(false);
    }
  }, [filterCategory]);

  useEffect(() => {
    void load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm({
      ...emptyForm,
      category: filterCategory || 'BRAND',
    });
    setModalOpen(true);
  };

  const openEdit = (row: MasterConfig) => {
    setEditing(row);
    setForm({
      category: row.category,
      key: row.key,
      value: row.value,
      isActive: row.isActive,
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.key.trim() || !form.value.trim()) {
      setError('key와 value는 필수입니다.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      if (editing) {
        await updateMasterConfig(editing.id, form);
      } else {
        await createMasterConfig(form);
      }
      invalidateMasterConfigCache();
      setModalOpen(false);
      await load();
    } catch (e) {
      setError(translateApiError(e));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (row: MasterConfig) => {
    setError(null);
    try {
      const usage = await getMasterConfigUsage(row.id);
      if (!usage.canDelete) {
        window.alert(
          `삭제할 수 없습니다.\n\n코드 [${row.category}/${row.key}]를 사용 중인 가맹점이 ${usage.storeCount}건 있습니다.\n해당 가맹점의 값을 변경한 후 다시 시도해 주세요.`,
        );
        return;
      }
      if (
        !confirm(
          `[${row.category}/${row.key}] "${row.value}" 코드를 비활성(삭제) 처리할까요?`,
        )
      ) {
        return;
      }
      await deleteMasterConfig(row.id);
      invalidateMasterConfigCache();
      await load();
    } catch (e) {
      setError(translateApiError(e));
    }
  };

  return (
    <div className="p-6 sm:p-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">공통 코드 관리</h1>
            <p className="mt-1 text-sm text-slate-500">
              MasterConfig — category / key / value 등록 · 수정 · 삭제
            </p>
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            + 코드 등록
          </button>
        </header>

        {error && (
          <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            {error}
          </div>
        )}

        <div className="mb-4 flex items-center gap-3">
          <label className="text-sm text-slate-600">카테고리 필터</label>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">전체</option>
            {categories.map((c) => (
              <option key={c.category} value={c.category}>
                {c.label} ({c.category})
              </option>
            ))}
          </select>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          {loading ? (
            <div className="flex justify-center p-12">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Key</th>
                    <th className="px-4 py-3">Value</th>
                    <th className="px-4 py-3">상태</th>
                    <th className="px-4 py-3 text-right">관리</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/80">
                      <td className="px-4 py-3 font-mono text-xs">{row.id}</td>
                      <td className="px-4 py-3">{row.category}</td>
                      <td className="px-4 py-3 font-mono text-xs">{row.key}</td>
                      <td className="px-4 py-3">{row.value}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            row.isActive
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {row.isActive ? '활성' : '비활성'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => openEdit(row)}
                          className="mr-2 text-blue-600 hover:underline"
                        >
                          수정
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDelete(row)}
                          className="text-rose-600 hover:underline"
                          disabled={!row.isActive}
                        >
                          삭제
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-slate-900">
              {editing ? '공통 코드 수정' : '공통 코드 등록'}
            </h2>
            <div className="mt-4 space-y-3">
              <label className="block text-sm">
                <span className="font-medium text-slate-700">Category</span>
                <select
                  value={form.category}
                  disabled={Boolean(editing)}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-100"
                >
                  {categories.map((c) => (
                    <option key={c.category} value={c.category}>
                      {c.label} ({c.category})
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm">
                <span className="font-medium text-slate-700">Key</span>
                <input
                  value={form.key}
                  disabled={Boolean(editing)}
                  onChange={(e) => setForm((f) => ({ ...f, key: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-100"
                  placeholder="예) BRAND_A"
                />
              </label>
              <label className="block text-sm">
                <span className="font-medium text-slate-700">Value (표시명)</span>
                <input
                  value={form.value}
                  onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  placeholder="예) 브랜드 A"
                />
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                />
                활성
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                disabled={submitting}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm"
              >
                취소
              </button>
              <button
                type="button"
                onClick={() => void handleSubmit()}
                disabled={submitting}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                {submitting ? '저장 중...' : '저장'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
