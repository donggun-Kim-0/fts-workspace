'use client';

import {
  Controller,
  type Control,
  type FieldErrors,
  type UseFormRegister,
  type UseFormSetValue,
  type UseFormWatch,
} from 'react-hook-form';
import type { MasterConfigFormOptions } from '@/lib/api/master-config';
import type { StoreFormValues } from '../schemas/store-form.schema';
import { STORE_FORM_REQUIRED_FIELDS } from '../schemas/store-form.schema';

export const inputClass =
  'mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-slate-100 disabled:text-slate-500';

function FieldLabel({
  label,
  name,
  required,
  hint,
}: {
  label: string;
  name: keyof StoreFormValues;
  required?: boolean;
  hint?: string;
}) {
  const showRequired = required ?? STORE_FORM_REQUIRED_FIELDS.has(name);
  return (
    <>
      {label}
      {showRequired && <span className="text-red-500"> *</span>}
      {hint && <span className="ml-1 font-normal text-slate-400">{hint}</span>}
    </>
  );
}

type FieldProps = {
  label: string;
  name: keyof StoreFormValues;
  register: UseFormRegister<StoreFormValues>;
  errors: FieldErrors<StoreFormValues>;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  hint?: string;
  className?: string;
};

export function TextField({
  label,
  name,
  register,
  errors,
  type = 'text',
  placeholder,
  disabled,
  readOnly,
  required,
  hint,
  className,
}: FieldProps) {
  const err = errors[name]?.message as string | undefined;
  return (
    <label className={`block text-sm font-medium text-slate-700 ${className ?? ''}`}>
      <FieldLabel label={label} name={name} required={required} hint={hint} />
      <input
        type={type}
        disabled={disabled}
        readOnly={readOnly}
        placeholder={placeholder}
        className={inputClass}
        {...register(name)}
      />
      {err && <p className="mt-1 text-xs text-rose-600">{err}</p>}
    </label>
  );
}

type SelectProps = FieldProps & {
  options: { value: string; label: string }[];
  emptyLabel?: string;
  onValueChange?: (value: string) => void;
};

export function SelectField({
  label,
  name,
  register,
  errors,
  options,
  emptyLabel = '선택해 주세요',
  required,
  className,
  onValueChange,
}: SelectProps) {
  const err = errors[name]?.message as string | undefined;
  const registration = register(name, {
    onChange: onValueChange ? (e) => onValueChange(e.target.value) : undefined,
  });
  return (
    <label className={`block text-sm font-medium text-slate-700 ${className ?? ''}`}>
      <FieldLabel label={label} name={name} required={required} />
      <select className={inputClass} {...registration}>
        <option value="">{emptyLabel}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {err && <p className="mt-1 text-xs text-rose-600">{err}</p>}
    </label>
  );
}

type CheckboxProps = {
  label: string;
  name: keyof StoreFormValues;
  control: Control<StoreFormValues>;
  errors: FieldErrors<StoreFormValues>;
};

export function CheckboxField({ label, name, control, errors }: CheckboxProps) {
  const err = errors[name]?.message as string | undefined;
  return (
    <div>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={Boolean(field.value)}
              onChange={(e) => field.onChange(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            {label}
          </label>
        )}
      />
      {err && <p className="mt-1 text-xs text-rose-600">{err}</p>}
    </div>
  );
}

export type TabFormProps = {
  register: UseFormRegister<StoreFormValues>;
  control: Control<StoreFormValues>;
  errors: FieldErrors<StoreFormValues>;
  setValue: UseFormSetValue<StoreFormValues>;
  watch: UseFormWatch<StoreFormValues>;
  branchCodeDisabled?: boolean;
  formOptions: MasterConfigFormOptions | null;
  optionsLoading?: boolean;
};
