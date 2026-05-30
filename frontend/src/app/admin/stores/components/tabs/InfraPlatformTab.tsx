'use client';

import { useEffect, useRef } from 'react';
import { pickOptions } from '@/lib/api/master-config';
import { resolvePosSwUrl } from '../../constants/pos-sw-url-map';
import {
  DUMMY_POS_HW_OPTIONS,
  DUMMY_POS_SW_OPTIONS,
  DUMMY_TABLE_ORDER_VENDOR_OPTIONS,
} from '../../constants/select-options';
import { PlatformLinksEditor } from '../PlatformLinksEditor';
import { PlaceMapLinksSection } from '../PlaceMapLinksSection';
import { CheckboxField, SelectField, TextField, type TabFormProps } from '../FormControls';

export function InfraPlatformTab({
  register,
  control,
  errors,
  setValue,
  watch,
  formOptions,
}: TabFormProps) {
  const tableOrderEnabled = watch('tableOrderEnabled');
  const prevPosSwRef = useRef('');

  useEffect(() => {
    prevPosSwRef.current = watch('posSwType') ?? '';
  }, [watch]);

  const handlePosSwTypeChange = (swTypeKey: string) => {
    const currentUrl = (watch('posUrl') ?? '').trim();
    const prevUrl = resolvePosSwUrl(prevPosSwRef.current, formOptions);
    const nextUrl = resolvePosSwUrl(swTypeKey, formOptions);

    if (nextUrl && (!currentUrl || currentUrl === prevUrl)) {
      setValue('posUrl', nextUrl, { shouldDirty: true });
    }

    prevPosSwRef.current = swTypeKey;
  };

  return (
    <div className="space-y-6">
      <section>
        <h3 className="mb-3 text-sm font-semibold text-slate-800">POS 정보</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            label="H/W 업체 (vendor)"
            name="posVendor"
            register={register}
            errors={errors}
            options={pickOptions(formOptions, 'POS_HW', [...DUMMY_POS_HW_OPTIONS])}
          />
          <TextField
            label="계약일 (contractDate)"
            name="posContractDate"
            type="date"
            register={register}
            errors={errors}
          />
          <SelectField
            label="S/W 종류 (swType)"
            name="posSwType"
            register={register}
            errors={errors}
            options={pickOptions(formOptions, 'SW_TYPE', [...DUMMY_POS_SW_OPTIONS])}
            className="sm:col-span-2"
            onValueChange={handlePosSwTypeChange}
          />
          <TextField
            label="POS URL"
            name="posUrl"
            type="url"
            placeholder="https://"
            register={register}
            errors={errors}
            className="sm:col-span-2"
          />
          <TextField
            label="POS ID"
            name="posId"
            placeholder="로그인 ID"
            register={register}
            errors={errors}
          />
          <TextField
            label="POS PW"
            name="posPassword"
            type="password"
            placeholder="비밀번호"
            register={register}
            errors={errors}
          />
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-800">테이블오더</h3>
            <p className="mt-0.5 text-xs text-slate-500">
              사용 여부를 켜면 아래 항목을 입력할 수 있습니다.
            </p>
          </div>
          <CheckboxField
            label="테이블오더 사용"
            name="tableOrderEnabled"
            control={control}
            errors={errors}
          />
        </div>
        <div
          className={`grid gap-4 sm:grid-cols-2 ${tableOrderEnabled ? '' : 'pointer-events-none opacity-50'}`}
        >
          <SelectField
            label="업체 (vendor)"
            name="tableOrderVendor"
            register={register}
            errors={errors}
            options={pickOptions(formOptions, 'TABLE_ORDER_VENDOR', [
              ...DUMMY_TABLE_ORDER_VENDOR_OPTIONS,
            ])}
          />
          <TextField
            label="수량"
            name="tableOrderQuantity"
            type="number"
            placeholder="0"
            register={register}
            errors={errors}
          />
          <TextField
            label="계약일 (contractDate)"
            name="tableOrderContractDate"
            type="date"
            register={register}
            errors={errors}
          />
          <div className="hidden sm:block" aria-hidden />
          <TextField
            label="ID"
            name="tableOrderId"
            placeholder="로그인 ID"
            register={register}
            errors={errors}
          />
          <TextField
            label="PW"
            name="tableOrderPassword"
            type="password"
            placeholder="비밀번호"
            register={register}
            errors={errors}
          />
        </div>
      </section>

      <section>
        <h3 className="mb-3 text-sm font-semibold text-slate-800">배달 · 플랫폼</h3>
        <PlatformLinksEditor
          control={control}
          register={register}
          errors={errors}
          setValue={setValue}
          watch={watch}
        />
      </section>

      <section>
        <h3 className="mb-3 text-sm font-semibold text-slate-800">KT 서비스</h3>
        <div className="flex flex-wrap gap-6">
          <CheckboxField label="인터넷" name="ktInternet" control={control} errors={errors} />
          <CheckboxField label="TV" name="ktTv" control={control} errors={errors} />
          <CheckboxField label="CCTV" name="ktCctv" control={control} errors={errors} />
        </div>
      </section>

      <PlaceMapLinksSection
        register={register}
        setValue={setValue}
        watch={watch}
        formOptions={formOptions}
      />
    </div>
  );
}
