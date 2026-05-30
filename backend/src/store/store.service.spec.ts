import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { MasterConfigService } from '../master-config/master-config.service';
import { AddressGeocodingService } from '../shared/address/address-geocoding.service';
import { StoreAutomationService } from './store-automation.service';
import { StoreService } from './store.service';

describe('StoreService', () => {
  let service: StoreService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StoreService,
        { provide: PrismaService, useValue: { store: {}, $transaction: jest.fn() } },
        { provide: MasterConfigService, useValue: { assertActiveKey: jest.fn() } },
        { provide: StoreAutomationService, useValue: {} },
        { provide: AddressGeocodingService, useValue: { geocode: jest.fn() } },
      ],
    }).compile();

    service = module.get<StoreService>(StoreService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
