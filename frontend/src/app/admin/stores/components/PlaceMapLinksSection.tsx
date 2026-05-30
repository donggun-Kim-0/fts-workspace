'use client';

import type { UseFormRegister, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import type { MasterConfigFormOptions } from '@/lib/api/master-config';
import { buildMapSearchUrls } from '../utils/build-map-search-urls';
import type { StoreFormValues } from '../schemas/store-form.schema';
import { inputClass } from './FormControls';

type Props = {
  register: UseFormRegister<StoreFormValues>;
  setValue: UseFormSetValue<StoreFormValues>;
  watch: UseFormWatch<StoreFormValues>;
  formOptions: MasterConfigFormOptions | null;
};

function resolveBrandLabel(
  contractBrandKey: string,
  formOptions: MasterConfigFormOptions | null,
): string {
  if (!contractBrandKey) return '';
  const item = formOptions?.BRAND?.find((b) => b.key === contractBrandKey);
  return item?.value ?? contractBrandKey;
}

export function PlaceMapLinksSection({ register, setValue, watch, formOptions }: Props) {
  const branchName = watch('branchName');
  const contractBrand = watch('contractBrand');

  const handleAutoFill = () => {
    const brandLabel = resolveBrandLabel(contractBrand ?? '', formOptions);
    const urls = buildMapSearchUrls(brandLabel, branchName ?? '');

    if (!urls) {
      window.alert('계약 브랜드와 지점명을 먼저 입력해 주세요.');
      return;
    }

    setValue('mapNaverUrl', urls.naver, { shouldDirty: true });
    setValue('mapKakaoUrl', urls.kakao, { shouldDirty: true });
    setValue('mapGoogleUrl', urls.google, { shouldDirty: true });
  };

  return (
    <section>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-slate-800">플레이스 정보</h3>
        <button
          type="button"
          onClick={handleAutoFill}
          className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100"
        >
          지도 URL 자동 입력
        </button>
      </div>
      <p className="mb-3 text-xs text-slate-500">
        계약 브랜드 + 지점명 기준으로 네이버/카카오/구글 지도 검색 URL을 생성합니다.
      </p>
      <div className="grid gap-4">
        <label className="block text-sm font-medium text-slate-700">
          네이버 지도
          <input
            className={inputClass}
            placeholder="https://map.naver.com/..."
            {...register('mapNaverUrl')}
          />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          카카오맵
          <input
            className={inputClass}
            placeholder="https://map.kakao.com/..."
            {...register('mapKakaoUrl')}
          />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          구글 지도
          <input
            className={inputClass}
            placeholder="https://www.google.com/maps/..."
            {...register('mapGoogleUrl')}
          />
        </label>
      </div>
    </section>
  );
}
