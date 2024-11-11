import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { PaginationDto } from './pagination-dto';
import { kondisi_enum } from '@prisma/client';

export class PemeliharaanGedungDto extends PaginationDto {
  @ApiProperty({ required: false, example: kondisi_enum.BAGUS })
  @Type(() => String)
  @IsOptional()
  @IsString()
  kondisi?: kondisi_enum;
}

export class UpdatePemeliharaanGedungDto {
  @ApiProperty({ required: true, example: 1 })
  @Type(() => Number)
  @IsNotEmpty()
  @IsInt()
  gedung_id: number;

  @ApiProperty({ required: true, example: 1 })
  @Type(() => Number)
  @IsNotEmpty()
  @IsInt()
  bagian_gedung_detail: number;

  @ApiProperty({ required: true, example: kondisi_enum.BAGUS })
  @Type(() => String)
  @IsNotEmpty()
  @IsString()
  kondisi: kondisi_enum;

  @ApiProperty({ required: false, example: 'OK' })
  @Type(() => String)
  @IsOptional()
  @IsString()
  catatan?: string;

  @ApiProperty({ required: true, example: 'http://img.com' })
  @Type(() => String)
  @IsNotEmpty()
  @IsString()
  image_url: string;
  
  @ApiProperty({ required: true, example: '0239429' })
  @Type(() => String)
  @IsNotEmpty()
  @IsString()
  updater_by: string;
}

export class CreatePemeliharaanGedungDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PemeliharaanGedungItemDto)
  data_pemeliharaan: PemeliharaanGedungItemDto[];
}

class PemeliharaanGedungItemDto {
  @ApiProperty({ required: true, example: 1 })
  @Type(() => Number)
  @IsNotEmpty()
  @IsInt()
  gedung_id: number;

  @ApiProperty({ required: true, example: 1 })
  @Type(() => Number)
  @IsNotEmpty()
  @IsInt()
  bagian_gedung_detail: number;

  @ApiProperty({ required: true, example: kondisi_enum.BAGUS })
  @Type(() => String)
  @IsNotEmpty()
  @IsString()
  kondisi: kondisi_enum;

  @ApiProperty({ required: false, example: 'OK' })
  @Type(() => String)
  @IsOptional()
  @IsString()
  catatan?: string;

  @ApiProperty({ required: true, example: 'http://img.com' })
  @Type(() => String)
  @IsNotEmpty()
  @IsString()
  image_url: string;

  @ApiProperty({ required: true, example: '0239429' })
  @Type(() => String)
  @IsNotEmpty()
  @IsString()
  updater_by: string;
}
