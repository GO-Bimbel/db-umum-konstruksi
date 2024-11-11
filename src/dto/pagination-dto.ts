import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { SortOrder } from './request-response.dto';


export class PaginationDto {
  @ApiProperty({ required: false, example: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiProperty({ required: false, example: 'asc' })
  @IsEnum(SortOrder)
  @IsOptional()
  sort?: SortOrder = SortOrder.ASC;

  @ApiProperty({ required: false, example: 10 })
  @Type(() => Number)
  @IsInt()
  @Min(10)
  @IsOptional()
  per_page?: number = 10;

  @ApiProperty({ required: false, example: 'id' })
  @Type(() => String)
  @IsOptional()
  @IsString()
  order_by?: string = 'id';

  @ApiProperty({ required: false })
  @Type(() => String)
  @IsOptional()
  @IsString()
  keyword?: string = '';

  @ApiProperty({ required: false, example: false })
  @IsOptional()
  @IsBoolean()
  @Transform(({ obj, key }) => {
    return obj[key] === 'true' ? true : obj[key] === 'false' ? false : obj[key];
  })
  is_all_data?: boolean = false;
  constructor(keyword = '', page = 1, sort = SortOrder.ASC) {
    this.keyword = keyword;
    this.page = page;
    this.sort = sort;
  }
}
