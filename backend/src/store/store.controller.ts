import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateStoreDto } from './dto/create-store.dto';
import { BulkCreateStoreDto } from './dto/bulk-create-store.dto';
import { FindStoresQueryDto } from './dto/find-stores-query.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { StoreBulkImportService } from './store-bulk-import.service';
import { StoreService } from './store.service';

@Controller('stores')
export class StoreController {
  constructor(
    private readonly storeService: StoreService,
    private readonly bulkImportService: StoreBulkImportService,
  ) {}

  @Post()
  create(@Body() createStoreDto: CreateStoreDto) {
    return this.storeService.create(createStoreDto);
  }

  @Post('bulk')
  bulkCreate(@Body() dto: BulkCreateStoreDto) {
    return this.storeService.bulkCreate(dto.items);
  }

  @Post('bulk-import')
  @UseInterceptors(FileInterceptor('file'))
  async bulkImport(@UploadedFile() file: Express.Multer.File) {
    if (!file?.buffer?.length) {
      return {
        total: 0,
        successCount: 0,
        failureCount: 0,
        createdIds: [],
        errors: [
          {
            row: 0,
            code: 'REQUIRED',
            message: '엑셀 파일(file)이 필요합니다.',
          },
        ],
      };
    }
    return this.bulkImportService.importFromBuffer(file.buffer);
  }

  @Get()
  findAll(@Query() query: FindStoresQueryDto) {
    return this.storeService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.storeService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateStoreDto: UpdateStoreDto) {
    return this.storeService.update(id, updateStoreDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.storeService.remove(id);
  }
}
