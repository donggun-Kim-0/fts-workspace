import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateMasterConfigDto {
  @IsString()
  @IsNotEmpty()
  category!: string;

  @IsString()
  @IsNotEmpty()
  key!: string;

  @IsString()
  @IsNotEmpty()
  value!: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
