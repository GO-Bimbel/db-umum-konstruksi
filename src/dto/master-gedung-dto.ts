import { ApiProperty } from '@nestjs/swagger';
import { PaginationDto } from './pagination-dto';
import { IsInt, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class BagianGedungDto extends PaginationDto {}
export class DetailGedungDto extends PaginationDto {
  @ApiProperty({ required: false, example: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  bagian_gedung_komponen_id: number;
}
export class KomponenGedungDto extends PaginationDto {
  @ApiProperty({ required: false, example: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  bagian_gedung_id: number;
}
