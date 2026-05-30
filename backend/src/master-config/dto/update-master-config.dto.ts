import { PartialType } from '@nestjs/mapped-types';
import { CreateMasterConfigDto } from './create-master-config.dto';

export class UpdateMasterConfigDto extends PartialType(CreateMasterConfigDto) {}
