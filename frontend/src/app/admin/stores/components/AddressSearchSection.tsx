'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import type { UseFormSetValue } from 'react-hook-form';
import { geocodeAddress } from '@/lib/geocoding/geocode-address';
import { REGION_TO_SUPERVISOR } from '../constants/region-supervisor-map';
import type { StoreFormValues } from '../schemas/store-form.schema';
import { extractRegionKeyFromAddress } from '../utils/address-region';

const DaumPostcode = dynamic(() => import('react-daum-postcode'), { ssr: false });

type AddressSearchProps = {
  setValue: UseFormSetValue<StoreFormValues>;
  onGeocodeStatus?: (msg: string | null) => void;
};

function applyRegionAndSupervisor(
  baseAddress: string,
  setValue: UseFormSetValue<StoreFormValues>,
) {
  const regionKey = extractRegionKeyFromAddress(baseAddress);
  if (!regionKey) return;

  setValue('region', regionKey, { shouldValidate: true, shouldDirty: true });

  const supervisorKey = REGION_TO_SUPERVISOR[regionKey];
  if (supervisorKey) {
    setValue('supervisor', supervisorKey, { shouldValidate: true, shouldDirty: true });
  }
}

export function AddressSearchSection({ setValue, onGeocodeStatus }: AddressSearchProps) {
  const [open, setOpen] = useState(false);
  const [geocoding, setGeocoding] = useState(false);

  const handleComplete = async (data: {
    zonecode: string;
    roadAddress: string;
    jibunAddress: string;
    address: string;
  }) => {
    const baseAddress = data.roadAddress || data.jibunAddress || data.address;
    setValue('zipCode', data.zonecode, { shouldValidate: true });
    setValue('baseAddress', baseAddress, { shouldValidate: true });
    setOpen(false);

    applyRegionAndSupervisor(baseAddress, setValue);

    setGeocoding(true);
    onGeocodeStatus?.('위·경도를 계산하는 중입니다...');

    try {
      const result = await geocodeAddress(baseAddress);

      if (result.status === 'success') {
        setValue('latitude', String(result.latitude), { shouldValidate: true });
        setValue('longitude', String(result.longitude), { shouldValidate: true });
        onGeocodeStatus?.('주소, 좌표, 지자체·담당 SV가 자동 입력되었습니다.');
      } else if (result.status === 'not_found') {
        setValue('latitude', '', { shouldValidate: true });
        setValue('longitude', '', { shouldValidate: true });
        const msg = '좌표를 찾을 수 없는 주소입니다. 상세 주소를 확인해 주세요.';
        onGeocodeStatus?.(msg);
        window.alert(msg);
      } else {
        setValue('latitude', '', { shouldValidate: true });
        setValue('longitude', '', { shouldValidate: true });
        onGeocodeStatus?.(result.message);
        console.warn('[geocode]', result.message);
      }
    } catch (e) {
      console.error('[geocode] 예상치 못한 오류:', e);
      setValue('latitude', '', { shouldValidate: true });
      setValue('longitude', '', { shouldValidate: true });
      onGeocodeStatus?.('좌표 변환 중 오류가 발생했습니다.');
    } finally {
      setGeocoding(false);
    }
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium text-slate-800">주소 검색</p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          disabled={geocoding}
          className="rounded-lg bg-slate-800 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-900 disabled:opacity-60"
        >
          {geocoding ? '좌표 계산 중...' : '우편번호 찾기'}
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <span className="font-medium text-slate-900">우편번호 · 주소 검색</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-sm text-slate-500 hover:text-slate-800"
              >
                닫기
              </button>
            </div>
            <DaumPostcode onComplete={handleComplete} style={{ height: 420 }} />
          </div>
        </div>
      )}
    </div>
  );
}
