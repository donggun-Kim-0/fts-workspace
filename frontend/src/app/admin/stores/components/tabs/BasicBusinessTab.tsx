'use client';

import { pickOptions } from '@/lib/api/master-config';
import {
  DUMMY_BRANCH_TYPE_OPTIONS,
  DUMMY_BRAND_OPTIONS,
  DUMMY_MARKET_TYPE_OPTIONS,
  DUMMY_NOTICE_PERIOD_OPTIONS,
  DUMMY_POS_HW_OPTIONS,
  DUMMY_POS_SW_OPTIONS,
  DUMMY_REGION_OPTIONS,
  DUMMY_STATUS_OPTIONS,
  DUMMY_SV_OPTIONS,
  DUMMY_TABLE_ORDER_VENDOR_OPTIONS,
} from '../../constants/select-options';
import type { StoreFormValues } from '../../schemas/store-form.schema';
import { SelectField, TextField, type TabFormProps } from '../FormControls';

export function BasicBusinessTab({
  register,
  errors,
  branchCodeDisabled,
  formOptions,
  optionsLoading,
}: TabFormProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {optionsLoading && (
        <p className="sm:col-span-2 text-xs text-slate-500">공통 코드 불러오는 중...</p>
      )}
      <TextField
        label="지점명"
        name="branchName"
        register={register}
        errors={errors}
        placeholder="예) 강남 1호점"
        className="sm:col-span-2"
      />
      <TextField
        label="지점코드"
        name="branchCode"
        register={register}
        errors={errors}
        disabled={branchCodeDisabled}
        hint={branchCodeDisabled ? undefined : '(비우면 자동 발급)'}
        placeholder="ST-20260530-001"
      />
      <SelectField
        label="계약 브랜드"
        name="contractBrand"
        register={register}
        errors={errors}
        options={pickOptions(formOptions, 'BRAND', [...DUMMY_BRAND_OPTIONS])}
      />
      <SelectField
        label="운영상태"
        name="status"
        register={register}
        errors={errors}
        options={pickOptions(formOptions, 'STORE_STATUS', [...DUMMY_STATUS_OPTIONS])}
      />
      <SelectField
        label="영업 형태"
        name="branchType"
        register={register}
        errors={errors}
        options={pickOptions(formOptions, 'BRANCH_TYPE', [...DUMMY_BRANCH_TYPE_OPTIONS])}
      />
      <SelectField
        label="지자체"
        name="region"
        register={register}
        errors={errors}
        options={pickOptions(formOptions, 'REGION', [...DUMMY_REGION_OPTIONS])}
      />
      <SelectField
        label="담당 SV"
        name="supervisor"
        register={register}
        errors={errors}
        options={pickOptions(formOptions, 'SV_MANAGER', [...DUMMY_SV_OPTIONS])}
      />

      <hr className="sm:col-span-2 border-slate-200" />
      <p className="sm:col-span-2 text-sm font-semibold text-slate-800">사업자 · 대표자</p>

      <TextField
        label="사업자등록번호"
        name="bizRegNo"
        register={register}
        errors={errors}
        placeholder="000-00-00000"
      />
      <TextField label="법인등록번호" name="corpRegNo" register={register} errors={errors} />
      <TextField label="상호명" name="bizName" register={register} errors={errors} />
      <TextField label="업태" name="bizType" register={register} errors={errors} />
      <TextField label="업종" name="bizCategory" register={register} errors={errors} />
      <TextField label="대표자명" name="ownerName" register={register} errors={errors} />
      <TextField label="대표자 연락처" name="ownerPhone" register={register} errors={errors} />
      <TextField label="매장 연락처" name="storePhone" register={register} errors={errors} />
      <TextField
        label="대표자 이메일"
        name="ownerEmail"
        type="email"
        register={register}
        errors={errors}
      />
      <TextField label="대표자 생년월일" name="ownerBirth" register={register} errors={errors} />
      <TextField label="매니저명" name="managerName" register={register} errors={errors} />
      <TextField label="매니저 연락처" name="managerPhone" register={register} errors={errors} />
      <TextField label="정직원 수" name="staffCount" register={register} errors={errors} />
      <TextField label="파트타임 수" name="partTimeCount" register={register} errors={errors} />
      <TextField label="인건비" name="laborCost" register={register} errors={errors} />
      <TextField
        label="자택 주소"
        name="homeAddress"
        register={register}
        errors={errors}
        className="sm:col-span-2"
      />
    </div>
  );
}
