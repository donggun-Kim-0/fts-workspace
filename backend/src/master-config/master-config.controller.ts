import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreateMasterConfigDto } from './dto/create-master-config.dto';
import { UpdateMasterConfigDto } from './dto/update-master-config.dto';
import { MasterConfigService } from './master-config.service';

@Controller('master-config')
export class MasterConfigController {
  constructor(private readonly masterConfigService: MasterConfigService) {}

  @Get('categories')
  listCategories() {
    return this.masterConfigService.listCategories();
  }

  @Get()
  findAll(
    @Query('category') category?: string,
    @Query('activeOnly') activeOnly?: string,
  ) {
    const onlyActive = activeOnly !== 'false';
    if (category) {
      return this.masterConfigService.findByCategory(category, onlyActive);
    }
    return this.masterConfigService.findAll(undefined, onlyActive);
  }

  @Get('form-options')
  getFormOptions() {
    return this.masterConfigService.getFormOptions();
  }

  @Get(':id/usage')
  getUsage(@Param('id', ParseIntPipe) id: number) {
    return this.masterConfigService.getUsage(id);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.masterConfigService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateMasterConfigDto) {
    return this.masterConfigService.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMasterConfigDto,
  ) {
    return this.masterConfigService.update(id, dto);
  }

  /** 소프트 삭제 (isActive=false) */
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.masterConfigService.remove(id);
  }
}
