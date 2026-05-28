import type { Franchise } from "@/domains/franchise/types";

const statusStyles: Record<Franchise["status"], string> = {
  ACTIVE: "bg-emerald-50 text-emerald-700",
  PENDING: "bg-amber-50 text-amber-700",
  SUSPENDED: "bg-rose-50 text-rose-700",
  CLOSED: "bg-slate-100 text-slate-600",
};

const statusLabel: Record<Franchise["status"], string> = {
  ACTIVE: "운영중",
  PENDING: "오픈 준비",
  SUSPENDED: "일시중지",
  CLOSED: "종료",
};

type FranchiseTableProps = {
  franchises: Franchise[];
};

export default function FranchiseTable({ franchises }: FranchiseTableProps) {
  if (franchises.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
        등록된 가맹점이 없습니다. 상단 폼에서 첫 가맹점을 등록해 보세요.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">가맹점명</th>
              <th className="px-4 py-3">코드</th>
              <th className="px-4 py-3">상태</th>
              <th className="px-4 py-3">연락처</th>
              <th className="px-4 py-3">등록일</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {franchises.map((franchise) => (
              <tr key={franchise.id} className="hover:bg-slate-50/70">
                <td className="px-4 py-3 font-medium text-slate-800">{franchise.name}</td>
                <td className="px-4 py-3 text-slate-600">{franchise.code}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[franchise.status]}`}
                  >
                    {statusLabel[franchise.status]}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-600">{franchise.contact ?? "-"}</td>
                <td className="px-4 py-3 text-slate-500">
                  {new Date(franchise.createdAt).toLocaleDateString("ko-KR")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
