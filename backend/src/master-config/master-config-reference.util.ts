import { Prisma } from '@prisma/client';
import { MASTER_CONFIG_CATEGORIES } from '../shared/constants/master-config-categories';

export function buildStoreReferenceWhere(
  category: string,
  key: string,
): Prisma.StoreWhereInput | null {
  switch (category) {
    case MASTER_CONFIG_CATEGORIES.BRAND:
      return { contractBrand: key };
    case MASTER_CONFIG_CATEGORIES.STORE_STATUS:
      return { status: key };
    case MASTER_CONFIG_CATEGORIES.REGION:
      return { region: key };
    case MASTER_CONFIG_CATEGORIES.SV_MANAGER:
      return { supervisor: key };
    case MASTER_CONFIG_CATEGORIES.BRANCH_TYPE:
      return { branchType: key };
    case MASTER_CONFIG_CATEGORIES.MARKET_TYPE:
      return { marketType: key };
    case MASTER_CONFIG_CATEGORIES.POS_HW:
    case MASTER_CONFIG_CATEGORIES.POS_VENDOR:
      return { posInfo: { path: ['vendor'], equals: key } };
    case MASTER_CONFIG_CATEGORIES.SW_TYPE:
      return { posInfo: { path: ['swType'], equals: key } };
    case MASTER_CONFIG_CATEGORIES.TABLE_ORDER_VENDOR:
      return { tableOrderInfo: { path: ['vendor'], equals: key } };
    default:
      return null;
  }
}
