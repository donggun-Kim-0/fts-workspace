"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { CreateFranchiseState } from "@/domains/franchise/actions/createFranchise";

type FranchiseFormProps = {
  action: (
    state: CreateFranchiseState,
    formData: FormData,
  ) => Promise<CreateFranchiseState>;
};

const initialState: CreateFranchiseState = {
  success: false,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
    >
      {pending ? "등록 중..." : "가맹점 등록"}
    </button>
  );
}

export default function FranchiseForm({ action }: FranchiseFormProps) {
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-base font-semibold text-slate-900">새 가맹점 등록</h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1.5 text-sm text-slate-700">
          <span>가맹점명</span>
          <input
            name="name"
            placeholder="예: 강남역점"
            className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none ring-blue-500/20 transition focus:border-blue-500 focus:ring-4"
          />
          {state.errors?.name && <p className="text-xs text-rose-600">{state.errors.name[0]}</p>}
        </label>

        <label className="space-y-1.5 text-sm text-slate-700">
          <span>상태</span>
          <select
            name="status"
            defaultValue="PENDING"
            className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none ring-blue-500/20 transition focus:border-blue-500 focus:ring-4"
          >
            <option value="PENDING">오픈 준비</option>
            <option value="ACTIVE">운영중</option>
            <option value="SUSPENDED">일시중지</option>
            <option value="CLOSED">종료</option>
          </select>
          {state.errors?.status && <p className="text-xs text-rose-600">{state.errors.status[0]}</p>}
        </label>
      </div>

      <label className="space-y-1.5 text-sm text-slate-700">
        <span>연락처</span>
        <input
          name="contact"
          placeholder="예: 010-1234-5678"
          className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none ring-blue-500/20 transition focus:border-blue-500 focus:ring-4"
        />
        {state.errors?.contact && <p className="text-xs text-rose-600">{state.errors.contact[0]}</p>}
      </label>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <SubmitButton />
        {state.message && (
          <p className={`text-sm ${state.success ? "text-emerald-600" : "text-rose-600"}`}>
            {state.message}
          </p>
        )}
      </div>
    </form>
  );
}
