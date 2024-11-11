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
import { BagianGedungDto } from 'src/dto/master-gedung-dto';
import { MasterGedungService } from './master-gedung.service';
import { SUCCESS_STATUS } from 'src/dto/request-response.dto';

@Controller('master-gedung')
@ApiTags('Master Gedung')
export class MasterGedungController {
  constructor(private readonly masterGedungService: MasterGedungService) {}
  private moment = require('moment-timezone');
  private locale = 'Asia/Jakarta';

  //   @Patch(':id')
  //   @ApiOperation({
  //     summary: 'Update Enrollment',
  //     description: 'Update enrollment using param id_barang and payloads',
  //   })
  //   async update(@Param('id') id: string, @Body() dto: UpdateEnrollmentDto) {
  //     try {
  //       const data = await this.masterGedungService.update(Number(id), dto);
  //       return {
  //         data: data,
  //         _meta: {
  //           code: HttpStatus.CREATED,
  //           status: SUCCESS_STATUS,
  //           message: 'success update enrollment',
  //         },
  //       };
  //     } catch (error) {
  //       throw error;
  //     }
  //   }

  //   @Post()
  //   @ApiOperation({
  //     summary: 'Input Enrollment',
  //     description: 'Input Enrollment ke Unit',
  //   })
  //   async post(@Body() dto: EnrollmentDto) {
  //     try {
  //       const data = await this.masterGedungService.post(dto);
  //       return {
  //         data: data,
  //         _meta: {
  //           code: HttpStatus.CREATED,
  //           status: SUCCESS_STATUS,
  //           message: 'success post enrollment',
  //         },
  //       };
  //     } catch (error) {
  //       throw error;
  //     }
  //   }

  @Get()
  @ApiOperation({
    summary: 'Get Bagian Gedung',
    description: 'Get Bagian Gedung using query params',
  })
  async get(@Query() params: BagianGedungDto) {
    try {
      const { total_data, data } = await this.masterGedungService.get(params);

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
          message: 'success get Bagian Gedung',
        },
      };
    } catch (error) {
      throw error;
    }
  }

  @Get('detail')
  @ApiOperation({
    summary: 'Get Bagian Gedung Detail',
    description: 'Get Bagian Gedung detail using query params',
  })
  async getDetail(@Query() params: BagianGedungDto) {
    try {
      const { total_data, data } = await this.masterGedungService.getDetail(params);

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
          message: 'success get Bagian Gedung Detail',
        },
      };
    } catch (error) {
      throw error;
    }
  }

  @Get('komponen')
  @ApiOperation({
    summary: 'Get Bagian Gedung Komponen',
    description: 'Get Bagian Gedung komponen using query params',
  })
  async getKomponen(@Query() params: BagianGedungDto) {
    try {
      const { total_data, data } = await this.masterGedungService.getKomponen(params);

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
          message: 'success get Bagian Gedung Komponen',
        },
      };
    } catch (error) {
      throw error;
    }
  }
}
