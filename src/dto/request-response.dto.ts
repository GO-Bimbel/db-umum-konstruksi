import { IsEnum, IsNumber, IsOptional } from 'class-validator';

export const SUCCESS_STATUS = 'success';
export const ERROR_STATUS = 'error';
export enum SortOrder {
  DESC = 'desc',
  ASC = 'asc',
}

export class Metadata {
  @IsNumber()
  page: number;

  @IsNumber()
  per_page: number = 10;

  @IsNumber()
  page_count: number;

  @IsNumber()
  total_count: number;

  @IsOptional()
  order_by?: string;

  @IsOptional()
  keyword?: string;

  @IsEnum(SortOrder)
  @IsOptional()
  sort?: SortOrder = SortOrder.DESC;
}

export class Meta {
  status: string;
  message: string;
}

export class CustomHttpResponse {
  data: any;
  metadata: any;
  _meta: any;
}
