import { ApiProperty } from '@nestjs/swagger';
import { PaginationDto } from './pagination-dto';
import { IsInt, IsOptional, Min, IsString, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class BagianGedungDto extends PaginationDto {}
export class DetailGedungDto extends PaginationDto {
  @ApiProperty({ required: false, example: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  bagian_gedung_komponen_id?: number;

  @ApiProperty({ required: false, example: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  gedung_id?: number;
}
export class DetailListGedungDto extends PaginationDto {
  @ApiProperty({ required: true, example: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  gedung_id: number;

  @ApiProperty({ required: true, example: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  bagian_gedung_id: number;

  @ApiProperty({ required: false, example: 1 })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  periode?: number;

  @ApiProperty({ required: false, example: '2024-11' })
  @IsString()
  @IsOptional()
  bulan?: string;
}

export class ImageDetailDto extends PaginationDto {
  @ApiProperty({ required: true, example: '1,2' })
  @IsString()
  @IsNotEmpty()
  pemeliharaan_gedung_ids: string;
}
export class KomponenGedungDto extends PaginationDto {
  @ApiProperty({ required: false, example: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  bagian_gedung_id: number;
}
