import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DetailListGedungDto, ImageDetailDto } from 'src/dto/master-gedung-dto';
import {
  CreatePemeliharaanGedungDto,
  PemeliharaanGedungDto,
  UpdatePemeliharaanGedungDto,
} from 'src/dto/pemeliharaan-gedung.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PemeliharaanGedungService {
  constructor(private readonly prisma: PrismaService) {}

  async getPemeliharaanGedung(params: PemeliharaanGedungDto) {
    const skip = params.page ? (params.page - 1) * params.per_page : 0;

    const where: Prisma.pemeliharaan_gedungWhereInput = {
      kondisi: params.kondisi,
      gedung_id: params.gedung_id,
      bagian_gedung_detail_id: params.bagian_gedung_detail_id,
      ruang_id: params.ruang_id,
    };

    const [data, total_data] = await Promise.all([
      this.prisma.pemeliharaan_gedung.findMany({
        where,
        skip: params.is_all_data ? undefined : skip,
        take: params.is_all_data ? undefined : params.per_page,
      }),
      this.prisma.pemeliharaan_gedung.count({
        where,
      }),
    ]);

    return {
      total_data: total_data,
      data: data,
    };
  }

  async createPemeliharaanGedung(dto: CreatePemeliharaanGedungDto) {
    const createData = dto.data_pemeliharaan.map((item) => ({
      gedung_id: item.gedung_id,
      bagian_gedung_detail_id: item.bagian_gedung_detail_id,
      kondisi: item.kondisi,
      nama_ruang: item.nama_ruang,
      ruang_id: item.ruang_id,
      catatan: item.catatan || null,
      image_url: item.image_url,
      updated_by: item.updated_by,
    }));

    const createdRecords = await this.prisma.pemeliharaan_gedung.createMany({
      data: createData,
    });

    return { createdRecordsCount: createdRecords.count };
  }

  async updatePemeliharaanGedung(id: number, dto: UpdatePemeliharaanGedungDto) {
    const result = await this.prisma.pemeliharaan_gedung.update({
      where: {
        id: id,
      },
      data: {
        bagian_gedung_detail_id: dto.bagian_gedung_detail_id,
        kondisi: dto.kondisi,
        catatan: dto.catatan || null,
        image_url: dto.image_url,
        updated_at: new Date(),
        updated_by: dto.updated_by,
      },
    });

    return { updatedRecordsCount: result };
  }

  async getKomponen(params: DetailListGedungDto) {
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
        pemeliharaan_gedung_id: item.pemeliharaan_gedung.filter(
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
  async getKomponenDetail(params: ImageDetailDto) {
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
}
