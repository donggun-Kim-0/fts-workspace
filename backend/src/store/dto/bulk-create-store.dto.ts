import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, ValidateNested } from 'class-validator';
import { CreateStoreDto } from './create-store.dto';

export class BulkCreateStoreDto {
  @IsArray({ message: 'items는 배열이어야 합니다.' })
  @ArrayMinSize(1, { message: '등록할 가맹점 데이터가 1건 이상 필요합니다.' })
  @ValidateNested({ each: true })
  @Type(() => CreateStoreDto)
  items!: CreateStoreDto[];
}
