'use client';

import { useEffect, useRef } from 'react';
import {
  useFieldArray,
  type Control,
  type FieldErrors,
  type UseFormRegister,
  type UseFormSetValue,
  type UseFormWatch,
} from 'react-hook-form';
import { DELIVERY_PLATFORM_OPTIONS, EMPTY_PLATFORM_LINK } from '../constants/delivery-platform-options';
import type { StoreFormValues } from '../schemas/store-form.schema';
import { getDeliveryPlatformLabel } from '../utils/delivery-platform-label';
import { inputClass } from './FormControls';

type Props = {
  control: Control<StoreFormValues>;
  register: UseFormRegister<StoreFormValues>;
  errors: FieldErrors<StoreFormValues>;
  setValue: UseFormSetValue<StoreFormValues>;
  watch: UseFormWatch<StoreFormValues>;
};

export function PlatformLinksEditor({ control, register, errors, setValue, watch }: Props) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'platformLinks',
  });

  const rowErrors = errors.platformLinks;
  const prevPlatformRef = useRef<Record<number, string>>({});

  useEffect(() => {
    fields.forEach((_, index) => {
      prevPlatformRef.current[index] = watch(`platformLinks.${index}.platform`) ?? '';
    });
  }, [fields, watch]);

  const handlePlatformChange = (index: number, newPlatformKey: string) => {
    const previousPlatformKey = prevPlatformRef.current[index] ?? '';
    const currentStoreName = (watch(`platformLinks.${index}.storeName`) ?? '').trim();
    const previousLabel = getDeliveryPlatformLabel(previousPlatformKey);
    const newLabel = getDeliveryPlatformLabel(newPlatformKey);

    if (!currentStoreName || currentStoreName === previousLabel) {
      setValue(`platformLinks.${index}.storeName`, newLabel, { shouldDirty: true });
    }

    prevPlatformRef.current[index] = newPlatformKey;
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
          <tr>
            <th className="px-3 py-2.5">플랫폼</th>
            <th className="px-3 py-2.5">스토어명</th>
            <th className="px-3 py-2.5">ID</th>
            <th className="px-3 py-2.5">PW</th>
            <th className="px-3 py-2.5">URL</th>
            <th className="w-20 px-3 py-2.5" />
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {fields.map((field, index) => (
            <tr key={field.id} className="align-top">
              <td className="px-3 py-2">
                <select
                  className={inputClass}
                  {...register(`platformLinks.${index}.platform`, {
                    onChange: (e) => handlePlatformChange(index, e.target.value),
                  })}
                >
                  <option value="">선택</option>
                  {DELIVERY_PLATFORM_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </td>
              <td className="px-3 py-2">
                <input
                  className={inputClass}
                  placeholder="플랫폼 내 매장명"
                  {...register(`platformLinks.${index}.storeName`)}
                />
              </td>
              <td className="px-3 py-2">
                <input
                  className={inputClass}
                  placeholder="로그인 ID"
                  autoComplete="off"
                  {...register(`platformLinks.${index}.id`)}
                />
              </td>
              <td className="px-3 py-2">
                <input
                  type="password"
                  className={inputClass}
                  placeholder="비밀번호"
                  autoComplete="new-password"
                  {...register(`platformLinks.${index}.password`)}
                />
              </td>
              <td className="px-3 py-2">
                <input
                  className={inputClass}
                  placeholder="https://"
                  {...register(`platformLinks.${index}.url`)}
                />
              </td>
              <td className="px-3 py-2">
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => append({ ...EMPTY_PLATFORM_LINK })}
                    className="rounded border border-slate-300 px-2 py-1 text-xs text-slate-600 hover:bg-slate-50"
                    title="행 추가"
                  >
                    +
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    disabled={fields.length <= 1}
                    className="rounded border border-slate-300 px-2 py-1 text-xs text-rose-600 hover:bg-rose-50 disabled:opacity-40"
                    title="행 삭제"
                  >
                    −
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {rowErrors && !Array.isArray(rowErrors) && (
        <p className="px-3 py-2 text-xs text-rose-600">{String(rowErrors.message ?? '')}</p>
      )}
    </div>
  );
}
