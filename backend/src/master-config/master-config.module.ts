import { Module } from '@nestjs/common';
import { MasterConfigController } from './master-config.controller';
import { MasterConfigService } from './master-config.service';

@Module({
  controllers: [MasterConfigController],
  providers: [MasterConfigService],
  exports: [MasterConfigService],
})
export class MasterConfigModule {}
