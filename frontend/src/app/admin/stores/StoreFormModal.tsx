'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { MasterConfigFormOptions } from '@/lib/api/master-config';
import type { StoreFormPayload } from '@/lib/api/stores';
import { REGION_TO_SUPERVISOR } from './constants/region-supervisor-map';
import { BasicBusinessTab } from './components/tabs/BasicBusinessTab';
import { ContractLocationTab } from './components/tabs/ContractLocationTab';
import { InfraPlatformTab } from './components/tabs/InfraPlatformTab';
import {
  defaultStoreFormValues,
  storeFormSchema,
  type StoreFormTab,
  type StoreFormValues,
} from './schemas/store-form.schema';
import { formValuesToPayload, formatFieldErrors } from './utils/store-form-mapper';
import { extractRegionKeyFromAddress } from './utils/address-region';

type StoreFormModalProps = {
  open: boolean;
  title: string;
  initialValues?: StoreFormValues;
  submitting: boolean;
  formError: string | null;
  branchCodeDisabled?: boolean;
  formOptions: MasterConfigFormOptions | null;
  optionsLoading?: boolean;
  onClose: () => void;
  onSubmit: (payload: StoreFormPayload) => void;
};

const TABS: { id: StoreFormTab; label: string }[] = [
  { id: 'basic', label: '기본 · 사업자' },
  { id: 'contract', label: '계약 · 위치' },
  { id: 'infra', label: '인프라 · 플랫폼' },
];

export function StoreFormModal({
  open,
  title,
  initialValues,
  submitting,
  formError,
  branchCodeDisabled = false,
  formOptions,
  optionsLoading = false,
  onClose,
  onSubmit,
}: StoreFormModalProps) {
  const [activeTab, setActiveTab] = useState<StoreFormTab>('basic');
  const [geocodeHint, setGeocodeHint] = useState<string | null>(null);
  const [validationSummary, setValidationSummary] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<StoreFormValues>({
    resolver: zodResolver(storeFormSchema),
    defaultValues: defaultStoreFormValues,
    mode: 'onBlur',
  });

  const region = watch('region');
  const baseAddress = watch('baseAddress');

  useEffect(() => {
    if (!open) return;
    if (!baseAddress?.trim()) return;

    const regionKey = extractRegionKeyFromAddress(baseAddress);
    if (!regionKey) return;

    setValue('region', regionKey, { shouldValidate: true, shouldDirty: true });

    const sv = REGION_TO_SUPERVISOR[regionKey];
    if (sv) {
      setValue('supervisor', sv, { shouldValidate: true, shouldDirty: true });
    }
  }, [baseAddress, open, setValue]);

  useEffect(() => {
    if (open) {
      reset(initialValues ?? defaultStoreFormValues);
      setActiveTab('basic');
      setGeocodeHint(null);
      setValidationSummary(null);
    }
  }, [open, initialValues, reset]);

  useEffect(() => {
    if (!region) return;
    const sv = REGION_TO_SUPERVISOR[region];
    if (sv) {
      setValue('supervisor', sv, { shouldValidate: true, shouldDirty: true });
    }
  }, [region, setValue]);

  if (!open) return null;

  const onFormSubmit = (values: StoreFormValues) => {
    setValidationSummary(null);
    onSubmit(formValuesToPayload(values));
  };

  const onInvalid = (fieldErrors: typeof errors) => {
    setValidationSummary(formatFieldErrors(fieldErrors));
    setActiveTab('basic');
  };

  const tabProps = {
    register,
    control,
    errors,
    setValue,
    watch,
    branchCodeDisabled,
    formOptions,
    optionsLoading,
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
      role="dialog"
      aria-modal="true"
    >
      <form
        onSubmit={handleSubmit(onFormSubmit, onInvalid)}
        className="flex max-h-[92vh] w-full max-w-3xl flex-col rounded-xl bg-white shadow-xl"
      >
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <p className="mt-1 text-xs text-slate-500">
            <span className="text-red-500">*</span> 필수 항목 · 우편번호 찾기 시 지자체·담당 SV 자동 매핑
          </p>
        </div>

        <div className="flex border-b border-slate-200 px-4">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {(formError || validationSummary) && (
            <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
              {formError || validationSummary}
            </div>
          )}

          {activeTab === 'basic' && <BasicBusinessTab {...tabProps} />}
          {activeTab === 'contract' && (
            <ContractLocationTab
              {...tabProps}
              geocodeHint={geocodeHint}
              onGeocodeStatus={setGeocodeHint}
            />
          )}
          {activeTab === 'infra' && <InfraPlatformTab {...tabProps} />}
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-200 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {submitting ? '저장 중...' : '저장'}
          </button>
        </div>
      </form>
    </div>
  );
}
