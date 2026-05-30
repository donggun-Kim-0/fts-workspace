'use client';

import { pickOptions } from '@/lib/api/master-config';
import {
  DUMMY_MARKET_TYPE_OPTIONS,
  DUMMY_NOTICE_PERIOD_OPTIONS,
} from '../../constants/select-options';
import { AddressSearchSection } from '../AddressSearchSection';
import { SelectField, TextField, type TabFormProps } from '../FormControls';

type Props = TabFormProps & {
  geocodeHint: string | null;
  onGeocodeStatus: (msg: string | null) => void;
};

export function ContractLocationTab({
  register,
  errors,
  setValue,
  geocodeHint,
  onGeocodeStatus,
  formOptions,
}: Props) {
  return (
    <div className="space-y-4">
      <AddressSearchSection setValue={setValue} onGeocodeStatus={onGeocodeStatus} />
      {geocodeHint && (
        <p className="text-xs text-blue-700">{geocodeHint}</p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="우편번호" name="zipCode" register={register} errors={errors} readOnly />
        <SelectField
          label="상권유형"
          name="marketType"
          register={register}
          errors={errors}
          options={pickOptions(formOptions, 'MARKET_TYPE', [...DUMMY_MARKET_TYPE_OPTIONS])}
        />
        <TextField
          label="기본 주소"
          name="baseAddress"
          register={register}
          errors={errors}
          className="sm:col-span-2"
          readOnly
          hint="(우편번호 찾기로 입력)"
        />
        <TextField
          label="상세 주소"
          name="addressDetail"
          register={register}
          errors={errors}
          className="sm:col-span-2"
          placeholder="동·호수, 층 등"
        />
        <TextField
          label="위도"
          name="latitude"
          register={register}
          errors={errors}
          readOnly
          hint="(자동)"
        />
        <TextField
          label="경도"
          name="longitude"
          register={register}
          errors={errors}
          readOnly
          hint="(자동)"
        />
        <TextField
          label="영업시간"
          name="businessHours"
          register={register}
          errors={errors}
          placeholder="09:00-22:00"
        />
        <TextField
          label="브레이크 타임"
          name="breakTime"
          register={register}
          errors={errors}
          placeholder="15:00-17:00"
        />
        <TextField
          label="휴무일"
          name="holidaysText"
          register={register}
          errors={errors}
          placeholder="월, 화 (쉼표로 구분)"
          className="sm:col-span-2"
        />
        <TextField label="오픈일" name="openedAt" type="date" register={register} errors={errors} />
      </div>

      <hr className="border-slate-200" />
      <p className="text-sm font-semibold text-slate-800">계약 정보</p>

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="정보공개서 회신일"
          name="disclosureReplyDate"
          type="date"
          register={register}
          errors={errors}
        />
        <TextField label="보장권역" name="coverageArea" register={register} errors={errors} />
        <TextField
          label="최초 계약일"
          name="initialContractDate"
          type="date"
          register={register}
          errors={errors}
        />
        <TextField
          label="갱신 계약일"
          name="renewalContractDate"
          type="date"
          register={register}
          errors={errors}
        />
        <TextField
          label="계약 기간(월)"
          name="contractPeriodMonths"
          register={register}
          errors={errors}
          hint="만료일 자동 계산"
        />
        <SelectField
          label="해지 통보 주기"
          name="terminationNoticePeriodKey"
          register={register}
          errors={errors}
          options={pickOptions(formOptions, 'TERMINATION_NOTICE_PERIOD', [
            ...DUMMY_NOTICE_PERIOD_OPTIONS,
          ])}
        />
        <TextField label="가맹비" name="franchiseFee" register={register} errors={errors} />
        <TextField label="교육비" name="educationFee" register={register} errors={errors} />
        <TextField label="로열티 금액" name="royaltyAmount" register={register} errors={errors} />
        <TextField label="로열티 날짜" name="royaltyDate" register={register} errors={errors} />
        <TextField
          label="해지일"
          name="terminateDate"
          type="date"
          register={register}
          errors={errors}
        />
        <TextField
          label="운영기간(일)"
          name="operationDuration"
          register={register}
          errors={errors}
        />
      </div>
    </div>
  );
}
