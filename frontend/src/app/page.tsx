'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { ApiError } from '@/lib/api/client';
import { listStores, type Store } from '@/lib/api/stores';

export default function DashboardPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    (async () => {
      try {
        const result = await listStores({ limit: 50 }, controller.signal);
        if (!cancelled) {
          setStores(result.data);
        }
      } catch (err) {
        if (axios.isCancel(err) || cancelled) return;
        console.error('데이터 가져오는 중 오류 발생:', err);
        setError(
          err instanceof ApiError
            ? err.message
            : '데이터를 불러오지 못했습니다.',
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, []);

  if (loading) {
    return <div className="p-8">데이터를 불러오는 중...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="mb-6 text-2xl font-bold">가맹점 운영 현황</h1>

      {error && (
        <p className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-800">
          {error}
        </p>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 bg-white">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-3 text-left">ID</th>
              <th className="border p-3 text-left">지점명</th>
              <th className="border p-3 text-left">주소</th>
              <th className="border p-3 text-left">점주명</th>
            </tr>
          </thead>
          <tbody>
            {stores.length > 0 ? (
              stores.map((store) => (
                <tr key={store.id} className="hover:bg-gray-50">
                  <td className="border p-3">{store.id}</td>
                  <td className="border p-3 font-semibold">{store.branchName}</td>
                  <td className="border p-3">{store.address}</td>
                  <td className="border p-3">{store.ownerName}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="p-4 text-center">
                  등록된 가맹점이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
