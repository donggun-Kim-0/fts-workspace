import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MasterConfigModule } from './master-config/master-config.module';
import { PrismaModule } from './prisma/prisma.module';
import { StoreModule } from './store/store.module';

@Module({
  imports: [PrismaModule, MasterConfigModule, StoreModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
