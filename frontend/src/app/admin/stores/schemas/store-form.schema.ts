import { z } from 'zod';
import { EMPTY_PLATFORM_LINK } from '../constants/delivery-platform-options';

const optionalText = z.string().trim().optional().or(z.literal(''));

const optionalEmail = z
  .string()
  .trim()
  .refine((v) => v === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), {
    message: '이메일 형식에 맞지 않습니다.',
  });

const optionalIntString = z
  .string()
  .trim()
  .refine((v) => v === '' || /^-?\d+$/.test(v), {
    message: '숫자 형식에 맞지 않습니다.',
  });

const optionalFloatString = z
  .string()
  .trim()
  .refine((v) => v === '' || /^-?\d+(\.\d+)?$/.test(v), {
    message: '숫자 형식에 맞지 않습니다.',
  });

const optionalDate = z
  .string()
  .trim()
  .refine((v) => v === '' || !Number.isNaN(Date.parse(v)), {
    message: '날짜 형식에 맞지 않습니다.',
  });

export const storeFormSchema = z.object({
  branchCode: optionalText,
  branchName: z.string().trim().min(1, '지점명은 필수 입력 항목입니다.'),
  contractBrand: optionalText,
  status: z.string().min(1, '운영상태는 필수 입력 항목입니다.'),
  branchType: optionalText,
  region: optionalText,
  supervisor: optionalText,
  marketType: optionalText,

  bizRegNo: optionalText,
  corpRegNo: optionalText,
  bizName: optionalText,
  bizType: optionalText,
  bizCategory: optionalText,
  ownerName: z.string().trim().min(1, '대표자명은 필수 입력 항목입니다.'),
  ownerPhone: optionalText,
  ownerEmail: optionalEmail,
  ownerBirth: optionalText,
  storePhone: optionalText,
  managerName: optionalText,
  managerPhone: optionalText,
  homeAddress: optionalText,
  staffCount: optionalIntString,
  partTimeCount: optionalIntString,
  laborCost: optionalIntString,

  zipCode: optionalText,
  baseAddress: optionalText,
  addressDetail: optionalText,
  latitude: optionalFloatString,
  longitude: optionalFloatString,
  businessHours: optionalText,
  breakTime: optionalText,
  holidaysText: optionalText,
  openedAt: optionalDate,

  disclosureReplyDate: optionalDate,
  coverageArea: optionalText,
  initialContractDate: optionalDate,
  renewalContractDate: optionalDate,
  contractPeriodMonths: optionalIntString,
  terminationNoticePeriodKey: optionalText,
  franchiseFee: optionalIntString,
  educationFee: optionalIntString,
  royaltyAmount: optionalIntString,
  royaltyDate: optionalText,
  terminateDate: optionalDate,
  operationDuration: optionalIntString,

  posVendor: optionalText,
  posContractDate: optionalDate,
  posSwType: optionalText,
  posUrl: optionalText,
  posId: optionalText,
  posPassword: optionalText,

  tableOrderEnabled: z.boolean(),
  tableOrderVendor: optionalText,
  tableOrderQuantity: optionalIntString,
  tableOrderContractDate: optionalDate,
  tableOrderId: optionalText,
  tableOrderPassword: optionalText,

  platformLinks: z.array(
    z.object({
      platform: optionalText,
      storeName: optionalText,
      id: optionalText,
      password: optionalText,
      url: optionalText,
    }),
  ),

  ktInternet: z.boolean(),
  ktTv: z.boolean(),
  ktCctv: z.boolean(),

  mapNaverUrl: optionalText,
  mapKakaoUrl: optionalText,
  mapGoogleUrl: optionalText,
});

export type StoreFormValues = z.infer<typeof storeFormSchema>;

export const defaultStoreFormValues: StoreFormValues = {
  branchCode: '',
  branchName: '',
  contractBrand: '',
  status: 'OPEN',
  branchType: '',
  region: '',
  supervisor: '',
  marketType: '',

  bizRegNo: '',
  corpRegNo: '',
  bizName: '',
  bizType: '',
  bizCategory: '',
  ownerName: '',
  ownerPhone: '',
  ownerEmail: '',
  ownerBirth: '',
  storePhone: '',
  managerName: '',
  managerPhone: '',
  homeAddress: '',
  staffCount: '0',
  partTimeCount: '0',
  laborCost: '0',

  zipCode: '',
  baseAddress: '',
  addressDetail: '',
  latitude: '',
  longitude: '',
  businessHours: '',
  breakTime: '',
  holidaysText: '',
  openedAt: '',

  disclosureReplyDate: '',
  coverageArea: '',
  initialContractDate: '',
  renewalContractDate: '',
  contractPeriodMonths: '36',
  terminationNoticePeriodKey: '90',
  franchiseFee: '',
  educationFee: '',
  royaltyAmount: '',
  royaltyDate: '',
  terminateDate: '',
  operationDuration: '',

  posVendor: '',
  posContractDate: '',
  posSwType: '',
  posUrl: '',
  posId: '',
  posPassword: '',

  tableOrderEnabled: false,
  tableOrderVendor: '',
  tableOrderQuantity: '',
  tableOrderContractDate: '',
  tableOrderId: '',
  tableOrderPassword: '',

  platformLinks: [{ ...EMPTY_PLATFORM_LINK }],

  ktInternet: false,
  ktTv: false,
  ktCctv: false,

  mapNaverUrl: '',
  mapKakaoUrl: '',
  mapGoogleUrl: '',
};

export type StoreFormTab = 'basic' | 'contract' | 'infra';

/** storeFormSchema 기준 필수 입력 필드 (Label 빨간 별표 표시용) */
export const STORE_FORM_REQUIRED_FIELDS = new Set<keyof StoreFormValues>([
  'branchName',
  'status',
  'ownerName',
]);
