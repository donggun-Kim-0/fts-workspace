 "use client";

import { useMemo, useState } from "react";
import type { CreateFranchiseState } from "@/domains/franchise/actions/createFranchise";
import type { Franchise } from "@/domains/franchise/types";
import FranchiseForm from "@/domains/franchise/components/FranchiseForm";
import FranchiseTable from "@/domains/franchise/components/FranchiseTable";

type FranchiseDashboardViewProps = {
  franchises: Franchise[];
  createAction: (
    state: CreateFranchiseState,
    formData: FormData,
  ) => Promise<CreateFranchiseState>;
};

export default function FranchiseDashboardView({
  franchises,
  createAction,
}: FranchiseDashboardViewProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);

  const summary = useMemo(() => {
    const total = franchises.length;
    const active = franchises.filter((franchise) => franchise.status === "ACTIVE").length;
    const pending = franchises.filter((franchise) => franchise.status === "PENDING").length;
    const suspended = franchises.filter((franchise) => franchise.status === "SUSPENDED").length;
    return { total, active, pending, suspended };
  }, [franchises]);

  const kpis = [
    {
      label: "전체 가맹점 수",
      value: `${summary.total}`,
      delta: "+12% 전월 대비",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3v18m5.25-14.25h9.75M9.75 12h9.75m-9.75 5.25h9.75" />
        </svg>
      ),
      tone: "bg-blue-50 text-blue-700",
    },
    {
      label: "운영 중",
      value: `${summary.active}`,
      delta: "+4.1% 전월 대비",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6.75V6a4.5 4.5 0 10-9 0v.75m9 0H18A2.25 2.25 0 0120.25 9v9A2.25 2.25 0 0118 20.25H6A2.25 2.25 0 013.75 18V9A2.25 2.25 0 016 6.75h1.5m9 0h-9" />
        </svg>
      ),
      tone: "bg-emerald-50 text-emerald-700",
    },
    {
      label: "계약 대기",
      value: `${summary.pending}`,
      delta: "-2건 전주 대비",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      tone: "bg-amber-50 text-amber-700",
    },
    {
      label: "이슈 매장",
      value: `${summary.suspended}`,
      delta: "+1건 신규",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0 3.75h.008v.008H12v-.008zM10.34 4.246l-6.245 10.5A1.5 1.5 0 005.34 17h13.32a1.5 1.5 0 001.287-2.254l-6.245-10.5a1.5 1.5 0 00-2.574 0z" />
        </svg>
      ),
      tone: "bg-rose-50 text-rose-700",
    },
  ];

  return (
    <section className="min-h-screen bg-slate-50">
      <div className="mx-auto flex max-w-[1500px] gap-6 p-4 sm:p-6 lg:p-8">
        <aside className="hidden w-64 shrink-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:block">
          <div className="mb-6 rounded-xl bg-blue-600 px-4 py-3 text-white">
            <p className="text-xs text-blue-100">FTS Control Center</p>
            <p className="mt-1 text-sm font-semibold">프랜차이즈 통합 관제</p>
          </div>
          <nav className="space-y-1">
            {["대시보드", "가맹점 관리", "매출 분석", "리뷰 관리", "정산 센터"].map((menu, idx) => (
              <button
                key={menu}
                type="button"
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm transition ${
                  idx === 1
                    ? "bg-blue-50 font-semibold text-blue-700"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <span>{menu}</span>
                {idx === 1 && <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />}
              </button>
            ))}
          </nav>
        </aside>

        <div className="min-w-0 flex-1 space-y-6">
          <header className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-slate-900">가맹점 DB 관리 대시보드</h1>
                <p className="mt-1 text-sm text-slate-500">
                  Fran D 벤치마킹 기반의 통합 운영 화면
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsFormOpen(true)}
                className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                + 신규 가맹점 등록
              </button>
            </div>
          </header>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {kpis.map((kpi) => (
              <article key={kpi.label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm text-slate-500">{kpi.label}</p>
                    <p className="mt-2 text-2xl font-bold text-slate-900">{kpi.value}</p>
                  </div>
                  <span className={`rounded-xl p-2 ${kpi.tone}`}>{kpi.icon}</span>
                </div>
                <p className="mt-3 text-xs font-medium text-slate-500">{kpi.delta}</p>
              </article>
            ))}
          </div>

          <div className="grid gap-4 xl:grid-cols-3">
            <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-base font-semibold text-slate-900">지역별 매출 현황</h2>
                <span className="text-xs text-slate-400">차트 연동 예정</span>
              </div>
              <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-500">
                차트 Placeholder (서울/부산/대구/광주 매출 추이)
              </div>
            </article>

            <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-base font-semibold text-slate-900">AI 가맹점 총평 분석</h2>
              <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                <p>
                  이번 달 상위 20% 가맹점은 배달 전환율과 재구매율이 동반 상승했습니다.
                </p>
                <p>
                  계약 대기 매장 중 2곳은 상권 데이터 기준 오픈 후 3개월 내 손익분기 도달 가능성이
                  높습니다.
                </p>
                <p>
                  이슈 매장은 리뷰 응답 속도와 피크타임 운영 인력 재배치가 우선 개선 포인트입니다.
                </p>
              </div>
            </article>
          </div>

          <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900">가맹점 DB 테이블</h2>
              <button
                type="button"
                onClick={() => setIsFormOpen(true)}
                className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                + 신규 가맹점 등록
              </button>
            </div>
            <FranchiseTable franchises={franchises} />
          </article>
        </div>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4 backdrop-blur-[1px]">
          <div className="w-full max-w-2xl rounded-xl bg-white p-4 shadow-xl sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">신규 가맹점 등록</h3>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="rounded-lg px-2 py-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
              >
                닫기
              </button>
            </div>
            <FranchiseForm action={createAction} />
          </div>
        </div>
      )}
    </section>
  );
}
