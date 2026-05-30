import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type SeedItem = {
  category: string;
  key: string;
  value: string;
};

const seeds: SeedItem[] = [
  { category: 'BRAND', key: 'BRAND_A', value: '브랜드 A' },
  { category: 'BRAND', key: 'BRAND_B', value: '브랜드 B' },
  { category: 'STORE_STATUS', key: 'OPEN', value: '운영중' },
  { category: 'STORE_STATUS', key: 'CLOSED', value: '폐점' },
  { category: 'STORE_STATUS', key: 'SUSPENDED', value: '일시중지' },
  { category: 'REGION', key: 'SEOUL', value: '서울특별시' },
  { category: 'REGION', key: 'GYEONGGI', value: '경기도' },
  { category: 'REGION', key: 'BUSAN', value: '부산광역시' },
  { category: 'SV_MANAGER', key: 'SV_KIM', value: '김철수' },
  { category: 'SV_MANAGER', key: 'SV_LEE', value: '이영희' },
  { category: 'SV_MANAGER', key: 'SV_PARK', value: '박민수' },
  { category: 'STORE_STATUS', key: 'PRE_OPEN', value: '오픈 예정' },
  { category: 'STORE_STATUS', key: 'TERMINATED', value: '해지' },
  { category: 'BRANCH_TYPE', key: 'STANDALONE', value: '단독매장' },
  { category: 'MARKET_TYPE', key: 'RESIDENTIAL', value: '주거 상권' },
  { category: 'MARKET_TYPE', key: 'STATION', value: '역세권' },
  { category: 'SW_TYPE', key: 'POS_CLOUD', value: '클라우드 POS' },
  { category: 'SW_TYPE', key: 'POS_ONPREM', value: '온프레미스 POS' },
  { category: 'TABLE_ORDER_VENDOR', key: 'TORDER_A', value: '테이블오더 A' },
  { category: 'POS_HW', key: 'HW_B', value: 'H/W 업체 B' },
  { category: 'BRANCH_TYPE', key: 'COMPLEX', value: '복합매장' },
  { category: 'BRANCH_TYPE', key: 'SHOP_IN_SHOP', value: '샵인샵' },
  { category: 'MARKET_TYPE', key: 'OFFICE', value: '오피스 상권' },
  { category: 'POS_HW', key: 'HW_A', value: 'H/W 업체 A' },
  { category: 'TERMINATION_NOTICE_PERIOD', key: '90', value: '90일 전 통보' },
  { category: 'TERMINATION_NOTICE_PERIOD', key: '60', value: '60일 전 통보' },
];

async function main() {
  for (const item of seeds) {
    const existing = await prisma.masterConfig.findFirst({
      where: { category: item.category, key: item.key },
    });

    if (existing) {
      await prisma.masterConfig.update({
        where: { id: existing.id },
        data: { value: item.value, isActive: true },
      });
    } else {
      await prisma.masterConfig.create({ data: { ...item, isActive: true } });
    }
  }
  console.log(`MasterConfig seed 완료 (${seeds.length}건)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
