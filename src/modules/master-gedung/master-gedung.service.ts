import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  BagianGedungDto,
  DetailGedungDto,
  KomponenGedungDto,
  DetailListGedungDto,
  ImageDetailDto,
} from 'src/dto/master-gedung-dto';

import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class MasterGedungService {
  constructor(private readonly prisma: PrismaService) {}

  async getBagian(params: BagianGedungDto) {
    const skip = params.page ? (params.page - 1) * params.per_page : 0;

    const where: Prisma.bagian_gedungWhereInput = {
      nama: {
        contains: params.keyword,
        mode: 'insensitive',
      },
    };

    const [data, total_data] = await Promise.all([
      this.prisma.bagian_gedung.findMany({
        where,
        skip: params.is_all_data ? undefined : skip,
        take: params.is_all_data ? undefined : params.per_page,
      }),
      this.prisma.bagian_gedung.count({
        where,
      }),
    ]);

    return {
      total_data: total_data,
      data: data,
    };
  }

  async getKomponen(params: KomponenGedungDto) {
    const skip = params.page ? (params.page - 1) * params.per_page : 0;

    const where: Prisma.bagian_gedung_komponenWhereInput = {
      nama: {
        contains: params.keyword,
        mode: 'insensitive',
      },
      bagian_gedung_id: params.bagian_gedung_id,
    };

    const [data, total_data] = await Promise.all([
      this.prisma.bagian_gedung_komponen.findMany({
        where,
        skip: params.is_all_data ? undefined : skip,
        take: params.is_all_data ? undefined : params.per_page,
      }),
      this.prisma.bagian_gedung_komponen.count({
        where,
      }),
    ]);

    return {
      total_data: total_data,
      data: data,
    };
  }

  async getDetail(params: DetailGedungDto) {
    const skip = params.page ? (params.page - 1) * params.per_page : 0;

    const where: Prisma.bagian_gedung_detailWhereInput = {
      nama: {
        contains: params.keyword,
        mode: 'insensitive',
      },
      bagian_gedung_komponen_id: params.bagian_gedung_komponen_id,
    };

    const [data, total_data] = await Promise.all([
      this.prisma.bagian_gedung_detail.findMany({
        where,
        skip: params.is_all_data ? undefined : skip,
        take: params.is_all_data ? undefined : params.per_page,
      }),
      this.prisma.bagian_gedung_detail.count({
        where,
      }),
    ]);

    return {
      total_data: total_data,
      data: data,
    };
  }
}
