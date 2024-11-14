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
  async getListDetail(params: DetailListGedungDto) {
    const skip = params.page ? (params.page - 1) * params.per_page : 0;

    const where: Prisma.bagian_gedung_detailWhereInput = {
      pemeliharaan_gedung: {
        some: {
          gedung_id: params.gedung_id,
        },
      },
      bagian_gedung_komponen: {
        bagian_gedung: {
          id: params.bagian_gedung_id,
        },
      },
    };

    const [data, total_data] = await Promise.all([
      this.prisma.bagian_gedung_detail.findMany({
        where,
        select: {
          id: true,
          nama: true,
          bagian_gedung_komponen: {
            select: {
              nama: true,
            },
          },
          pemeliharaan_gedung: {
            select: {
              id: true,
              bagian_gedung_detail_id: true,
              gedung_id: true,
              image_url: true,
            },
          },
        },

        skip: params.is_all_data ? undefined : skip,
        take: params.is_all_data ? undefined : params.per_page,
      }),
      this.prisma.bagian_gedung_detail.count({
        where,
      }),
    ]);

    const output = data.map((item) => {
      return {
        id: item.id,
        nama_komponen: item.bagian_gedung_komponen.nama,
        detail_komponen: item.nama,
        detail_pemeliharaan_id: item.pemeliharaan_gedung.filter(
          (list) =>
            list.bagian_gedung_detail_id === item.id &&
            list.gedung_id === params.gedung_id,
        )[0]?.id,
      };
    });

    return {
      total_data: total_data,
      data: output,
    };
  }
  async getImageDetail(params: ImageDetailDto) {
    const skip = params.page ? (params.page - 1) * params.per_page : 0;

    const where: Prisma.pemeliharaan_gedungWhereInput = {
      id: params.id,
    };

    const [data, total_data] = await Promise.all([
      this.prisma.pemeliharaan_gedung.findMany({
        where,
        select: {
          kondisi: true,
          catatan: true,
          image_url: true,
          updated_at: true,
        },
        skip: params.is_all_data ? undefined : skip,
        take: params.is_all_data ? undefined : params.per_page,
      }),
      this.prisma.pemeliharaan_gedung.count({
        where,
      }),
    ]);

    return {
      total_data: total_data,
      data,
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
