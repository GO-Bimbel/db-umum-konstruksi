import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SUCCESS_STATUS } from 'src/dto/request-response.dto';
import { PemeliharaanGedungService } from './pemeliharaan-gedung.service';
import {
  CreatePemeliharaanGedungDto,
  PemeliharaanGedungDetailDto,
  PemeliharaanGedungDto,
  UpdatePemeliharaanGedungDto,
} from 'src/dto/pemeliharaan-gedung.dto';
import { DetailListGedungDto, ImageDetailDto } from 'src/dto/master-gedung-dto';

@Controller('pemeliharaan-gedung')
@ApiTags('Master Gedung')
export class PemeliharaanGedungController {
  constructor(
    private readonly pemeliharaanGedungService: PemeliharaanGedungService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Get Pemeliharaan Gedung',
    description: 'Get Pemeliharaan Gedung using query params',
  })
  async getPemeliharaanGedung(@Query() params: PemeliharaanGedungDto) {
    try {
      const { total_data, data } =
        await this.pemeliharaanGedungService.getPemeliharaanGedung(params);

      const metadata = {
        total_count: total_data,
        page_count: params.is_all_data
          ? 1
          : Math.ceil(total_data / (params.per_page ?? 10)),
        page: params.is_all_data ? 1 : params.page,
        per_page: params.is_all_data ? total_data : params.per_page,
        sort: params.sort,
        order_by: params.order_by,
        keyword: params.keyword,
      };

      return {
        data: data,
        metadata: metadata ? metadata : null,
        _meta: {
          code: HttpStatus.OK,
          status: SUCCESS_STATUS,
          message: 'success get Pemeliharaan Gedung',
        },
      };
    } catch (error) {
      throw error;
    }
  }

  @Get('detail')
  @ApiOperation({
    summary: 'Get Pemeliharaan Gedung Detail',
    description: 'Get pemeliharaan gedung detail using query params',
  })
  async getPemeliharaanGedungDetail(@Query() params: PemeliharaanGedungDetailDto) {
    try {
      const { total_data, data } =
        await this.pemeliharaanGedungService.getPemeliharaanGedungDetail(params);

      const metadata = {
        total_count: total_data,
        page_count: params.is_all_data
          ? 1
          : Math.ceil(total_data / (params.per_page ?? 10)),
        page: params.is_all_data ? 1 : params.page,
        per_page: params.is_all_data ? total_data : params.per_page,
        sort: params.sort,
        order_by: params.order_by,
        keyword: params.keyword,
      };

      return {
        data: data,
        metadata: metadata ? metadata : null,
        _meta: {
          code: HttpStatus.OK,
          status: SUCCESS_STATUS,
          message: 'success get pemeliharaan gedung detail',
        },
      };
    } catch (error) {
      throw error;
    }
  }

  @Get('komponen')
  @ApiOperation({
    summary: 'Get Komponen Gedung',
    description: 'Get komponen gedung using query params',
  })
  async getKomponen(@Query() params: DetailListGedungDto) {
    try {
      const { total_data, data } =
        await this.pemeliharaanGedungService.getKomponen(params);

      const metadata = {
        total_count: total_data,
        page_count: params.is_all_data
          ? 1
          : Math.ceil(total_data / (params.per_page ?? 10)),
        page: params.is_all_data ? 1 : params.page,
        per_page: params.is_all_data ? total_data : params.per_page,
        sort: params.sort,
        order_by: params.order_by,
        keyword: params.keyword,
      };

      return {
        data: data,
        metadata: metadata ? metadata : null,
        _meta: {
          code: HttpStatus.OK,
          status: SUCCESS_STATUS,
          message: 'success get komponen gedung',
        },
      };
    } catch (error) {
      throw error;
    }
  }
  
  @Get('komponen/detail')
  @ApiOperation({
    summary: 'Get Komponen Detail',
    description: 'Get komponen detail using query params',
  })
  async getKomponenDetail(@Query() params: ImageDetailDto) {
    try {
      const { total_data, data } =
        await this.pemeliharaanGedungService.getKomponenDetail(params);

      const metadata = {
        total_count: total_data,
        page_count: params.is_all_data
          ? 1
          : Math.ceil(total_data / (params.per_page ?? 10)),
        page: params.is_all_data ? 1 : params.page,
        per_page: params.is_all_data ? total_data : params.per_page,
        sort: params.sort,
        order_by: params.order_by,
        keyword: params.keyword,
      };

      return {
        data: data,
        metadata: metadata ? metadata : null,
        _meta: {
          code: HttpStatus.OK,
          status: SUCCESS_STATUS,
          message: 'success get komponen detail',
        },
      };
    } catch (error) {
      throw error;
    }
  }

  @Post()
  @ApiOperation({
    summary: 'Input pemeliharaan gedung',
    description: 'Input pemeliharaan gedung ke Unit',
  })
  async createPemeliharaanGedung(@Body() dto: CreatePemeliharaanGedungDto) {
    try {
      const data =
        await this.pemeliharaanGedungService.createPemeliharaanGedung(dto);
      return {
        data: data,
        _meta: {
          code: HttpStatus.CREATED,
          status: SUCCESS_STATUS,
          message: 'success post pemeliharaan gedung',
        },
      };
    } catch (error) {
      throw error;
    }
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update pemeliharaan gedung',
    description:
      'Update pemeliharaan gedung using param id_barang and payloads',
  })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdatePemeliharaanGedungDto,
  ) {
    try {
      const data =
        await this.pemeliharaanGedungService.updatePemeliharaanGedung(
          Number(id),
          dto,
        );
      return {
        data: data,
        _meta: {
          code: HttpStatus.ACCEPTED,
          status: SUCCESS_STATUS,
          message: 'success update pemeliharaan gedung',
        },
      };
    } catch (error) {
      throw error;
    }
  }
}
