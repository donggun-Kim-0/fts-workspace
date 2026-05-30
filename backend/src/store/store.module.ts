import { Module } from '@nestjs/common';
import { MasterConfigModule } from '../master-config/master-config.module';
import { AddressGeocodingService } from '../shared/address/address-geocoding.service';
import { StoreAutomationService } from './store-automation.service';
import { StoreBulkImportService } from './store-bulk-import.service';
import { StoreController } from './store.controller';
import { StoreService } from './store.service';

@Module({
  imports: [MasterConfigModule],
  controllers: [StoreController],
  providers: [
    StoreService,
    StoreAutomationService,
    StoreBulkImportService,
    AddressGeocodingService,
  ],
  exports: [StoreService, StoreAutomationService],
})
export class StoreModule {}
